import type { StarScaleFateKey } from "./05_STAR_SCALE_FATES"

export type InterstellarScaleFateKey =
  | "giantMolecularCloud"
  | "HIIRegion"
  | "superbubble"
  | "diffuseISM"
  | "openCluster"
  | "globularCluster"
  | "stellarStream"
  | "evolvedField"

type InterstellarScaleLock =
  | "clusterBinding" // gravitationally bound cluster formed
  | "feedbackDisruption" // GMC destroyed by stellar feedback
  | "tidalDisruption" // structure torn apart by tidal forces
  | false

type InterstellarScaleFateCharacteristics = {
  sizePcMin: number
  sizePcMax?: number
  gasRich: boolean
  starFormationActive: boolean
  gravitationallyBound: boolean

  fateLockedBy: InterstellarScaleLock
  typicalTimescaleMyr: number

  allowedTransitions: InterstellarScaleFateKey[]

  /**
   * Defines what fraction of child (stellar) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<StarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * Physical regimes of stellar neighborhoods at ~100 pc scale.
 *
 * This is the scale of:
 *   - Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   - Star clusters — bound stellar systems with shared origins
 *   - HII regions — ionized gas around young OB stars
 *   - Superbubbles — hot cavities carved by supernovae
 *   - The diffuse interstellar medium (ISM)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   - GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   - Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   - HII region lifetimes: ~10 Myr (expand and fade)
 *   - Superbubble persistence: ~30-50 Myr (cool and collapse)
 *
 * This is faster than galactic evolution (~Gyr) but spans many stellar generations.
 * The interstellar fate determines the LOCAL environment for star formation—things
 * like stellar density, metallicity coherence, and gas availability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * When an interstellar fate paints its stellar children, it paints final
 * outcomes. A GMC doesn't paint "collapsing cores"—it paints the stars,
 * brown dwarfs, and gas that will exist when the process completes.
 *
 * Transitions between interstellar fates are caused by external events:
 *   - GMC → HIIRegion (massive stars ionize the cloud)
 *   - openCluster → stellarStream (tidal forces disrupt the cluster)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   - clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   - feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   - tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 */
export const INTERSTELLAR_SCALE_FATES: Record<
  InterstellarScaleFateKey,
  InterstellarScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    // Active star-forming cloud
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.4, // molecular cloud material that won't form stars
      star: 0.35,
      brownDwarf: 0.15,
      substellarObject: 0.1,
    },
  },

  HIIRegion: {
    // Ionized by OB stars; feedback suppresses new star formation
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    allowedTransitions: ["superbubble", "diffuseISM"],
    childFateWeights: {
      star: 0.45, // massive OB stars ionizing the region
      diffuseGas: 0.25, // ionized (HII)
      brownDwarf: 0.18,
      substellarObject: 0.12, // ejected from forming systems
    },
  },

  superbubble: {
    // Hot cavity carved by supernovae
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.25, // hot, tenuous plasma
      star: 0.25, // survivors
      whiteDwarf: 0.2,
      neutronStar: 0.15, // from core-collapse supernovae
      blackHole: 0.06, // from most massive progenitors
      brownDwarf: 0.05,
      substellarObject: 0.04,
    },
  },

  diffuseISM: {
    // Ambient interstellar medium
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    allowedTransitions: ["giantMolecularCloud"],
    childFateWeights: {
      diffuseGas: 0.5, // warm/cool atomic hydrogen
      star: 0.25, // field stars passing through
      whiteDwarf: 0.1,
      brownDwarf: 0.08,
      substellarObject: 0.04,
      neutronStar: 0.02,
      blackHole: 0.01,
    },
  },

  openCluster: {
    // Young bound cluster
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100,
    allowedTransitions: ["stellarStream", "evolvedField"],
    childFateWeights: {
      star: 0.6, // coeval population
      brownDwarf: 0.15,
      whiteDwarf: 0.1,
      substellarObject: 0.08,
      neutronStar: 0.05,
      blackHole: 0.02,
    },
  },

  globularCluster: {
    // Ancient dense cluster
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000,
    allowedTransitions: ["stellarStream"],
    childFateWeights: {
      star: 0.4, // ancient, low-mass survivors
      whiteDwarf: 0.3, // accumulated over ~10 Gyr
      neutronStar: 0.1, // includes millisecond pulsars
      brownDwarf: 0.1,
      blackHole: 0.05,
      substellarObject: 0.05,
    },
  },

  stellarStream: {
    // Tidally disrupted cluster
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000,
    allowedTransitions: ["evolvedField"],
    childFateWeights: {
      star: 0.45, // stripped from parent cluster
      whiteDwarf: 0.25,
      brownDwarf: 0.12,
      neutronStar: 0.08,
      substellarObject: 0.06,
      blackHole: 0.04,
    },
  },

  evolvedField: {
    // Terminal state: old field population
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 5000,
    allowedTransitions: [],
    childFateWeights: {
      star: 0.35, // long-lived, low-mass
      whiteDwarf: 0.3, // accumulated over Gyr
      brownDwarf: 0.15,
      substellarObject: 0.08,
      neutronStar: 0.07,
      blackHole: 0.05,
    },
  },
}
