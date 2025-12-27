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
  | "Ni"

type SupportType =
  | "thermalGas" // kinetic pressure from thermal motion
  | "electronDegeneracy" // Pauli exclusion of electrons (WD, BD)
  | "neutronDegeneracy" // Pauli exclusion of neutrons (NS)
  | "nuclear" // fusion energy release regulates contraction
  | "material" // EM bonds / lattice strength
  | "eventHorizon" // spacetime geometry (black holes)

export type StarScaleFateKey =
  | "diffuseGas"
  | "star"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "substellarObject"

type StarScaleFateLock =
  | "fusionIgnition" // hydrogen fusion began
  | "electronDegeneracyDominance" // electron degeneracy is sole support
  | "neutronDegeneracyDominance" // neutron degeneracy is sole support
  | "eventHorizonFormation" // singularity formed
  | false

type StarScaleFateCharacteristics = {
  massMin?: number // solar masses
  massMax?: number // solar masses
  elementsProduced: Elem[]
  support: SupportType[] | false

  fateLockedBy: StarScaleFateLock
  typicalTimescaleMyr: number

  allowedTransitions: StarScaleFateKey[]
}

/**
 * STAR_SCALE_FATES
 * ----------------
 *
 * This table defines the **physical regimes of individual stellar systems**—the
 * objects and states that exist at the ~1 pc scale within a galaxy.
 *
 * At this scale, a "parcel" represents a single stellar system or the immediate
 * environment around one: a star, a stellar remnant, or a patch of interstellar gas.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE: FATES ARE DESTINATIONS
 *
 * When a parent parcel "paints" child fates, it paints **final outcomes**, not
 * initial states. The fate is the destination, not a stage in a lifecycle.
 *
 * For example, when a GMC paints its stellar children:
 *   - Some cells are painted as `star` (they WILL become stars)
 *   - Some cells are painted as `brownDwarf` (they WILL become brown dwarfs)
 *   - Some cells are painted as `diffuseGas` (they WON'T form anything)
 *
 * The transient "collapsing core" phase is just the mechanism by which stars
 * form—it's not a separate fate. We don't model stages, we model endpoints.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions occur when an **external force** destroys a parcel's contents
 * and replaces them with something else. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a
 *     black hole. The STAR PARCELS were destroyed and replaced.
 *
 *   - A supernova from a nearby star disrupts a gas cloud. The GAS PARCEL
 *     was destroyed and might become diffuse or be swept into new structures.
 *
 * Internal evolution (e.g., a star exhausting fuel and leaving a white dwarf)
 * is NOT modeled as a transition. Instead, when the PARENT fate transitions
 * (e.g., openCluster → evolvedField), it repaints its children with new
 * weights that reflect the aged population (more remnants, fewer active stars).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SEVEN STELLAR FATES
 *
 * GAS (stable until parent repaints):
 *   - diffuseGas — ambient ISM, not self-gravitating
 *
 * NUCLEAR-BURNING:
 *   - star — any object with sustained hydrogen (or later) fusion
 *
 * DEGENERATE REMNANTS:
 *   - whiteDwarf — electron-degenerate, no fusion
 *   - neutronStar — neutron-degenerate, no fusion
 *   - brownDwarf — electron-degenerate, never achieved H fusion
 *
 * GRAVITATIONAL:
 *   - blackHole — event horizon, no internal structure accessible
 *
 * SUBSTELLAR:
 *   - substellarObject — below brown dwarf mass (PMO, rogue planet)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY STARS DON'T TRANSITION TO REMNANTS
 *
 * You might expect `star → whiteDwarf` as a transition (stellar evolution).
 * But in this model, internal evolution is not a transition—it's just what
 * happens within a fate over time.
 *
 * When the parent interstellar region ages (e.g., openCluster → evolvedField),
 * the parent REPAINTS its children. The new weights have more whiteDwarf and
 * fewer star. This is how the "population ages"—not by stars transitioning
 * internally, but by the parent reflecting the changed composition.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game:
 *   - `star` — potential host for habitable planets
 *   - `whiteDwarf` — dim, but may have surviving planets
 *   - `neutronStar` / `blackHole` — hazardous, scientifically interesting
 *   - `diffuseGas` — no stars, just ISM
 *   - `brownDwarf` / `substellarObject` — dim, cold, unlikely targets
 *
 * Planets will be handled at a future AU scale.
 */
export const STAR_SCALE_FATES: Record<
  StarScaleFateKey,
  StarScaleFateCharacteristics
> = {
  diffuseGas: {
    // Ambient ISM: warm/cool atomic or molecular gas, not self-gravitating
    // Stable until the parent (interstellar) fate changes and repaints this cell
    massMax: Infinity,
    elementsProduced: [],
    support: false, // not self-gravitating, no support needed
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    allowedTransitions: [],
  },

  star: {
    // Any object with sustained nuclear fusion (H-burning or later stages)
    // Includes main sequence, giants, supergiants, AGB, etc.
    // Internal evolution (MS → RGB → WD) is not modeled as transitions
    massMin: 0.08,
    massMax: 150,
    elementsProduced: ["He", "C", "N", "O"], // varies by mass, simplified
    support: ["nuclear"],
    fateLockedBy: "fusionIgnition",
    typicalTimescaleMyr: 10000, // varies enormously by mass
    // External events that can destroy a star and leave something else:
    // - Multi-star gravitational collapse → blackHole
    // - Collision/merger with compact object → blackHole or neutronStar
    allowedTransitions: ["blackHole"],
  },

  whiteDwarf: {
    // Electron-degenerate remnant of low/intermediate mass stars
    // Carbon-oxygen or oxygen-neon core, no fusion
    // Painted directly by parent (not a transition from star)
    massMin: 0.5, // remnant mass
    massMax: 1.4, // Chandrasekhar limit
    elementsProduced: ["He", "C", "N", "O"],
    support: ["electronDegeneracy"],
    fateLockedBy: "electronDegeneracyDominance",
    typicalTimescaleMyr: Infinity, // effectively permanent
    // Could accrete enough to collapse: WD + gas → NS or Type Ia → nothing
    allowedTransitions: ["neutronStar"],
  },

  neutronStar: {
    // Neutron-degenerate remnant of massive stars
    // Supported by neutron degeneracy + nuclear forces
    // Painted directly by parent (not a transition from star)
    massMin: 1.4,
    massMax: 2.5, // TOV limit
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["neutronDegeneracy"],
    fateLockedBy: "neutronDegeneracyDominance",
    typicalTimescaleMyr: Infinity,
    // Could accrete enough to collapse: NS + gas → BH
    allowedTransitions: ["blackHole"],
  },

  blackHole: {
    // Gravitational singularity behind event horizon
    // No accessible internal structure
    // Can be painted directly OR result from external collapse events
    massMin: 2.5, // stellar-mass BH minimum
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["eventHorizon"],
    fateLockedBy: "eventHorizonFormation",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [], // terminal
  },

  brownDwarf: {
    // Electron-degenerate object that never achieved sustained H fusion
    // Fuses deuterium briefly, then cools forever
    massMin: 0.013, // deuterium-burning limit
    massMax: 0.08, // hydrogen-burning limit
    elementsProduced: [],
    support: ["electronDegeneracy"],
    fateLockedBy: "electronDegeneracyDominance",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
  },

  substellarObject: {
    // Below brown dwarf mass: planetary-mass objects, rogue planets
    // Supported by material strength or electron degeneracy depending on mass
    massMax: 0.013,
    elementsProduced: [],
    support: ["material", "electronDegeneracy"],
    fateLockedBy: "electronDegeneracyDominance",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
  },
}

