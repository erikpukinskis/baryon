type GalacticScaleFateKey =
  | "diffuseHalo"
  | "dwarfIrregular"
  | "dwarfSpheroid"
  | "spiralGalaxy"
  | "lenticularGalaxy"
  | "ellipticalGalaxy"
  | "activeGalactic"
  | "quenchedRemnant"

type GalacticLock =
  | "diskFormation" // angular momentum settled into stable disk
  | "morphologicalQuenching" // structure prevents further star formation
  | "mergerDisruption" // major merger destroys disk, forms elliptical
  | "ageFading" // passive evolution, no gas left
  | false

type GasRichness = "high" | "moderate" | "low" | "negligible"

/**
 * Stellar fate keys, imported conceptually for type reference.
 * (In practice, this would import from STELLAR_SCALE_FATES.ts)
 */
type StellarScaleFateKey =
  | "gasCloud"
  | "prestellarCore"
  | "PMO"
  | "solidAggregate"
  | "planet"
  | "gasGiant"
  | "plasmaReservoir"
  | "brownDwarf"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "noRemnant"

type GalacticScaleCharacteristics = {
  stellarMassMin: number // M☉
  stellarMassMax: number // M☉

  centralBlackHoleMass: [number, number] // [min, max] in M☉, or [0, 0] for none
  gasRichness: GasRichness
  starFormationActive: boolean

  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Cross-Scale Constraints)
   * ---------------------------------------------
   *
   * Defines the probability distribution over stellar-scale child fates.
   *
   * A galaxy's physical regime determines what stellar populations exist inside it:
   *
   *   • spiralGalaxy (gas-rich, star-forming)
   *       → children likely: gasCloud, prestellarCore, young stars
   *       → weights: { gasCloud: 0.3, prestellarCore: 0.2, ... }
   *
   *   • ellipticalGalaxy (gas-poor, quiescent)
   *       → children likely: whiteDwarf, neutronStar, old low-mass stars
   *       → weights: { whiteDwarf: 0.4, neutronStar: 0.1, ... }
   *
   *   • diffuseHalo (minimal stellar content)
   *       → children rare: almost no stellar fates at all
   *       → weights: { gasCloud: 0.8, ... } (mostly unprocessed gas)
   *
   * These weights are priors, not hard rules. A quenched elliptical can still
   * have occasional star formation; a dwarf irregular can have old stars.
   *
   * See GROUP_SCALE_FATES.ts for detailed documentation on this pattern.
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures at the
 * ~100 kpc scale that host stellar populations and regulate star formation.
 *
 * Like fates at other scales, these are **physical states**, not observational classifications.
 * A galaxy's fate is determined by:
 *
 *   • its gravitational potential and angular momentum
 *   • the availability of cold gas for star formation
 *   • the presence and activity of a central black hole
 *   • its merger and interaction history
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **~100 kpc parcel** containing:
 *   • a dark matter halo (inherited from group/cluster parent)
 *   • a baryonic component (stars, gas, dust)
 *   • potentially a central supermassive black hole
 *
 * Galaxies are **containers and regulators** for stellar-scale parcels.
 * Their fate constrains:
 *   • what stellar fates are probable in children
 *   • the rate at which new stars form
 *   • the metallicity and age distribution of stars
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along four orthogonal axes:
 *
 *   1) **Morphology**
 *      – Disk-dominated, spheroid-dominated, or irregular?
 *
 *   2) **Gas content**
 *      – Is cold gas available for star formation?
 *
 *   3) **Star formation state**
 *      – Actively forming stars, or quiescent?
 *
 *   4) **Nuclear activity**
 *      – Is the central black hole accreting and producing feedback?
 *
 * These axes define **distinct evolutionary regimes**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of these thresholds:
 *
 *   • diskFormation
 *       – Angular momentum settles into a stable disk; hard to undo without merger.
 *
 *   • morphologicalQuenching
 *       – Spheroidal structure stabilizes gas against collapse; star formation ceases.
 *
 *   • mergerDisruption
 *       – Major merger scrambles stellar orbits; disk cannot reform.
 *
 *   • ageFading
 *       – Gas exhausted or expelled; galaxy passively ages.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHILD CONSTRAINTS (STELLAR SCALE)
 *
 * A galaxy's fate constrains what stellar-scale fates are probable inside it:
 *
 *   • spiralGalaxy (starFormationActive: true, gasRichness: high)
 *       → children likely: gasCloud, prestellarCore, young stars
 *       → children possible: all stellar fates
 *
 *   • ellipticalGalaxy (starFormationActive: false, gasRichness: negligible)
 *       → children likely: whiteDwarf, neutronStar, old low-mass stars
 *       → children rare: gasCloud, prestellarCore
 *
 *   • diffuseHalo (minimal stellar content)
 *       → children rare: any stellar fates
 *
 * This is how the hierarchical constraint propagation works.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths:
 *
 *   dwarfIrregular → dwarfSpheroid (gas exhaustion)
 *   spiralGalaxy → lenticularGalaxy (gas stripping in cluster)
 *   spiralGalaxy → ellipticalGalaxy (major merger)
 *   lenticularGalaxy → ellipticalGalaxy (continued merging)
 *   any → activeGalactic (black hole activation)
 *   activeGalactic → quenchedRemnant (AGN feedback expels gas)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER SCALES
 *
 * • GROUP_SCALE_FATES constrain which galactic fates are possible
 *     (e.g., fossilGroup → mostly ellipticalGalaxy or quenchedRemnant)
 *
 * • GALACTIC_SCALE_FATES constrain which stellar fates are probable
 *     (e.g., spiralGalaxy → many gasCloud and prestellarCore children)
 *
 * This maintains the hierarchical constraint model at every scale.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 0,
    stellarMassMax: 1e7,
    centralBlackHoleMass: [0, 0],
    gasRichness: "low",
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 10,
    definingProcesses: [
      "failed galaxy formation",
      "tidal stripping",
      "reionization suppression",
    ],
    allowedTransitions: ["dwarfIrregular"], // if gas accretes
    // Minimal stellar content, mostly unprocessed gas
    childFateWeights: {
      plasmaReservoir: 0.5, // hot diffuse gas
      gasCloud: 0.3, // cold gas pockets
      whiteDwarf: 0.1, // rare old stars
      PMO: 0.05, // failed stars
      brownDwarf: 0.05, // substellar
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    centralBlackHoleMass: [0, 1e4],
    gasRichness: "high",
    starFormationActive: true,
    dominantStellarPopulation: "young",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "chaotic gas dynamics",
    ],
    allowedTransitions: ["dwarfSpheroid", "activeGalactic"],
    // Active but chaotic star formation
    // Young stars, lots of gas, few remnants yet
    childFateWeights: {
      gasCloud: 0.25, // abundant raw material
      prestellarCore: 0.2, // active collapse
      planet: 0.15, // forming around young stars
      solidAggregate: 0.1, // protoplanetary material
      whiteDwarf: 0.1, // some generations have passed
      gasGiant: 0.08, // young planetary systems
      brownDwarf: 0.05, // failed stars common
      neutronStar: 0.04, // from early massive stars
      noRemnant: 0.03, // supernovae ongoing
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    centralBlackHoleMass: [0, 1e3],
    gasRichness: "negligible",
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "ageFading",
    typicalTimescaleGyr: 10,
    definingProcesses: [
      "gas exhaustion",
      "ram-pressure stripping",
      "passive aging",
    ],
    allowedTransitions: [], // endpoint for dwarfs
    // Ancient, quiescent, no gas
    // Only old stellar remnants and surviving low-mass stars
    childFateWeights: {
      whiteDwarf: 0.4, // dominant remnant population
      planet: 0.2, // ancient planetary systems
      brownDwarf: 0.15, // long-lived substellar
      PMO: 0.1, // ejected planets, failed stars
      neutronStar: 0.1, // from ancient massive stars
      blackHole: 0.05, // rare stellar-mass BHs
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    centralBlackHoleMass: [1e5, 1e8],
    gasRichness: "high",
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: "diskFormation",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "disk settling",
      "spiral density waves",
      "bar instabilities",
      "ongoing gas accretion",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Full range of stellar populations
    // Active star formation in arms, old populations in bulge
    childFateWeights: {
      gasCloud: 0.15, // spiral arms, molecular clouds
      prestellarCore: 0.1, // ongoing formation
      planet: 0.15, // abundant planetary systems
      whiteDwarf: 0.15, // old disk population
      gasGiant: 0.1, // common in mature systems
      solidAggregate: 0.08, // debris, asteroids
      brownDwarf: 0.08, // failed stars
      neutronStar: 0.08, // from massive stars
      blackHole: 0.05, // stellar-mass BHs
      noRemnant: 0.03, // recent supernovae
      PMO: 0.03, // rogue planets
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    centralBlackHoleMass: [1e5, 1e8],
    gasRichness: "low",
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalQuenching",
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "disk fading",
      "minor mergers",
    ],
    allowedTransitions: ["ellipticalGalaxy", "activeGalactic"],
    // Aging disk population, little new star formation
    // Remnants accumulating
    childFateWeights: {
      whiteDwarf: 0.3, // aging population
      planet: 0.2, // old planetary systems
      neutronStar: 0.12, // accumulated remnants
      brownDwarf: 0.1, // substellar
      blackHole: 0.08, // stellar-mass
      gasCloud: 0.05, // residual gas
      PMO: 0.05, // ejected planets
      gasGiant: 0.05, // surviving giants
      prestellarCore: 0.03, // rare new formation
      solidAggregate: 0.02, // debris
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e13,
    centralBlackHoleMass: [1e6, 1e10],
    gasRichness: "negligible",
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "mergerDisruption",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot halo maintenance",
    ],
    allowedTransitions: ["activeGalactic"], // can reactivate if gas accretes
    // Ancient stellar population, no gas
    // Dominated by remnants and surviving low-mass stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant population
      planet: 0.15, // ancient systems (planets survive)
      neutronStar: 0.15, // abundant remnants
      blackHole: 0.1, // stellar-mass BHs common
      brownDwarf: 0.1, // long-lived
      PMO: 0.08, // ejected, merger debris
      plasmaReservoir: 0.05, // hot halo gas
      gasGiant: 0.02, // surviving giants
    },
  },

  activeGalactic: {
    stellarMassMin: 1e8,
    stellarMassMax: 1e13,
    centralBlackHoleMass: [1e6, 1e10],
    gasRichness: "moderate", // feeding the AGN
    starFormationActive: true, // often, but regulated
    dominantStellarPopulation: "mixed",
    fateLockedBy: false, // transient phase
    typicalTimescaleGyr: 0.1, // AGN episodes are short
    definingProcesses: [
      "black hole accretion",
      "AGN feedback",
      "jets and winds",
      "quasar activity",
    ],
    allowedTransitions: [
      "quenchedRemnant",
      "spiralGalaxy", // if feedback is gentle
      "ellipticalGalaxy", // if feedback is violent
    ],
    // Mixed population with active nucleus
    // Some star formation, significant remnants
    childFateWeights: {
      whiteDwarf: 0.2, // background population
      blackHole: 0.15, // enhanced by AGN environment
      gasCloud: 0.12, // feeding material
      neutronStar: 0.12, // from starbursts
      planet: 0.1, // mixed systems
      prestellarCore: 0.08, // triggered formation
      plasmaReservoir: 0.08, // AGN-heated gas
      brownDwarf: 0.05, // substellar
      noRemnant: 0.05, // recent supernovae
      gasGiant: 0.03, // some planetary systems
      PMO: 0.02, // ejected material
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e13,
    centralBlackHoleMass: [1e6, 1e10],
    gasRichness: "negligible",
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "ageFading",
    typicalTimescaleGyr: 10,
    definingProcesses: [
      "AGN-driven gas expulsion",
      "halo heating",
      "passive evolution",
    ],
    allowedTransitions: ["activeGalactic"], // can reawaken if gas accretes
    // Recently quenched, aging population
    // Similar to elliptical but with more recent starburst remnants
    childFateWeights: {
      whiteDwarf: 0.3, // dominant
      neutronStar: 0.15, // from recent starburst
      blackHole: 0.12, // stellar-mass, from massive stars
      planet: 0.12, // surviving systems
      brownDwarf: 0.1, // substellar
      plasmaReservoir: 0.08, // expelled, heated gas
      PMO: 0.05, // ejected planets
      noRemnant: 0.05, // recent supernovae (starburst legacy)
      gasGiant: 0.03, // surviving giants
    },
  },
}
