/**
 * 3D HAAR WAVELET DENSITY FIELD
 * ==============================
 *
 * This module implements a 3D density field using Haar wavelets.
 * Unlike Fourier (where every mode affects everywhere), wavelets are LOCAL:
 * each wavelet only affects a specific region of space.
 *
 * Benefits for cosmic web:
 *   - Smooth void regions need few wavelets (fast to evaluate)
 *   - Detailed filament/node regions can have more wavelets
 *   - Observations add LOCAL corrections, not global perturbations
 *
 * Structure:
 *   - Wavelets are organized in an octree hierarchy
 *   - Each level doubles the resolution
 *   - Level 0: one wavelet covering the whole volume
 *   - Level 1: 8 wavelets, each covering 1/8 of the volume
 *   - Level N: 8^N wavelets
 */

import type { WebScaleFateKey } from "~/model"

/**
 * A single wavelet coefficient.
 * Position is in normalized coordinates [0, 1] for each axis.
 */
type WaveletCoefficient = {
  // Position of the wavelet's center
  cx: number
  cy: number
  cz: number
  // Half-size of the wavelet's support region
  halfSize: number
  // The coefficient value (amplitude)
  value: number
  // Which type of wavelet (0-7 for 3D Haar)
  // 0 = scaling function (constant)
  // 1-7 = various wavelet orientations
  type: number
}

/**
 * Collection of wavelet coefficients that define the density field.
 */
export type WaveletField = {
  coefficients: WaveletCoefficient[]
  // Bounding box for the field (in world coordinates)
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

/**
 * Haar wavelet basis functions.
 *
 * Type 0: Scaling function (constant = 1)
 * Types 1-7: Wavelets with +1/-1 patterns in different octants
 */
function haarBasis(
  type: number,
  localX: number,
  localY: number,
  localZ: number
): number {
  // localX, localY, localZ are in [-1, 1] relative to wavelet center

  if (type === 0) {
    // Scaling function: constant
    return 1.0
  }

  // Determine which octant we're in
  const signX = localX >= 0 ? 1 : -1
  const signY = localY >= 0 ? 1 : -1
  const signZ = localZ >= 0 ? 1 : -1

  // Types 1-7 correspond to different sign patterns
  // This creates the 7 wavelet functions orthogonal to the scaling function
  switch (type) {
    case 1:
      return signX // +x/-x split
    case 2:
      return signY // +y/-y split
    case 3:
      return signZ // +z/-z split
    case 4:
      return signX * signY // xy quadrant pattern
    case 5:
      return signX * signZ // xz quadrant pattern
    case 6:
      return signY * signZ // yz quadrant pattern
    case 7:
      return signX * signY * signZ // octant pattern
    default:
      return 0
  }
}

/**
 * Evaluate the density field at a point.
 *
 * @param x - X coordinate in world space
 * @param y - Y coordinate in world space
 * @param z - Z coordinate in world space
 * @param field - The wavelet field
 * @returns Density value at this point
 */
export function evaluateDensity(
  x: number,
  y: number,
  z: number,
  field: WaveletField
): number {
  // Normalize to [0, 1]
  const nx = (x - field.minX) / (field.maxX - field.minX)
  const ny = (y - field.minY) / (field.maxY - field.minY)
  const nz = (z - field.minZ) / (field.maxZ - field.minZ)

  let density = 0

  for (const coeff of field.coefficients) {
    // Check if point is within this wavelet's support
    const dx = nx - coeff.cx
    const dy = ny - coeff.cy
    const dz = nz - coeff.cz

    if (
      Math.abs(dx) <= coeff.halfSize &&
      Math.abs(dy) <= coeff.halfSize &&
      Math.abs(dz) <= coeff.halfSize
    ) {
      // Point is within support, evaluate basis function
      const localX = dx / coeff.halfSize // Normalize to [-1, 1]
      const localY = dy / coeff.halfSize
      const localZ = dz / coeff.halfSize

      density += coeff.value * haarBasis(coeff.type, localX, localY, localZ)
    }
  }

  return density
}

/**
 * Evaluate the gradient of the density field at a point.
 * Uses finite differences since Haar wavelets are discontinuous.
 */
export function evaluateGradient(
  x: number,
  y: number,
  z: number,
  field: WaveletField
): { dx: number; dy: number; dz: number } {
  const epsilon = 0.01 * (field.maxX - field.minX) // 1% of domain size

  const dx =
    (evaluateDensity(x + epsilon, y, z, field) -
      evaluateDensity(x - epsilon, y, z, field)) /
    (2 * epsilon)
  const dy =
    (evaluateDensity(x, y + epsilon, z, field) -
      evaluateDensity(x, y - epsilon, z, field)) /
    (2 * epsilon)
  const dz =
    (evaluateDensity(x, y, z + epsilon, field) -
      evaluateDensity(x, y, z - epsilon, field)) /
    (2 * epsilon)

  return { dx, dy, dz }
}

/**
 * Evaluate the Hessian matrix of the density field at a point.
 * Returns the 6 unique components of the symmetric 3x3 matrix.
 */
export function evaluateHessian(
  x: number,
  y: number,
  z: number,
  field: WaveletField
): {
  dxx: number
  dyy: number
  dzz: number
  dxy: number
  dxz: number
  dyz: number
} {
  const epsilon = 0.01 * (field.maxX - field.minX)

  const center = evaluateDensity(x, y, z, field)

  // Second derivatives (diagonal)
  const dxx =
    (evaluateDensity(x + epsilon, y, z, field) -
      2 * center +
      evaluateDensity(x - epsilon, y, z, field)) /
    (epsilon * epsilon)
  const dyy =
    (evaluateDensity(x, y + epsilon, z, field) -
      2 * center +
      evaluateDensity(x, y - epsilon, z, field)) /
    (epsilon * epsilon)
  const dzz =
    (evaluateDensity(x, y, z + epsilon, field) -
      2 * center +
      evaluateDensity(x, y, z - epsilon, field)) /
    (epsilon * epsilon)

  // Mixed derivatives (off-diagonal)
  const dxy =
    (evaluateDensity(x + epsilon, y + epsilon, z, field) -
      evaluateDensity(x + epsilon, y - epsilon, z, field) -
      evaluateDensity(x - epsilon, y + epsilon, z, field) +
      evaluateDensity(x - epsilon, y - epsilon, z, field)) /
    (4 * epsilon * epsilon)
  const dxz =
    (evaluateDensity(x + epsilon, y, z + epsilon, field) -
      evaluateDensity(x + epsilon, y, z - epsilon, field) -
      evaluateDensity(x - epsilon, y, z + epsilon, field) +
      evaluateDensity(x - epsilon, y, z - epsilon, field)) /
    (4 * epsilon * epsilon)
  const dyz =
    (evaluateDensity(x, y + epsilon, z + epsilon, field) -
      evaluateDensity(x, y + epsilon, z - epsilon, field) -
      evaluateDensity(x, y - epsilon, z + epsilon, field) +
      evaluateDensity(x, y - epsilon, z - epsilon, field)) /
    (4 * epsilon * epsilon)

  return { dxx, dyy, dzz, dxy, dxz, dyz }
}

/**
 * Compute eigenvalues of a 3x3 symmetric matrix.
 * Uses the analytical solution for real symmetric matrices.
 */
function eigenvalues3x3(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): { lambda1: number; lambda2: number; lambda3: number } {
  // Matrix: [[a, d, e], [d, b, f], [e, f, c]]
  // Using Cardano's formula for cubic eigenvalue equation

  const p1 = d * d + e * e + f * f
  const q = (a + b + c) / 3
  const p2 = (a - q) * (a - q) + (b - q) * (b - q) + (c - q) * (c - q) + 2 * p1

  const p = Math.sqrt(p2 / 6)

  // B = (1/p) * (A - q*I)
  const B11 = (a - q) / p
  const B22 = (b - q) / p
  const B33 = (c - q) / p
  const B12 = d / p
  const B13 = e / p
  const B23 = f / p

  // det(B)
  const detB =
    B11 * (B22 * B33 - B23 * B23) -
    B12 * (B12 * B33 - B23 * B13) +
    B13 * (B12 * B23 - B22 * B13)

  const r = detB / 2

  // Clamp to [-1, 1] for acos
  const phi = r <= -1 ? Math.PI / 3 : r >= 1 ? 0 : Math.acos(r) / 3

  // Eigenvalues
  const lambda1 = q + 2 * p * Math.cos(phi)
  const lambda3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)
  const lambda2 = 3 * q - lambda1 - lambda3

  return { lambda1, lambda2, lambda3 }
}

/**
 * Classify a point in the density field into a cosmic web fate.
 *
 * Uses the T-web classification based on eigenvalues of the Hessian:
 *   - Void: all eigenvalues positive (local minimum in 3D)
 *   - Sheet: 2 positive, 1 negative (2D surface in 3D)
 *   - Filament: 1 positive, 2 negative (1D curve in 3D)
 *   - Node: all eigenvalues negative (local maximum in 3D)
 */
export function classifyWebFate(
  x: number,
  y: number,
  z: number,
  field: WaveletField
): WebScaleFateKey {
  const hess = evaluateHessian(x, y, z, field)
  const { lambda1, lambda2, lambda3 } = eigenvalues3x3(
    hess.dxx,
    hess.dyy,
    hess.dzz,
    hess.dxy,
    hess.dxz,
    hess.dyz
  )

  // Count positive eigenvalues
  const threshold = 0.1 // Consider eigenvalue "zero" if below this
  let positiveCount = 0
  let negativeCount = 0

  for (const lambda of [lambda1, lambda2, lambda3]) {
    if (lambda > threshold) positiveCount++
    else if (lambda < -threshold) negativeCount++
  }

  // T-web classification
  if (positiveCount === 3) return "void"
  if (positiveCount === 2 && negativeCount >= 1) return "sheet"
  if (positiveCount >= 1 && negativeCount === 2) return "filament"
  if (negativeCount === 3) return "node"

  // Ambiguous case (near flat region) - default to sheet
  return "sheet"
}

/**
 * Generate a minimal wavelet field with only low-frequency priors.
 *
 * This represents the "before observations" state:
 *   - A few large-scale wavelets create background texture
 *   - Detailed structure will be added as observations are made
 *
 * The prior is derived from the early-universe thermal regime:
 *   - At Mpc100 scale, each cell has a density contrast
 *   - These density contrasts seed the cosmic web structure
 *   - We use ~3-8 wavelets to represent this low-frequency prior
 */
export function generateDefaultField(
  seed: number,
  gridSize = 10
): WaveletField {
  const coefficients: WaveletCoefficient[] = []

  // Simple pseudo-random based on seed
  const random = (i: number): number => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return x - Math.floor(x)
  }

  // Level 0: DC component (mean density = 0)
  coefficients.push({
    cx: 0.5,
    cy: 0.5,
    cz: 0.5,
    halfSize: 0.5,
    value: 0,
    type: 0,
  })

  // Level 1 only: 8 cells × a few wavelet types = ~8-24 wavelets
  // This creates the large-scale structure (voids, overdense regions)
  const numPerSide = 2 // 2×2×2 = 8 cells at level 1
  const cellSize = 1.0 / numPerSide
  const halfSize = cellSize / 2
  const baseAmplitude = 2.0 // Strong low-frequency structure

  let coeffIndex = 0
  for (let ix = 0; ix < numPerSide; ix++) {
    for (let iy = 0; iy < numPerSide; iy++) {
      for (let iz = 0; iz < numPerSide; iz++) {
        const cx = (ix + 0.5) * cellSize
        const cy = (iy + 0.5) * cellSize
        const cz = (iz + 0.5) * cellSize

        // Only add types 1-3 (the primary axis splits)
        // This gives us ~24 wavelets max, typically ~12 after filtering
        for (let type = 1; type <= 3; type++) {
          const r = random(coeffIndex++)
          const amplitude = baseAmplitude * (r - 0.5) * 2

          // Skip small amplitudes
          if (Math.abs(amplitude) < 0.3) continue

          coefficients.push({
            cx,
            cy,
            cz,
            halfSize,
            value: amplitude,
            type,
          })
        }
      }
    }
  }

  return {
    coefficients,
    minX: 0,
    maxX: gridSize,
    minY: 0,
    maxY: gridSize,
    minZ: 0,
    maxZ: gridSize,
  }
}

/**
 * Add a wavelet to an existing field (for recording observations).
 *
 * @param field - The field to modify
 * @param x - World X coordinate of the observation
 * @param y - World Y coordinate of the observation
 * @param z - World Z coordinate of the observation
 * @param amplitude - Strength of the wavelet (positive = overdense, negative = underdense)
 * @param size - Size of the affected region (in world coordinates)
 * @param type - Wavelet type (0-7, default 0 for isotropic)
 */
export function addWavelet(
  field: WaveletField,
  x: number,
  y: number,
  z: number,
  amplitude: number,
  size: number,
  type = 0
): void {
  // Convert world coordinates to normalized [0, 1]
  const cx = (x - field.minX) / (field.maxX - field.minX)
  const cy = (y - field.minY) / (field.maxY - field.minY)
  const cz = (z - field.minZ) / (field.maxZ - field.minZ)
  const halfSize = size / (field.maxX - field.minX) / 2

  field.coefficients.push({
    cx,
    cy,
    cz,
    halfSize,
    value: amplitude,
    type,
  })
}

/**
 * Ray march through the field from above (z = max) to find the first non-void.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param field - The wavelet field
 * @param zSteps - Number of z-steps to sample (default 50)
 * @returns The fate at the first non-void point, or "void" if all void
 */
export function rayMarchFromAbove(
  x: number,
  y: number,
  field: WaveletField,
  zSteps = 50
): WebScaleFateKey {
  const zMin = field.minZ
  const zMax = field.maxZ
  const zStep = (zMax - zMin) / zSteps

  // March from top to bottom
  for (let z = zMax; z >= zMin; z -= zStep) {
    // Quick density check first (cheaper than full classification)
    const density = evaluateDensity(x, y, z, field)

    // If density is high enough, this might be structure
    // Use a threshold to decide when to do full classification
    if (density > 0.5) {
      const fate = classifyWebFate(x, y, z, field)
      if (fate !== "void") {
        return fate
      }
    }
  }

  // All void
  return "void"
}

/**
 * Get the number of wavelet coefficients in the field.
 * Useful for performance monitoring.
 */
export function getWaveletCount(field: WaveletField): number {
  return field.coefficients.length
}
