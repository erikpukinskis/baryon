/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Interstellar-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "~/model/02_HALO_SCALE_FATES"
import type { GALACTIC_SCALE_FATES } from "~/model/03_GALACTIC_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *         "pc100": [5,3],   // interstellar scale (GMCs, clusters)
 *         "pc1": [42,17],   // stellar scale
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the halo-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of halo fates.
 * For now, uses a uniform distribution (all halo fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain halo fate weights.
 */
function observeHaloFate(
  coords: Coordinates,
  universeSeed: number
): HaloScaleFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe halo fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all halo fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<HaloScaleFateKey, number>> = {
    gasRichGroup: 0.25,
    gasPoorGroup: 0.25,
    fossilGroup: 0.1,
    coolCoreCluster: 0.15,
    nonCoolCoreCluster: 0.15,
    fossilCluster: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeHaloFate(coords, universeSeed)
  const parentCharacteristics = HALO_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}
