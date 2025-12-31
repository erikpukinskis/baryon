import {
  BARYON_COOLING_REGIMES,
  type BaryonicCoolingRegimeKey,
} from "./00_BARYON_COOLING_REGIMES"
import { WEB_SCALE_FATES, type WebScaleFateKey } from "./01_WEB_SCALE_FATES"
import { HALO_SCALE_FATES, type HaloScaleFateKey } from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export {
  BARYON_COOLING_REGIMES,
  WEB_SCALE_FATES,
  HALO_SCALE_FATES,
  GALACTIC_SCALE_FATES,
  INTERSTELLAR_SCALE_FATES,
  STAR_SCALE_FATES,
}

export type {
  BaryonicCoolingRegimeKey,
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

/**
 * The uniform cosmological background — the statistical distribution of
 * web-scale structures across the universe. At scales >300 Mpc, all regions
 * have approximately this same mix.
 *
 * NOTE: This is now derived from BARYON_COOLING_REGIMES.recombinedGas.childFateWeights.
 * Kept here for backward compatibility with existing code.
 */
export const COSMOLOGICAL_FATE: Partial<Record<WebScaleFateKey, number>> =
  BARYON_COOLING_REGIMES.recombinedGas.childFateWeights

/**
 * Union of all fate keys that have childFateWeights.
 * These are the fates that can serve as parents when sampling child parcels.
 */
export type ParentFateKey =
  | WebScaleFateKey
  | HaloScaleFateKey
  | GalacticScaleFateKey
  | InterstellarScaleFateKey

/**
 * Minimal interface for fates that can serve as parents in the hierarchy.
 * Extracted from the full fate characteristics to enable parent fate lookup
 * without depending on scale-specific types.
 */
export type FateWithChildren = {
  childFateWeights: Partial<Record<string, number>>
}

// Build a single lookup map with explicit typing to satisfy ESLint
// TODO: This was a hack to satisfy ESLint. Can we do this without the "as"?
const PARENT_FATE_LOOKUP = new Map<ParentFateKey, FateWithChildren>()

for (const [key, value] of Object.entries(WEB_SCALE_FATES)) {
  PARENT_FATE_LOOKUP.set(key as WebScaleFateKey, value)
}
for (const [key, value] of Object.entries(HALO_SCALE_FATES)) {
  PARENT_FATE_LOOKUP.set(key as HaloScaleFateKey, value)
}
for (const [key, value] of Object.entries(GALACTIC_SCALE_FATES)) {
  PARENT_FATE_LOOKUP.set(key as GalacticScaleFateKey, value)
}
for (const [key, value] of Object.entries(INTERSTELLAR_SCALE_FATES)) {
  PARENT_FATE_LOOKUP.set(key as InterstellarScaleFateKey, value)
}

/**
 * Look up the characteristics of any fate by its key.
 * Returns the fate object which includes childFateWeights if applicable.
 */
export function getFateCharacteristics(
  fateKey: ParentFateKey
): FateWithChildren {
  const characteristics = PARENT_FATE_LOOKUP.get(fateKey)
  if (!characteristics) {
    throw new Error(`Unknown fate key: ${String(fateKey)}`)
  }
  return characteristics
}

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *   ├── Orion Molecular Cloud Complex
 *   │   ├── Orion Nebula Cluster
 *   │   ├── Young stellar systems (tilted to cluster plane)
 *   │   └── Barnard's Loop (superbubble, aligned)
 *   ├── Local Bubble (superbubble containing Sol)
 *   │   └── Sol system (stellar scale, tilted 60° to galactic plane)
 *   └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 *
 * Example: A coordinate at scale "Mpc1" with x=52, y=37 encodes:
 *   - Mpc1:  (2, 7)   ← 52 % 10 = 2,  37 % 10 = 7
 *   - Mpc10: (5, 3)   ← 52 / 10 = 5,  37 / 10 = 3
 *
 * Example: A coordinate at scale "pc1" with x=4523, y=891 encodes:
 *   - pc1:   (23, 91)  ← x % 100,      y % 100
 *   - pc100: (45, 8)   ← (x / 100) % 1000, (y / 100) % 1000
 *   - kpc100: (0, 0)   ← (x / 100000) % 10, etc.
 *   - ...and so on up to Mpc10
 */
export const SCALES = {
  /**
   * 100x100 Mpc grid: early-universe thermal regimes
   * Parent of web-scale structure. Each cell is internally homogeneous but
   * cells differ in density contrast, temperature trajectory, etc.
   * Regimes are reversible (not locked fates).
   */
  Mpc100: {
    regimes: { BARYON_COOLING_REGIMES },
  },

  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
  "Mpc100",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  Mpc10: 10, // 10 Mpc10 per Mpc100 (100 Mpc = 10 × 10 Mpc cells)
  Mpc100: 1000, // 1000×1000 grid covers 100,000 Mpc — well beyond observable universe
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution being simulated
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are not part of this coordinate system — they
 * belong to a different simulation context entirely.
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>
