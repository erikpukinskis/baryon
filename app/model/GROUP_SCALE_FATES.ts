type GroupScaleFateKey =
  | "unboundAssociation"
  | "boundGroup"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "infallingGroup";

type GroupLock =
  | "gravitationalBinding" // becomes a real group
  | "dynamicalExhaustion" // internal merging largely complete
  | "externalCapture" // absorbed into larger halo
  | false;

/**
 * Galactic fate keys, imported conceptually for type reference.
 * (In practice, this would import from GALACTIC_SCALE_FATES.ts)
 */
type GalacticScaleFateKey =
  | "diffuseHalo"
  | "dwarfIrregular"
  | "dwarfSpheroid"
  | "spiralGalaxy"
  | "lenticularGalaxy"
  | "ellipticalGalaxy"
  | "activeGalactic"
  | "quenchedRemnant";

type GroupScaleCharacteristics = {
  haloMassMin: number; // dark matter halo mass (M☉)
  haloMassMax?: number;

  gravitationallyBound: boolean;
  dominantBaryonPhase: "mixed" | "stellar" | "plasma";

  fateLockedBy: GroupLock;
  typicalTimescaleGyr: number;

  definingProcesses: string[];
  allowedTransitions: GroupScaleFateKey[];

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 10×10 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this parent regime, what mix of child fates exists?"
   * They do NOT answer: "Where in the tile does each fate appear?"
   *
   * Why weights belong on the parent:
   *
   *   A fate represents a **physical regime**. A physical regime determines
   *   what structures can exist inside it and how likely each one is.
   *
   *   Therefore: P(child fate | parent fate) belongs to the parent.
   *
   * How to read these weights:
   *
   *   • Weights are **relative**, not absolute. They are normalized at runtime.
   *   • Higher weight = more probable in this parent context.
   *   • Omitted fates have weight 0 (essentially absent in this context).
   *   • These are **priors**, not hard rules.
   *
   * Example:
   *
   *   fossilGroup.childFateWeights = {
   *     ellipticalGalaxy: 0.5,   // dominant—mergers complete
   *     quenchedRemnant: 0.2,    // common—no gas left
   *     dwarfSpheroid: 0.15,     // surviving satellites
   *   }
   *
   *   This says: "In a fossil group tile, about 50% of child cells are
   *   ellipticals, 20% are quenched remnants, 15% are dwarf spheroids."
   *
   * ─────────────────────────────────────────────────────────────────────────
   * FUTURE: SPATIAL STRUCTURE (childFieldPrior)
   *
   * The weights define WHAT fates appear. A future `childFieldPrior` field
   * will define WHERE they appear—the spatial structure of the child tile:
   *
   *   • Clustering: similar fates grouped together
   *   • Gradients: density increasing toward filament/center
   *   • Voids: contiguous empty regions
   *
   * The two work together:
   *   • childFateWeights → thresholds for converting field values to fates
   *   • childFieldPrior → parameters for generating the continuous field
   *
   * This ensures marginals match the weights while adding spatial coherence.
   * See scales.ts for the full architecture.
   * ─────────────────────────────────────────────────────────────────────────
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>;
};

/**
 * GROUP_SCALE_FATES
 * -----------------
 *
 * This table defines the **qualitative dynamical regimes of galaxy groups**—structures that
 * sit between individual galaxies and massive clusters in the cosmic hierarchy.
 *
 * Like `PARCEL_FATES` and `CLUSTER_FATES`, this model treats groups not as size bins
 * ("N galaxies") but as **physical states** separated by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A “GROUP” IS IN THIS MODEL
 *
 * A group is a **dark-matter–dominated halo** hosting multiple galaxies whose mutual
 * interactions and shared environment meaningfully affect their evolution.
 *
 * Groups are:
 *   • the most common galaxy environment
 *   • dynamically active
 *   • often transient on cosmological timescales
 *
 * Their defining feature is **partial gravitational binding** without the deep,
 * hot intracluster medium that characterizes clusters.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Groups are classified along three orthogonal axes:
 *
 *   1) **Binding**
 *      – Is the association gravitationally bound as a single halo?
 *
 *   2) **Baryon phase**
 *      – Are baryons primarily in cold gas, stars, or hot plasma?
 *
 *   3) **Evolutionary maturity**
 *      – Has internal merging largely completed, or is the group still assembling?
 *
 * These axes define **distinct regimes** with different long-term behavior.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A group’s identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • gravitationalBinding
 *       – The system virializes into a single halo and becomes a “real” group.
 *
 *   • dynamicalExhaustion
 *       – Most galaxies have merged into a dominant central object (fossil group).
 *
 *   • externalCapture
 *       – The group is accreted by a larger halo and ceases to exist as an independent system.
 *
 * Once a lock occurs, the group cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   unboundAssociation → boundGroup
 *   boundGroup → gasRichGroup / gasPoorGroup
 *   gasPoorGroup → fossilGroup
 *   boundGroup → infallingGroup
 *
 * Disallowed transitions (e.g., fossilGroup → gasRichGroup) are intentionally absent,
 * reflecting the irreversibility of internal merging and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `PARCEL_FATES` describe **object-scale physics** (stars, planets, gas parcels)
 * • `GROUP_SCALE_FATES` describe **intermediate halo-scale dynamics**
 * • `CLUSTER_FATES` describe **large-scale bound endpoints**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` — probability distribution over child fates
 *
 * A group fate constrains what galaxies can form inside it:
 *
 *   • fossilGroup → mostly ellipticals and quenched remnants
 *   • gasRichGroup → spirals and irregulars are likely
 *   • infallingGroup → stripped, quenched systems
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 * See the `childFateWeights` field in GroupScaleCharacteristics for details.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat groups as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions.
 */
export const GROUP_SCALE_FATES: Record<
  GroupScaleFateKey,
  GroupScaleCharacteristics
> = {
  unboundAssociation: {
    haloMassMin: 1e11,
    haloMassMax: 1e12,
    gravitationallyBound: false,
    dominantBaryonPhase: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "filamentary alignment",
      "chance proximity",
      "weak tidal interactions",
    ],
    allowedTransitions: ["boundGroup"],
    // Loose association, galaxies relatively undisturbed
    // Gas-rich environment favors spirals and irregulars
    childFateWeights: {
      diffuseHalo: 0.3, // many regions don't form galaxies
      dwarfIrregular: 0.25, // common in loose environments
      spiralGalaxy: 0.25, // gas-rich, undisturbed
      dwarfSpheroid: 0.1, // some old dwarfs
      ellipticalGalaxy: 0.05, // rare without mergers
      lenticularGalaxy: 0.05, // rare without stripping
    },
  },

  boundGroup: {
    haloMassMin: 1e12,
    haloMassMax: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "halo virialization",
      "galaxy–galaxy interactions",
      "gas stripping",
    ],
    allowedTransitions: ["gasRichGroup", "gasPoorGroup", "infallingGroup"],
    // Newly bound, interactions beginning
    // Mix of morphologies, transformation starting
    childFateWeights: {
      spiralGalaxy: 0.3, // still common
      dwarfIrregular: 0.2, // many dwarfs
      lenticularGalaxy: 0.15, // stripping beginning
      dwarfSpheroid: 0.15, // stripped dwarfs
      ellipticalGalaxy: 0.1, // early mergers
      diffuseHalo: 0.1, // failed formation
    },
  },

  gasRichGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1.5,
    definingProcesses: [
      "ongoing gas accretion",
      "cooling flows",
      "active star formation",
    ],
    allowedTransitions: ["gasPoorGroup", "infallingGroup"],
    // Active gas accretion, star formation flourishing
    // Spirals and star-forming dwarfs dominate
    childFateWeights: {
      spiralGalaxy: 0.35, // dominant population
      dwarfIrregular: 0.25, // active star-forming dwarfs
      activeGalactic: 0.1, // AGN activity from gas supply
      lenticularGalaxy: 0.1, // some transformation
      dwarfSpheroid: 0.1, // older dwarfs
      ellipticalGalaxy: 0.05, // rare
      diffuseHalo: 0.05, // rare in gas-rich environment
    },
  },

  gasPoorGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "gas depletion",
      "ram-pressure stripping",
      "repeated mergers",
    ],
    allowedTransitions: ["fossilGroup", "infallingGroup"],
    // Gas depleted, stripping and mergers ongoing
    // Lenticulars and ellipticals rising
    childFateWeights: {
      lenticularGalaxy: 0.3, // stripped spirals
      ellipticalGalaxy: 0.2, // merger products
      dwarfSpheroid: 0.2, // stripped dwarf irregulars
      spiralGalaxy: 0.1, // survivors
      quenchedRemnant: 0.1, // post-starburst
      dwarfIrregular: 0.05, // rare, gas stripped
      diffuseHalo: 0.05, // tidal debris
    },
  },

  fossilGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "galaxy cannibalism",
      "long isolation",
      "lack of late infall",
    ],
    allowedTransitions: [
      "infallingGroup", // only if captured by a larger halo
    ],
    // Merging complete, one dominant elliptical
    // Mostly old, quiescent systems
    childFateWeights: {
      ellipticalGalaxy: 0.5, // dominant central galaxy
      quenchedRemnant: 0.2, // post-merger remnants
      dwarfSpheroid: 0.15, // surviving satellites
      lenticularGalaxy: 0.1, // intermediate survivors
      diffuseHalo: 0.05, // tidal streams, debris
    },
  },

  infallingGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "externalCapture",
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "tidal stripping",
      "ram-pressure heating",
      "loss of group identity",
    ],
    allowedTransitions: [],
    // Being absorbed into larger cluster
    // Extreme stripping, rapid quenching
    childFateWeights: {
      lenticularGalaxy: 0.3, // rapidly stripped
      quenchedRemnant: 0.25, // recently quenched
      dwarfSpheroid: 0.2, // stripped dwarfs
      ellipticalGalaxy: 0.15, // pre-existing ellipticals
      diffuseHalo: 0.1, // tidal debris, disrupted dwarfs
    },
  },
};
