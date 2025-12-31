/**
 * OBSERVATION SYSTEM
 * ==================
 *
 * Observations are the bridge between the "heavier simulation" (which determines
 * ground truth at specific points) and the "fast projection" (wavelets that
 * interpolate between observations).
 *
 * Each observation:
 *   - Has a coordinate (x, y, z) in world space
 *   - Was made at a specific time t (Gyr since Big Bang)
 *   - Records the observed fate and density at that point
 *   - Is encoded as splines that extend backward to early universe and forward
 *
 * The splines allow us to:
 *   - Query what this point looked like at any time
 *   - Propagate constraints up (child observations constrain parent fates)
 *   - Propagate constraints down (parent fate constrains child distribution)
 */

import { addMode, type SparseFourierField } from "~/helpers/sparseFourier"
import type { WebScaleFateKey, Coordinate } from "~/model"

/**
 * A damped oscillator spline over cosmic time.
 * Domain: time in Gyr since Big Bang
 * Codomain: a physical quantity (density contrast, temperature, etc.)
 *
 * y(t) = equilibrium + amplitude * exp(-damping * t) * cos(frequency * t + phase)
 */
export type TimeSpline = {
  /** The quantity being tracked (e.g., "densityContrast", "temperature") */
  quantity: string

  /** Asymptotic value as t → ∞ */
  equilibrium: number

  /** Initial amplitude of oscillation */
  amplitude: number

  /** Oscillation frequency (radians per Gyr) */
  frequencyPerGyr: number

  /** Decay rate (per Gyr) */
  dampingPerGyr: number

  /** Phase offset (radians) */
  phase: number
}

/**
 * Evaluate a damped oscillator spline at time t.
 */
export function evaluateSpline(spline: TimeSpline, tGyr: number): number {
  const { equilibrium, amplitude, frequencyPerGyr, dampingPerGyr, phase } =
    spline
  return (
    equilibrium +
    amplitude *
      Math.exp(-dampingPerGyr * tGyr) *
      Math.cos(frequencyPerGyr * tGyr + phase)
  )
}

/**
 * Fit a simple spline to a single observation.
 *
 * Given:
 *   - Early universe value (t ≈ 0): nearly zero (homogeneous)
 *   - Observed value at t_obs
 *
 * We fit a spline that:
 *   - Starts near zero at t = 0
 *   - Passes through the observed value at t_obs
 *   - Asymptotes to the observed value (equilibrium = observed)
 *
 * This is a simplified fit; with multiple observations we'd do proper fitting.
 */
export function fitSplineToObservation(
  quantity: string,
  observedValue: number,
  tObsGyr: number
): TimeSpline {
  // Simple model: structure grows from zero to observed value
  // equilibrium = observed value (where it ends up)
  // amplitude = -observed value (so it starts near zero)
  // damping chosen so it's mostly settled by t_obs
  // frequency = 0 (no oscillation for now, just growth)

  const equilibrium = observedValue
  const amplitude = -observedValue // Start at equilibrium + amplitude ≈ 0
  const dampingPerGyr = 3 / tObsGyr // e^(-3) ≈ 0.05, so 95% settled by t_obs
  const frequencyPerGyr = 0 // No oscillation
  const phase = 0

  return {
    quantity,
    equilibrium,
    amplitude,
    frequencyPerGyr,
    dampingPerGyr,
    phase,
  }
}

/**
 * An observation records what was seen at a specific point in space and time.
 */
export type Observation = {
  /** Unique identifier for this observation */
  id: string

  /** The coordinate in hierarchical space */
  coordinate: Coordinate

  /** World-space position within the parcel */
  worldX: number
  worldY: number
  worldZ: number

  /** Time of observation (Gyr since Big Bang) */
  timeGyr: number

  /** The observed web-scale fate */
  fate: WebScaleFateKey

  /** The observed density contrast at this point */
  densityContrast: number

  /** Spline encoding how density evolves over time */
  densitySpline: TimeSpline
}

/**
 * Storage for observations (in-memory for now, database later).
 */
const observationStore: Map<string, Observation> = new Map()

/**
 * Generate a unique ID for an observation.
 */
function generateObservationId(
  coordinate: Coordinate,
  worldX: number,
  worldY: number,
  worldZ: number
): string {
  return `${coordinate.scale}:${coordinate.x},${coordinate.y}:${worldX.toFixed(
    2
  )},${worldY.toFixed(2)},${worldZ.toFixed(2)}`
}

/**
 * Record an observation.
 *
 * This stores the observation and fits a spline to it.
 * The observation can then be used to add wavelets to the field.
 */
export function recordObservation(
  coordinate: Coordinate,
  worldX: number,
  worldY: number,
  worldZ: number,
  timeGyr: number,
  fate: WebScaleFateKey,
  densityContrast: number
): Observation {
  const id = generateObservationId(coordinate, worldX, worldY, worldZ)

  const densitySpline = fitSplineToObservation(
    "densityContrast",
    densityContrast,
    timeGyr
  )

  const observation: Observation = {
    id,
    coordinate,
    worldX,
    worldY,
    worldZ,
    timeGyr,
    fate,
    densityContrast,
    densitySpline,
  }

  observationStore.set(id, observation)
  return observation
}

/**
 * Get all observations for a given coordinate (parcel).
 */
export function getObservationsForParcel(
  coordinate: Coordinate
): Observation[] {
  const prefix = `${coordinate.scale}:${coordinate.x},${coordinate.y}:`
  const results: Observation[] = []

  for (const [id, obs] of observationStore) {
    if (id.startsWith(prefix)) {
      results.push(obs)
    }
  }

  return results
}

/**
 * Get all observations (for debugging/visualization).
 */
export function getAllObservations(): Observation[] {
  return Array.from(observationStore.values())
}

/**
 * Clear all observations (for testing).
 */
export function clearObservations(): void {
  observationStore.clear()
}

/**
 * Make an observation at a specific point.
 *
 * This is the entry point for the observation process:
 *   1. Determine the fate and density at the point (via simulation or lookup)
 *   2. Record the observation
 *   3. Return the observation for further processing (e.g., adding wavelets)
 *
 * TODO: The "determine fate and density" step currently needs a heavier
 * simulation. For now, this function takes the fate and density as parameters.
 * Later, we'll plug in the actual simulation.
 */
export function makeObservation(
  coordinate: Coordinate,
  worldX: number,
  worldY: number,
  worldZ: number,
  timeGyr: number,
  // TODO: These should come from simulation, not be passed in
  fate: WebScaleFateKey,
  densityContrast: number
): Observation {
  // Step 1: Determine fate and density
  // ============================================
  // TODO: This is where the "heavier simulation" would go.
  // For now, we take fate and densityContrast as parameters.
  // Later, this would:
  //   - Look up the parent Mpc100 regime
  //   - Run a physics-based simulation to determine local structure
  //   - Return the ground-truth fate and density

  // Step 2: Record the observation
  const observation = recordObservation(
    coordinate,
    worldX,
    worldY,
    worldZ,
    timeGyr,
    fate,
    densityContrast
  )

  return observation
}

/**
 * Apply an observation to a sparse Fourier field.
 *
 * This adds Fourier modes that help represent the observed structure.
 * Unlike wavelets, Fourier modes have GLOBAL influence — which is what
 * we want for cosmic web structure.
 *
 * The approach:
 *   - Find or create a mode at an appropriate frequency
 *   - Adjust its amplitude to help match the observation
 *   - The phase is set based on the observation location
 */
export function applyObservationToField(
  observation: Observation,
  field: SparseFourierField
): void {
  const { worldX, worldY, worldZ, densityContrast } = observation

  // Normalize position to [0, period]
  const nx = ((worldX - field.minX) / (field.maxX - field.minX)) * field.period
  const ny = ((worldY - field.minY) / (field.maxY - field.minY)) * field.period
  const nz = ((worldZ - field.minZ) / (field.maxZ - field.minZ)) * field.period

  // Add a mode that peaks at this location
  // Use a low-frequency mode (k=1) for broad influence
  // The phase is set so the cosine peaks at this location
  const twoPi = 2 * Math.PI

  // For each direction, add a mode if the observation warrants it
  // Phase = -2π * k * n / period makes cos(phase + 2π*k*n/period) = cos(0) = 1 at this point
  const kx = 1
  const ky = 1
  const kz = 1
  const phase = (-twoPi * (kx * nx + ky * ny + kz * nz)) / field.period

  // Amplitude proportional to density contrast
  // Scale down since this mode affects the whole field
  const amplitude = densityContrast * 0.3

  addMode(field, kx, ky, kz, amplitude, phase)
}

/**
 * Apply all observations for a parcel to a sparse Fourier field.
 */
export function applyAllObservationsToField(
  coordinate: Coordinate,
  field: SparseFourierField
): void {
  const observations = getObservationsForParcel(coordinate)
  for (const obs of observations) {
    applyObservationToField(obs, field)
  }
}
