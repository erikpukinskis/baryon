/**
 * SPARSE 3D FOURIER DENSITY FIELD
 * ================================
 *
 * This module implements a 3D density field using sparse Fourier modes.
 * Unlike a full Fourier transform (which uses all frequency modes), we use
 * only a small subset of modes that are sufficient to represent the structure.
 *
 * Key properties:
 *   - Global influence: each mode affects the entire volume
 *   - Periodic/tiling: natural boundary conditions
 *   - Analytical derivatives: gradient and Hessian are exact
 *   - Sparse: start with ~3-5 modes, add more as observations are made
 *
 * The modes are added incrementally:
 *   - Start with DC (mean) + lowest frequency modes
 *   - Each observation can add/adjust modes to fit the data
 *   - Total modes stay small (10-50) unless heavily observed
 */

import type { WebScaleFateKey } from "~/model"

/**
 * A single Fourier mode in 3D.
 */
export type FourierMode = {
  /** Frequency in x direction (integer, can be negative) */
  kx: number
  /** Frequency in y direction */
  ky: number
  /** Frequency in z direction */
  kz: number
  /** Amplitude of this mode */
  amplitude: number
  /** Phase offset (radians) */
  phase: number
}

/**
 * A sparse Fourier field: a collection of modes that define the density.
 */
export type SparseFourierField = {
  modes: FourierMode[]
  /** Bounding box for the field (in world coordinates) */
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
  /** Period of the field (for normalization) */
  period: number
}

/**
 * Evaluate the density field at a point.
 *
 * density(x, y, z) = Σ amplitude[k] * cos(2π(kx·x + ky·y + kz·z)/period + phase[k])
 */
export function evaluateDensity(
  x: number,
  y: number,
  z: number,
  field: SparseFourierField
): number {
  // Normalize coordinates to [0, period]
  const nx = ((x - field.minX) / (field.maxX - field.minX)) * field.period
  const ny = ((y - field.minY) / (field.maxY - field.minY)) * field.period
  const nz = ((z - field.minZ) / (field.maxZ - field.minZ)) * field.period

  let density = 0
  const twoPi = 2 * Math.PI

  for (const mode of field.modes) {
    const phase =
      (twoPi * (mode.kx * nx + mode.ky * ny + mode.kz * nz)) / field.period +
      mode.phase
    density += mode.amplitude * Math.cos(phase)
  }

  return density
}

/**
 * Evaluate the gradient of the density field at a point.
 * Analytical derivative of the Fourier sum.
 */
export function evaluateGradient(
  x: number,
  y: number,
  z: number,
  field: SparseFourierField
): { dx: number; dy: number; dz: number } {
  const nx = ((x - field.minX) / (field.maxX - field.minX)) * field.period
  const ny = ((y - field.minY) / (field.maxY - field.minY)) * field.period
  const nz = ((z - field.minZ) / (field.maxZ - field.minZ)) * field.period

  let dx = 0
  let dy = 0
  let dz = 0
  const twoPi = 2 * Math.PI
  const scale = twoPi / field.period

  for (const mode of field.modes) {
    const phase =
      (twoPi * (mode.kx * nx + mode.ky * ny + mode.kz * nz)) / field.period +
      mode.phase
    const sinPhase = Math.sin(phase)

    // Derivative of cos(phase) = -sin(phase) * d(phase)/dx
    // d(phase)/dx = 2π * kx / period * (period / (maxX - minX)) = 2π * kx / (maxX - minX)
    const scaleX = scale / (field.maxX - field.minX) * field.period
    const scaleY = scale / (field.maxY - field.minY) * field.period
    const scaleZ = scale / (field.maxZ - field.minZ) * field.period

    dx -= mode.amplitude * sinPhase * mode.kx * scaleX
    dy -= mode.amplitude * sinPhase * mode.ky * scaleY
    dz -= mode.amplitude * sinPhase * mode.kz * scaleZ
  }

  return { dx, dy, dz }
}

/**
 * Evaluate the Hessian matrix of the density field at a point.
 * Analytical second derivatives.
 */
export function evaluateHessian(
  x: number,
  y: number,
  z: number,
  field: SparseFourierField
): {
  dxx: number
  dyy: number
  dzz: number
  dxy: number
  dxz: number
  dyz: number
} {
  const nx = ((x - field.minX) / (field.maxX - field.minX)) * field.period
  const ny = ((y - field.minY) / (field.maxY - field.minY)) * field.period
  const nz = ((z - field.minZ) / (field.maxZ - field.minZ)) * field.period

  let dxx = 0, dyy = 0, dzz = 0
  let dxy = 0, dxz = 0, dyz = 0
  const twoPi = 2 * Math.PI
  const scale = twoPi / field.period

  const scaleX = scale / (field.maxX - field.minX) * field.period
  const scaleY = scale / (field.maxY - field.minY) * field.period
  const scaleZ = scale / (field.maxZ - field.minZ) * field.period

  for (const mode of field.modes) {
    const phase =
      (twoPi * (mode.kx * nx + mode.ky * ny + mode.kz * nz)) / field.period +
      mode.phase
    const cosPhase = Math.cos(phase)

    // Second derivative of cos(phase) = -cos(phase) * (d(phase)/dx)^2
    const a = mode.amplitude * cosPhase

    dxx -= a * mode.kx * mode.kx * scaleX * scaleX
    dyy -= a * mode.ky * mode.ky * scaleY * scaleY
    dzz -= a * mode.kz * mode.kz * scaleZ * scaleZ
    dxy -= a * mode.kx * mode.ky * scaleX * scaleY
    dxz -= a * mode.kx * mode.kz * scaleX * scaleZ
    dyz -= a * mode.ky * mode.kz * scaleY * scaleZ
  }

  return { dxx, dyy, dzz, dxy, dxz, dyz }
}

/**
 * Compute eigenvalues of a 3x3 symmetric matrix.
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
  const p1 = d * d + e * e + f * f
  const q = (a + b + c) / 3
  const p2 = (a - q) * (a - q) + (b - q) * (b - q) + (c - q) * (c - q) + 2 * p1
  const p = Math.sqrt(p2 / 6)

  if (p < 1e-10) {
    // Matrix is essentially diagonal
    return { lambda1: a, lambda2: b, lambda3: c }
  }

  const B11 = (a - q) / p
  const B22 = (b - q) / p
  const B33 = (c - q) / p
  const B12 = d / p
  const B13 = e / p
  const B23 = f / p

  const detB =
    B11 * (B22 * B33 - B23 * B23) -
    B12 * (B12 * B33 - B23 * B13) +
    B13 * (B12 * B23 - B22 * B13)

  const r = detB / 2
  const phi = r <= -1 ? Math.PI / 3 : r >= 1 ? 0 : Math.acos(r) / 3

  const lambda1 = q + 2 * p * Math.cos(phi)
  const lambda3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)
  const lambda2 = 3 * q - lambda1 - lambda3

  return { lambda1, lambda2, lambda3 }
}

/**
 * Classify a point in the density field into a cosmic web fate.
 * Uses the T-web classification based on Hessian eigenvalues.
 */
export function classifyWebFate(
  x: number,
  y: number,
  z: number,
  field: SparseFourierField
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

  // Count positive/negative eigenvalues
  const threshold = 0.1
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

  return "sheet" // Default for ambiguous cases
}

/**
 * Generate a default sparse Fourier field with low-frequency prior.
 *
 * Starts with just 3-5 modes representing the large-scale structure.
 * More modes are added as observations are made.
 */
export function generateDefaultField(
  seed: number,
  gridSize = 10
): SparseFourierField {
  const modes: FourierMode[] = []

  // Simple pseudo-random based on seed
  const random = (i: number): number => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return x - Math.floor(x)
  }

  // DC component (mean = 0)
  modes.push({ kx: 0, ky: 0, kz: 0, amplitude: 0, phase: 0 })

  // Lowest frequency modes (k = ±1 in each direction)
  // These create the large-scale void/overdense structure
  const lowFreqModes = [
    { kx: 1, ky: 0, kz: 0 },
    { kx: 0, ky: 1, kz: 0 },
    { kx: 0, ky: 0, kz: 1 },
    { kx: 1, ky: 1, kz: 0 },
    { kx: 1, ky: 0, kz: 1 },
    { kx: 0, ky: 1, kz: 1 },
  ]

  for (let i = 0; i < lowFreqModes.length; i++) {
    const { kx, ky, kz } = lowFreqModes[i]
    const amplitude = 2.0 * (random(i) - 0.3) // Bias toward positive for structure
    const phase = random(i + 100) * 2 * Math.PI

    if (Math.abs(amplitude) > 0.3) {
      modes.push({ kx, ky, kz, amplitude, phase })
    }
  }

  return {
    modes,
    minX: 0,
    maxX: gridSize,
    minY: 0,
    maxY: gridSize,
    minZ: 0,
    maxZ: gridSize,
    period: gridSize,
  }
}

/**
 * Add a new Fourier mode to the field.
 * Used when observations require more detail.
 */
export function addMode(
  field: SparseFourierField,
  kx: number,
  ky: number,
  kz: number,
  amplitude: number,
  phase: number
): void {
  // Check if this mode already exists
  const existing = field.modes.find(
    (m) => m.kx === kx && m.ky === ky && m.kz === kz
  )

  if (existing) {
    // Adjust existing mode
    existing.amplitude += amplitude
    // Phase adjustment would require complex arithmetic; skip for now
  } else {
    // Add new mode
    field.modes.push({ kx, ky, kz, amplitude, phase })
  }
}

/**
 * Ray march through the field from above to find the first non-void.
 */
export function rayMarchFromAbove(
  x: number,
  y: number,
  field: SparseFourierField,
  zSteps = 50
): WebScaleFateKey {
  const zMin = field.minZ
  const zMax = field.maxZ
  const zStep = (zMax - zMin) / zSteps

  for (let z = zMax; z >= zMin; z -= zStep) {
    const density = evaluateDensity(x, y, z, field)

    // If density is significant, classify
    if (Math.abs(density) > 0.5) {
      const fate = classifyWebFate(x, y, z, field)
      if (fate !== "void") {
        return fate
      }
    }
  }

  return "void"
}

/**
 * Get the number of modes in the field.
 */
export function getModeCount(field: SparseFourierField): number {
  return field.modes.length
}

