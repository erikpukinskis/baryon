import type { InterstellarScaleFateKey } from "./04_INTERSTELLAR_SCALE_FATES"

export type GalacticScaleFateKey =
  | "diffuseHalo"
  | "dwarfIrregular"
  | "dwarfSpheroid"
  | "spiralGalaxy"
  | "lenticularGalaxy"
  | "ellipticalGalaxy"
  | "activeGalactic"
  | "quenchedRemnant"

type GalacticScaleLock =
  | "morphologicalRelaxation" // violent relaxation produces elliptical structure
  | "gasExhaustion" // gas supply permanently depleted
  | "tidalDisruption" // galaxy is being torn apart by tidal forces
  | false

type GalacticScaleFateCharacteristics = {
  stellarMassMinMsun: number
  stellarMassMaxMsun?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  allowedTransitions: GalacticScaleFateKey[]

  /**
   * Defines what fraction of child (interstellar) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   */
  childFateWeights?: Partial<Record<InterstellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * Physical regimes of galaxies at ~100 kpc scale.
 *
 * Galaxies are dark-matter–dominated halos hosting stellar and gas components.
 * Fates are distinguished by morphology, gas content, and dynamical state.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A galactic fate represents a physical regime, not a stage. When a galactic
 * fate paints its interstellar children, it paints what will eventually exist there:
 *
 *   - spiralGalaxy → GMCs, HII regions, open clusters
 *   - ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   - spiralGalaxy → ellipticalGalaxy (major merger)
 *   - spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   - morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   - gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   - tidalDisruption — galaxy is being torn apart by a larger system
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMinMsun: 1e4,
    stellarMassMaxMsun: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    childFateWeights: {
      diffuseISM: 0.6,
      evolvedField: 0.3,
      giantMolecularCloud: 0.08,
      openCluster: 0.02,
    },
  },

  dwarfIrregular: {
    stellarMassMinMsun: 1e6,
    stellarMassMaxMsun: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    childFateWeights: {
      giantMolecularCloud: 0.25,
      superbubble: 0.2,
      diffuseISM: 0.25,
      HIIRegion: 0.15,
      openCluster: 0.1,
      evolvedField: 0.05,
    },
  },

  dwarfSpheroid: {
    stellarMassMinMsun: 1e5,
    stellarMassMaxMsun: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    allowedTransitions: [],
    childFateWeights: {
      evolvedField: 0.6,
      globularCluster: 0.15,
      stellarStream: 0.15,
      diffuseISM: 0.1,
    },
  },

  spiralGalaxy: {
    stellarMassMinMsun: 1e9,
    stellarMassMaxMsun: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    childFateWeights: {
      giantMolecularCloud: 0.2,
      HIIRegion: 0.1,
      diffuseISM: 0.25,
      openCluster: 0.15,
      superbubble: 0.1,
      evolvedField: 0.15,
      globularCluster: 0.03,
      stellarStream: 0.02,
    },
  },

  lenticularGalaxy: {
    stellarMassMinMsun: 1e10,
    stellarMassMaxMsun: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    childFateWeights: {
      evolvedField: 0.5,
      diffuseISM: 0.15,
      globularCluster: 0.1,
      stellarStream: 0.1,
      openCluster: 0.1,
      superbubble: 0.05,
    },
  },

  ellipticalGalaxy: {
    stellarMassMinMsun: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    childFateWeights: {
      evolvedField: 0.55,
      globularCluster: 0.2,
      stellarStream: 0.15,
      diffuseISM: 0.1,
    },
  },

  activeGalactic: {
    stellarMassMinMsun: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    childFateWeights: {
      diffuseISM: 0.35,
      evolvedField: 0.3,
      superbubble: 0.15,
      globularCluster: 0.1,
      stellarStream: 0.1,
    },
  },

  quenchedRemnant: {
    // Terminal state
    stellarMassMinMsun: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    allowedTransitions: [],
    childFateWeights: {
      evolvedField: 0.65,
      globularCluster: 0.15,
      stellarStream: 0.15,
      diffuseISM: 0.05,
    },
  },
}
