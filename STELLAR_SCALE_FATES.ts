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
  | "noRemnant";

type StellarScaleFateLock =
  | "stablePressureMaximum"
  | "fusionIgnition"
  | "degeneracyDominance"
  | "eventHorizon"
  | "totalDisruption";

type StellarScaleFateCharacteristics = {
  massMax: number;
  elementsProduced: Elem[];
  support: SupportType[] | false;

  fateLockedBy: StellarScaleFateLock | false;
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
export const STELLAR_SCALE_FATES: Record<StellarScaleFateKey, StellarScaleFateCharacteristics> = {
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
