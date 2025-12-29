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
  childFateWeights: Partial<Record<HaloScaleFateKey, number>>
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
      coolCoreCluster: 0.1, // some clusters along filaments
      nonCoolCoreCluster: 0.1,
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
      fossilCluster: 0.1,
      fossilGroup: 0.1,
      gasRichGroup: 0.05, // rare recent infall
    },
  },
}
