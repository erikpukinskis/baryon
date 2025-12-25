/**
 * This file attempts to begin to sketch out a model for a simulation of the
 * universe.
 *
 * The hope is that it might lead to an engine that can drive a video game
 * called "Starsheet". The name is kind of a pun on "Starfleet" and is also a
 * reference to the way Eve Online has been jokingly referred to as a
 * spreadsheet simulator.
 *
 * The game will be a space sandbox game where the player is directing an effort
 * for a species to emmigrate from their homeworld as their star is expanding
 * and the star system is becoming uninhabitable.
 *
 * The game will not have any notable graphics engine. Instead it will be
 * essentially a business application, with spreadsheets, schematics, data
 * files, etc.
 *
 * The player will begin with a list of star systems to study. They will be able
 * to see some tabular information about the star systems, sort, filter, etc.
 *
 * They will be able to launch probes to promising star systems. The probes will
 * be tracked in another spreadsheet.
 *
 * Each probe will be pointed at a certain star system. The player will have to
 * choose orbital parameters, for example using gravity assists from other
 * celestial bodies. They will have to choose how close the probe will go to the
 * star, whether it is a terminal orbit, or if it will go on to another star
 * system, etc. The player will also have to choose which instruments to install
 * on the probe, and what data to collect.
 *
 * The challenges will be:
 * 1) it takes a long time for a probe to reach any star system
 * 2) it takes a long time for the data to be sent back
 * 3) probes could collide with asteroid belts or planets that weren't detected
 *    in advance
 *
 * Probes may also be sent which drop rovers onto planets to collect more data.
 *
 * The goal is to find habitable worlds, with some degree of flora and fauna,
 * comfortable gravity, atmosphere, etc.
 *
 * Once a habitable world is found, the player can send "manned" missions. These
 * will be commanded by robots, which will install the basic infrastructure:
 * energy, farms, water, housing, etc. Once some degree of survivability has
 * been established, the robots will defrost human embryos and implant them in
 * artificial wombs. As the children grow up, they become scientists, engineers,
 * and caretakers for the outpost.
 *
 * Of course none of this is visible to the player. It's all just spreadsheets.
 * They will see the progress of infrastructure deployment, population numbers,
 * economic numbers, etc.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 */

type Elem =
  | "H"
  | "He"
  | "C"
  | "N"
  | "O"
  | "Ne"
  | "Mg"
  | "Si"
  | "S"
  | "Fe"
  | "Ni";

type SupportType =
  | "thermalGas" // kinetic pressure from thermal motion; gas giant envelopes
  | "degeneracy" // quantum Pauli exclusion; brown/white dwarfs, neutron stars, PMOs
  | "nuclear" // fusion regulates contraction; main sequence stars
  | "material" // EM bonds / lattice strength; planets, rocky cores
  | "gravity"; // self-gravity; contributes to PMOs, sole support for black holes

type FateName =
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
  | "noRemnant";

type FateLock =
  | "stablePressureMaximum"
  | "fusionIgnition"
  | "degeneracyDominance"
  | "eventHorizon"
  | "totalDisruption";

type FateCharacteristics = {
  massMax: number;
  elementsProduced: Elem[];
  support: SupportType[] | false;

  fateLockedBy: FateLock | false;
  allowedTransitions: string[];
};

/**
 * PARCEL_FATES
 * ------------
 *
 * This table defines a **physics-first state machine** for baryonic matter in the universe.
 *
 * Each entry represents a **qualitative physical regime (“fate”)** that a parcel of matter
 * can occupy, rather than a final outcome in a narrative or teleological sense.
 *
 * The model is intentionally **not mass-classified**. Mass is a parameter that limits which
 * fates are accessible, but *mass alone never defines the fate*. Instead, fates are distinguished
 * by:
 *
 *   • the dominant **support mechanism** (material strength, gas pressure, degeneracy, gravity)
 *   • whether the parcel has crossed an **irreversible physical threshold**
 *   • whether further transitions are physically possible
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE CONCEPTS
 *
 * 1) Parcels
 * ----------
 * A "parcel" is an abstract region of matter followed through time. It may represent:
 *   • diffuse gas or plasma
 *   • a collapsing core
 *   • a bound object (planet, PMO, star, remnant)
 *
 * Parcels may transition between fates until an irreversible threshold is crossed.
 *
 *
 * 2) Fate ≠ Destiny
 * -----------------
 * "Fate" here means **current physical regime**, not guaranteed endpoint.
 *
 * Many fates are reversible:
 *   • gasCloud ↔ plasmaReservoir
 *   • gasCloud → prestellarCore → gasCloud
 *   • solidAggregate → planet (or dispersal)
 *
 * A fate becomes irreversible only when `fateLockedBy !== false`.
 *
 *
 * 3) Fate Locks (Irreversibility)
 * -------------------------------
 * `fateLockedBy` encodes the *physical reason* a parcel can no longer change regimes.
 *
 * Canonical locks include:
 *   • stablePressureMaximum  — collapse into a hydrostatic object
 *   • fusionIgnition        — stellar ignition fixes evolutionary path
 *   • degeneracyDominance   — quantum support replaces thermal support
 *   • eventHorizon          — spacetime geometry prevents further evolution
 *   • totalDisruption       — parcel identity is destroyed
 *
 * Once a lock is present, the parcel’s fate is fixed and `allowedTransitions` is empty.
 *
 *
 * 4) Support Mechanisms
 * --------------------
 * `support` describes *what resists gravity* at the microscopic level:
 *
 *   • 'material'    — electromagnetic / lattice strength (planets, solids)
 *   • 'thermalGas'  — thermal pressure of a fluid
 *   • 'degeneracy'  — quantum exclusion pressure
 *   • 'gravity'     — spacetime curvature (black holes)
 *
 * These define **separate physical branches** (planetary vs stellar), even when mass overlaps.
 *
 *
 * 5) Allowed Transitions
 * ---------------------
 * `allowedTransitions` explicitly encodes **which fates can follow which**, forming a directed
 * state graph.
 *
 * Invalid transitions (e.g. planet → PMO, solidAggregate → star) are intentionally absent,
 * making unphysical evolution paths unrepresentable.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTENDED USES
 *
 * This structure can be used to:
 *
 *   • drive simulations of cosmic structure formation
 *   • validate evolution paths in a model or game
 *   • reason about irreversibility and phase changes
 *   • cleanly separate planetary and stellar lineages
 *   • attach transition conditions (mass, metallicity, cooling rate) externally
 *
 * The design favors **causal clarity over completeness**:
 * new fates, locks, or transitions can be added without breaking invariants.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Pressure maxima, fusion, degeneracy, and horizons are treated as *events* that lock evolution,
 * not as passive labels. This keeps the model aligned with real physical thresholds rather than
 * observational taxonomy.
 */
const PARCEL_FATES: Record<FateName, FateCharacteristics> = {
  plasmaReservoir: {
    massMax: Infinity,
    elementsProduced: [],
    support: false,
    fateLockedBy: false,
    allowedTransitions: ["gasCloud"],
  },

  gasCloud: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas"],
    fateLockedBy: false,
    allowedTransitions: ["prestellarCore", "plasmaReservoir"],
  },

  prestellarCore: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas"],
    fateLockedBy: false,
    allowedTransitions: ["PMO", "brownDwarf", "gasCloud"],
  },

  PMO: {
    massMax: 0.013,
    elementsProduced: [],
    support: ["degeneracy", "gravity"],
    fateLockedBy: "stablePressureMaximum",
    allowedTransitions: [],
  },

  brownDwarf: {
    massMax: 0.08,
    elementsProduced: [],
    support: ["degeneracy"],
    fateLockedBy: "fusionIgnition", // deuterium-scale ignition
    allowedTransitions: [],
  },

  solidAggregate: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["material"],
    fateLockedBy: false,
    allowedTransitions: ["planet", "gasGiant"],
  },

  planet: {
    massMax: 0.01,
    elementsProduced: [],
    support: ["material"],
    fateLockedBy: "stablePressureMaximum",
    allowedTransitions: [],
  },

  gasGiant: {
    massMax: 0.013,
    elementsProduced: [],
    support: ["material", "thermalGas"],
    fateLockedBy: "stablePressureMaximum",
    allowedTransitions: [],
  },

  whiteDwarf: {
    massMax: 8,
    elementsProduced: ["He", "C", "N", "O"],
    support: ["degeneracy"],
    fateLockedBy: "degeneracyDominance",
    allowedTransitions: [],
  },

  neutronStar: {
    massMax: 20,
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["degeneracy"],
    fateLockedBy: "degeneracyDominance",
    allowedTransitions: [],
  },

  blackHole: {
    massMax: 140,
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["gravity"],
    fateLockedBy: "eventHorizon",
    allowedTransitions: [],
  },

  noRemnant: {
    massMax: 260,
    elementsProduced: ["He", "C", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: false,
    fateLockedBy: "totalDisruption",
    allowedTransitions: [],
  },
};

type BaryometricCharacteristics = {
  minTemperature?: number; // K
  maxTemperature?: number; // K
  freeElectronAbundance?: number; // electrons per baryon
  thomsonToExpansionRatio?: number; // Γ_T / H
  h2Fraction?: number; // H₂ per H
  metallicity?: number; // Z / Z☉
  requiresDarkMatterHalo?: boolean;
  canGravitate?: boolean;
  primordialLithiumPreserved?: boolean;
  lithiumDestroyed?: boolean;
};

/**
 * BARYON_COOLING_FATES
 * -------------------
 *
 * This table describes the **early-universe and diffuse-regime thermal states** of baryonic
 * matter *before* it becomes a bound object with a locked fate.
 *
 * Where `PARCEL_FATES` models **qualitative end-states and irreversible transitions**,
 * `BARYON_COOLING_FATES` models the **cooling and coupling regimes** that determine whether
 * a parcel of baryons *can ever reach* one of those fates.
 *
 * In other words:
 *
 *   • BARYON_COOLING_FATES answer: *“Can this matter cool and collapse at all?”*
 *   • PARCEL_FATES answer:         *“What kind of object does it become once it does?”*
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE IDEA
 *
 * In the early universe, **cooling — not mass — was the limiting factor**.
 *
 * Most baryons never formed stars or planets because they:
 *   • remained coupled to radiation
 *   • lacked molecular or metal cooling channels
 *   • or never fell into deep gravitational potential wells
 *
 * These cooling regimes are **qualitative**: crossing one changes the dominant physics,
 * not just a parameter value.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A “COOLING FATE” IS
 *
 * A baryon cooling fate represents:
 *   • how strongly baryons are coupled to photons
 *   • whether gravity can overcome pressure
 *   • which radiative channels are available
 *
 * Cooling fates are **reversible** and **environment-dependent**.
 * They do *not* lock evolution on their own.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TYPICAL SEQUENCE
 *
 *   radiationCoupled
 *        ↓ (expansion)
 *   acousticFluid
 *        ↓ (recombination)
 *   recombinedGas
 *        ↓ (DM halo + cooling)
 *   noCooling  OR  popIIIStarFormation
 *        ↓
 *   metalCooling
 *
 * Only after sufficient cooling does a parcel transition into a `PARCEL_FATE`
 * such as `prestellarCore` or `gasCloud`.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO PARCEL_FATES
 *
 * • Cooling fates describe **thermodynamic and radiative regimes**
 * • Parcel fates describe **structural and evolutionary regimes**
 *
 * Cooling fates gate access to parcel fates but do not replace them.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLES
 *
 * • Values are **order-of-magnitude thresholds**, not precise predictions
 * • Fields describe *what physics dominates*, not exact conditions
 * • This structure is meant to be combined with environment, redshift,
 *   and halo models rather than used in isolation
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTENDED USES
 *
 * • modeling early-universe structure formation
 * • explaining why most baryons never form stars
 * • gating transitions into prestellar or galactic regimes
 * • tracking primordial vs processed matter
 *
 * Together with `PARCEL_FATES`, this provides a complete picture:
 *
 *   cooling decides *whether* collapse is possible;
 *   fate decides *what kind* of object results.
 */
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
  radiationCoupled: {
    minTemperature: 1e6,
    freeElectronAbundance: 1.0,
    thomsonToExpansionRatio: 1e5, // photons dominate completely
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  acousticFluid: {
    minTemperature: 3000,
    maxTemperature: 1e6,
    freeElectronAbundance: 0.99,
    thomsonToExpansionRatio: 10, // still tightly coupled
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  recombinedGas: {
    maxTemperature: 3000,
    freeElectronAbundance: 1e-4,
    thomsonToExpansionRatio: 0.1, // decoupled
    canGravitate: true,
    primordialLithiumPreserved: true,
  },

  noCooling: {
    freeElectronAbundance: 1e-4,
    h2Fraction: 1e-7, // below cooling threshold
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  popIIIStarFormation: {
    h2Fraction: 1e-4, // sufficient molecular cooling
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
  },

  metalCooling: {
    metallicity: 1e-4, // critical metallicity
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
  },
};
