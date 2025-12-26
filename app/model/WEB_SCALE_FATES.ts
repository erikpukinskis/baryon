type WebScaleFateKey = "void" | "sheet" | "filament" | "node" | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
 * Web-scale fates constrain what groups and clusters can form.
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
  | "emptyCell" // no structure formed (common in voids)

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number // relative to cosmic mean
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number // characteristic size
  definingProcesses: string[]
  allowedTransitions: WebScaleFateKey[]

  /**
   * Probability distribution over child fates at Mpc1 scale.
   * See GROUP_SCALE_FATES and CLUSTER_SCALE_FATES for child definitions.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
}

/**
 * WEB_SCALE_FATES
 * --------------
 *
 * This table defines the **large-scale, unbound regimes of the cosmic web**:
 * filaments, sheets, voids, and their transitional states.
 *
 * Unlike `GROUP_SCALE_FATES` and `CLUSTER_SCALE_FATES`, web-scale fates do **not**
 * represent bound objects or endpoints. They represent **infrastructure**:
 * long-lived, anisotropic structures that **transport matter and set boundary
 * conditions** for smaller-scale evolution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT “WEB SCALE” MEANS
 *
 * Web-scale structures are:
 *   • larger than individual dark-matter halos
 *   • generally **not gravitationally bound as wholes**
 *   • dominated by dark matter geometry and diffuse baryons
 *
 * Their defining feature is **connectivity**, not containment.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE DISTINCTIONS
 *
 * Web fates are distinguished primarily by:
 *
 *   1) **Dimensionality**
 *      – 0D (nodes), 1D (filaments), 2D (sheets), 3D (voids)
 *
 *   2) **Matter flow**
 *      – Is matter passing through, stagnating, or evacuating?
 *
 *   3) **Cooling viability**
 *      – Can baryons ever cool enough to seed group or cluster formation?
 *
 * These are **geometric and dynamical regimes**, not object classes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IRREVERSIBILITY (OR LACK THEREOF)
 *
 * Web-scale fates are mostly **not fate-locked**.
 *
 * They evolve slowly via:
 *   • gravitational collapse along preferred axes
 *   • evacuation of voids
 *   • thickening or thinning of filaments
 *
 * The only true irreversibility is **capture into a bound halo**, at which point
 * the parcel leaves the web-scale model entirely and enters
 * `GROUP_SCALE_FATES` or `CLUSTER_SCALE_FATES`.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `WEB_SCALE_FATES`   → transport & geometry
 * • `GROUP_SCALE_FATES`→ halo-scale binding
 * • `CLUSTER_SCALE_FATES` → terminal containment
 * • `PARCEL_FATES`     → object-scale physics
 *
 * Web fates **gate where structure can form**, but never guarantee that it will.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Treat the cosmic web as **persistent environment**, not failed structure
 * • Encode **flows, not endpoints**
 * • Keep transitions explicit and one-way into bound regimes
 *
 * This allows large-scale structure, galaxy environments, and matter transport
 * to be reasoned about consistently without conflating filaments with clusters.
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
    definingProcesses: [
      "cosmic expansion",
      "matter evacuation",
      "suppressed cooling",
    ],
    allowedTransitions: ["sheet"],
    // Underdense regions: almost no structure formation
    // Occasional isolated dwarfs at void edges
    childFateWeights: {
      emptyCell: 0.9, // vast majority is empty
      unboundAssociation: 0.08, // rare loose associations at edges
      boundGroup: 0.02, // very rare isolated groups
    },
  },

  sheet: {
    typicalDensityContrast: 0.3,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 5,
    definingProcesses: ["pancake collapse", "anisotropic infall"],
    allowedTransitions: ["filament"],
    // Weak overdensity: some groups beginning to form
    childFateWeights: {
      emptyCell: 0.6, // still mostly empty
      unboundAssociation: 0.25, // loose groupings
      boundGroup: 0.1, // some bound groups
      gasRichGroup: 0.05, // rare, need more infall
    },
  },

  filament: {
    typicalDensityContrast: 3, // representative value in 1-10 range
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalScaleMpc: 2, // representative value in 1-3 range
    definingProcesses: [
      "one-dimensional collapse",
      "matter transport",
      "shock heating",
    ],
    allowedTransitions: ["node", "infallRegion"],
    // Matter transport corridor: groups common, clusters rare
    childFateWeights: {
      unboundAssociation: 0.25, // forming along filament
      boundGroup: 0.25, // common
      gasRichGroup: 0.2, // ongoing accretion
      gasPoorGroup: 0.1, // some evolved groups
      emptyCell: 0.1, // gaps between halos
      protoCluster: 0.05, // cluster seeds at dense points
      fossilGroup: 0.03, // isolated evolved groups
      infallingGroup: 0.02, // near larger structures
    },
  },

  node: {
    typicalDensityContrast: 30, // representative value >10
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false, // node itself is a junction, not the cluster
    fateLockedBy: false,
    typicalScaleMpc: 1,
    definingProcesses: ["filament intersection", "maximum inflow"],
    allowedTransitions: ["infallRegion"],
    // Filament intersection: clusters form here
    childFateWeights: {
      protoCluster: 0.2, // clusters assembling
      collapsingCluster: 0.15, // actively forming
      boundGroup: 0.15, // infalling groups
      gasRichGroup: 0.15, // fresh infall
      infallingGroup: 0.1, // being captured
      relaxedCluster: 0.1, // mature clusters
      gasPoorGroup: 0.05, // stripped groups
      mergingCluster: 0.05, // cluster-cluster mergers
      coolCoreCluster: 0.05, // evolved massive clusters
    },
  },

  infallRegion: {
    typicalDensityContrast: 50, // representative value >10
    dominantBaryonPhase: "plasma",
    gravitationallyBound: false,
    fateLockedBy: "haloCapture",
    typicalScaleMpc: 1,
    definingProcesses: ["accretion shocks", "transition to bound halo"],
    allowedTransitions: [], // exits web-scale model
    // Transition zone: matter entering bound halos
    // This is where groups become cluster members
    childFateWeights: {
      infallingGroup: 0.3, // groups being accreted
      collapsingCluster: 0.2, // cluster assembly ongoing
      relaxedCluster: 0.15, // mature clusters
      mergingCluster: 0.1, // active mergers
      coolCoreCluster: 0.1, // evolved cores
      gasPoorGroup: 0.08, // stripped by ICM
      fossilGroup: 0.05, // isolated massive ellipticals
      fossilCluster: 0.02, // very evolved
    },
  },
}
