import type { GalacticScaleFateKey } from "./03_GALACTIC_SCALE_FATES"

export type HaloScaleFateKey =
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
