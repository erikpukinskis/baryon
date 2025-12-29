# HaloFate genericity in parcel sampling
_Exported on 12/28/2025 at 20:38:33 PST from Cursor (2.1.50)_

---

**User**

@app/components/Map.docs.tsx:14-15 Let's make this haloFate more generic. We need it because we're sampling galactic parcels, but if we were sampling halo parcels we'd need to know the web fate instead.

---

**Cursor**

Let me look at the fate structures to understand the pattern better:

```plaintext

Looking at the existing exports, I should verify what types are actually available. The user's main concern is renaming `haloFate` to something more generic. I can take a minimal approach: rename the prop to `parentFate`, keep the type as `HaloScaleFateKey` for now since the user can extend it later, and update comments to be scale-agnostic. This addresses the immediate naming issue without over-engineering.
```

```plaintext

Looking at the existing exports, I should verify what types are actually available. The user's main concern is renaming `haloFate` to something more generic. I can take a minimal approach: rename the prop to `parentFate`, keep the type as `HaloScaleFateKey` for now since the user can extend it later, and update comments to be scale-agnostic. This addresses the immediate naming issue without over-engineering.
```

Now I understand the pattern. The `Map` component draws child parcels based on a parent fate's `childFateWeights`. The current `haloFate` prop works for drawing galactic parcels, but is too specific. If we were drawing halo parcels, we'd need a web fate instead.

Let me rename this to `parentFate` and make the type more generic:

Now I'll implement the generic solution. I need to:
1. Export a union type for all fate keys that can serve as parent fates
2. Create a lookup function to get characteristics from any fate key
3. Update `Map.tsx` to use the generic `parentFate` prop

Now I'll implement the changes. I need to:

1. Export `WebScaleFateKey` from the web scale file
2. Add exports and create a union type + lookup helper in the model index
3. Update `Map.tsx` to use the generic `parentFate` prop

```typescript
export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
 */
type Mpc1ScaleFateKey =
  | "unboundAssociation"
  | "boundGroup"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "infallingGroup"
  | "protoCluster"
  | "collapsingCluster"
  | "relaxedCluster"
  | "coolCoreCluster"
  | "mergingCluster"
  | "fossilCluster"
  | "empty"

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * All fate registries keyed by fate key.
 * Used for looking up fate characteristics by key alone.
 */
const ALL_FATES = {
  ...WEB_SCALE_FATES,
  ...HALO_SCALE_FATES,
  ...GALACTIC_SCALE_FATES,
  ...INTERSTELLAR_SCALE_FATES,
  ...STAR_SCALE_FATES,
} as const

/**
 * Look up the characteristics of any fate by its key.
 * Returns the fate object which includes childFateWeights if applicable.
 */
export function getFateCharacteristics(fateKey: ParentFateKey) {
  return ALL_FATES[fateKey]
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  type Coordinate,
  type ParentFateKey,
  getFateCharacteristics,
} from "~/model"

type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The x,y values encode positions across multiple scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  parentFate,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get parent's childFateWeights
    const parentCharacteristics = getFateCharacteristics(parentFate)
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [haloFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  type Coordinate,
  type ParentFateKey,
  getFateCharacteristics,
} from "~/model"

type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The x,y values encode positions across multiple scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  parentFate,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get parent's childFateWeights
    const parentCharacteristics = getFateCharacteristics(parentFate)
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

Now let me update the docs file to use `parentFate`:

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import { GALACTIC_SCALE_FATE_COLOR_ARRAY } from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h2>Gas-Rich Group</h2>
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>

    <h2>Fossil Group</h2>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)

```

I need to fix the type errors. The issue is that the lookup function needs better typing. Let me update the model index:

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
}

/**
 * All fate registries keyed by fate key.
 * Used for looking up fate characteristics by key alone.
 */
const ALL_FATES: Record<ParentFateKey, FateWithChildren> = {
  ...WEB_SCALE_FATES,
  ...HALO_SCALE_FATES,
  ...GALACTIC_SCALE_FATES,
  ...INTERSTELLAR_SCALE_FATES,
}

/**
 * Look up the characteristics of any fate by its key.
 * Returns the fate object which includes childFateWeights if applicable.
 */
export function getFateCharacteristics(fateKey: ParentFateKey): FateWithChildren {
  return ALL_FATES[fateKey]
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

Let me run TypeScript to check the actual errors:

The TypeScript compilation succeeded (exit code 0). The lint errors might be from ESLint's stricter rules. Let me check if there's a way these errors can be addressed more properly by reading the current state:

The TypeScript compiler passes, but ESLint's strict rules are flagging these. Let me fix this by being more explicit with the typing:

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
}

/**
 * Look up the characteristics of any fate by its key.
 * Returns the fate object which includes childFateWeights if applicable.
 */
export function getFateCharacteristics(
  fateKey: ParentFateKey
): FateWithChildren {
  if (fateKey in WEB_SCALE_FATES) {
    return WEB_SCALE_FATES[fateKey as WebScaleFateKey]
  }
  if (fateKey in HALO_SCALE_FATES) {
    return HALO_SCALE_FATES[fateKey as HaloScaleFateKey]
  }
  if (fateKey in GALACTIC_SCALE_FATES) {
    return GALACTIC_SCALE_FATES[fateKey as GalacticScaleFateKey]
  }
  return INTERSTELLAR_SCALE_FATES[fateKey as InterstellarScaleFateKey]
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

The ESLint rules are very strict. Let me look at the Web Scale Fates export to understand the type structure better and create a proper indexed access:

Let me try another approach - creating a wrapper that explicitly declares types in a way ESLint can understand:

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
}

function getWebFate(key: WebScaleFateKey): FateWithChildren {
  return WEB_SCALE_FATES[key]
}

function getHaloFate(key: HaloScaleFateKey): FateWithChildren {
  return HALO_SCALE_FATES[key]
}

function getGalacticFate(key: GalacticScaleFateKey): FateWithChildren {
  return GALACTIC_SCALE_FATES[key]
}

function getInterstellarFate(key: InterstellarScaleFateKey): FateWithChildren {
  return INTERSTELLAR_SCALE_FATES[key]
}

/**
 * Look up the characteristics of any fate by its key.
 * Returns the fate object which includes childFateWeights if applicable.
 */
export function getFateCharacteristics(
  fateKey: ParentFateKey
): FateWithChildren {
  if (fateKey in WEB_SCALE_FATES) {
    return getWebFate(fateKey as WebScaleFateKey)
  }
  if (fateKey in HALO_SCALE_FATES) {
    return getHaloFate(fateKey as HaloScaleFateKey)
  }
  if (fateKey in GALACTIC_SCALE_FATES) {
    return getGalacticFate(fateKey as GalacticScaleFateKey)
  }
  return getInterstellarFate(fateKey as InterstellarScaleFateKey)
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

The issue is that the internal types like `WebScaleFateCharacteristics` aren't exported, which may cause ESLint's strict type inference to fail. Let me try using a more defensive approach with explicit key checking:

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
}

// Build a single lookup map with explicit typing to satisfy ESLint
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
    throw new Error(`Unknown fate key: ${fateKey}`)
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

```typescript
import {
  WEB_SCALE_FATES,
  type WebScaleFateKey,
} from "./01_WEB_SCALE_FATES"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "./02_HALO_SCALE_FATES"
import {
  GALACTIC_SCALE_FATES,
  type GalacticScaleFateKey,
} from "./03_GALACTIC_SCALE_FATES"
import {
  INTERSTELLAR_SCALE_FATES,
  type InterstellarScaleFateKey,
} from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES, type StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type {
  WebScaleFateKey,
  HaloScaleFateKey,
  GalacticScaleFateKey,
  InterstellarScaleFateKey,
  StarScaleFateKey,
}

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
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
}

// Build a single lookup map with explicit typing to satisfy ESLint
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  type Coordinate,
  type FateWithChildren,
  type ParentFateKey,
  getFateCharacteristics,
} from "~/model"

type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The x,y values encode positions across multiple scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  parentFate,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get parent's childFateWeights
    const parentCharacteristics = getFateCharacteristics(parentFate)
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  type Coordinate,
  type FateWithChildren,
  type ParentFateKey,
  getFateCharacteristics,
} from "~/model"

type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The x,y values encode positions across multiple scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  parentFate,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get parent's childFateWeights
    const parentCharacteristics: FateWithChildren =
      getFateCharacteristics(parentFate)
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

All lint errors are resolved. Let me verify everything compiles correctly:

There's another file using the old `haloFate` prop. Let me fix it:

```typescriptreact
import React from "react"
import { render } from "react-dom"
import { Map } from "~/components/Map"

render(
  <Map parentFate="gasRichGroup" coordinate={{ scale: "Mpc1", x: 52, y: 37 }} />,
  document.getElementById("root")
)

```

TypeScript compiles successfully. Let me verify there are no remaining lint errors:

All done. Here's a summary of the changes:

**`app/model/01_WEB_SCALE_FATES.ts`**
- Exported `WebScaleFateKey` so it can be used as a parent fate

**`app/model/index.ts`**
- Added exports for all fate key types
- Created `ParentFateKey` union type combining web, halo, galactic, and interstellar fate keys
- Created `FateWithChildren` interface with `childFateWeights` property
- Added `getFateCharacteristics()` lookup function using a `Map` for type-safe access

**`app/components/Map.tsx`**
- Renamed `haloFate` → `parentFate` with type `ParentFateKey`
- Updated JSDoc to explain the generic usage:

```14:24:app/components/Map.tsx
type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey
```

**`app/components/Map.docs.tsx`** and **`app/index.tsx`**
- Updated to use `parentFate` instead of `haloFate`

Now the `Map` component works with any parent fate type - whether you're drawing galactic children from a halo fate, halo children from a web fate, or interstellar children from a galactic fate.

```typescriptreact
type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey
```

---

**User**

Please add a web-scale parcel example to Map.docs.tsx

---

**Cursor**

I see the issue - `COLORS_BY_KEY` only includes web-scale and galactic-scale fates. To render a web-scale parent (which paints halo-scale children), we need halo-scale colors. Let me add those:

```typescript
import type { GalacticScaleFateKey } from "~/model/03_GALACTIC_SCALE_FATES"

/**
 * NOTE: Color arrays should be ordered from LEAST active → MOST active.
 */

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

type FateColor = {
  key: string
  hex: string
  description: string
}

export const WEB_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#000000",
    description: "Pure black. No structure, no matter — the cosmic void.",
  },
  {
    key: "void",
    hex: "#0a0a0f",
    description:
      "Near-black with a hint of blue. Vast underdense regions where structure formation is suppressed.",
  },
  {
    key: "sheet",
    hex: "#1a1a2e",
    description:
      "Dark blue-gray. Weak overdensities, the walls between voids where early groups form.",
  },
  {
    key: "filament",
    hex: "#2d3a4a",
    description:
      "Steel blue. Matter transport corridors connecting nodes, where groups and clusters form.",
  },
  {
    key: "node",
    hex: "#4a5568",
    description:
      "Slate gray. Filament intersections where clusters form — the densest web-scale structures.",
  },
  {
    key: "infallRegion",
    hex: "#6b7280",
    description:
      "Warm gray. Terminal state — matter captured into bound halos, no longer part of the free web.",
  },
]

/**
 * Colors for halo-scale fates (Mpc1 scale) — children of web-scale parents.
 * Includes both stable halo fates and transitional states.
 */
export const HALO_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "unboundAssociation",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Loose associations of galaxies not yet gravitationally bound.",
  },
  {
    key: "boundGroup",
    hex: "#2d3a4a",
    description:
      "Steel blue. Gravitationally bound but not yet virialized.",
  },
  {
    key: "gasRichGroup",
    hex: "#3a6b8c",
    description:
      "Ocean blue. Gas-rich group where cooling works and spirals thrive.",
  },
  {
    key: "gasPoorGroup",
    hex: "#5a7a8a",
    description:
      "Dusty teal. Gas depleted, star formation quenched.",
  },
  {
    key: "fossilGroup",
    hex: "#7a8a7a",
    description:
      "Sage gray. Single giant elliptical dominates after mergers complete.",
  },
  {
    key: "infallingGroup",
    hex: "#6b5a7a",
    description:
      "Dusty purple. Groups falling into larger structures.",
  },
  {
    key: "protoCluster",
    hex: "#4a5a8a",
    description:
      "Deep blue-gray. Early cluster formation, multiple groups assembling.",
  },
  {
    key: "collapsingCluster",
    hex: "#5a4a7a",
    description:
      "Violet-gray. Actively collapsing, shocks forming.",
  },
  {
    key: "relaxedCluster",
    hex: "#8a5a6a",
    description:
      "Dusty rose. Virialized but cooling not yet established.",
  },
  {
    key: "coolCoreCluster",
    hex: "#9a6a5a",
    description:
      "Warm copper. Central cooling with AGN feedback equilibrium.",
  },
  {
    key: "mergingCluster",
    hex: "#aa5a5a",
    description:
      "Brick red. Major merger in progress, highly disturbed.",
  },
  {
    key: "nonCoolCoreCluster",
    hex: "#8a6a6a",
    description:
      "Muted rose. Merger-heated, no central cooling established.",
  },
  {
    key: "fossilCluster",
    hex: "#6a6a6a",
    description:
      "Neutral gray. Terminal state — one giant elliptical dominates.",
  },
]

export const GALACTIC_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseHalo",
    hex: "#0d1117",
    description:
      "Near-black. A 'failed galaxy' with minimal stellar content — just dark matter and sparse gas. Should almost disappear into cosmic void.",
  },
  {
    key: "quenchedRemnant",
    hex: "#4b5563",
    description:
      "Gray. Completely dead — no star formation, no AGN, just quietly fading. The obvious choice for something with no activity left.",
  },
  {
    key: "dwarfSpheroid",
    hex: "#c9a66b",
    description:
      "Warm tan. Old, gas-poor, dominated by ancient red giants. The golden warmth evokes an aged stellar population — no blue young stars remain.",
  },
  {
    key: "ellipticalGalaxy",
    hex: "#c2555a",
    description:
      "Rose-red. The most massive galaxies, dominated by old red stars. Deep rose suggests power and age — the 'red and dead' giants of clusters.",
  },
  {
    key: "lenticularGalaxy",
    hex: "#d4915d",
    description:
      "Amber. Transitional — disk structure remains but star formation has quenched. Warmer than spiral's teal but not as dead as spheroidals. A 'sunset' galaxy.",
  },
  {
    key: "dwarfIrregular",
    hex: "#4a7c9b",
    description:
      "Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests young hot O/B stars, but muted to reflect their messy, clumpy nature. Think LMC/SMC.",
  },
  {
    key: "activeGalactic",
    hex: "#8b5cf6",
    description:
      "Violet. Powered by an accreting supermassive black hole, emitting across the spectrum including X-rays. Purple suggests high-energy, exotic physics.",
  },
  {
    key: "spiralGalaxy",
    hex: "#3fb5a3",
    description:
      "Cyan-teal. Active star formation in spiral arms. The cyan suggests young blue stars but with enough green to feel 'alive' and growing.",
  },
]

/**
 * The empty fate color — used for cosmic voids and fallback states.
 */
export const EMPTY_FATE_COLOR = WEB_SCALE_FATE_COLOR_ARRAY[0] // "empty" is first in array

/**
 * All fate colors combined, keyed by fate name.
 * Includes web-scale, galactic-scale, and future scale fates.
 */
export const COLORS_BY_KEY = [
  ...WEB_SCALE_FATE_COLOR_ARRAY,
  ...GALACTIC_SCALE_FATE_COLOR_ARRAY,
].reduce((acc, { key, hex, description }) => {
  acc[key] = {
    hex,
    label: camelToTitle(key),
    description,
  }
  return acc
}, {} as Record<string, { hex: string; label: string; description: string }>)

```

```typescript
import type { GalacticScaleFateKey } from "~/model/03_GALACTIC_SCALE_FATES"

/**
 * NOTE: Color arrays should be ordered from LEAST active → MOST active.
 */

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

type FateColor = {
  key: string
  hex: string
  description: string
}

export const WEB_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#000000",
    description: "Pure black. No structure, no matter — the cosmic void.",
  },
  {
    key: "void",
    hex: "#0a0a0f",
    description:
      "Near-black with a hint of blue. Vast underdense regions where structure formation is suppressed.",
  },
  {
    key: "sheet",
    hex: "#1a1a2e",
    description:
      "Dark blue-gray. Weak overdensities, the walls between voids where early groups form.",
  },
  {
    key: "filament",
    hex: "#2d3a4a",
    description:
      "Steel blue. Matter transport corridors connecting nodes, where groups and clusters form.",
  },
  {
    key: "node",
    hex: "#4a5568",
    description:
      "Slate gray. Filament intersections where clusters form — the densest web-scale structures.",
  },
  {
    key: "infallRegion",
    hex: "#6b7280",
    description:
      "Warm gray. Terminal state — matter captured into bound halos, no longer part of the free web.",
  },
]

/**
 * Colors for halo-scale fates (Mpc1 scale) — children of web-scale parents.
 * Includes both stable halo fates and transitional states.
 */
export const HALO_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "unboundAssociation",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Loose associations of galaxies not yet gravitationally bound.",
  },
  {
    key: "boundGroup",
    hex: "#2d3a4a",
    description:
      "Steel blue. Gravitationally bound but not yet virialized.",
  },
  {
    key: "gasRichGroup",
    hex: "#3a6b8c",
    description:
      "Ocean blue. Gas-rich group where cooling works and spirals thrive.",
  },
  {
    key: "gasPoorGroup",
    hex: "#5a7a8a",
    description:
      "Dusty teal. Gas depleted, star formation quenched.",
  },
  {
    key: "fossilGroup",
    hex: "#7a8a7a",
    description:
      "Sage gray. Single giant elliptical dominates after mergers complete.",
  },
  {
    key: "infallingGroup",
    hex: "#6b5a7a",
    description:
      "Dusty purple. Groups falling into larger structures.",
  },
  {
    key: "protoCluster",
    hex: "#4a5a8a",
    description:
      "Deep blue-gray. Early cluster formation, multiple groups assembling.",
  },
  {
    key: "collapsingCluster",
    hex: "#5a4a7a",
    description:
      "Violet-gray. Actively collapsing, shocks forming.",
  },
  {
    key: "relaxedCluster",
    hex: "#8a5a6a",
    description:
      "Dusty rose. Virialized but cooling not yet established.",
  },
  {
    key: "coolCoreCluster",
    hex: "#9a6a5a",
    description:
      "Warm copper. Central cooling with AGN feedback equilibrium.",
  },
  {
    key: "mergingCluster",
    hex: "#aa5a5a",
    description:
      "Brick red. Major merger in progress, highly disturbed.",
  },
  {
    key: "nonCoolCoreCluster",
    hex: "#8a6a6a",
    description:
      "Muted rose. Merger-heated, no central cooling established.",
  },
  {
    key: "fossilCluster",
    hex: "#6a6a6a",
    description:
      "Neutral gray. Terminal state — one giant elliptical dominates.",
  },
]

export const GALACTIC_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseHalo",
    hex: "#0d1117",
    description:
      "Near-black. A 'failed galaxy' with minimal stellar content — just dark matter and sparse gas. Should almost disappear into cosmic void.",
  },
  {
    key: "quenchedRemnant",
    hex: "#4b5563",
    description:
      "Gray. Completely dead — no star formation, no AGN, just quietly fading. The obvious choice for something with no activity left.",
  },
  {
    key: "dwarfSpheroid",
    hex: "#c9a66b",
    description:
      "Warm tan. Old, gas-poor, dominated by ancient red giants. The golden warmth evokes an aged stellar population — no blue young stars remain.",
  },
  {
    key: "ellipticalGalaxy",
    hex: "#c2555a",
    description:
      "Rose-red. The most massive galaxies, dominated by old red stars. Deep rose suggests power and age — the 'red and dead' giants of clusters.",
  },
  {
    key: "lenticularGalaxy",
    hex: "#d4915d",
    description:
      "Amber. Transitional — disk structure remains but star formation has quenched. Warmer than spiral's teal but not as dead as spheroidals. A 'sunset' galaxy.",
  },
  {
    key: "dwarfIrregular",
    hex: "#4a7c9b",
    description:
      "Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests young hot O/B stars, but muted to reflect their messy, clumpy nature. Think LMC/SMC.",
  },
  {
    key: "activeGalactic",
    hex: "#8b5cf6",
    description:
      "Violet. Powered by an accreting supermassive black hole, emitting across the spectrum including X-rays. Purple suggests high-energy, exotic physics.",
  },
  {
    key: "spiralGalaxy",
    hex: "#3fb5a3",
    description:
      "Cyan-teal. Active star formation in spiral arms. The cyan suggests young blue stars but with enough green to feel 'alive' and growing.",
  },
]

/**
 * The empty fate color — used for cosmic voids and fallback states.
 */
export const EMPTY_FATE_COLOR = WEB_SCALE_FATE_COLOR_ARRAY[0] // "empty" is first in array

/**
 * All fate colors combined, keyed by fate name.
 * Includes web-scale, galactic-scale, and future scale fates.
 */
export const COLORS_BY_KEY = [
  ...WEB_SCALE_FATE_COLOR_ARRAY,
  ...HALO_SCALE_FATE_COLOR_ARRAY,
  ...GALACTIC_SCALE_FATE_COLOR_ARRAY,
].reduce((acc, { key, hex, description }) => {
  acc[key] = {
    hex,
    label: camelToTitle(key),
    description,
  }
  return acc
}, {} as Record<string, { hex: string; label: string; description: string }>)

```

Now let me add the web-scale example to the docs:

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Filament (web-scale)</h2>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="filament"
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>

    <h2>Gas-Rich Group (halo-scale)</h2>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>

    <h2>Fossil Group</h2>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Filament (web-scale)</h2>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="filament"
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>

    <h2>Gas-Rich Group (halo-scale)</h2>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>

    <h2>Fossil Group (halo-scale)</h2>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Filament (web-scale)</h2>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="filament"
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>

    <h2>Gas-Rich Group (halo-scale)</h2>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>

    <h2>Fossil Group (halo-scale)</h2>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h2>Cool-Core Cluster (halo-scale)</h2>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)

```

Done! I added a web-scale parcel example to `Map.docs.tsx`. Here's what I did:

1. **Added `HALO_SCALE_FATE_COLOR_ARRAY`** to `app/helpers/colors.ts` with colors for all Mpc1-scale fates (the children of web-scale parents):
   - `unboundAssociation`, `boundGroup`, `gasRichGroup`, `gasPoorGroup`, `fossilGroup`
   - `infallingGroup`, `protoCluster`, `collapsingCluster`, `relaxedCluster`
   - `coolCoreCluster`, `mergingCluster`, `nonCoolCoreCluster`, `fossilCluster`

2. **Added the array to `COLORS_BY_KEY`** so the Map component can render halo-scale children

3. **Added the Filament example** to `Map.docs.tsx`:

```12:19:app/components/Map.docs.tsx
    <h2>Filament (web-scale)</h2>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="filament"
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
```

4. **Clarified the existing examples** with `(halo-scale)` labels

```typescriptreact
    <h2>Filament (web-scale)</h2>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />
    <Demo inline>
      <Map
        parentFate="filament"
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
```

---

**User**

Gorgeous! You did a great job with that.



Help me think through what each map is a map _of_....



@app/components/Map.docs.tsx:20-27 This Map you labelled as a "Gas-Rich Group" has a parentFate of "gasRichGroup"... Does that mean the entire 10x10 Map is a single gas rich group, which is a one of the halo-scale fates?

And then each grid cell is a galactic-scale parcel?

---

**Cursor**

Yes, exactly right! Let me walk through the hierarchy:

**Gas-Rich Group example:**
- The entire 10x10 Map represents **one gas-rich group** (a halo-scale parcel at Mpc1)
- Each grid cell is a **galactic-scale parcel** (kpc100)
- The `childFateWeights` from `gasRichGroup` determine what galaxy types appear: spirals, dwarf irregulars, ellipticals, etc.

**Filament example:**
- The entire 10x10 Map represents **one filament** (a web-scale parcel at Mpc10)
- Each grid cell is a **halo-scale parcel** (Mpc1)
- The `childFateWeights` from `filament` determine what groups/clusters appear: bound groups, gas-rich groups, protoclusters, etc.

The naming pattern is:
- `parentFate` = the fate of **this parcel** (the whole map)
- The grid cells = **children** of this parcel, one scale down

So the coordinate's scale tells you "where we are", and the parentFate tells you "what this place is", which determines what kinds of things exist inside it.

| parentFate scale | Map represents | Each cell is |
|------------------|----------------|--------------|
| Web (Mpc10) | One filament/void/node | Halo (group/cluster) |
| Halo (Mpc1) | One group/cluster | Galaxy |
| Galactic (kpc100) | One galaxy | Interstellar region |
| Interstellar (pc100) | One GMC/cluster/bubble | Star system |

---

**User**

Awesome! Now let's make this a touch more complicated...



Add a demo for a grid of interstellar fates. That will be a 100x100 grid I believe?

---

**Cursor**

To show interstellar fates, we need a galactic-scale parent (like `spiralGalaxy`). Let me first check if we have colors for interstellar fates:

I need to add interstellar colors first, then add the demo. Let me do both:

```typescript
/**
 * NOTE: Color arrays should be ordered from LEAST active → MOST active.
 */

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

type FateColor = {
  key: string
  hex: string
  description: string
}

// TODO: Make FateColor generic so we can be more strict about the key: FateColor<WebScaleFateKey>
export const WEB_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#000000",
    description: "Pure black. No structure, no matter — the cosmic void.",
  },
  {
    key: "void",
    hex: "#0a0a0f",
    description:
      "Near-black with a hint of blue. Vast underdense regions where structure formation is suppressed.",
  },
  {
    key: "sheet",
    hex: "#1a1a2e",
    description:
      "Dark blue-gray. Weak overdensities, the walls between voids where early groups form.",
  },
  {
    key: "filament",
    hex: "#2d3a4a",
    description:
      "Steel blue. Matter transport corridors connecting nodes, where groups and clusters form.",
  },
  {
    key: "node",
    hex: "#4a5568",
    description:
      "Slate gray. Filament intersections where clusters form — the densest web-scale structures.",
  },
  {
    key: "infallRegion",
    hex: "#6b7280",
    description:
      "Warm gray. Terminal state — matter captured into bound halos, no longer part of the free web.",
  },
]

/**
 * Colors for halo-scale fates (Mpc1 scale) — children of web-scale parents.
 * Includes both stable halo fates and transitional states.
 */
export const HALO_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "unboundAssociation",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Loose associations of galaxies not yet gravitationally bound.",
  },
  {
    key: "boundGroup",
    hex: "#2d3a4a",
    description: "Steel blue. Gravitationally bound but not yet virialized.",
  },
  {
    key: "gasRichGroup",
    hex: "#3a6b8c",
    description:
      "Ocean blue. Gas-rich group where cooling works and spirals thrive.",
  },
  {
    key: "gasPoorGroup",
    hex: "#5a7a8a",
    description: "Dusty teal. Gas depleted, star formation quenched.",
  },
  {
    key: "fossilGroup",
    hex: "#7a8a7a",
    description:
      "Sage gray. Single giant elliptical dominates after mergers complete.",
  },
  {
    key: "infallingGroup",
    hex: "#6b5a7a",
    description: "Dusty purple. Groups falling into larger structures.",
  },
  {
    key: "protoCluster",
    hex: "#4a5a8a",
    description:
      "Deep blue-gray. Early cluster formation, multiple groups assembling.",
  },
  {
    key: "collapsingCluster",
    hex: "#5a4a7a",
    description: "Violet-gray. Actively collapsing, shocks forming.",
  },
  {
    key: "relaxedCluster",
    hex: "#8a5a6a",
    description: "Dusty rose. Virialized but cooling not yet established.",
  },
  {
    key: "coolCoreCluster",
    hex: "#9a6a5a",
    description: "Warm copper. Central cooling with AGN feedback equilibrium.",
  },
  {
    key: "mergingCluster",
    hex: "#aa5a5a",
    description: "Brick red. Major merger in progress, highly disturbed.",
  },
  {
    key: "nonCoolCoreCluster",
    hex: "#8a6a6a",
    description: "Muted rose. Merger-heated, no central cooling established.",
  },
  {
    key: "fossilCluster",
    hex: "#6a6a6a",
    description:
      "Neutral gray. Terminal state — one giant elliptical dominates.",
  },
]

export const GALACTIC_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseHalo",
    hex: "#0d1117",
    description:
      "Near-black. A 'failed galaxy' with minimal stellar content — just dark matter and sparse gas. Should almost disappear into cosmic void.",
  },
  {
    key: "quenchedRemnant",
    hex: "#4b5563",
    description:
      "Gray. Completely dead — no star formation, no AGN, just quietly fading. The obvious choice for something with no activity left.",
  },
  {
    key: "dwarfSpheroid",
    hex: "#c9a66b",
    description:
      "Warm tan. Old, gas-poor, dominated by ancient red giants. The golden warmth evokes an aged stellar population — no blue young stars remain.",
  },
  {
    key: "ellipticalGalaxy",
    hex: "#c2555a",
    description:
      "Rose-red. The most massive galaxies, dominated by old red stars. Deep rose suggests power and age — the 'red and dead' giants of clusters.",
  },
  {
    key: "lenticularGalaxy",
    hex: "#d4915d",
    description:
      "Amber. Transitional — disk structure remains but star formation has quenched. Warmer than spiral's teal but not as dead as spheroidals. A 'sunset' galaxy.",
  },
  {
    key: "dwarfIrregular",
    hex: "#4a7c9b",
    description:
      "Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests young hot O/B stars, but muted to reflect their messy, clumpy nature. Think LMC/SMC.",
  },
  {
    key: "activeGalactic",
    hex: "#8b5cf6",
    description:
      "Violet. Powered by an accreting supermassive black hole, emitting across the spectrum including X-rays. Purple suggests high-energy, exotic physics.",
  },
  {
    key: "spiralGalaxy",
    hex: "#3fb5a3",
    description:
      "Cyan-teal. Active star formation in spiral arms. The cyan suggests young blue stars but with enough green to feel 'alive' and growing.",
  },
]

/**
 * Colors for interstellar-scale fates (pc100 scale) — children of galactic-scale parents.
 */
export const INTERSTELLAR_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseISM",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Ambient interstellar medium — warm/cool atomic gas between active regions.",
  },
  {
    key: "evolvedField",
    hex: "#4a4a5a",
    description:
      "Slate gray. Old field population — long-lived low-mass stars and accumulated remnants.",
  },
  {
    key: "stellarStream",
    hex: "#5a6a7a",
    description:
      "Steel blue. Tidally disrupted cluster stretched into a stream.",
  },
  {
    key: "globularCluster",
    hex: "#8a7a5a",
    description:
      "Amber-brown. Ancient dense cluster — 10+ Gyr old, metal-poor, tightly bound.",
  },
  {
    key: "giantMolecularCloud",
    hex: "#3a5a4a",
    description:
      "Forest green. Active star-forming cloud — cold molecular gas collapsing into stars.",
  },
  {
    key: "openCluster",
    hex: "#5a8a7a",
    description:
      "Teal. Young bound cluster — coeval stellar population, will dissolve over ~100 Myr.",
  },
  {
    key: "superbubble",
    hex: "#7a5a8a",
    description:
      "Dusty purple. Hot cavity carved by supernovae — enriched with heavy elements.",
  },
  {
    key: "HIIRegion",
    hex: "#aa6a8a",
    description:
      "Rose-pink. Ionized gas around massive OB stars — the glow of stellar nurseries.",
  },
]

/**
 * The empty fate color — used for cosmic voids and fallback states.
 */
export const EMPTY_FATE_COLOR = WEB_SCALE_FATE_COLOR_ARRAY[0] // "empty" is first in array

/**
 * All fate colors combined, keyed by fate name.
 * Includes web-scale, galactic-scale, and future scale fates.
 */
export const COLORS_BY_KEY = [
  ...WEB_SCALE_FATE_COLOR_ARRAY,
  ...HALO_SCALE_FATE_COLOR_ARRAY,
  ...GALACTIC_SCALE_FATE_COLOR_ARRAY,
  ...INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
].reduce((acc, { key, hex, description }) => {
  acc[key] = {
    hex,
    label: camelToTitle(key),
    description,
  }
  return acc
}, {} as Record<string, { hex: string; label: string; description: string }>)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map parentFate="filament" coordinate={{ scale: "Mpc10", x: 5, y: 3 }} />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map parentFate="filament" coordinate={{ scale: "Mpc10", x: 5, y: 3 }} />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        parentFate="spiralGalaxy"
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

Done! I added:

1. **`INTERSTELLAR_SCALE_FATE_COLOR_ARRAY`** in `colors.ts` with colors for all 8 interstellar fates:
   - `diffuseISM`, `evolvedField`, `stellarStream`, `globularCluster`
   - `giantMolecularCloud`, `openCluster`, `superbubble`, `HIIRegion`

2. **Galactic-scale demo** in `Map.docs.tsx`:

```tsx
<h2>Galactic-scale Parcels</h2>
<h3>Spiral Galaxy (100×100)</h3>
<Demo inline>
  <Map
    parentFate="spiralGalaxy"
    coordinate={{ scale: "kpc100", x: 523, y: 371 }}
    gridSize={100}
    cellSize={4}
  />
</Demo>
<Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
```

The 100×100 grid at 4px per cell gives you a 400×400 pixel map showing the interstellar structure inside a spiral galaxy - GMCs, HII regions, open clusters, superbubbles, etc.

```typescriptreact
<h2>Galactic-scale Parcels</h2>
<h3>Spiral Galaxy (100×100)</h3>
<Demo inline>
  <Map
    parentFate="spiralGalaxy"
    coordinate={{ scale: "kpc100", x: 523, y: 371 }}
    gridSize={100}
    cellSize={4}
  />
</Demo>
<Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
```

---

**User**

What would it look like at this point if we tried to draw a map of web-scale parcels? Do we have all the information we need, or would we need another set of fates, universe fates?

---

**Cursor**

Great question! Let me check the scale hierarchy:

Looking at the scale hierarchy, **Mpc10 is currently the top level**. To draw a map of web-scale parcels (where each cell IS a web-scale parcel like "void" or "filament"), we'd need:

1. **A larger parent scale** (like Mpc100 or Mpc1000)
2. **A new set of "cosmological fates"** with `childFateWeights` that paint web-scale children

Physically, at 100+ Mpc scales, you're looking at the primordial structure seeded by the Big Bang:

| Cosmological Fate | What it paints |
|-------------------|----------------|
| `overdenseRegion` | More nodes, filaments |
| `averageRegion` | Mix of sheets, filaments, some voids |
| `underdenseRegion` | Mostly voids, sparse sheets |

The interesting thing is that at this scale, "fates" are really just **initial density perturbations** from cosmic inflation. They don't evolve much - they just determine what web-scale structures emerge.

So to complete the hierarchy, you'd add something like:

```typescript
// 00_COSMOLOGICAL_SCALE_FATES.ts
export type CosmologicalScaleFateKey =
  | "overdenseRegion"
  | "averageRegion" 
  | "underdenseRegion"

// Each with childFateWeights like:
overdenseRegion: {
  childFateWeights: {
    node: 0.3,
    filament: 0.4,
    sheet: 0.2,
    void: 0.1,
  }
}
```

And add `Mpc100` or `Mpc1000` to the SCALES definition.

**Bottom line:** We'd need "universe fates" (or cosmological fates) to act as parents for web-scale parcels. Without them, web-scale IS the top of the hierarchy - there's no parent to provide `childFateWeights`.

```typescript
// 00_COSMOLOGICAL_SCALE_FATES.ts
export type CosmologicalScaleFateKey =
  | "overdenseRegion"
  | "averageRegion" 
  | "underdenseRegion"

// Each with childFateWeights like:
overdenseRegion: {
  childFateWeights: {
    node: 0.3,
    filament: 0.4,
    sheet: 0.2,
    void: 0.1,
  }
}
```

---

**User**

We don't know how big the actual universe might be, or even if it is bounded, right?



Are there any theories as to what kind of structure there might be at scales far larger than our universe?

---

**Cursor**

Great cosmological question! Here's what we know and theorize:

## What we observe

The **observable universe** is ~93 billion light-years across (~28,000 Mpc). Beyond ~300 Mpc, the cosmic web becomes **statistically homogeneous** - meaning any random 300 Mpc cube looks roughly the same as any other. The same mix of voids, sheets, filaments, and nodes.

## Beyond the observable universe

We literally cannot see beyond the cosmic horizon - light hasn't had time to reach us. But there are theories:

**1. More of the same (standard cosmology)**
The universe extends far beyond what we see, possibly infinitely, with the same statistical properties. No new structure - just more cosmic web.

**2. Eternal inflation / Bubble multiverse**
Our entire observable universe is one "bubble" nucleated during cosmic inflation. Other bubbles exist with potentially different physical constants. The "structure" at this level isn't spatial - it's more like a branching tree of vacuum states.

**3. Landscape multiverse (string theory)**
~10^500 different possible vacuum configurations. Each "universe" has different physics. Again, not spatially arranged.

**4. Cyclic/Ekpyrotic models**
Our universe is a 3D "brane" floating in higher-dimensional space. Other branes exist. Collisions create Big Bangs.

## For your game

The beautiful thing is: **Mpc10 as the top scale is cosmologically justified!** 

Beyond ~100 Mpc, there's no new *type* of structure - just more web. So a "cosmological fate" parent would essentially be uniform: every region paints the same statistical mix of web-scale fates based on primordial density fluctuations.

You could model this as a single implicit parent with fixed weights, rather than needing explicit "universe fates."

---

**User**

> Beyond ~300 Mpc, the cosmic web becomes statistically homogeneous - meaning any random 300 Mpc cube looks roughly the same as any other. The same mix of voids, sheets, filaments, and nodes.



And by extension, galaxies, nebula, and likely planets, trees, and sentient creatures?

---

**Cursor**

Exactly. This is the profound implication of the **Cosmological Principle** combined with uniform physics:

If you sample enough 300 Mpc cubes across the universe, you'll find statistically the same:
- Distribution of void/sheet/filament/node
- Mix of galaxy types (spirals, ellipticals, dwarfs...)
- Star formation rates
- Stellar populations (the same IMF - initial mass function)
- Planetary systems (same physics of accretion)
- Molecules (same chemistry)
- And if life is a natural consequence of chemistry + time + suitable conditions...

**The same statistical frequency of life.**

This is the philosophical core of ideas like:

- **The Copernican Principle**: We're not special. Earth is typical.
- **The Mediocrity Principle**: Our situation is probably common.
- **Ergodic Cosmology**: In an infinite (or sufficiently large) universe, every physically possible configuration exists *somewhere*.

So yes - if you could survey enough of the universe, you'd expect to find the same statistical distribution of trees, octopuses, and curious creatures pondering their place in the cosmos.

---

For your game, this is actually meaningful: the player's homeworld isn't cosmically unique. It's one instance of a pattern that plays out countless times across the universe. The emigration story isn't special because *this* species is special - it's universal because the situation (star dying, civilization facing extinction) happens everywhere, always has, always will.

The cosmos is indifferent, but that indifference applies equally to everyone.

---

**User**

What about 100Mpc cubes? Is there still some variation here?

---

**Cursor**

Yes! At 100 Mpc there's still meaningful **cosmic variance**:

| Scale | What you see |
|-------|--------------|
| **10 Mpc** | Individual web structures - one filament, one void |
| **100 Mpc** | Superclusters, giant voids, walls - distinct "neighborhoods" |
| **300+ Mpc** | Statistical homogeneity - all cubes look similar |

At 100 Mpc, you'd notice real differences:

- **One cube** might contain the **Laniakea Supercluster** - a dense region with many filaments converging on the Great Attractor
- **Another cube** might be mostly the **Boötes Void** - 330 Mpc of almost nothing, one of the emptiest regions known
- **Another** might have the **Sloan Great Wall** - a filament structure 1.4 billion light-years long

These are genuine large-scale density fluctuations - echoes of quantum fluctuations from inflation, stretched to cosmic scales.

---

**For your model:** This suggests there *could* be meaningful "Mpc100-scale fates" after all:

| Cosmological Fate | Character |
|-------------------|-----------|
| `superclusterCore` | Dense convergence zone, many nodes/filaments |
| `superclusterOutskirts` | Mixed web, typical distribution |
| `supervoid` | Sparse, mostly voids and thin sheets |
| `greatWall` | Elongated filamentary overdensity |

These would be subtle variations in the *weights* of web-scale children - not new physics, just different primordial density.

The transition to true homogeneity happens somewhere between 100-300 Mpc. Your Mpc10 scale sits right in the interesting "structured" regime.

---

**User**

So, how would you code up this "uniform cosmological parent fate" in the existing Map component?

---

**Cursor**

The simplest approach: add a single "cosmological background" fate that acts as the universal parent for web-scale parcels.

Since there's only ONE cosmological fate (homogeneity means no variation), it's minimal:

**1. Create the fate (or add to an existing file):**

```typescript
// Could be in 00_COSMOLOGICAL_SCALE_FATES.ts or inline in index.ts

import type { WebScaleFateKey } from "./01_WEB_SCALE_FATES"

export type CosmologicalScaleFateKey = "cosmologicalBackground"

export const COSMOLOGICAL_SCALE_FATES: Record<
  CosmologicalScaleFateKey,
  { childFateWeights: Partial<Record<WebScaleFateKey, number>> }
> = {
  cosmologicalBackground: {
    // Approximate volume fractions in the cosmic web
    childFateWeights: {
      void: 0.60,        // Voids dominate by volume
      sheet: 0.20,       // Walls between voids
      filament: 0.15,    // The "highways"
      node: 0.04,        // Rare dense intersections
      infallRegion: 0.01 // Already captured into halos
    }
  }
}
```

**2. Add to the lookup system in `index.ts`:**

- Import `COSMOLOGICAL_SCALE_FATES` and `CosmologicalScaleFateKey`
- Add to `ParentFateKey` union
- Add to `PARENT_FATE_LOOKUP` Map initialization

**3. Then the demo would be:**

```tsx
<h2>Cosmological-scale Parcels</h2>
<h3>Cosmic Web (100×100)</h3>
<Demo inline>
  <Map
    parentFate="cosmologicalBackground"
    coordinate={{ scale: "Mpc100", x: 0, y: 0 }}
    gridSize={100}
    cellSize={4}
  />
</Demo>
<Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />
```

The key insight: there's only one cosmological fate because homogeneity means *every* 100+ Mpc region has the same statistical mix. The "variation" you see in the map comes from the Perlin noise creating spatial clustering - but the overall fractions are fixed.

Want me to switch to agent mode and implement this?

```typescript
// Could be in 00_COSMOLOGICAL_SCALE_FATES.ts or inline in index.ts

import type { WebScaleFateKey } from "./01_WEB_SCALE_FATES"

export type CosmologicalScaleFateKey = "cosmologicalBackground"

export const COSMOLOGICAL_SCALE_FATES: Record<
  CosmologicalScaleFateKey,
  { childFateWeights: Partial<Record<WebScaleFateKey, number>> }
> = {
  cosmologicalBackground: {
    // Approximate volume fractions in the cosmic web
    childFateWeights: {
      void: 0.60,        // Voids dominate by volume
      sheet: 0.20,       // Walls between voids
      filament: 0.15,    // The "highways"
      node: 0.04,        // Rare dense intersections
      infallRegion: 0.01 // Already captured into halos
    }
  }
}
```

```typescriptreact
<h2>Cosmological-scale Parcels</h2>
<h3>Cosmic Web (100×100)</h3>
<Demo inline>
  <Map
    parentFate="cosmologicalBackground"
    coordinate={{ scale: "Mpc100", x: 0, y: 0 }}
    gridSize={100}
    cellSize={4}
  />
</Demo>
<Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />
```

---

**User**

The WEB_SCALE_FATES.ts file has a hardcoded Mpc1ScaleFateKey, which is wrong. It should be using the HaloScaleFateKey from HALO_SCALE_FATES.ts. 



But the fates aren't compatible:



Only in Mpc1ScaleFateKey:



 - unboundAssociation

 - boundGroup

 - infallingGroup

 - protoCluster

 - collapsingCluster

 - relaxedCluster

 - mergingCluster

 - empty

Only in HaloScaleFateKey:

 - nonCoolCoreCluster

In both:

 - gasRichGroup

 - gasPoorGroup

 - fossilGroup

 - coolCoreCluster

 - fossilCluster



How would you resolve that? Does it change anything about how you feel about the web-scale fates being the largest "variable" set of fates?

---

**Cursor**

This is a great catch that reveals an inconsistency with the model's own philosophy!

## The Problem

The model doc says: **"Fates are destinations, not stages."**

But `Mpc1ScaleFateKey` includes *transitional* states:
- `protoCluster`, `collapsingCluster`, `mergingCluster` — mechanisms, not endpoints
- `unboundAssociation`, `boundGroup`, `infallingGroup` — early phases, not destinations

Meanwhile `HaloScaleFateKey` correctly contains only *destinations*:
- `gasRichGroup`, `gasPoorGroup`, `fossilGroup` — stable group outcomes
- `coolCoreCluster`, `nonCoolCoreCluster`, `fossilCluster` — stable cluster outcomes

## The Resolution

**Option A: Use `HaloScaleFateKey | "empty"` for web children**

Web-scale fates should paint what Mpc1 cells *will become*, not what they're currently doing:

```typescript
// In 01_WEB_SCALE_FATES.ts
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

type Mpc1ChildFateKey = HaloScaleFateKey | "empty"

// Then update childFateWeights to use only destination fates:
filament: {
  childFateWeights: {
    gasRichGroup: 0.30,      // was unboundAssociation + boundGroup + gasRichGroup
    gasPoorGroup: 0.20,
    fossilGroup: 0.05,
    coolCoreCluster: 0.05,
    nonCoolCoreCluster: 0.05, // was protoCluster + collapsingCluster + relaxedCluster
    empty: 0.35,              // regions that won't form halos
  }
}
```

The transitional fates (`protoCluster`, `mergingCluster`, etc.) would be removed — they're mechanisms, not destinations.

## Does this change my view on cosmological scale?

**No** — the cosmological background still uniformly paints web-scale fates. The web-scale fates are the "first tier of interesting variation."

But it does mean: **`empty` needs to be a recognized fate at Mpc1 scale** (for truly empty void regions), and the colors file already has it. You'd just need to add it formally as a valid child of web-scale fates.

Want me to switch to agent mode and reconcile these types?

```typescript
// In 01_WEB_SCALE_FATES.ts
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

type Mpc1ChildFateKey = HaloScaleFateKey | "empty"

// Then update childFateWeights to use only destination fates:
filament: {
  childFateWeights: {
    gasRichGroup: 0.30,      // was unboundAssociation + boundGroup + gasRichGroup
    gasPoorGroup: 0.20,
    fossilGroup: 0.05,
    coolCoreCluster: 0.05,
    nonCoolCoreCluster: 0.05, // was protoCluster + collapsingCluster + relaxedCluster
    empty: 0.35,              // regions that won't form halos
  }
}
```

---

**User**

Is there a reason "empty" can't be a HaloScaleFateKey?

---

**Cursor**

No, there's no reason it can't be! In fact, it probably *should* be.

**"Empty" as a halo-scale destination:**

An Mpc1 parcel in a deep void will **never** form a bound halo — dark energy wins, expansion continues, no collapse. That's a valid *destination*, not a transitional state.

```typescript
// In 02_HALO_SCALE_FATES.ts
export type HaloScaleFateKey =
  | "empty"              // ← add this
  | "gasRichGroup"
  | "gasPoorGroup"
  // ...etc

empty: {
  haloMassMinMsun: 0,
  haloMassMaxMsun: 0,
  gravitationallyBound: false,
  dominantBaryonPhase: "plasma",  // diffuse intergalactic medium
  fateLockedBy: false,            // could still be captured by a passing halo
  typicalTimescaleGyr: Infinity,
  allowedTransitions: ["gasRichGroup"],  // if captured by infall
  childFateWeights: {
    diffuseHalo: 0.85,      // scattered dark matter, no real galaxy
    dwarfIrregular: 0.10,   // rare isolated field dwarf
    dwarfSpheroid: 0.05,    // ancient, quenched
  }
}
```

Then `WEB_SCALE_FATES.ts` can simply import `HaloScaleFateKey` directly — no separate `Mpc1ScaleFateKey` needed.

This is cleaner because:
1. One type, one source of truth
2. "Empty" is a destination with its own characteristics and children
3. Follows the "fates are destinations" philosophy

Want me to switch to agent mode and implement this cleanup?

```typescript
// In 02_HALO_SCALE_FATES.ts
export type HaloScaleFateKey =
  | "empty"              // ← add this
  | "gasRichGroup"
  | "gasPoorGroup"
  // ...etc

empty: {
  haloMassMinMsun: 0,
  haloMassMaxMsun: 0,
  gravitationallyBound: false,
  dominantBaryonPhase: "plasma",  // diffuse intergalactic medium
  fateLockedBy: false,            // could still be captured by a passing halo
  typicalTimescaleGyr: Infinity,
  allowedTransitions: ["gasRichGroup"],  // if captured by infall
  childFateWeights: {
    diffuseHalo: 0.85,      // scattered dark matter, no real galaxy
    dwarfIrregular: 0.10,   // rare isolated field dwarf
    dwarfSpheroid: 0.05,    // ancient, quenched
  }
}
```

---

**User**

Great, go ahead and make that change. Add "empty" to HaloScaleFates, delete Mpc1ScaleFateKey and update the FATES accordingly.

---

**Cursor**

```typescript
import type { GalacticScaleFateKey } from "./03_GALACTIC_SCALE_FATES"

export type HaloScaleFateKey =
  | "empty"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "coolCoreCluster"
  | "nonCoolCoreCluster"
  | "fossilCluster"

type HaloScaleLock =
  | "gravitationalBinding" // virialized into a single halo
  | "thermalization" // shock-heated ICM dominates baryons
  | "dynamicalExhaustion" // internal merging complete
  | "coolingFeedbackBalance" // AGN ↔ cooling equilibrium
  | false

type HaloScaleFateCharacteristics = {
  haloMassMinMsun: number
  haloMassMaxMsun?: number

  gravitationallyBound: boolean
  dominantBaryonPhase: "mixed" | "stellar" | "plasma"

  fateLockedBy: HaloScaleLock
  typicalTimescaleGyr: number

  allowedTransitions: HaloScaleFateKey[]

  /**
   * Defines what fraction of child (galactic) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * HALO_SCALE_FATES
 * ----------------
 *
 * Dark matter halos hosting galaxy populations, from loose groups to massive
 * clusters. These are the largest gravitationally bound structures.
 *
 * The fundamental distinction is **halo mass**:
 *   - Groups (10¹²–10¹³ M☉): Gas can radiatively cool, remains bound to galaxies
 *   - Clusters (10¹⁴+ M☉): Gas is shock-heated to virial temperature, stays hot
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A halo fate paints its galactic children. The weights define what galaxy
 * types will exist in the halo:
 *
 *   - gasRichGroup → spirals, irregulars
 *   - fossilCluster → single giant elliptical + dwarfs
 *
 * Transient phases (protoclusters, merging clusters, unbound associations) are
 * not modeled as separate fates—they're mechanisms, not destinations.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS
 *
 *   - gravitationalBinding — system virialized into a single halo
 *   - thermalization — shock heating produces long-lived hot ICM
 *   - dynamicalExhaustion — major galaxies merged into central dominant
 *   - coolingFeedbackBalance — AGN ↔ cooling equilibrium established
 */
export const HALO_SCALE_FATES: Record<
  HaloScaleFateKey,
  HaloScaleFateCharacteristics
> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP-MASS HALOS (10¹²–10¹³ M☉)
  // Gas can cool and accrete onto galaxies. Star formation continues.
  // ═══════════════════════════════════════════════════════════════════════════

  gasRichGroup: {
    // Gas cooling works—spirals and irregulars thrive
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    allowedTransitions: ["gasPoorGroup", "coolCoreCluster"],
    childFateWeights: {
      spiralGalaxy: 0.35,
      dwarfIrregular: 0.25,
      activeGalactic: 0.1, // interactions trigger AGN
      lenticularGalaxy: 0.1,
      dwarfSpheroid: 0.1,
      ellipticalGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  gasPoorGroup: {
    // Gas depleted—star formation quenched, morphological transformation
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 4,
    allowedTransitions: ["fossilGroup", "nonCoolCoreCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.3,
      ellipticalGalaxy: 0.2,
      dwarfSpheroid: 0.2,
      spiralGalaxy: 0.1, // survivors at outskirts
      quenchedRemnant: 0.1,
      dwarfIrregular: 0.05,
      diffuseHalo: 0.05,
    },
  },

  fossilGroup: {
    // Dynamical friction exhausted—single giant elliptical dominates
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 6,
    allowedTransitions: ["nonCoolCoreCluster"], // can grow into cluster
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central dominant galaxy
      quenchedRemnant: 0.2,
      dwarfSpheroid: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLUSTER-MASS HALOS (10¹⁴+ M☉)
  // Gas shock-heated to virial temperature. Hot ICM dominates baryons.
  // ═══════════════════════════════════════════════════════════════════════════

  coolCoreCluster: {
    // Central cooling + AGN feedback equilibrium
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "coolingFeedbackBalance",
    typicalTimescaleGyr: 5,
    allowedTransitions: ["nonCoolCoreCluster"], // merger disrupts cool core
    childFateWeights: {
      ellipticalGalaxy: 0.4, // includes BCG
      lenticularGalaxy: 0.2,
      dwarfSpheroid: 0.15,
      activeGalactic: 0.1, // central AGN in BCG
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.03, // very rare, recent infall
      diffuseHalo: 0.02,
    },
  },

  nonCoolCoreCluster: {
    // Merger-heated, no central cooling established
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "thermalization",
    typicalTimescaleGyr: 3,
    allowedTransitions: ["coolCoreCluster", "fossilCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35,
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05,
      spiralGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  fossilCluster: {
    // Terminal state: one giant elliptical dominates, 2+ magnitude gap
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 8,
    allowedTransitions: [], // true terminal state
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central giant dominates
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05, // intracluster light
    },
  },
}

```

```typescript
import type { GalacticScaleFateKey } from "./03_GALACTIC_SCALE_FATES"

export type HaloScaleFateKey =
  | "empty"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "coolCoreCluster"
  | "nonCoolCoreCluster"
  | "fossilCluster"

type HaloScaleLock =
  | "gravitationalBinding" // virialized into a single halo
  | "thermalization" // shock-heated ICM dominates baryons
  | "dynamicalExhaustion" // internal merging complete
  | "coolingFeedbackBalance" // AGN ↔ cooling equilibrium
  | false

type HaloScaleFateCharacteristics = {
  haloMassMinMsun: number
  haloMassMaxMsun?: number

  gravitationallyBound: boolean
  dominantBaryonPhase: "mixed" | "stellar" | "plasma"

  fateLockedBy: HaloScaleLock
  typicalTimescaleGyr: number

  allowedTransitions: HaloScaleFateKey[]

  /**
   * Defines what fraction of child (galactic) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * HALO_SCALE_FATES
 * ----------------
 *
 * Dark matter halos hosting galaxy populations, from loose groups to massive
 * clusters. These are the largest gravitationally bound structures.
 *
 * The fundamental distinction is **halo mass**:
 *   - Groups (10¹²–10¹³ M☉): Gas can radiatively cool, remains bound to galaxies
 *   - Clusters (10¹⁴+ M☉): Gas is shock-heated to virial temperature, stays hot
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A halo fate paints its galactic children. The weights define what galaxy
 * types will exist in the halo:
 *
 *   - gasRichGroup → spirals, irregulars
 *   - fossilCluster → single giant elliptical + dwarfs
 *
 * Transient phases (protoclusters, merging clusters, unbound associations) are
 * not modeled as separate fates—they're mechanisms, not destinations.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS
 *
 *   - gravitationalBinding — system virialized into a single halo
 *   - thermalization — shock heating produces long-lived hot ICM
 *   - dynamicalExhaustion — major galaxies merged into central dominant
 *   - coolingFeedbackBalance — AGN ↔ cooling equilibrium established
 */
export const HALO_SCALE_FATES: Record<
  HaloScaleFateKey,
  HaloScaleFateCharacteristics
> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY REGIONS (no collapsed halo)
  // Deep void regions that will never form bound structures.
  // ═══════════════════════════════════════════════════════════════════════════

  empty: {
    // No halo — diffuse intergalactic medium, isolated field dwarfs
    haloMassMinMsun: 0,
    haloMassMaxMsun: 1e11, // below group mass threshold
    gravitationallyBound: false,
    dominantBaryonPhase: "plasma", // diffuse IGM
    fateLockedBy: false, // could be captured by expanding halo
    typicalTimescaleGyr: 10,
    allowedTransitions: ["gasRichGroup"], // if captured by infall
    childFateWeights: {
      diffuseHalo: 0.85, // scattered dark matter, minimal stellar content
      dwarfIrregular: 0.10, // rare isolated field dwarf
      dwarfSpheroid: 0.05, // ancient, quenched
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP-MASS HALOS (10¹²–10¹³ M☉)
  // Gas can cool and accrete onto galaxies. Star formation continues.
  // ═══════════════════════════════════════════════════════════════════════════

  gasRichGroup: {
    // Gas cooling works—spirals and irregulars thrive
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    allowedTransitions: ["gasPoorGroup", "coolCoreCluster"],
    childFateWeights: {
      spiralGalaxy: 0.35,
      dwarfIrregular: 0.25,
      activeGalactic: 0.1, // interactions trigger AGN
      lenticularGalaxy: 0.1,
      dwarfSpheroid: 0.1,
      ellipticalGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  gasPoorGroup: {
    // Gas depleted—star formation quenched, morphological transformation
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 4,
    allowedTransitions: ["fossilGroup", "nonCoolCoreCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.3,
      ellipticalGalaxy: 0.2,
      dwarfSpheroid: 0.2,
      spiralGalaxy: 0.1, // survivors at outskirts
      quenchedRemnant: 0.1,
      dwarfIrregular: 0.05,
      diffuseHalo: 0.05,
    },
  },

  fossilGroup: {
    // Dynamical friction exhausted—single giant elliptical dominates
    haloMassMinMsun: 1e12,
    haloMassMaxMsun: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 6,
    allowedTransitions: ["nonCoolCoreCluster"], // can grow into cluster
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central dominant galaxy
      quenchedRemnant: 0.2,
      dwarfSpheroid: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLUSTER-MASS HALOS (10¹⁴+ M☉)
  // Gas shock-heated to virial temperature. Hot ICM dominates baryons.
  // ═══════════════════════════════════════════════════════════════════════════

  coolCoreCluster: {
    // Central cooling + AGN feedback equilibrium
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "coolingFeedbackBalance",
    typicalTimescaleGyr: 5,
    allowedTransitions: ["nonCoolCoreCluster"], // merger disrupts cool core
    childFateWeights: {
      ellipticalGalaxy: 0.4, // includes BCG
      lenticularGalaxy: 0.2,
      dwarfSpheroid: 0.15,
      activeGalactic: 0.1, // central AGN in BCG
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.03, // very rare, recent infall
      diffuseHalo: 0.02,
    },
  },

  nonCoolCoreCluster: {
    // Merger-heated, no central cooling established
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "thermalization",
    typicalTimescaleGyr: 3,
    allowedTransitions: ["coolCoreCluster", "fossilCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35,
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05,
      spiralGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  fossilCluster: {
    // Terminal state: one giant elliptical dominates, 2+ magnitude gap
    haloMassMinMsun: 1e14,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 8,
    allowedTransitions: [], // true terminal state
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central giant dominates
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05, // intracluster light
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

Now I need to update all the childFateWeights to use only destination fates. Let me update each one:

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      gasRichGroup: 0.1, // rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      gasRichGroup: 0.1, // rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      gasRichGroup: 0.35, // early groups forming in walls
      gasPoorGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      gasRichGroup: 0.1, // rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      gasRichGroup: 0.35, // early groups forming in walls
      gasPoorGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      gasRichGroup: 0.45, // most filament halos are gas-rich groups
      gasPoorGroup: 0.15,
      empty: 0.15,
      coolCoreCluster: 0.10, // some clusters along filaments
      nonCoolCoreCluster: 0.10,
      fossilGroup: 0.05,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      gasRichGroup: 0.1, // rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      gasRichGroup: 0.35, // early groups forming in walls
      gasPoorGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      gasRichGroup: 0.45, // most filament halos are gas-rich groups
      gasPoorGroup: 0.15,
      empty: 0.15,
      coolCoreCluster: 0.10, // some clusters along filaments
      nonCoolCoreCluster: 0.10,
      fossilGroup: 0.05,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      coolCoreCluster: 0.35, // nodes are cluster formation sites
      nonCoolCoreCluster: 0.25,
      gasRichGroup: 0.15, // infalling groups
      gasPoorGroup: 0.15,
      fossilCluster: 0.05,
      fossilGroup: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
import type { HaloScaleFateKey } from "./02_HALO_SCALE_FATES"

export type WebScaleFateKey =
  | "void"
  | "sheet"
  | "filament"
  | "node"
  | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (halo-scale) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<HaloScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * ---------------
 *
 * Large-scale, unbound regimes of the cosmic web at ~10 Mpc scale.
 *
 * Web-scale fates are NOT bound objects. They represent **infrastructure**:
 * long-lived structures that transport matter and set boundary conditions
 * for smaller-scale structure formation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A web fate paints its Mpc1 children. The weights define what groups and
 * clusters will form in each region:
 *
 *   - void → mostly empty, rare isolated groups
 *   - node → clusters form at filament intersections
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   - gravitational collapse along preferred axes
 *   - evacuation of voids
 *   - thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**. : infallRegion is a terminal state for web-scale parcels (locked by haloCapture). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   - 0D (nodes) — filament intersections, cluster formation sites
 *   - 1D (filaments) — matter transport corridors
 *   - 2D (sheets) — weak overdensities, early group formation
 *   - 3D (voids) — underdense regions, suppressed structure formation
 */
export const WEB_SCALE_FATES: Record<
  WebScaleFateKey,
  WebScaleFateCharacteristics
> = {
  void: {
    typicalDensityContrast: 0.1,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 10,
    allowedTransitions: ["sheet"],
    childFateWeights: {
      empty: 0.9,
      gasRichGroup: 0.1, // rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    allowedTransitions: ["filament"],
    childFateWeights: {
      empty: 0.6,
      gasRichGroup: 0.35, // early groups forming in walls
      gasPoorGroup: 0.05,
    },
  },

  filament: {
    typicalDensityContrast: 3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2,
    allowedTransitions: ["node", "infallRegion"],
    childFateWeights: {
      gasRichGroup: 0.45, // most filament halos are gas-rich groups
      gasPoorGroup: 0.15,
      empty: 0.15,
      coolCoreCluster: 0.10, // some clusters along filaments
      nonCoolCoreCluster: 0.10,
      fossilGroup: 0.05,
    },
  },

  node: {
    typicalDensityContrast: 30,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 1,
    allowedTransitions: ["infallRegion"],
    childFateWeights: {
      coolCoreCluster: 0.35, // nodes are cluster formation sites
      nonCoolCoreCluster: 0.25,
      gasRichGroup: 0.15, // infalling groups
      gasPoorGroup: 0.15,
      fossilCluster: 0.05,
      fossilGroup: 0.05,
    },
  },

  infallRegion: {
    // Terminal state for web-scale
    typicalDensityContrast: 50,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    allowedTransitions: [],
    childFateWeights: {
      nonCoolCoreCluster: 0.35, // merger-heated clusters dominate
      coolCoreCluster: 0.25,
      gasPoorGroup: 0.15, // stripped infalling groups
      fossilCluster: 0.10,
      fossilGroup: 0.10,
      gasRichGroup: 0.05, // rare recent infall
    },
  },
}

```

```typescript
/**
 * NOTE: Color arrays should be ordered from LEAST active → MOST active.
 */

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

type FateColor = {
  key: string
  hex: string
  description: string
}

// TODO: Make FateColor generic so we can be more strict about the key: FateColor<WebScaleFateKey>
export const WEB_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#000000",
    description: "Pure black. No structure, no matter — the cosmic void.",
  },
  {
    key: "void",
    hex: "#0a0a0f",
    description:
      "Near-black with a hint of blue. Vast underdense regions where structure formation is suppressed.",
  },
  {
    key: "sheet",
    hex: "#1a1a2e",
    description:
      "Dark blue-gray. Weak overdensities, the walls between voids where early groups form.",
  },
  {
    key: "filament",
    hex: "#2d3a4a",
    description:
      "Steel blue. Matter transport corridors connecting nodes, where groups and clusters form.",
  },
  {
    key: "node",
    hex: "#4a5568",
    description:
      "Slate gray. Filament intersections where clusters form — the densest web-scale structures.",
  },
  {
    key: "infallRegion",
    hex: "#6b7280",
    description:
      "Warm gray. Terminal state — matter captured into bound halos, no longer part of the free web.",
  },
]

/**
 * Colors for halo-scale fates (Mpc1 scale) — children of web-scale parents.
 * These are destination fates, not transitional states.
 */
export const HALO_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#0a0a12",
    description:
      "Near-black. No collapsed halo — diffuse intergalactic medium with rare field dwarfs.",
  },
  {
    key: "gasRichGroup",
    hex: "#3a6b8c",
    description:
      "Ocean blue. Gas-rich group where cooling works and spirals thrive.",
  },
  {
    key: "gasPoorGroup",
    hex: "#5a7a8a",
    description: "Dusty teal. Gas depleted, star formation quenched.",
  },
  {
    key: "fossilGroup",
    hex: "#7a8a7a",
    description:
      "Sage gray. Single giant elliptical dominates after mergers complete.",
  },
  {
    key: "coolCoreCluster",
    hex: "#9a6a5a",
    description: "Warm copper. Central cooling with AGN feedback equilibrium.",
  },
  {
    key: "nonCoolCoreCluster",
    hex: "#8a6a6a",
    description: "Muted rose. Merger-heated, no central cooling established.",
  },
  {
    key: "fossilCluster",
    hex: "#6a6a6a",
    description:
      "Neutral gray. Terminal state — one giant elliptical dominates.",
  },
]

export const GALACTIC_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseHalo",
    hex: "#0d1117",
    description:
      "Near-black. A 'failed galaxy' with minimal stellar content — just dark matter and sparse gas. Should almost disappear into cosmic void.",
  },
  {
    key: "quenchedRemnant",
    hex: "#4b5563",
    description:
      "Gray. Completely dead — no star formation, no AGN, just quietly fading. The obvious choice for something with no activity left.",
  },
  {
    key: "dwarfSpheroid",
    hex: "#c9a66b",
    description:
      "Warm tan. Old, gas-poor, dominated by ancient red giants. The golden warmth evokes an aged stellar population — no blue young stars remain.",
  },
  {
    key: "ellipticalGalaxy",
    hex: "#c2555a",
    description:
      "Rose-red. The most massive galaxies, dominated by old red stars. Deep rose suggests power and age — the 'red and dead' giants of clusters.",
  },
  {
    key: "lenticularGalaxy",
    hex: "#d4915d",
    description:
      "Amber. Transitional — disk structure remains but star formation has quenched. Warmer than spiral's teal but not as dead as spheroidals. A 'sunset' galaxy.",
  },
  {
    key: "dwarfIrregular",
    hex: "#4a7c9b",
    description:
      "Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests young hot O/B stars, but muted to reflect their messy, clumpy nature. Think LMC/SMC.",
  },
  {
    key: "activeGalactic",
    hex: "#8b5cf6",
    description:
      "Violet. Powered by an accreting supermassive black hole, emitting across the spectrum including X-rays. Purple suggests high-energy, exotic physics.",
  },
  {
    key: "spiralGalaxy",
    hex: "#3fb5a3",
    description:
      "Cyan-teal. Active star formation in spiral arms. The cyan suggests young blue stars but with enough green to feel 'alive' and growing.",
  },
]

/**
 * Colors for interstellar-scale fates (pc100 scale) — children of galactic-scale parents.
 */
export const INTERSTELLAR_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseISM",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Ambient interstellar medium — warm/cool atomic gas between active regions.",
  },
  {
    key: "evolvedField",
    hex: "#4a4a5a",
    description:
      "Slate gray. Old field population — long-lived low-mass stars and accumulated remnants.",
  },
  {
    key: "stellarStream",
    hex: "#5a6a7a",
    description:
      "Steel blue. Tidally disrupted cluster stretched into a stream.",
  },
  {
    key: "globularCluster",
    hex: "#8a7a5a",
    description:
      "Amber-brown. Ancient dense cluster — 10+ Gyr old, metal-poor, tightly bound.",
  },
  {
    key: "giantMolecularCloud",
    hex: "#3a5a4a",
    description:
      "Forest green. Active star-forming cloud — cold molecular gas collapsing into stars.",
  },
  {
    key: "openCluster",
    hex: "#5a8a7a",
    description:
      "Teal. Young bound cluster — coeval stellar population, will dissolve over ~100 Myr.",
  },
  {
    key: "superbubble",
    hex: "#7a5a8a",
    description:
      "Dusty purple. Hot cavity carved by supernovae — enriched with heavy elements.",
  },
  {
    key: "HIIRegion",
    hex: "#aa6a8a",
    description:
      "Rose-pink. Ionized gas around massive OB stars — the glow of stellar nurseries.",
  },
]

/**
 * The empty fate color — used for cosmic voids and fallback states.
 */
export const EMPTY_FATE_COLOR = WEB_SCALE_FATE_COLOR_ARRAY[0] // "empty" is first in array

/**
 * All fate colors combined, keyed by fate name.
 * Includes web-scale, galactic-scale, and future scale fates.
 */
export const COLORS_BY_KEY = [
  ...WEB_SCALE_FATE_COLOR_ARRAY,
  ...HALO_SCALE_FATE_COLOR_ARRAY,
  ...GALACTIC_SCALE_FATE_COLOR_ARRAY,
  ...INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
].reduce((acc, { key, hex, description }) => {
  acc[key] = {
    hex,
    label: camelToTitle(key),
    description,
  }
  return acc
}, {} as Record<string, { hex: string; label: string; description: string }>)

```

Done! Here's what I changed:

**1. `02_HALO_SCALE_FATES.ts`**
- Added `"empty"` to `HaloScaleFateKey`
- Added `empty` fate with characteristics (no halo, diffuse IGM, paints mostly `diffuseHalo` galaxies)

**2. `01_WEB_SCALE_FATES.ts`**
- Removed `Mpc1ScaleFateKey` (and TODO comment)
- Now imports `HaloScaleFateKey` from the halo fates file
- Updated all `childFateWeights` to use only destination fates:
  - `void`: 90% empty, 10% gasRichGroup
  - `sheet`: 60% empty, 35% gasRichGroup, 5% gasPoorGroup
  - `filament`: mix of groups and some clusters
  - `node`: cluster-dominated (35% coolCore, 25% nonCoolCore)
  - `infallRegion`: mostly clusters (stripped/heated)

**3. `colors.ts`**
- Removed transitional fate colors (unboundAssociation, boundGroup, infallingGroup, protoCluster, collapsingCluster, relaxedCluster, mergingCluster)
- Added `empty` color (near-black)
- Now matches `HaloScaleFateKey` exactly

The model is now consistent with its own "fates are destinations" philosophy — no more transitional states in the hierarchy, just the endpoints that parcels will eventually become.

---

**User**

Circling back to the cosmological fates...



What do you think about just having a single:



const COSMOLOGICAL_FATE = {

      void: 0.60,        // Voids dominate by volume

      sheet: 0.20,       // Walls between voids

      filament: 0.15,    // The "highways"

      node: 0.04,        // Rare dense intersections

      infallRegion: 0.01 // Already captured into halos

}



? Would that be incompatible with the props to Map?

---

**Cursor**

That's a cleaner approach! The only issue is that `Map` currently expects a `parentFate` key to look up via `getFateCharacteristics()`.

But we could make `Map` accept the weights directly as an alternative prop:

```typescript
type MapProps = {
  // Either provide a parentFate to lookup...
  parentFate?: ParentFateKey
  
  // ...OR provide childFateWeights directly
  childFateWeights?: Partial<Record<string, number>>
  
  coordinate: Coordinate
  // ...
}
```

Then the Map would use whichever is provided:

```typescript
const weights = childFateWeights ?? getFateCharacteristics(parentFate!).childFateWeights
```

And the docs would be:

```tsx
import { COSMOLOGICAL_FATE } from "~/model"

<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc100", x: 0, y: 0 }}
/>
```

This is actually **more honest** than inventing a fake "cosmologicalBackground" fate — because there really isn't a cosmological *fate* in the model's sense. There's just the uniform statistical background that web-scale parcels emerge from.

The pattern would be:
- **Real fates** → use `parentFate` prop
- **Uniform background** → pass `childFateWeights` directly

Want me to implement this?

```typescript
type MapProps = {
  // Either provide a parentFate to lookup...
  parentFate?: ParentFateKey
  
  // ...OR provide childFateWeights directly
  childFateWeights?: Partial<Record<string, number>>
  
  coordinate: Coordinate
  // ...
}
```

```typescript
const weights = childFateWeights ?? getFateCharacteristics(parentFate!).childFateWeights
```

```typescriptreact
import { COSMOLOGICAL_FATE } from "~/model"

<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc100", x: 0, y: 0 }}
/>
```

---

**User**

Could we just remove the parentFate prop entirely?

---

**Cursor**

```typescriptreact
<Map parentFate="gasRichGroup" coordinate={...} />
```

```typescriptreact
<Map 
  childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights} 
  coordinate={...} 
/>
```

```typescriptreact
<Map 
  childFateWeights={getChildFateWeights("gasRichGroup")} 
  coordinate={...} 
/>
```

Yes! That would make the API more explicit and honest about what Map actually does:

```typescript
type MapProps = {
  /** The fate weights to sample from when painting child cells */
  childFateWeights: Partial<Record<string, number>>
  
  coordinate: Coordinate
  cellSize?: number
  gridSize?: number
}
```

Call sites would become:

```tsx
// Cosmological (uniform background)
<Map childFateWeights={COSMOLOGICAL_FATE} coordinate={...} />

// Halo-scale parent
<Map 
  childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights} 
  coordinate={...} 
/>

// Or with a helper if you want brevity
<Map childFateWeights={getChildWeights("gasRichGroup")} coordinate={...} />
```

**The tradeoff:**
- ✅ More explicit - you see exactly what's being rendered
- ✅ Simpler component - no lookup logic inside Map
- ✅ Uniform pattern for all scales (including cosmological)
- ⚠️ Slightly more verbose at call sites

The Map component becomes a pure "paint cells from weights" renderer, and the *meaning* of those weights (what fate they came from) stays outside the component.

Want me to make this change?

```typescript
type MapProps = {
  /** The fate weights to sample from when painting child cells */
  childFateWeights: Partial<Record<string, number>>
  
  coordinate: Coordinate
  cellSize?: number
  gridSize?: number
}
```

```typescriptreact
// Cosmological (uniform background)
<Map childFateWeights={COSMOLOGICAL_FATE} coordinate={...} />

// Halo-scale parent
<Map 
  childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights} 
  coordinate={...} 
/>

// Or with a helper if you want brevity
<Map childFateWeights={getChildWeights("gasRichGroup")} coordinate={...} />
```

---

**User**

Yes, let's do it. And add a cosmological Map demo with a grid of 1000x1000 Mpc10 cells.

---

**Cursor**

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescript
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
  WEB_SCALE_FATES,
  HALO_SCALE_FATES,
  GALACTIC_SCALE_FATES,
  INTERSTELLAR_SCALE_FATES,
  STAR_SCALE_FATES,
}

export type {
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
 */
export const COSMOLOGICAL_FATE: Partial<Record<WebScaleFateKey, number>> = {
  void: 0.6, // Voids dominate by volume
  sheet: 0.2, // Walls between voids
  filament: 0.15, // The "highways"
  node: 0.04, // Rare dense intersections
  infallRegion: 0.01, // Already captured into halos
}

/**
 * Union of all fate keys that have childFateWeights.
 * These are the fates that can serve as parents when sampling child parcels.
 */
export type ParentFateKey =
  | WebScaleFateKey
  | HaloScaleFateKey
  | GalacticScaleFateKey
  | InterstellarScaleFateKey

// TODO: I wonder about the name "fate with children".... seems like this is just a partial of FateCharacteristics?
/**
 * Minimal interface for fate characteristics relevant to sampling children.
 */
export type FateWithChildren = {
  childFateWeights?: Partial<Record<string, number>>
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
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
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
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
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

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc100", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={1}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights!}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights!}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

The `Mpc100` scale doesn't exist. Let me use `Mpc10` for the cosmological demo (it's the largest scale, and the coordinate is just used for noise seeding):

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={1}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights!}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights!}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights!}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

Done! Here's what changed:

**1. `Map.tsx`** - Simplified API
- Replaced `parentFate: ParentFateKey` with `childFateWeights: Partial<Record<string, number>>`
- Removed the `getFateCharacteristics` lookup
- Component now directly uses the weights you pass

**2. `model/index.ts`** - New exports
- Added `COSMOLOGICAL_FATE` constant with the uniform background distribution
- Exported all fate objects (`WEB_SCALE_FATES`, `HALO_SCALE_FATES`, etc.) so they can be accessed for `.childFateWeights`

**3. `Map.docs.tsx`** - Updated demos
- Added cosmological demo: 1000×1000 grid at 1px per cell (1000×1000 pixels!)
- Updated all demos to use `childFateWeights={FATES.fate.childFateWeights!}`

The cosmological demo shows the web-scale structure of a ~10,000 Mpc region - a million cells representing the cosmic web!

```tsx
<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
  gridSize={1000}
  cellSize={1}
/>
```

```typescriptreact
<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
  gridSize={1000}
  cellSize={1}
/>
```

---

**User**

Nice! That looks directionally correct.



However, the Cosmological Scale map is all black? Any ideas why that might be?

---

**Cursor**

Good catch! There are two possible issues:

**1. Sub-pixel rendering** - `cellSize={0.5}` means each cell is half a pixel. Canvas doesn't render sub-pixel rects well - they may not appear at all or blend to nothing.

**2. Very dark colors** - The web-scale fate colors are extremely dark by design:
- `void` (#0a0a0f) - almost black (RGB 10,10,15)
- `sheet` (#1a1a2e) - very dark blue (RGB 26,26,46)

With 60% void + 20% sheet, the map would appear almost entirely black even if rendering correctly.

Let me check what's happening:

```typescript
childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights}
```

Looking at the code, with `cellSize={0.5}`, the canvas is 500×500 pixels but painting 1,000,000 half-pixel rectangles. Canvas anti-aliasing on sub-pixel rects likely makes them nearly invisible.

**Quick fix:** Change `cellSize` to at least `1`:

The colors are there but they're **very dark** by design. Combined with sub-pixel rendering (`cellSize=0.5`), it's essentially invisible.

Two issues:
1. `void` is `#0a0a0f` (RGB 10,10,15) - barely distinguishable from black
2. Canvas `fillRect` with 0.5×0.5 pixels gets anti-aliased to near-invisible

**Quick test:** Try `cellSize={1}` and see if you get a very dark (but not pure black) image. If it's still all black, there's a different bug.

For a smaller visual size, you could use CSS scaling:

```tsx
<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
  gridSize={1000}
  cellSize={1}
  style={{ width: 500, height: 500 }}  // CSS scales down
/>
```

Or we could brighten the web-scale colors for better visualization. Want me to make them more distinct?

```typescriptreact
<Map
  childFateWeights={COSMOLOGICAL_FATE}
  coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
  gridSize={1000}
  cellSize={1}
  style={{ width: 500, height: 500 }}  // CSS scales down
/>
```

---

**User**

It was black before I changed the cell size, so that's not the only issue.

But for cellSize, if you like when cellSize is < 1, you can use 1 for rendering, but scale the canvas (with css?)



I'm also not sure the colors are the issue. Assuming there's at least one infallRegion, I should be able to see that. It really looks inky black.

---

**Cursor**

```typescript
ctx.fillStyle = COLORS_BY_KEY[fate].hex
```

Let me check what's actually happening. First, let me re-read the current Map.tsx to see if the empty check was removed:

Let me check if there's an issue with how COSMOLOGICAL_FATE is being passed. Let me verify the model/index.ts export:

```typescript
childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights}
```

Let me add some debugging to see what's happening:

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

I've added debugging. When you view the docs, check the browser console:

1. **If you see "No weights!"** → `childFateWeights` is being passed as undefined/empty
2. **If you see the keys and thresholds logged** → weights are OK, issue is elsewhere
3. **If you see "Missing color for fate: X"** → color lookup is failing (map will turn red)
4. **If logs look correct but map is dark** → the colors really are just that dark

Also, if there's a missing color, the map will now render **red** instead of failing silently.

Can you check the console and let me know what you see?

---

**User**

I get:



childFateWeights: {void: 0.6, sheet: 0.2, filament: 0.15, node: 0.04, infallRegion: 0.01}

Map.tsx:58 keys: (5) ['void', 'sheet', 'filament', 'node', 'infallRegion'] thresholds: (5) [0.6, 0.8, 0.9500000000000001, 0.9900000000000001, 1]

---

**Cursor**

The weights and thresholds look correct. So the issue is either:

1. **Perlin noise values** - maybe they're all clustering in the void range
2. **Colors are just dark** - void is #0a0a0f (nearly black)

Do you see any **"Missing color for fate"** errors? If not, the colors ARE being applied - they're just very dark.

Let me add one more debug to see what fates are actually being sampled:

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Debug: count how many of each fate we sample
    const fateCounts: Record<string, number> = {}

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Debug: count how many of each fate we sample
    const fateCounts: Record<string, number> = {}

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)
        fateCounts[fate] = (fateCounts[fate] ?? 0) + 1

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Debug: count how many of each fate we sample
    const fateCounts: Record<string, number> = {}

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)
        fateCounts[fate] = (fateCounts[fate] ?? 0) + 1

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
    console.log("Fate distribution:", fateCounts)
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

Now check the console for **"Fate distribution:"** - it'll show how many of each fate type was actually sampled. This will tell us if it's all "void" (explaining the near-black) or if we're getting a mix but the colors are just dark.

---

**User**

No missing color for fate errors. Just:



childFateWeights: {void: 0.6, sheet: 0.2, filament: 0.15, node: 0.04, infallRegion: 0.01}

Map.tsx:58 keys: (5) ['void', 'sheet', 'filament', 'node', 'infallRegion'] thresholds: (5) [0.6, 0.8, 0.9500000000000001, 0.9900000000000001, 1]





---

**Cursor**

Hmm, you should also see **"Fate distribution:"** at the end. If you don't see that log, the loop might not be completing (1,000,000 iterations is a lot).

Try this: change the cosmological demo temporarily to a smaller grid size to test:

```typescriptreact
    <h2>Cosmological Scale</h2>
    <Demo inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
        gridSize={100}
        cellSize
```

---

**User**

Now I get: 



Fate distribution: {void: 1000000}

---

**Cursor**

```typescript
x += seed * 17.1
y += seed * 31.7
```

```typescript
const x0 = Math.floor(x)  // = x when x is integer
const y0 = Math.floor(y)  // = y when y is integer

const sx = smoothstep(x - x0)  // = smoothstep(0) = 0
const sy = smoothstep(y - y0)  // = smoothstep(0) = 0
```

Found it! **All 1,000,000 cells are "void"** because the Perlin noise is returning the same value for all integer coordinates.

The bug: when sampling Perlin noise at exact integer coordinates (x=0,1,2,... y=0,1,2,...), the gradient dot product is always 0, which normalizes to 0.5. And 0.5 < 0.6 threshold → always "void".

The fix: scale the coordinates so we're not sampling at integer grid points:

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      console.log("No weights! childFateWeights:", childFateWeights)
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    console.log("childFateWeights:", childFateWeights)
    const { keys, thresholds } = computeThresholds(childFateWeights)
    console.log("keys:", keys, "thresholds:", thresholds)

    // Debug: count how many of each fate we sample
    const fateCounts: Record<string, number> = {}

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)
        fateCounts[fate] = (fateCounts[fate] ?? 0) + 1

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
    console.log("Fate distribution:", fateCounts)
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

Try it now - you should see a mix of fates. The `* 0.1` scale means adjacent cells sample 0.1 units apart in noise space, giving smooth coherent regions rather than pure randomness.

---

**User**

Ayy! That looks great. I see sort of blue and black noise, with a handful of slightly brighter spots!

---

**Cursor**

Excellent! 🎉 The cosmic web is visible! Now let me clean up the debug logs and add the CSS scaling for sub-pixel cell sizes:

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)
        fateCounts[fate] = (fateCounts[fate] ?? 0) + 1

        // Paint the cell
        const color = COLORS_BY_KEY[fate]
        if (!color) {
          console.error("Missing color for fate:", fate)
        }
        ctx.fillStyle = color?.hex ?? "#ff0000" // Red if missing
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
    console.log("Fate distribution:", fateCounts)
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate]?.hex ?? EMPTY_FATE_COLOR.hex
        ctx.fillRect(x * renderCellSize, y * renderCellSize, renderCellSize, renderCellSize)
      }
    }
  }, [childFateWeights, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate]?.hex ?? EMPTY_FATE_COLOR.hex
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [childFateWeights, coordinate, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate]?.hex ?? EMPTY_FATE_COLOR.hex
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [childFateWeights, coordinate, gridSize])

  // Canvas is always 1 pixel per cell; CSS scales to desired display size
  const displaySize = gridSize * cellSize

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize}
      height={gridSize}
      style={{ width: displaySize, height: displaySize, imageRendering: "pixelated" }}
    />
  )
}

```

The `!` assertions are needed because TypeScript doesn't know the fates have `childFateWeights` defined. Let me fix the docs:

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights ?? {}}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

```typescriptreact
import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights ?? {}}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights ?? {}}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)

```

All fixed! Here's what changed:

**Map.tsx improvements:**
1. **Fixed Perlin noise sampling** - scale by 0.1 to avoid integer coordinates (which always returned 0.5)
2. **Removed debug logs**
3. **Canvas now renders at 1px per cell** and uses CSS scaling (`imageRendering: "pixelated"`) for crisp display at any size

Now `cellSize` controls the *display* size, not the canvas resolution. A 1000×1000 grid with `cellSize={0.5}` renders a 1000×1000 canvas displayed at 500×500 CSS pixels - no sub-pixel rendering issues.

---

**User**

Awesome! Love where we ended up here.

---

**Cursor**

Glad it all came together! Here's a recap of the session:

**Model cleanup:**
- Added `"empty"` as a proper halo-scale fate (for void regions with no collapsed halo)
- Removed transitional fates (`protoCluster`, `mergingCluster`, etc.) - fates are destinations, not stages
- Web-scale fates now import and use `HaloScaleFateKey` directly
- Added `COSMOLOGICAL_FATE` - the uniform statistical background of the universe

**Map component evolution:**
- Renamed `parentFate` → `childFateWeights` for explicit, honest API
- Fixed Perlin noise bug (integer coordinates always returned 0.5)
- Canvas renders at 1px/cell with CSS scaling (`imageRendering: "pixelated"`)

**The hierarchy is now clean:**

| Scale | Example | Children |
|-------|---------|----------|
| Cosmological | `COSMOLOGICAL_FATE` | Web-scale (void, filament...) |
| Web (Mpc10) | filament | Halo-scale (groups, clusters) |
| Halo (Mpc1) | gasRichGroup | Galactic (spirals, ellipticals) |
| Galactic (kpc100) | spiralGalaxy | Interstellar (GMCs, clusters) |
| Interstellar (pc100) | openCluster | Stars |

And you've got that gorgeous 1000×1000 cosmic web visualization showing the large-scale structure of the universe! 🌌

