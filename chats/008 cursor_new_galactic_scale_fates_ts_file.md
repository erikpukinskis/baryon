# New `GALACTIC_SCALE_FATES.ts` file
_Exported on 12/28/2025 at 20:36:59 PST from Cursor (2.1.50)_

---

**User**

@app/model/GROUP_SCALE_FATES.ts:15-27 Create a GALACTIC_SCALE_FATES.ts file as suggested here.

---

**Cursor**

I'll look at the existing fate files to understand the pattern and structure, then create the `GALACTIC_SCALE_FATES.ts` file.

Now let me also check the `BARYON_COOLING_FATES.ts` to understand what child fates galaxies might produce, and `WEB_SCALE_FATES.ts` for completeness:

Now I have a complete understanding of the pattern. Let me create the `GALACTIC_SCALE_FATES.ts` file with proper structure, documentation, and child fate weights referencing `StellarScaleFateKey`:

```typescript
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

/**
 * Stellar fate keys, imported conceptually for type reference.
 * Galaxies constrain what stellar systems can form inside them.
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

type GalacticScaleFateCharacteristics = {
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 10×10 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this galactic regime, what mix of stellar fates
   * exists?" They do NOT answer: "Where in the galaxy does each fate appear?"
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
   *   ellipticalGalaxy.childFateWeights = {
   *     whiteDwarf: 0.4,      // old stellar population, many WDs
   *     plasmaReservoir: 0.2, // hot halo gas
   *     blackHole: 0.05,      // central SMBH region
   *   }
   *
   *   This says: "In an elliptical galaxy tile, about 40% of child cells are
   *   white dwarfs, 20% are plasma reservoirs, 5% contain black holes."
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `STELLAR_SCALE_FATES` describe **stellar object physics** within galaxies
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over stellar fates
 *
 * A galaxy fate constrains what stellar systems can form inside it:
 *
 *   • spiralGalaxy → gas clouds, prestellar cores, young stars common
 *   • ellipticalGalaxy → old stars, white dwarfs, little gas
 *   • dwarfIrregular → stochastic star formation, PMOs, brown dwarfs
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with rare old stars
    childFateWeights: {
      plasmaReservoir: 0.5, // hot halo gas dominates
      gasCloud: 0.15, // some diffuse gas
      whiteDwarf: 0.15, // old stellar population
      PMO: 0.1, // failed stars
      brownDwarf: 0.05, // substellar objects
      prestellarCore: 0.05, // rare collapse events
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Gas clouds and young stars common
    childFateWeights: {
      gasCloud: 0.25, // abundant molecular gas
      prestellarCore: 0.15, // active collapse
      plasmaReservoir: 0.15, // warm/hot ISM
      whiteDwarf: 0.15, // older stars
      brownDwarf: 0.1, // common in low-mass environments
      PMO: 0.08, // substellar objects
      solidAggregate: 0.07, // planet-forming regions
      neutronStar: 0.03, // from past supernovae
      blackHole: 0.02, // rare stellar-mass BHs
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

The `GALACTIC_SCALE_FATES.ts` file has been created with no linter errors. Looking at `index.ts`, the import was already in place:

```2:2:app/model/index.ts
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
```

Now let me update `GROUP_SCALE_FATES.ts` to properly import the type from the new file instead of defining it locally:

```typescript
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
```

```typescript
type GroupScaleFateKey =
  | "unboundAssociation"
  | "boundGroup"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "infallingGroup"

type GroupLock =
  | "gravitationalBinding" // becomes a real group
  | "dynamicalExhaustion" // internal merging largely complete
  | "externalCapture" // absorbed into larger halo
  | false

import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

type GroupScaleCharacteristics = {
  haloMassMin: number // dark matter halo mass (M☉)
  haloMassMax?: number

  gravitationallyBound: boolean
  dominantBaryonPhase: "mixed" | "stellar" | "plasma"

  fateLockedBy: GroupLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GroupScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 10×10 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this parent regime, what mix of child fates
   * exists?" They do NOT answer: "Where in the tile does each fate appear?"
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
   *   • Higher weight = more probable in this parent context. • Omitted fates
   *   have weight 0 (essentially absent in this context). • These are
   *   **priors**, not hard rules.
   *
   * Example:
   *
   *   fossilGroup.childFateWeights = { ellipticalGalaxy: 0.5,   //
   *     dominant—mergers complete quenchedRemnant: 0.2,    // common—no gas
   *     left dwarfSpheroid: 0.15,     // surviving satellites
   *   }
   *
   *   This says: "In a fossil group tile, about 50% of child cells are
   *   ellipticals, 20% are quenched remnants, 15% are dwarf spheroids."
   *
   * ─────────────────────────────────────────────────────────────────────────
   * FUTURE: SPATIAL STRUCTURE (childFieldPrior)
   *
   * The weights define WHAT fates appear. A future `childFieldPrior` field will
   * define WHERE they appear—the spatial structure of the child tile:
   *
   *   • Clustering: similar fates grouped together • Gradients: density
   *   increasing toward filament/center • Voids: contiguous empty regions
   *
   * The two work together: • childFateWeights → thresholds for converting field
   *   values to fates • childFieldPrior → parameters for generating the
   *   continuous field
   *
   * This ensures marginals match the weights while adding spatial coherence.
   * See ~/model for the full architecture.
   * ─────────────────────────────────────────────────────────────────────────
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

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
}

```

```typescript
type ClusterScaleFateKey =
  | "protoCluster"
  | "poorCluster"
  | "massiveCluster"
  | "mergingCluster"
  | "relaxedCluster"
  | "coolCoreCluster"
  | "nonCoolCoreCluster"
  | "fossilCluster"
  | "collapsingCluster" // added for web-scale compatibility

type ClusterScaleLock =
  | "gravitationalBinding" // cluster-scale virialization
  | "thermalization" // hot ICM dominates baryons
  | "dynamicalRelaxation" // substructure erased
  | "coolingFeedbackBalance" // AGN ↔ cooling equilibrium
  | false

import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

type ClusterScaleFateCharacteristics = {
  massMin: number // halo mass in solar masses (M☉)
  massMax?: number
  dominantBaryonPhase: "plasma" | "mixed"
  gravitationallyBound: boolean

  fateLockedBy: ClusterScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[] // qualitative physics drivers
  allowedTransitions: ClusterScaleFateKey[]

  /**
   * Probability distribution over galactic-scale child fates.
   * Cluster environments strongly suppress star formation and strip gas,
   * favoring quiescent morphologies (ellipticals, lenticulars, spheroids).
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * CLUSTER_SCALE_FATES
 * ------------------
 *
 * This table defines the **qualitative dynamical and thermodynamic regimes of galaxy clusters**,
 * the largest gravitationally bound structures in the universe.
 *
 * As with `PARCEL_FATES` and `GROUP_SCALE_FATES`, clusters are modeled not as size or richness
 * categories, but as **physical regimes** separated by **irreversible thresholds** in binding,
 * heating, and relaxation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A “CLUSTER” IS IN THIS MODEL
 *
 * A cluster is a **deep dark-matter halo** whose gravitational potential is strong enough that:
 *
 *   • the majority of baryons reside in a **hot, diffuse plasma**
 *   • gas cooling times are long compared to dynamical times
 *   • individual galaxy evolution is dominated by environment
 *
 * Clusters are the **endpoints of hierarchical structure formation** for baryonic matter
 * on megaparsec scales.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Cluster fates are distinguished along three primary axes:
 *
 *   1) **Binding depth**
 *      – Has the system virialized into a single, cluster-scale halo?
 *
 *   2) **Thermal state of baryons**
 *      – Is the intracluster medium (ICM) fully shock-heated and dominant?
 *
 *   3) **Dynamical maturity**
 *      – Has substructure been erased, or is the cluster still assembling?
 *
 * These axes define regimes with qualitatively different galaxy evolution,
 * gas behavior, and observational signatures.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Cluster evolution becomes irreversible when one or more of the following thresholds
 * are crossed:
 *
 *   • gravitationalBinding
 *       – The system becomes a permanently bound cluster-scale halo.
 *
 *   • thermalization
 *       – Shock heating produces a long-lived, hot intracluster medium that dominates baryons.
 *
 *   • dynamicalRelaxation
 *       – Major substructure is erased and the potential becomes smooth.
 *
 *   • coolingFeedbackBalance
 *       – Long-term equilibrium between radiative cooling and AGN feedback is established.
 *
 * Once these locks occur, the cluster cannot revert to a group-scale or filamentary regime.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible cluster evolution paths, such as:
 *
 *   protoCluster → poorCluster → massiveCluster
 *   massiveCluster ↔ mergingCluster → relaxedCluster
 *   relaxedCluster → coolCoreCluster / nonCoolCoreCluster
 *
 * Transitions reflect **history and environment**, not just mass.
 * Major mergers can temporarily move a cluster out of a relaxed state,
 * but not undo its fundamental binding or scale.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `PARCEL_FATES` describe **object-scale matter physics**
 * • `GROUP_SCALE_FATES` describe **intermediate halo-scale assembly**
 * • `CLUSTER_SCALE_FATES` describe **large-scale environmental endpoints**
 *
 * Together, these models form a hierarchical, multi-scale description of how matter
 * organizes itself in the universe.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Treat clusters as **dynamical processes**, not static catalog entries
 * • Encode **irreversibility explicitly**
 * • Separate **mass thresholds** from **physical regime changes**
 *
 * This allows cluster behavior to be reasoned about consistently across simulations,
 * observations, and conceptual models without relying on survey-specific definitions.
 */
export const CLUSTER_SCALE_FATES: Record<
  ClusterScaleFateKey,
  ClusterScaleFateCharacteristics
> = {
  protoCluster: {
    massMin: 1e13,
    massMax: 1e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "hierarchical accretion",
      "group infall",
      "incomplete virialization",
    ],
    allowedTransitions: ["poorCluster", "mergingCluster"],
    // Assembling cluster: mix of infalling groups
    // Still has spirals, transformation beginning
    childFateWeights: {
      spiralGalaxy: 0.25, // still arriving from field
      lenticularGalaxy: 0.2, // transformation starting
      ellipticalGalaxy: 0.15, // group mergers
      dwarfIrregular: 0.1, // infalling dwarfs
      dwarfSpheroid: 0.1, // stripping beginning
      quenchedRemnant: 0.1, // recently quenched
      activeGalactic: 0.05, // AGN triggered by interactions
      diffuseHalo: 0.05, // tidal debris
    },
  },

  collapsingCluster: {
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1.5,
    definingProcesses: [
      "active assembly",
      "multiple group mergers",
      "ICM formation beginning",
    ],
    allowedTransitions: ["poorCluster", "mergingCluster"],
    // Active collapse: rapid transformation
    childFateWeights: {
      lenticularGalaxy: 0.25, // rapid stripping
      ellipticalGalaxy: 0.2, // mergers common
      spiralGalaxy: 0.15, // surviving but doomed
      quenchedRemnant: 0.15, // recently quenched
      dwarfSpheroid: 0.1, // stripped dwarfs
      activeGalactic: 0.08, // merger-triggered AGN
      dwarfIrregular: 0.05, // rare, being stripped
      diffuseHalo: 0.02, // tidal debris
    },
  },

  poorCluster: {
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    definingProcesses: ["group mergers", "halo virialization", "shock heating"],
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    // Bound but not massive: mixed populations
    childFateWeights: {
      lenticularGalaxy: 0.25, // stripping ongoing
      ellipticalGalaxy: 0.2, // from mergers
      spiralGalaxy: 0.15, // at outskirts
      dwarfSpheroid: 0.15, // stripped satellites
      quenchedRemnant: 0.1, // quenched galaxies
      activeGalactic: 0.05, // occasional AGN
      dwarfIrregular: 0.05, // rare, infalling
      diffuseHalo: 0.05, // tidal streams
    },
  },

  massiveCluster: {
    massMin: 5e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "thermalization",
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "deep potential well",
      "hot intracluster medium",
      "long cooling times",
    ],
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    // Massive, hot: mostly quiescent galaxies
    childFateWeights: {
      ellipticalGalaxy: 0.35, // dominant population
      lenticularGalaxy: 0.25, // common
      dwarfSpheroid: 0.15, // stripped satellites
      quenchedRemnant: 0.1, // post-AGN
      spiralGalaxy: 0.05, // rare, at outskirts
      activeGalactic: 0.05, // central AGN
      diffuseHalo: 0.05, // tidal debris
    },
  },

  mergingCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "cluster–cluster mergers",
      "shock fronts",
      "bulk gas motions",
      "substructure survival",
    ],
    allowedTransitions: ["relaxedCluster", "nonCoolCoreCluster"],
    // Active merger: enhanced interactions, AGN
    childFateWeights: {
      ellipticalGalaxy: 0.25, // from pre-existing
      lenticularGalaxy: 0.2, // common
      quenchedRemnant: 0.15, // merger quenching
      activeGalactic: 0.15, // merger-triggered AGN
      dwarfSpheroid: 0.1, // stripped satellites
      spiralGalaxy: 0.08, // surviving at outskirts
      diffuseHalo: 0.07, // tidal streams common
    },
  },

  relaxedCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "violent relaxation complete",
      "smooth potential",
      "isotropic galaxy velocities",
    ],
    allowedTransitions: ["coolCoreCluster", "nonCoolCoreCluster"],
    // Relaxed: old populations dominate
    childFateWeights: {
      ellipticalGalaxy: 0.35, // dominant
      lenticularGalaxy: 0.25, // common
      dwarfSpheroid: 0.2, // abundant satellites
      quenchedRemnant: 0.1, // old quenched
      spiralGalaxy: 0.05, // rare, infalling
      diffuseHalo: 0.05, // ancient tidal debris
    },
  },

  coolCoreCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "coolingFeedbackBalance",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "short central cooling times",
      "AGN feedback",
      "entropy stratification",
    ],
    allowedTransitions: [
      "nonCoolCoreCluster", // major merger can disrupt
    ],
    // Cool core: central BCG with AGN, old population
    childFateWeights: {
      ellipticalGalaxy: 0.4, // dominant, including BCG
      lenticularGalaxy: 0.2, // common
      dwarfSpheroid: 0.15, // satellites
      activeGalactic: 0.1, // central AGN in BCG
      quenchedRemnant: 0.1, // old quenched
      spiralGalaxy: 0.03, // very rare
      diffuseHalo: 0.02, // minor debris
    },
  },

  nonCoolCoreCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "merger heating",
      "high core entropy",
      "suppressed cooling",
    ],
    allowedTransitions: ["coolCoreCluster"],
    // Merger-heated: similar to relaxed but more disturbed
    childFateWeights: {
      ellipticalGalaxy: 0.35, // dominant
      lenticularGalaxy: 0.25, // common
      dwarfSpheroid: 0.15, // satellites
      quenchedRemnant: 0.1, // post-merger
      activeGalactic: 0.05, // less than cool-core
      spiralGalaxy: 0.05, // rare, infalling
      diffuseHalo: 0.05, // tidal debris
    },
  },

  fossilCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "early formation",
      "galaxy cannibalism",
      "lack of late infall",
    ],
    allowedTransitions: [],
    // Fossil: one giant elliptical dominates, few satellites
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central giant dominates
      dwarfSpheroid: 0.2, // surviving small satellites
      quenchedRemnant: 0.15, // post-merger remnants
      lenticularGalaxy: 0.1, // few remaining
      diffuseHalo: 0.05, // intracluster light
    },
  },
}

```

All done. I've created `GALACTIC_SCALE_FATES.ts` with the 8 galactic fates and updated both `GROUP_SCALE_FATES.ts` and `CLUSTER_SCALE_FATES.ts` to import the type from the new file instead of defining it locally.

The new file includes:

- **`GalacticScaleFateKey`** — exported type with all 8 fates
- **`GalacticScaleLock`** — irreversibility thresholds (`morphologicalRelaxation`, `gasExhaustion`, `tidalDisruption`)
- **`GalacticScaleFateCharacteristics`** — characteristics type with stellar mass ranges, gas content, star formation status, stellar populations, and child fate weights
- **Extensive documentation** following the established pattern explaining the physical model
- **`childFateWeights`** referencing `StellarScaleFateKey` for cross-scale constraints (what kinds of stellar objects each galaxy type produces)

The fates model galaxy evolution as physical regimes:

| Fate | Description |
|------|-------------|
| `diffuseHalo` | Low-mass, inefficiently cooled halo |
| `dwarfIrregular` | Gas-rich dwarf with bursty star formation |
| `dwarfSpheroid` | Gas-stripped, quiescent dwarf (locked) |
| `spiralGalaxy` | Disk-dominated with active star formation |
| `lenticularGalaxy` | Disk with no gas, faded spiral |
| `ellipticalGalaxy` | Pressure-supported, merger product (locked) |
| `activeGalactic` | AGN-dominated phase |
| `quenchedRemnant` | Dead galaxy, passive aging (locked) |

---

**User**

Awesome! You did a superb job.

Please take a look at the SCALES definition here:

@app/model/index.ts:163-200 

Does it make sense that there are no scales between kpc100 and pc1? Are there any mentions of what might be there elsewhere in the project?



---

**Cursor**

Great question! The jump from 100 kpc to 1 pc is enormous—a factor of 100,000. Let me search the codebase for any mentions of intermediate scales or what might fill that gap.

```plaintext
   Mpc10    →  Mpc1    →  kpc100   →  pc1     →  (AU1)
   (web)       (groups)   (galaxies)  (stars)    (planets)
```

```plaintext
   // AU1: {
   //   fates: { PLANETARY_SCALE_FATES }
   // }
```

Interesting find! Looking at the documentation in `index.ts` lines 33-34:

```33:34:app/model/index.ts
 *   Mpc10    →  Mpc1    →  kpc100   →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (stars)    (planets)
```

The jump from **100 kpc** to **1 pc** is a factor of **100,000**! That's a huge gap. In a 10×10 grid hierarchy, each step is typically ~10× smaller, so you'd expect 4-5 intermediate scales.

Let me search for any discussion of what might fill this gap:

```typescript
 *   Mpc10    →  Mpc1    →  kpc100   →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (stars)    (planets)
```

```plaintext
*   Milky Way (disk plane)
*     ├── Orion Arm (aligned with parent)
*     │     └── Sol system (tilted 60° to galactic plane)
*     └── Sagittarius Dwarf (oriented 90° to disk)
```

Excellent question! Looking at the documentation, I found a key hint. In lines 144-147 of `index.ts`:

```144:147:app/model/index.ts
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
```

The **Orion Arm** is explicitly mentioned as an intermediate structure between the galaxy and the stellar system! This suggests there should be scales between kpc100 and pc1.

## The Gap Analysis

| Current Scale | Size | Jump Factor |
|---------------|------|-------------|
| kpc100 (galaxies) | 100,000 pc | — |
| pc1 (stars) | 1 pc | **100,000×** |

With 10×10 grids at each level, you'd expect ~10× jumps per scale, meaning **4-5 intermediate scales** are missing:

| Potential Scale | Size | Physical Structures |
|-----------------|------|---------------------|
| **kpc10** | 10 kpc | Spiral arms, bulge, disk regions, halo |
| **kpc1** | 1 kpc | Star-forming complexes, stellar streams |
| **pc100** | 100 pc | OB associations, giant molecular cloud complexes |
| **pc10** | 10 pc | Open clusters, globular clusters, molecular clouds, HII regions |

These would represent distinct physical regimes with their own fate-determining physics:

- **kpc10** — disk vs bulge vs halo (morphological regions, metallicity gradients)
- **kpc1** — coherent star-forming complexes, inter-arm voids
- **pc100** — OB associations, stellar nurseries, superbubbles
- **pc10** — bound star clusters, individual molecular clouds

Currently, `GALACTIC_SCALE_FATES` has `childFateWeights` pointing directly to `StellarScaleFateKey`, which skips over all this structure. Want me to propose intermediate scale fates to fill this gap?

```typescript
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
```

```typescript
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
```

---

**User**

I don't think we necessarily need a new scale every 10x. The only reason we have Mpc1 and Mpc10 for example is that between those two scales, there are substantial, qualitative differences in how physics works.



To be honest, I would _prefer_ if the jump between scales is closer to 100x. That way when I want to run a simulation at one scale, it will be 100x100 pixels, which allows for a lot more detail.



Also, having fewer scales just means less to debug.



Given that, I guess I'll ask a new question: Do you think there are any scales between kpc100 and pc1 which are *essential* to the model functioning the way we hope it will?

---

**Cursor**

Great framing! Let me think about what's **qualitatively different** between 100 kpc and 1 pc, and whether any intermediate physics is essential.

## What physics happens between galaxy and star?

| Scale | Structures | Key Physics |
|-------|------------|-------------|
| ~10 kpc | Spiral arms, disk/bulge/halo | Density waves, rotation curves |
| ~1 kpc | Star-forming complexes | Galactic shear, superbubble feedback |
| ~100 pc | OB associations, GMC complexes | Turbulent cascades, cloud collisions |
| ~10 pc | Star clusters, individual GMCs | Gravitational collapse, cluster dynamics |

## The key question: Is there an **irreversible threshold** between galaxy and star?

Looking at your model's design principle—**fates are regimes separated by irreversible thresholds**—I'd argue:

**No essential intermediate scale is needed.** Here's why:

1. **Spiral arms, disk regions** (kpc scales) are not "fates"—they're spatial modulations within a galactic fate. A spiral arm isn't a regime with irreversible thresholds; it's a density wave passing through.

2. **Molecular clouds and star clusters** (10-100 pc) are interesting, but they're transient. GMCs live ~10-30 Myr, open clusters dissolve. They're more like *transitions* than *fates*.

3. **The physics that matters for stellar fates**—metallicity, gas density, turbulence—are inherited from the galaxy fate and can be encoded in `childFateWeights` + spatial correlation.

## One consideration: Star clusters

The one thing you *might* miss is **bound star clusters** (open and globular). These are long-lived structures where:
- Stars share age/metallicity
- Nearby systems are truly neighbors (for colonization gameplay!)
- Dynamics are different (cluster evaporation, core collapse)

But you could handle this by:
- Making "star cluster member" vs "field star" a property of stellar-scale parcels
- Or using spatial correlation to group similar stellar fates

## My verdict

**The current kpc100 → pc1 jump is probably fine for a first implementation.** The 100,000× jump is large, but you're not skipping any *essential* fate-determining physics—you're skipping spatial structure that can be recovered through field-based sampling.

If you later find the model produces unrealistic stellar neighborhoods (too uniform, no clustering), you could add a **pc100** scale for "regional fates" (star-forming region, evolved stellar field, globular cluster, etc.). But I'd treat that as optimization, not essential architecture.

---

**User**

Excellent analysis!



I think you might be putting too much weight on the fates being "forever'...



It is true that at the largest scales (web scale, group scale) fates were set in stone in the early universe, and their nature will not change.



However, I think as you go to smaller and smaller spatial scales, the "fate" also  applies to smaller and smaller timescales. A star might always be white dward, but if it's close to the middle of a galaxy it might merge with some other stars and then get whipped out of the galaxy and become a rogue black hole.



That's not a "stellar" fate, it's a galactic fate that the galaxy is such that it's creating rogue black holes.



Yet, the concept of "stellar fates" makes perfect sense on a smaller timescale.



Does that change your analysis at all?

---

**Cursor**

Ah, this reframing is crucial! If fates are **"regimes at the characteristic timescale of that scale"**, then the question changes from "what's eternal?" to "what timescales are distinct?"

## Timescale Analysis

| Scale | Characteristic Timescale | What changes on this timescale |
|-------|-------------------------|-------------------------------|
| Web (10 Mpc) | Hubble time (~10 Gyr) | Nothing—frozen since early universe |
| Group (1 Mpc) | ~1-5 Gyr | Mergers, gas stripping, infall |
| Galaxy (100 kpc) | ~100 Myr - 1 Gyr | Morphological evolution, quenching |
| **??? (~100 pc)** | **~10-100 Myr** | **GMC lifecycle, cluster dissolution, superbubble evolution** |
| Stellar (1 pc) | ~1 Myr - 10 Gyr | Stellar evolution, core collapse |

## The gap I missed: ISM structure timescales

There IS a distinct timescale regime at ~10-100 Myr that governs:

- **Giant Molecular Clouds**: form, host star formation, get disrupted by feedback (~20-30 Myr lifecycle)
- **Star clusters**: form in GMCs, dissolve into the field (~100 Myr for open clusters)
- **HII regions**: expand around young stars, then fade (~10 Myr)
- **Superbubbles**: carved by supernovae, persist, then collapse (~10-50 Myr)

These aren't just spatial patterns—they're **dynamical regimes** with their own physics. A star forming inside a dense GMC core vs. at the edge of an expanding superbubble has genuinely different initial conditions.

## What the current model misses

Right now, `GALACTIC_SCALE_FATES` → `STELLAR_SCALE_FATES` means every 1 pc cell in a spiral galaxy independently samples from the same distribution. But in reality:

- Stars form in **clusters**, not uniformly
- GMCs are **coherent objects** spanning ~50-100 pc
- The local ISM state (molecular cloud vs HII region vs superbubble) determines whether star formation happens at all

The current `gasCloud` and `plasmaReservoir` stellar fates describe what's in a 1 pc cell, but not whether that cell is part of a 50 pc GMC complex or an isolated cloudlet.

## Updated verdict

**One intermediate scale at ~100 pc (pc100) would be justified** on physics grounds. It would represent:

| Fate | Description | Timescale | Constrains stellar fates |
|------|-------------|-----------|-------------------------|
| `giantMolecularCloud` | Dense, star-forming complex | ~30 Myr | High prestellarCore, gasCloud |
| `HIIRegion` | Ionized by young OB stars | ~10 Myr | High plasmaReservoir, low formation |
| `superbubble` | Hot cavity from supernovae | ~30 Myr | Almost entirely plasmaReservoir |
| `diffuseISM` | Low-density interstellar medium | Steady state | Sparse, isolated star formation |
| `openCluster` | Bound stellar cluster | ~100 Myr dissolution | Concentrated stellar fates |
| `globularCluster` | Ancient dense cluster | ~10 Gyr stable | Old stars only, specific metallicity |
| `stellarStream` | Tidally disrupted structure | ~Gyr coherence | Kinematically related old stars |

This gives you:
- **kpc100 → pc100**: 1000× (galaxy → neighborhood)
- **pc100 → pc1**: 100× (neighborhood → star)

**But it's still optional.** You could defer this and use spatial correlation at pc1 to create clustering. The model would work—it just wouldn't explicitly represent star-forming regions and clusters as first-class entities.

---

**User**

Great, go ahead and create that scale.



Be aggressive about updating documentation, references, notes and such you find throughout the project if anything is out of date.



Also you mentioned there might be some overlap between gas clouds at the stellar scale and at this intermediate scale. Feel free to move any concerns from galactic of stellar scale to this new scale if they seem more at home there. Also feel free to simply narrow the scope of any concerns at those scales if they were doing double duty for things that will now have a home at the intermediate scale.

---

**Cursor**

I'll create the new intermediate scale and update all related files. Let me start by creating a comprehensive todo list and then work through it systematically.

Now let me read the index.ts to understand the full context before creating the new file:

Now I'll create the new REGIONAL_SCALE_FATES.ts file:

```typescript
export type RegionalScaleFateKey =
  | "giantMolecularCloud"
  | "HIIRegion"
  | "superbubble"
  | "diffuseISM"
  | "openCluster"
  | "globularCluster"
  | "stellarStream"
  | "evolvedField"

type RegionalScaleLock =
  | "clusterBinding" // gravitationally bound cluster formed
  | "feedbackDisruption" // GMC destroyed by stellar feedback
  | "tidalDisruption" // structure torn apart by tidal forces
  | false

/**
 * Stellar fate keys, imported conceptually for type reference.
 * Regional structures constrain what stellar systems can form inside them.
 */
type StellarScaleFateKey =
  | "protostellarCore"
  | "protoplanetaryDisk"
  | "mainSequenceStar"
  | "evolvedStar"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "PMO"
  | "planetarySystem"
  | "diffuseGas"
  | "denseClump"

type RegionalScaleFateCharacteristics = {
  sizePcMin: number // characteristic size in parsecs
  sizePcMax?: number
  gasRich: boolean
  starFormationActive: boolean
  gravitationallyBound: boolean

  fateLockedBy: RegionalScaleLock
  typicalTimescaleMyr: number // note: Myr, not Gyr—this scale evolves faster

  definingProcesses: string[]
  allowedTransitions: RegionalScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 100×100 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this regional regime, what mix of stellar fates
   * exists?" They do NOT answer: "Where in the region does each fate appear?"
   *
   * Regional fates have a characteristic timescale of ~10-100 Myr, which is
   * faster than galactic timescales but slower than stellar evolution. This
   * makes them the natural home for:
   *
   *   • Star-forming regions (GMCs, HII regions)
   *   • Star clusters (open, globular)
   *   • ISM phases (superbubbles, diffuse gas)
   *
   * Example:
   *
   *   giantMolecularCloud.childFateWeights = {
   *     denseClump: 0.3,         // collapsing cores
   *     protostellarCore: 0.2,   // active star formation
   *     diffuseGas: 0.25,        // ambient cloud material
   *   }
   *
   *   This says: "In a GMC tile, about 30% of child cells are dense clumps,
   *   20% are protostellar cores, 25% are diffuse gas."
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * REGIONAL_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of stellar neighborhoods**—
 * structures at ~100 pc scale that sit between galaxies and individual stellar systems.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
 *
 * This is faster than galactic evolution (~Gyr) but spans many stellar generations.
 * The regional fate determines the LOCAL environment for star formation—things
 * like stellar density, metallicity coherence, and gas availability.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Regional fates are distinguished by:
 *
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 *   4) **Age/evolutionary state**
 *      – Young (GMC, HII) vs evolved (superbubble, old cluster) vs ancient (stream)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Regional fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode the lifecycle of ISM structures:
 *
 *   diffuseISM → giantMolecularCloud (cloud formation)
 *   giantMolecularCloud → HIIRegion / openCluster (star formation + feedback)
 *   HIIRegion → superbubble (supernovae from OB stars)
 *   superbubble → diffuseISM (cooling and mixing)
 *   openCluster → stellarStream / evolvedField (dissolution)
 *   globularCluster → stellarStream (tidal stripping, rare)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GALACTIC_SCALE_FATES` describe **galaxy-wide morphology and gas content**
 * • `REGIONAL_SCALE_FATES` describe **local ISM structure and star clusters**
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * The galactic fate sets the overall star formation rate and gas fraction.
 * The regional fate determines WHERE stars form and in what environment.
 * The stellar fate describes the individual objects that result.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game, regional fates matter because:
 *
 *   • Stars in the same cluster have similar ages and metallicities
 *   • Nearby stars in a cluster are truly close (potential travel targets)
 *   • GMCs and HII regions are hazardous (radiation, gas)
 *   • Evolved field regions have stable, well-separated stellar systems
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Encode **ISM lifecycle** as a state machine
 * • Treat clusters as **first-class entities**, not emergent patterns
 * • Distinguish **bound** (cluster) from **unbound** (association, field) populations
 * • Use timescales appropriate to the physics (~Myr, not Gyr)
 */
export const REGIONAL_SCALE_FATES: Record<
  RegionalScaleFateKey,
  RegionalScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false, // cloud is not bound, but dense cores within it are
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    definingProcesses: [
      "gravitational collapse",
      "turbulent fragmentation",
      "magnetic support",
      "cooling and shielding",
    ],
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    // Active star-forming cloud: mix of dense cores and diffuse gas
    childFateWeights: {
      diffuseGas: 0.35, // ambient molecular gas
      denseClump: 0.25, // collapsing cores, not yet stars
      protostellarCore: 0.15, // actively forming protostars
      protoplanetaryDisk: 0.1, // young stars with disks
      mainSequenceStar: 0.08, // recently formed stars
      brownDwarf: 0.05, // failed stars
      PMO: 0.02, // planetary-mass objects
    },
  },

  HIIRegion: {
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true, // ionized gas, not molecular
    starFormationActive: false, // feedback suppresses new formation
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    definingProcesses: [
      "photoionization",
      "radiation pressure",
      "stellar winds",
      "champagne flows",
    ],
    allowedTransitions: ["superbubble", "diffuseISM"],
    // Ionized region around young OB stars: bright, hot, expanding
    childFateWeights: {
      mainSequenceStar: 0.3, // young OB stars dominating
      diffuseGas: 0.25, // ionized gas (HII)
      protoplanetaryDisk: 0.15, // young stars with surviving disks
      protostellarCore: 0.1, // triggered star formation at edges
      brownDwarf: 0.1, // low-mass products
      PMO: 0.05, // ejected objects
      evolvedStar: 0.05, // a few evolved massive stars
    },
  },

  superbubble: {
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false, // hot, tenuous plasma
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    definingProcesses: [
      "supernova explosions",
      "stellar wind bubbles",
      "shock heating",
      "chimney venting",
    ],
    allowedTransitions: ["diffuseISM"],
    // Hot cavity carved by supernovae: sparse, energetic
    childFateWeights: {
      diffuseGas: 0.3, // hot, ionized gas
      mainSequenceStar: 0.2, // surviving stars
      whiteDwarf: 0.15, // remnants of intermediate-mass stars
      neutronStar: 0.1, // core-collapse remnants
      blackHole: 0.05, // rare massive remnants
      evolvedStar: 0.1, // late-stage massive stars
      brownDwarf: 0.05, // low-mass survivors
      PMO: 0.05, // dynamically ejected objects
    },
  },

  diffuseISM: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true, // warm/cool atomic gas
    starFormationActive: false, // too diffuse
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 100, // quasi-steady state
    definingProcesses: [
      "thermal equilibrium",
      "cosmic ray heating",
      "radiative cooling",
      "turbulent mixing",
    ],
    allowedTransitions: ["giantMolecularCloud"],
    // Ambient interstellar medium: low density, stable
    childFateWeights: {
      diffuseGas: 0.5, // warm/cool atomic hydrogen
      mainSequenceStar: 0.2, // field stars passing through
      whiteDwarf: 0.1, // old remnants
      brownDwarf: 0.08, // low-mass objects
      PMO: 0.05, // rogue planets, free-floating
      evolvedStar: 0.04, // red giants
      neutronStar: 0.02, // old pulsars
      blackHole: 0.01, // rare stellar-mass BHs
    },
  },

  openCluster: {
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false, // gas expelled by feedback
    starFormationActive: false, // formation complete
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100, // dissolution timescale
    definingProcesses: [
      "two-body relaxation",
      "mass segregation",
      "tidal stripping",
      "evaporation",
    ],
    allowedTransitions: ["stellarStream", "evolvedField"],
    // Young bound cluster: concentrated, coeval population
    childFateWeights: {
      mainSequenceStar: 0.5, // dominant population
      protoplanetaryDisk: 0.1, // youngest members
      brownDwarf: 0.12, // low-mass members
      whiteDwarf: 0.08, // if cluster is old enough
      evolvedStar: 0.08, // red giants, supergiants
      PMO: 0.05, // ejected planets
      planetarySystem: 0.05, // mature planetary systems
      neutronStar: 0.02, // from massive star deaths
    },
  },

  globularCluster: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000, // ~10 Gyr, very long-lived
    definingProcesses: [
      "core collapse",
      "mass segregation",
      "blue straggler formation",
      "tidal truncation",
    ],
    allowedTransitions: ["stellarStream"], // only via tidal disruption
    // Ancient dense cluster: old stars, exotic binaries
    childFateWeights: {
      mainSequenceStar: 0.35, // low-mass MS stars
      whiteDwarf: 0.25, // many old WDs
      evolvedStar: 0.15, // red giants, HB stars
      neutronStar: 0.08, // millisecond pulsars
      brownDwarf: 0.08, // ancient low-mass
      blackHole: 0.04, // stellar-mass BHs (controversial)
      PMO: 0.03, // ancient ejected objects
      planetarySystem: 0.02, // rare, but some survive
    },
  },

  stellarStream: {
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000, // ~Gyr coherence time
    definingProcesses: [
      "tidal stripping",
      "differential rotation",
      "phase mixing",
    ],
    allowedTransitions: ["evolvedField"], // eventually phase-mixes away
    // Tidally disrupted cluster: stretched, kinematically coherent
    childFateWeights: {
      mainSequenceStar: 0.4, // stream members
      whiteDwarf: 0.2, // old remnants
      evolvedStar: 0.12, // giants
      brownDwarf: 0.1, // low-mass members
      neutronStar: 0.05, // old pulsars
      PMO: 0.05, // stripped planets
      planetarySystem: 0.05, // surviving systems
      blackHole: 0.03, // rare
    },
  },

  evolvedField: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false, // gas-poor, old population
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 5000, // ~5 Gyr, long-term quasi-stable
    definingProcesses: [
      "passive stellar evolution",
      "dynamical heating",
      "random encounters",
    ],
    allowedTransitions: [], // terminal state for stellar populations
    // Old field population: widely separated, evolved stars
    childFateWeights: {
      mainSequenceStar: 0.3, // long-lived low-mass stars
      whiteDwarf: 0.25, // accumulated over Gyr
      evolvedStar: 0.12, // red giants
      brownDwarf: 0.1, // ancient low-mass
      planetarySystem: 0.1, // mature planetary systems
      PMO: 0.05, // rogue planets
      neutronStar: 0.05, // old pulsars
      blackHole: 0.03, // stellar-mass BHs
    },
  },
}

```

Now let me update GALACTIC_SCALE_FATES.ts to reference RegionalScaleFateKey:

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 10×10 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this galactic regime, what mix of stellar fates
   * exists?" They do NOT answer: "Where in the galaxy does each fate appear?"
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
   *   ellipticalGalaxy.childFateWeights = {
   *     whiteDwarf: 0.4,      // old stellar population, many WDs
   *     plasmaReservoir: 0.2, // hot halo gas
   *     blackHole: 0.05,      // central SMBH region
   *   }
   *
   *   This says: "In an elliptical galaxy tile, about 40% of child cells are
   *   white dwarfs, 20% are plasma reservoirs, 5% contain black holes."
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `STELLAR_SCALE_FATES` describe **stellar object physics** within galaxies
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over stellar fates
 *
 * A galaxy fate constrains what stellar systems can form inside it:
 *
 *   • spiralGalaxy → gas clouds, prestellar cores, young stars common
 *   • ellipticalGalaxy → old stars, white dwarfs, little gas
 *   • dwarfIrregular → stochastic star formation, PMOs, brown dwarfs
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with rare old stars
    childFateWeights: {
      plasmaReservoir: 0.5, // hot halo gas dominates
      gasCloud: 0.15, // some diffuse gas
      whiteDwarf: 0.15, // old stellar population
      PMO: 0.1, // failed stars
      brownDwarf: 0.05, // substellar objects
      prestellarCore: 0.05, // rare collapse events
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Gas clouds and young stars common
    childFateWeights: {
      gasCloud: 0.25, // abundant molecular gas
      prestellarCore: 0.15, // active collapse
      plasmaReservoir: 0.15, // warm/hot ISM
      whiteDwarf: 0.15, // older stars
      brownDwarf: 0.1, // common in low-mass environments
      PMO: 0.08, // substellar objects
      solidAggregate: 0.07, // planet-forming regions
      neutronStar: 0.03, // from past supernovae
      blackHole: 0.02, // rare stellar-mass BHs
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `STELLAR_SCALE_FATES` describe **stellar object physics** within galaxies
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over stellar fates
 *
 * A galaxy fate constrains what stellar systems can form inside it:
 *
 *   • spiralGalaxy → gas clouds, prestellar cores, young stars common
 *   • ellipticalGalaxy → old stars, white dwarfs, little gas
 *   • dwarfIrregular → stochastic star formation, PMOs, brown dwarfs
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with rare old stars
    childFateWeights: {
      plasmaReservoir: 0.5, // hot halo gas dominates
      gasCloud: 0.15, // some diffuse gas
      whiteDwarf: 0.15, // old stellar population
      PMO: 0.1, // failed stars
      brownDwarf: 0.05, // substellar objects
      prestellarCore: 0.05, // rare collapse events
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Gas clouds and young stars common
    childFateWeights: {
      gasCloud: 0.25, // abundant molecular gas
      prestellarCore: 0.15, // active collapse
      plasmaReservoir: 0.15, // warm/hot ISM
      whiteDwarf: 0.15, // older stars
      brownDwarf: 0.1, // common in low-mass environments
      PMO: 0.08, // substellar objects
      solidAggregate: 0.07, // planet-forming regions
      neutronStar: 0.03, // from past supernovae
      blackHole: 0.02, // rare stellar-mass BHs
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

Now let me update the documentation about relations to other models and the cross-scale constraints:

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with rare old stars
    childFateWeights: {
      plasmaReservoir: 0.5, // hot halo gas dominates
      gasCloud: 0.15, // some diffuse gas
      whiteDwarf: 0.15, // old stellar population
      PMO: 0.1, // failed stars
      brownDwarf: 0.05, // substellar objects
      prestellarCore: 0.05, // rare collapse events
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Gas clouds and young stars common
    childFateWeights: {
      gasCloud: 0.25, // abundant molecular gas
      prestellarCore: 0.15, // active collapse
      plasmaReservoir: 0.15, // warm/hot ISM
      whiteDwarf: 0.15, // older stars
      brownDwarf: 0.1, // common in low-mass environments
      PMO: 0.08, // substellar objects
      solidAggregate: 0.07, // planet-forming regions
      neutronStar: 0.03, // from past supernovae
      blackHole: 0.02, // rare stellar-mass BHs
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

Now let me update all the childFateWeights to use regional fates instead of stellar fates:

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Gas clouds and young stars common
    childFateWeights: {
      gasCloud: 0.25, // abundant molecular gas
      prestellarCore: 0.15, // active collapse
      plasmaReservoir: 0.15, // warm/hot ISM
      whiteDwarf: 0.15, // older stars
      brownDwarf: 0.1, // common in low-mass environments
      PMO: 0.08, // substellar objects
      solidAggregate: 0.07, // planet-forming regions
      neutronStar: 0.03, // from past supernovae
      blackHole: 0.02, // rare stellar-mass BHs
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by stellar remnants
    childFateWeights: {
      whiteDwarf: 0.4, // old stellar population
      plasmaReservoir: 0.2, // hot diffuse gas
      PMO: 0.15, // frozen-out objects
      brownDwarf: 0.1, // old substellar
      neutronStar: 0.08, // from ancient supernovae
      blackHole: 0.05, // rare stellar-mass BHs
      planet: 0.02, // surviving planets
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full range of stellar evolution
    // Active star formation in spiral arms
    childFateWeights: {
      gasCloud: 0.2, // molecular clouds in arms
      prestellarCore: 0.12, // active formation
      plasmaReservoir: 0.15, // halo and hot ISM
      whiteDwarf: 0.2, // old disk population
      solidAggregate: 0.1, // protoplanetary material
      brownDwarf: 0.08, // common
      PMO: 0.05, // ejected planets, failed stars
      neutronStar: 0.05, // from disk supernovae
      blackHole: 0.03, // stellar-mass BHs
      planet: 0.02, // planetary systems
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // Some residual structure, mostly old stars
    childFateWeights: {
      whiteDwarf: 0.35, // dominant old population
      plasmaReservoir: 0.2, // hot halo
      neutronStar: 0.1, // from past supernovae
      brownDwarf: 0.1, // old substellar
      PMO: 0.08, // frozen-out objects
      blackHole: 0.07, // central + stellar-mass
      planet: 0.05, // surviving planetary systems
      gasCloud: 0.05, // rare residual gas
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // Hot gas halo, central SMBH
    childFateWeights: {
      whiteDwarf: 0.4, // dominant population
      plasmaReservoir: 0.25, // X-ray emitting halo
      neutronStar: 0.1, // ancient remnants
      blackHole: 0.1, // central SMBH region prominent
      brownDwarf: 0.08, // old substellar
      PMO: 0.05, // frozen remnants
      planet: 0.02, // ancient planetary systems
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, quenching
    // Unusual stellar environment near nucleus
    childFateWeights: {
      plasmaReservoir: 0.3, // AGN-heated gas
      blackHole: 0.15, // central SMBH region prominent
      whiteDwarf: 0.25, // old stars
      neutronStar: 0.1, // old remnants
      brownDwarf: 0.08, // substellar
      PMO: 0.07, // frozen objects
      gasCloud: 0.05, // some surviving clouds
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population
    childFateWeights: {
      whiteDwarf: 0.45, // dominant remnant population
      plasmaReservoir: 0.15, // very hot, tenuous halo
      neutronStar: 0.12, // ancient remnants
      blackHole: 0.1, // stellar-mass BHs accumulated
      PMO: 0.1, // frozen-out objects
      brownDwarf: 0.05, // old substellar
      planet: 0.03, // ancient surviving planets
    },
  },
}

```

```typescript
import type { RegionalScaleFateKey } from "./REGIONAL_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

Now let me update STELLAR_SCALE_FATES.ts to align with the new structure. The stellar scale should focus on individual stellar systems at 1 pc, now that regional structures are handled by the new scale:

```typescript
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
  | "thermalGas" // kinetic pressure from thermal motion; gas giant envelopes
  | "degeneracy" // quantum Pauli exclusion; brown/white dwarfs, neutron stars, PMOs
  | "nuclear" // fusion regulates contraction; main sequence stars
  | "material" // EM bonds / lattice strength; planets, rocky cores
  | "gravity" // self-gravity; contributes to PMOs, sole support for black holes

export type StellarScaleFateKey =
  | "diffuseGas"
  | "denseClump"
  | "protostellarCore"
  | "protoplanetaryDisk"
  | "mainSequenceStar"
  | "evolvedStar"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "PMO"
  | "planetarySystem"

type StellarScaleFateLock =
  | "stablePressureMaximum"
  | "fusionIgnition"
  | "degeneracyDominance"
  | "eventHorizon"
  | "totalDisruption"
  | false

type StellarScaleFateCharacteristics = {
  massMax: number
  elementsProduced: Elem[]
  support: SupportType[] | false

  fateLockedBy: StellarScaleFateLock
  typicalTimescaleMyr: number // typical duration of this phase

  definingProcesses: string[]
  allowedTransitions: StellarScaleFateKey[]
}

/**
 * STELLAR_SCALE_FATES
 * -------------------
 *
 * This table defines the **physical regimes of individual stellar systems**—the
 * objects and states that exist at the ~1 pc scale within a galaxy.
 *
 * At this scale, a "parcel" represents a single stellar system or the immediate
 * environment around one: a star with its planets, a protostellar core, a stellar
 * remnant, or a patch of interstellar gas.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS SCALE REPRESENTS
 *
 * The stellar scale (~1 pc) captures:
 *   • Individual stars at all evolutionary stages
 *   • Stellar remnants (white dwarfs, neutron stars, black holes)
 *   • Substellar objects (brown dwarfs, planetary-mass objects)
 *   • Planetary systems around stars
 *   • Local gas (dense clumps, diffuse ISM patches)
 *
 * This is the scale most relevant to the game: finding habitable systems,
 * planning interstellar travel, and establishing colonies.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO REGIONAL SCALE
 *
 * The parent regional fate (GMC, HII region, cluster, etc.) determines the
 * MIX of stellar fates in a neighborhood. Within a single regional tile:
 *
 *   • GMC → mostly dense clumps and protostellar cores
 *   • Open cluster → mostly main sequence stars with similar ages
 *   • Evolved field → mix of MS stars, white dwarfs, planetary systems
 *
 * The stellar fate describes WHAT each 1 pc cell contains; the regional fate
 * describes the environment that produced it.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Stellar fates are distinguished by:
 *
 *   1) **Evolutionary stage**
 *      – Pre-stellar, main sequence, post-main sequence, remnant
 *
 *   2) **Support mechanism**
 *      – What resists gravity: thermal pressure, nuclear fusion, degeneracy
 *
 *   3) **Mass regime**
 *      – Substellar (brown dwarfs, PMOs), stellar, or supermassive
 *
 *   4) **Presence of companions**
 *      – Isolated vs. planetary system vs. binary (future)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Stellar fates become irreversible when:
 *
 *   • stablePressureMaximum
 *       – Object reaches hydrostatic equilibrium at a stable mass
 *
 *   • fusionIgnition
 *       – Nuclear fusion begins, setting the evolutionary track
 *
 *   • degeneracyDominance
 *       – Quantum degeneracy pressure becomes the sole support
 *
 *   • eventHorizon
 *       – Spacetime geometry prevents further evolution (black hole)
 *
 *   • totalDisruption
 *       – Object is destroyed (pair-instability supernova, merger)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * The stellar lifecycle follows well-defined paths:
 *
 *   diffuseGas → denseClump → protostellarCore → mainSequenceStar
 *   mainSequenceStar → evolvedStar → whiteDwarf / neutronStar / blackHole
 *   protostellarCore → brownDwarf / PMO (if mass too low)
 *   mainSequenceStar + time → planetarySystem (if planets form/survive)
 *
 * Mass determines which endpoint is reached; locks prevent reversal.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game, stellar fates matter because:
 *
 *   • mainSequenceStar + planetarySystem = potential colony targets
 *   • protostellarCore / protoplanetaryDisk = hazardous, no stable orbits
 *   • whiteDwarf / evolvedStar = may have surviving planets, low energy
 *   • neutronStar / blackHole = dangerous, but scientifically interesting
 *   • diffuseGas / denseClump = no stars, just interstellar medium
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Focus on **individual objects**, not statistics
 * • Encode **stellar evolution** as a state machine
 * • Distinguish **pre-stellar**, **stellar**, and **remnant** phases
 * • Make **habitability-relevant** distinctions explicit
 */
export const STELLAR_SCALE_FATES: Record<
  StellarScaleFateKey,
  StellarScaleFateCharacteristics
> = {
  diffuseGas: {
    massMax: Infinity,
    elementsProduced: [],
    support: false, // not self-gravitating
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    definingProcesses: [
      "thermal equilibrium",
      "turbulent mixing",
      "cosmic ray heating",
    ],
    allowedTransitions: ["denseClump"],
  },

  denseClump: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas"],
    fateLockedBy: false,
    typicalTimescaleMyr: 1,
    definingProcesses: [
      "gravitational contraction",
      "turbulent fragmentation",
      "magnetic braking",
    ],
    allowedTransitions: ["protostellarCore", "diffuseGas"],
  },

  protostellarCore: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas"],
    fateLockedBy: false,
    typicalTimescaleMyr: 0.5,
    definingProcesses: [
      "accretion",
      "Kelvin-Helmholtz contraction",
      "disk formation",
      "outflow launching",
    ],
    allowedTransitions: [
      "protoplanetaryDisk",
      "mainSequenceStar",
      "brownDwarf",
      "PMO",
    ],
  },

  protoplanetaryDisk: {
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas", "material"],
    fateLockedBy: false,
    typicalTimescaleMyr: 5,
    definingProcesses: [
      "disk accretion",
      "planetesimal formation",
      "gas dispersal",
      "migration",
    ],
    allowedTransitions: ["mainSequenceStar", "planetarySystem"],
  },

  mainSequenceStar: {
    massMax: 150, // most massive stable stars
    elementsProduced: ["He"],
    support: ["nuclear"],
    fateLockedBy: "fusionIgnition",
    typicalTimescaleMyr: 10000, // varies enormously by mass
    definingProcesses: [
      "hydrogen fusion",
      "hydrostatic equilibrium",
      "convection/radiation",
    ],
    allowedTransitions: ["evolvedStar", "planetarySystem"],
  },

  evolvedStar: {
    massMax: 150,
    elementsProduced: ["He", "C", "N", "O"],
    support: ["nuclear", "thermalGas"],
    fateLockedBy: false,
    typicalTimescaleMyr: 100, // red giant, AGB phases
    definingProcesses: [
      "shell burning",
      "envelope expansion",
      "mass loss",
      "thermal pulses",
    ],
    allowedTransitions: ["whiteDwarf", "neutronStar", "blackHole"],
  },

  whiteDwarf: {
    massMax: 8, // progenitor mass
    elementsProduced: ["He", "C", "N", "O"],
    support: ["degeneracy"],
    fateLockedBy: "degeneracyDominance",
    typicalTimescaleMyr: 100000, // cooling time, essentially permanent
    definingProcesses: ["electron degeneracy", "crystallization", "cooling"],
    allowedTransitions: [],
  },

  neutronStar: {
    massMax: 25, // progenitor mass
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["degeneracy"],
    fateLockedBy: "degeneracyDominance",
    typicalTimescaleMyr: Infinity, // stable on cosmic timescales
    definingProcesses: [
      "neutron degeneracy",
      "pulsar emission",
      "magnetic braking",
    ],
    allowedTransitions: [],
  },

  blackHole: {
    massMax: 150, // progenitor mass (avoiding pair-instability gap)
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["gravity"],
    fateLockedBy: "eventHorizon",
    typicalTimescaleMyr: Infinity, // stable forever (classically)
    definingProcesses: ["gravitational collapse", "event horizon formation"],
    allowedTransitions: [],
  },

  brownDwarf: {
    massMax: 0.08, // below hydrogen fusion threshold
    elementsProduced: [],
    support: ["degeneracy"],
    fateLockedBy: "degeneracyDominance",
    typicalTimescaleMyr: Infinity, // slowly cooling forever
    definingProcesses: [
      "deuterium burning",
      "electron degeneracy",
      "slow cooling",
    ],
    allowedTransitions: [],
  },

  PMO: {
    massMax: 0.013, // planetary-mass object threshold
    elementsProduced: [],
    support: ["degeneracy", "material"],
    fateLockedBy: "stablePressureMaximum",
    typicalTimescaleMyr: Infinity, // stable indefinitely
    definingProcesses: [
      "ejection from system",
      "failed core collapse",
      "cooling",
    ],
    allowedTransitions: [],
  },

  planetarySystem: {
    massMax: 150, // host star mass
    elementsProduced: [], // planets don't produce elements
    support: ["nuclear", "material"], // star + planets
    fateLockedBy: "stablePressureMaximum",
    typicalTimescaleMyr: 10000, // stable for stellar lifetime
    definingProcesses: [
      "orbital dynamics",
      "tidal evolution",
      "secular resonances",
      "atmospheric evolution",
    ],
    allowedTransitions: ["evolvedStar"], // when host star evolves
  },
}

```

Now let me update REGIONAL_SCALE_FATES.ts to import from STELLAR_SCALE_FATES.ts:

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

export type RegionalScaleFateKey =
  | "giantMolecularCloud"
  | "HIIRegion"
  | "superbubble"
  | "diffuseISM"
  | "openCluster"
  | "globularCluster"
  | "stellarStream"
  | "evolvedField"

type RegionalScaleLock =
  | "clusterBinding" // gravitationally bound cluster formed
  | "feedbackDisruption" // GMC destroyed by stellar feedback
  | "tidalDisruption" // structure torn apart by tidal forces
  | false

type RegionalScaleFateCharacteristics = {
  sizePcMin: number // characteristic size in parsecs
  sizePcMax?: number
  gasRich: boolean
  starFormationActive: boolean
  gravitationallyBound: boolean

  fateLockedBy: RegionalScaleLock
  typicalTimescaleMyr: number // note: Myr, not Gyr—this scale evolves faster

  definingProcesses: string[]
  allowedTransitions: RegionalScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the 100×100 child grid should have each fate, summed over the
   * whole tile.
   *
   * These weights answer: "In this regional regime, what mix of stellar fates
   * exists?" They do NOT answer: "Where in the region does each fate appear?"
   *
   * Regional fates have a characteristic timescale of ~10-100 Myr, which is
   * faster than galactic timescales but slower than stellar evolution. This
   * makes them the natural home for:
   *
   *   • Star-forming regions (GMCs, HII regions)
   *   • Star clusters (open, globular)
   *   • ISM phases (superbubbles, diffuse gas)
   *
   * Example:
   *
   *   giantMolecularCloud.childFateWeights = {
   *     denseClump: 0.3,         // collapsing cores
   *     protostellarCore: 0.2,   // active star formation
   *     diffuseGas: 0.25,        // ambient cloud material
   *   }
   *
   *   This says: "In a GMC tile, about 30% of child cells are dense clumps,
   *   20% are protostellar cores, 25% are diffuse gas."
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * REGIONAL_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of stellar neighborhoods**—
 * structures at ~100 pc scale that sit between galaxies and individual stellar systems.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
 *
 * This is faster than galactic evolution (~Gyr) but spans many stellar generations.
 * The regional fate determines the LOCAL environment for star formation—things
 * like stellar density, metallicity coherence, and gas availability.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Regional fates are distinguished by:
 *
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 *   4) **Age/evolutionary state**
 *      – Young (GMC, HII) vs evolved (superbubble, old cluster) vs ancient (stream)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Regional fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode the lifecycle of ISM structures:
 *
 *   diffuseISM → giantMolecularCloud (cloud formation)
 *   giantMolecularCloud → HIIRegion / openCluster (star formation + feedback)
 *   HIIRegion → superbubble (supernovae from OB stars)
 *   superbubble → diffuseISM (cooling and mixing)
 *   openCluster → stellarStream / evolvedField (dissolution)
 *   globularCluster → stellarStream (tidal stripping, rare)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GALACTIC_SCALE_FATES` describe **galaxy-wide morphology and gas content**
 * • `REGIONAL_SCALE_FATES` describe **local ISM structure and star clusters**
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * The galactic fate sets the overall star formation rate and gas fraction.
 * The regional fate determines WHERE stars form and in what environment.
 * The stellar fate describes the individual objects that result.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game, regional fates matter because:
 *
 *   • Stars in the same cluster have similar ages and metallicities
 *   • Nearby stars in a cluster are truly close (potential travel targets)
 *   • GMCs and HII regions are hazardous (radiation, gas)
 *   • Evolved field regions have stable, well-separated stellar systems
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Encode **ISM lifecycle** as a state machine
 * • Treat clusters as **first-class entities**, not emergent patterns
 * • Distinguish **bound** (cluster) from **unbound** (association, field) populations
 * • Use timescales appropriate to the physics (~Myr, not Gyr)
 */
export const REGIONAL_SCALE_FATES: Record<
  RegionalScaleFateKey,
  RegionalScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false, // cloud is not bound, but dense cores within it are
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    definingProcesses: [
      "gravitational collapse",
      "turbulent fragmentation",
      "magnetic support",
      "cooling and shielding",
    ],
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    // Active star-forming cloud: mix of dense cores and diffuse gas
    childFateWeights: {
      diffuseGas: 0.35, // ambient molecular gas
      denseClump: 0.25, // collapsing cores, not yet stars
      protostellarCore: 0.15, // actively forming protostars
      protoplanetaryDisk: 0.1, // young stars with disks
      mainSequenceStar: 0.08, // recently formed stars
      brownDwarf: 0.05, // failed stars
      PMO: 0.02, // planetary-mass objects
    },
  },

  HIIRegion: {
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true, // ionized gas, not molecular
    starFormationActive: false, // feedback suppresses new formation
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    definingProcesses: [
      "photoionization",
      "radiation pressure",
      "stellar winds",
      "champagne flows",
    ],
    allowedTransitions: ["superbubble", "diffuseISM"],
    // Ionized region around young OB stars: bright, hot, expanding
    childFateWeights: {
      mainSequenceStar: 0.3, // young OB stars dominating
      diffuseGas: 0.25, // ionized gas (HII)
      protoplanetaryDisk: 0.15, // young stars with surviving disks
      protostellarCore: 0.1, // triggered star formation at edges
      brownDwarf: 0.1, // low-mass products
      PMO: 0.05, // ejected objects
      evolvedStar: 0.05, // a few evolved massive stars
    },
  },

  superbubble: {
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false, // hot, tenuous plasma
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    definingProcesses: [
      "supernova explosions",
      "stellar wind bubbles",
      "shock heating",
      "chimney venting",
    ],
    allowedTransitions: ["diffuseISM"],
    // Hot cavity carved by supernovae: sparse, energetic
    childFateWeights: {
      diffuseGas: 0.3, // hot, ionized gas
      mainSequenceStar: 0.2, // surviving stars
      whiteDwarf: 0.15, // remnants of intermediate-mass stars
      neutronStar: 0.1, // core-collapse remnants
      blackHole: 0.05, // rare massive remnants
      evolvedStar: 0.1, // late-stage massive stars
      brownDwarf: 0.05, // low-mass survivors
      PMO: 0.05, // dynamically ejected objects
    },
  },

  diffuseISM: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true, // warm/cool atomic gas
    starFormationActive: false, // too diffuse
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 100, // quasi-steady state
    definingProcesses: [
      "thermal equilibrium",
      "cosmic ray heating",
      "radiative cooling",
      "turbulent mixing",
    ],
    allowedTransitions: ["giantMolecularCloud"],
    // Ambient interstellar medium: low density, stable
    childFateWeights: {
      diffuseGas: 0.5, // warm/cool atomic hydrogen
      mainSequenceStar: 0.2, // field stars passing through
      whiteDwarf: 0.1, // old remnants
      brownDwarf: 0.08, // low-mass objects
      PMO: 0.05, // rogue planets, free-floating
      evolvedStar: 0.04, // red giants
      neutronStar: 0.02, // old pulsars
      blackHole: 0.01, // rare stellar-mass BHs
    },
  },

  openCluster: {
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false, // gas expelled by feedback
    starFormationActive: false, // formation complete
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100, // dissolution timescale
    definingProcesses: [
      "two-body relaxation",
      "mass segregation",
      "tidal stripping",
      "evaporation",
    ],
    allowedTransitions: ["stellarStream", "evolvedField"],
    // Young bound cluster: concentrated, coeval population
    childFateWeights: {
      mainSequenceStar: 0.5, // dominant population
      protoplanetaryDisk: 0.1, // youngest members
      brownDwarf: 0.12, // low-mass members
      whiteDwarf: 0.08, // if cluster is old enough
      evolvedStar: 0.08, // red giants, supergiants
      PMO: 0.05, // ejected planets
      planetarySystem: 0.05, // mature planetary systems
      neutronStar: 0.02, // from massive star deaths
    },
  },

  globularCluster: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000, // ~10 Gyr, very long-lived
    definingProcesses: [
      "core collapse",
      "mass segregation",
      "blue straggler formation",
      "tidal truncation",
    ],
    allowedTransitions: ["stellarStream"], // only via tidal disruption
    // Ancient dense cluster: old stars, exotic binaries
    childFateWeights: {
      mainSequenceStar: 0.35, // low-mass MS stars
      whiteDwarf: 0.25, // many old WDs
      evolvedStar: 0.15, // red giants, HB stars
      neutronStar: 0.08, // millisecond pulsars
      brownDwarf: 0.08, // ancient low-mass
      blackHole: 0.04, // stellar-mass BHs (controversial)
      PMO: 0.03, // ancient ejected objects
      planetarySystem: 0.02, // rare, but some survive
    },
  },

  stellarStream: {
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000, // ~Gyr coherence time
    definingProcesses: [
      "tidal stripping",
      "differential rotation",
      "phase mixing",
    ],
    allowedTransitions: ["evolvedField"], // eventually phase-mixes away
    // Tidally disrupted cluster: stretched, kinematically coherent
    childFateWeights: {
      mainSequenceStar: 0.4, // stream members
      whiteDwarf: 0.2, // old remnants
      evolvedStar: 0.12, // giants
      brownDwarf: 0.1, // low-mass members
      neutronStar: 0.05, // old pulsars
      PMO: 0.05, // stripped planets
      planetarySystem: 0.05, // surviving systems
      blackHole: 0.03, // rare
    },
  },

  evolvedField: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false, // gas-poor, old population
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 5000, // ~5 Gyr, long-term quasi-stable
    definingProcesses: [
      "passive stellar evolution",
      "dynamical heating",
      "random encounters",
    ],
    allowedTransitions: [], // terminal state for stellar populations
    // Old field population: widely separated, evolved stars
    childFateWeights: {
      mainSequenceStar: 0.3, // long-lived low-mass stars
      whiteDwarf: 0.25, // accumulated over Gyr
      evolvedStar: 0.12, // red giants
      brownDwarf: 0.1, // ancient low-mass
      planetarySystem: 0.1, // mature planetary systems
      PMO: 0.05, // rogue planets
      neutronStar: 0.05, // old pulsars
      blackHole: 0.03, // stellar-mass BHs
    },
  },
}


```

Now let me update index.ts with the new scale and updated documentation:

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces mostly young stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces mostly young stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces mostly young stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane)
 *     ├── Orion Arm (aligned with parent)
 *     │     └── Sol system (tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (regional scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

Now let me add the new scale to the SCALES constant:

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { REGIONAL_SCALE_FATES } from "./REGIONAL_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (regional scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: stellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { REGIONAL_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

Let me update the documentation in findGalaxies.ts to reflect the new scale hierarchy:

```typescript
/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Regional-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import type { GALACTIC_SCALE_FATES } from "~/model/GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "~/model/GROUP_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES
type GroupFateKey = keyof typeof GROUP_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the group-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of group fates.
 * For now, uses a uniform distribution (all group fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain group fate weights.
 */
function observeGroupFate(
  coords: Coordinates,
  universeSeed: number
): GroupFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe group fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all group fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<GroupFateKey, number>> = {
    unboundAssociation: 0.2,
    boundGroup: 0.25,
    gasRichGroup: 0.2,
    gasPoorGroup: 0.15,
    fossilGroup: 0.1,
    infallingGroup: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeGroupFate(coords, universeSeed)
  const parentCharacteristics = GROUP_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds) as GalacticFateKey
}

```

```typescript
/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Regional-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import type { GALACTIC_SCALE_FATES } from "~/model/GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "~/model/GROUP_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES
type GroupFateKey = keyof typeof GROUP_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *         "pc100": [5,3],   // regional scale (GMCs, clusters)
 *         "pc1": [42,17],   // stellar scale
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the group-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of group fates.
 * For now, uses a uniform distribution (all group fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain group fate weights.
 */
function observeGroupFate(
  coords: Coordinates,
  universeSeed: number
): GroupFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe group fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all group fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<GroupFateKey, number>> = {
    unboundAssociation: 0.2,
    boundGroup: 0.25,
    gasRichGroup: 0.2,
    gasPoorGroup: 0.15,
    fossilGroup: 0.1,
    infallingGroup: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeGroupFate(coords, universeSeed)
  const parentCharacteristics = GROUP_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds) as GalacticFateKey
}

```

Let me check and fix the linter error in findGalaxies.ts:

```typescript
/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Regional-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import type { GALACTIC_SCALE_FATES } from "~/model/GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "~/model/GROUP_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES
type GroupFateKey = keyof typeof GROUP_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *         "pc100": [5,3],   // regional scale (GMCs, clusters)
 *         "pc1": [42,17],   // stellar scale
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the group-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of group fates.
 * For now, uses a uniform distribution (all group fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain group fate weights.
 */
function observeGroupFate(
  coords: Coordinates,
  universeSeed: number
): GroupFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe group fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all group fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<GroupFateKey, number>> = {
    unboundAssociation: 0.2,
    boundGroup: 0.25,
    gasRichGroup: 0.2,
    gasPoorGroup: 0.15,
    fossilGroup: 0.1,
    infallingGroup: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeGroupFate(coords, universeSeed)
  const parentCharacteristics = GROUP_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

```

Let me search for any other files that might need updates:

```typescript
type BaryonicCoolingFateKey =
  | "radiationCoupled"
  | "acousticFluid"
  | "recombinedGas"
  | "noCooling"
  | "popIIIStarFormation"
  | "metalCooling"

type BaryometricCharacteristics = {
  minTemperature?: number // K
  maxTemperature?: number // K
  freeElectronAbundance?: number // electrons per baryon
  thomsonToExpansionRatio?: number // Γ_T / H
  h2Fraction?: number // H₂ per H
  metallicity?: number // Z / Z☉
  requiresDarkMatterHalo?: boolean
  canGravitate?: boolean
  primordialLithiumPreserved?: boolean
  lithiumDestroyed?: boolean
}

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
 * such as `protostellarCore` or `denseClump`.
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
export const BARYON_COOLING_FATES: Record<
  BaryonicCoolingFateKey,
  BaryometricCharacteristics
> = {
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
}

```

All complete with no linter errors. Here's a summary of what was created and updated:

## New File Created

**`REGIONAL_SCALE_FATES.ts`** — The new ~100 pc scale with 8 fates:

| Fate | Description | Timescale |
|------|-------------|-----------|
| `giantMolecularCloud` | Star-forming molecular cloud complex | ~30 Myr |
| `HIIRegion` | Ionized gas around young OB stars | ~10 Myr |
| `superbubble` | Hot cavity carved by supernovae | ~30 Myr |
| `diffuseISM` | Ambient interstellar medium | ~100 Myr |
| `openCluster` | Young bound star cluster | ~100 Myr |
| `globularCluster` | Ancient dense cluster | ~10 Gyr |
| `stellarStream` | Tidally disrupted structure | ~1 Gyr |
| `evolvedField` | Old field population | ~5 Gyr |

## Files Updated

1. **`GALACTIC_SCALE_FATES.ts`** — Now references `RegionalScaleFateKey` for childFateWeights. All 8 galactic fates updated to produce regional structures instead of stellar objects directly.

2. **`STELLAR_SCALE_FATES.ts`** — Restructured with 12 new/renamed fates focused on individual stellar systems:
   - `diffuseGas`, `denseClump`, `protostellarCore`, `protoplanetaryDisk`
   - `mainSequenceStar`, `evolvedStar`, `whiteDwarf`, `neutronStar`, `blackHole`
   - `brownDwarf`, `PMO`, `planetarySystem`

3. **`index.ts`** — Added `pc100` scale with `REGIONAL_SCALE_FATES`, updated documentation throughout.

4. **`findGalaxies.ts`** — Updated documentation to reference the new scale hierarchy.

5. **`BARYON_COOLING_FATES.ts`** — Updated comment to use new stellar fate names.

## New Scale Hierarchy

```
Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
(web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
            1000×        1000×       100×       100×
```

```plaintext
Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
(web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
            1000×        1000×       100×       100×
```

---

**User**

Awesome! Love where you're doing with this. I love the "typicalTimescaleMyr"  numbers you added... even just as a signpost!



Here are some notes/questions. Let's discuss and see if we need to change anything:





1. Rather than REGIONAL_SCALE_FATES Let's call it INTERSTELLAR_SCALE_FATES, it's just a little cooler 😎



2. solidAggregate → protoplanetary disk => What's the difference between these?



3. mainSequenceStar, evolvedStar => what are the qualitative distinctions which differentiate these from the other items at this scale?



4. noRemnant => yes remove



5. I'm a little concerned that you included "Distinguish **pre-stellar**, **stellar**, and **remnant** phases" in your stellar scale design guidelines. I want to be careful that we don't start baking evolutionary distinctions (x comes after y) within a single set of fates, like the stellar fates. It should not be the case that any stellar fare evolves into a different stellar fate. They are "lanes". It's possible one could *change* to another based on various factors, but one shouldn't naturally evolve into a new "fate".



6. Say more about the "defining processes" you added. Why are those necessary? I think the decision might clarify some things about our model at the highest level.







---

**Cursor**

Great questions! These get at some important conceptual issues. Let me address each:

## 1. REGIONAL → INTERSTELLAR
Agreed, "interstellar" is cooler and more evocative. Easy rename.

## 2. solidAggregate → protoplanetaryDisk
They're actually different concepts:
- **solidAggregate** (old): Generic solid material—asteroids, planetesimals, debris. Could exist in various contexts.
- **protoplanetaryDisk** (new): Specifically the circumstellar disk around a young star where planets form. More tied to stellar evolution.

I think the conflation was a mistake. The question is: what's the right abstraction for the 1 pc scale? A protoplanetary disk is ~100-1000 AU, which is much smaller than 1 pc. So maybe `protoplanetaryDisk` doesn't belong as a fate—it's more like a *property* of a protostellar system.

## 3 & 5. mainSequenceStar vs evolvedStar — and the "lanes" issue

**You're absolutely right to be concerned.** I violated the model's core principle.

Looking at my `allowedTransitions`:
```
mainSequenceStar → evolvedStar → whiteDwarf/neutronStar/blackHole
```

This encodes *stellar evolution* as a state machine, which is exactly what we said fates should NOT be. Fates are "lanes"—parallel physical regimes—not sequential stages.

The original STELLAR_SCALE_FATES was more careful: things like `whiteDwarf`, `neutronStar`, `blackHole` are genuine *endpoints* (locked fates), but even there, `gasCloud → prestellarCore` was an evolutionary sequence.

**The fix:** At the stellar scale, we should ask: "What is the *current physical regime* of this 1 pc cell?" not "What stage of evolution is the star in?"

Better categories might be:
- **By what's there:** star, remnant, substellar, gas, nothing
- **By support mechanism:** nuclear fusion, degeneracy, material, thermal gas
- **By habitability relevance:** stable system, hazardous, no system

I think the right approach is:
- `star` (any star, MS or evolved—they're the same lane)
- `compactRemnant` (WD/NS—degenerate support, locked)
- `blackHole` (distinct physics, locked)
- `substellar` (brown dwarfs, PMOs—failed ignition, locked)
- `planetarySystem` (star with stable planetary orbits—the goal state for the game!)
- `protostellar` (still accreting, not yet stable)
- `diffuseGas`, `denseClump` (ISM states)

The WD/NS split might not even be necessary—they're both "degenerate remnant" with different mass.

## 4. noRemnant
Already removed. ✓

## 6. definingProcesses — why?

Honestly, **they're not strictly necessary for the model to function**. The essential fields are:
- `childFateWeights` — cross-scale constraints
- `allowedTransitions` — same-scale evolution
- `fateLockedBy` — irreversibility

`definingProcesses` is metadata/documentation. I added it because:
1. It helps humans understand what makes each fate distinct
2. It could potentially be used for flavor text in the game
3. It documents the physical reasoning behind the classification

But if we want to keep the model minimal, we could remove it. The question is: **do we want fate tables to be purely mechanical, or also serve as documentation?**

Given the extensive doc comments already in these files, I'd lean toward keeping `definingProcesses` as lightweight inline documentation. But I could see removing it for purity.

---

**Summary of needed changes:**
1. Rename REGIONAL → INTERSTELLAR
2. Rethink protoplanetaryDisk (maybe remove or merge)
3. Collapse mainSequenceStar + evolvedStar → `star`
4. Consider collapsing whiteDwarf + neutronStar → `compactRemnant`
5. Make sure no fate has allowedTransitions to another fate (lanes, not sequences)

Want me to switch to agent mode and implement these changes?

```plaintext
mainSequenceStar → evolvedStar → whiteDwarf/neutronStar/blackHole
```

---

**User**

> gasCloud → prestellarCore

This wasn't an evolutionary step, I believe this was differentiating gas clouds which never formed a pressure maximum and therefore never became a prestellar core.


> At the stellar scale, we should ask: "What is the current physical regime of this 1 pc cell?" not "What stage of evolution is the star in?"

That sounds right

> star (any star, MS or evolved—they're the same lane)

You might be right, but aren't there multiple lanes here, different set-in-stone fates for different kinds of stars? Different types of burning, etc?

> The WD/NS split might not even be necessary—they're both "degenerate remnant" with different mass.

That also sounds correct. Different masses aren't inherently different fates, the lanes/fates are about whether there are qualitatively different processes governing the parcel.

> definingProcesses

Let's remove them. You can note them in comments if it's important context. So far the model is focused on 1) "painting" sub-parcels within a parcel, 2) understanding which state transitions are possible, and maybe some more things? 

Does that all make sense? Why don't you write out a more detailed plan for a second revision.

---

**Cursor**

Yes, this all makes sense! Let me think through the star types question and then write a detailed plan.

## On multiple lanes for stars

You raise a good point. Let me think about what makes stars genuinely different *fates* vs just different *properties*:

**Same lane (just mass differences):**
- A 1 M☉ star and a 10 M☉ star both fuse hydrogen via the same basic mechanism
- Different masses → different lifetimes, different remnants, but same current regime

**Possibly different lanes (qualitatively different physics):**
- **Convective vs radiative cores** — low-mass stars have radiative cores and convective envelopes, high-mass stars have convective cores and radiative envelopes. This is a genuine structural difference.
- **p-p chain vs CNO cycle** — different nuclear reaction pathways dominate at different masses

But even these... they're all "nuclear-supported plasma spheres." The distinction is more about *how* the fusion happens, not *what* the object fundamentally is.

I think the cleanest answer is: **`star` is one lane**, and mass/type is a property. The lock (`fusionIgnition`) is the same for all stars. What differentiates WD from NS from BH is the *endpoint*—different physics takes over after the star dies.

If later we find this is too coarse, we could split into:
- `lowMassStar` (< 8 M☉, → WD)
- `massiveStar` (> 8 M☉, → NS/BH)

But I'd start unified and split only if needed.

---

## Detailed Plan for Revision

### 1. Rename REGIONAL → INTERSTELLAR
- Rename `REGIONAL_SCALE_FATES.ts` → `INTERSTELLAR_SCALE_FATES.ts`
- Update `RegionalScaleFateKey` → `InterstellarScaleFateKey`
- Update imports in `GALACTIC_SCALE_FATES.ts`, `index.ts`
- Update scale name `pc100` to have `INTERSTELLAR_SCALE_FATES`

### 2. Revise STELLAR_SCALE_FATES with "lanes" principle

**New fate list:**

| Fate | Support | Locked? | What it represents |
|------|---------|---------|---------------------|
| `diffuseGas` | none (thermal) | no | Ambient ISM, not self-gravitating |
| `denseCore` | thermal | no | Self-gravitating core, may collapse or disperse |
| `star` | nuclear | yes (`fusionIgnition`) | Any hydrogen/helium-burning star |
| `whiteDwarf` | electron degeneracy | yes | Electron-degenerate remnant |
| `neutronStar` | neutron degeneracy | yes | Neutron-degenerate remnant |
| `blackHole` | event horizon | yes | Gravitational singularity |
| `brownDwarf` | electron degeneracy | yes | Never achieved H fusion |
| `substellarObject` | material/degeneracy | yes | Below BD mass (PMO, rogue planet) |

**Removed:**
- `protostellarCore` → merged into `denseCore` (the core either collapses or doesn't)
- `protoplanetaryDisk` → removed (too small for 1 pc, more like a property)
- `mainSequenceStar` → merged into `star`
- `evolvedStar` → merged into `star`
- `planetarySystem` → removed for now (defer to future AU scale, or treat as property)

**Transitions (threshold events, not evolution):**
- `diffuseGas` → `denseCore` (gravitational compression event)
- `denseCore` → `star` (fusion ignition) / `brownDwarf` (degeneracy-supported, no H fusion) / `substellarObject` (too low mass) / `diffuseGas` (dispersal)
- `star` → `whiteDwarf` / `neutronStar` / `blackHole` (core collapse/exhaustion event)
- All remnants: no transitions (locked)

### 3. Remove `definingProcesses` from all fate files
- STELLAR_SCALE_FATES (remove from type and all entries)
- INTERSTELLAR_SCALE_FATES (remove from type and all entries)
- GALACTIC_SCALE_FATES (already doesn't have it in entries, just ensure type is clean)
- GROUP_SCALE_FATES (already doesn't have it in entries)
- CLUSTER_SCALE_FATES (already doesn't have it in entries)
- WEB_SCALE_FATES (already doesn't have it in entries)

Add brief comments where the context is important.

### 4. Update INTERSTELLAR_SCALE_FATES childFateWeights
- Update all entries to use new stellar fate keys (`diffuseGas`, `denseCore`, `star`, etc.)

### 5. Update documentation
- Update index.ts descriptions
- Update any comments that reference old fate names
- Clarify the "lanes not evolution" principle in the stellar scale doc block

---

**Open questions for you:**

1. **WD vs NS** — Keep separate or merge into `degenerateRemnant`? I lean toward keeping them separate (electron vs neutron degeneracy is genuinely different physics), but you might see it differently.

2. **Planets** — Handle at a future AU scale, or add a `planetarySystem` compound fate? I lean toward deferring.

3. **The `denseCore` transitions** — Is `denseCore → star` a valid transition at the stellar scale, or should that be handled by the regional scale "painting" different outcomes?

Want me to switch to agent mode and implement this plan?

---

**User**

> WD vs NS



Yes, separate



> Planets



Yes, I think this will be a future scale



> Is denseCore → star a valid transition at the stellar scale



Not sure. You choose.



Why don't you go ahead and implement the plan.

---

**Cursor**

I'll implement the revision plan. Let me start with a todo list and work through it systematically.

Let me start by creating the revised STELLAR_SCALE_FATES with the lanes principle:

```typescript
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

export type StellarScaleFateKey =
  | "diffuseGas"
  | "denseCore"
  | "star"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "substellarObject"

type StellarScaleFateLock =
  | "fusionIgnition" // hydrogen fusion began
  | "electronDegeneracyDominance" // electron degeneracy is sole support
  | "neutronDegeneracyDominance" // neutron degeneracy is sole support
  | "eventHorizonFormation" // singularity formed
  | false

type StellarScaleFateCharacteristics = {
  massMin?: number // solar masses
  massMax?: number // solar masses
  elementsProduced: Elem[]
  support: SupportType[] | false

  fateLockedBy: StellarScaleFateLock
  typicalTimescaleMyr: number

  allowedTransitions: StellarScaleFateKey[]
}

/**
 * STELLAR_SCALE_FATES
 * -------------------
 *
 * This table defines the **physical regimes of individual stellar systems**—the
 * objects and states that exist at the ~1 pc scale within a galaxy.
 *
 * At this scale, a "parcel" represents a single stellar system or the immediate
 * environment around one: a star, a stellar remnant, or a patch of interstellar gas.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE: LANES, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes its CURRENT physical state, determined
 * by what support mechanism resists gravity.
 *
 * Transitions between fates represent **threshold events** (fusion ignition,
 * core collapse, degeneracy onset), not gradual aging. A main sequence star
 * and a red giant are both in the `star` lane—they have the same support
 * mechanism (nuclear fusion) even though their properties differ.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT DEFINES A DISTINCT FATE
 *
 * Fates are distinguished by:
 *
 *   1) **Support mechanism** — What resists gravity?
 *      - thermalGas: kinetic pressure (gas clouds, dense cores)
 *      - nuclear: fusion energy (stars)
 *      - electronDegeneracy: Pauli exclusion of electrons (WD, BD)
 *      - neutronDegeneracy: Pauli exclusion of neutrons (NS)
 *      - eventHorizon: spacetime geometry (BH)
 *
 *   2) **Locked vs unlocked** — Can it transition to something else?
 *      - Unlocked fates (gas) can collapse or disperse
 *      - Locked fates (stars, remnants) have crossed irreversible thresholds
 *
 * Different masses within the same support regime are NOT different fates.
 * A 1 M☉ star and a 10 M☉ star are both in the `star` lane.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE EIGHT STELLAR FATES
 *
 * GAS STATES (unlocked):
 *   • diffuseGas — ambient ISM, not self-gravitating
 *   • denseCore — self-gravitating, may collapse or disperse
 *
 * NUCLEAR-BURNING (locked):
 *   • star — any object with sustained hydrogen (or later) fusion
 *
 * DEGENERATE REMNANTS (locked):
 *   • whiteDwarf — electron-degenerate, no fusion
 *   • neutronStar — neutron-degenerate, no fusion
 *   • brownDwarf — electron-degenerate, never achieved H fusion
 *
 * GRAVITATIONAL (locked):
 *   • blackHole — event horizon, no internal structure accessible
 *
 * SUBSTELLAR (locked):
 *   • substellarObject — below brown dwarf mass (PMO, rogue planet)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS (THRESHOLD EVENTS)
 *
 * Transitions represent discrete threshold crossings, not gradual evolution:
 *
 *   diffuseGas → denseCore (gravitational compression)
 *   denseCore → star (fusion ignition)
 *   denseCore → brownDwarf (degeneracy-supported, no H fusion)
 *   denseCore → substellarObject (too low mass for BD)
 *   denseCore → diffuseGas (dispersal)
 *   star → whiteDwarf / neutronStar / blackHole (core collapse/exhaustion)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game:
 *   • `star` — potential host for habitable planets
 *   • `whiteDwarf` — dim, but may have surviving planets
 *   • `neutronStar` / `blackHole` — hazardous, scientifically interesting
 *   • `denseCore` / `diffuseGas` — no stars, just ISM
 *   • `brownDwarf` / `substellarObject` — dim, cold, unlikely targets
 *
 * Planets will be handled at a future AU scale.
 */
export const STELLAR_SCALE_FATES: Record<
  StellarScaleFateKey,
  StellarScaleFateCharacteristics
> = {
  diffuseGas: {
    // Ambient ISM: warm/cool atomic or molecular gas, not self-gravitating
    massMax: Infinity,
    elementsProduced: [],
    support: false, // not self-gravitating, no support needed
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    allowedTransitions: ["denseCore"],
  },

  denseCore: {
    // Self-gravitating core: may collapse to form a star, or disperse
    // This is the "decision point" where mass determines outcome
    massMax: Infinity,
    elementsProduced: [],
    support: ["thermalGas"],
    fateLockedBy: false,
    typicalTimescaleMyr: 1,
    allowedTransitions: ["star", "brownDwarf", "substellarObject", "diffuseGas"],
  },

  star: {
    // Any object with sustained nuclear fusion (H-burning or later stages)
    // Includes main sequence, giants, supergiants, AGB, etc.
    massMin: 0.08,
    massMax: 150,
    elementsProduced: ["He", "C", "N", "O"], // varies by mass, simplified
    support: ["nuclear"],
    fateLockedBy: "fusionIgnition",
    typicalTimescaleMyr: 10000, // varies enormously by mass
    allowedTransitions: ["whiteDwarf", "neutronStar", "blackHole"],
  },

  whiteDwarf: {
    // Electron-degenerate remnant of low/intermediate mass stars
    // Carbon-oxygen or oxygen-neon core, no fusion
    massMin: 0.5, // remnant mass
    massMax: 1.4, // Chandrasekhar limit
    elementsProduced: ["He", "C", "N", "O"],
    support: ["electronDegeneracy"],
    fateLockedBy: "electronDegeneracyDominance",
    typicalTimescaleMyr: Infinity, // cooling time is ~Gyr, effectively permanent
    allowedTransitions: [],
  },

  neutronStar: {
    // Neutron-degenerate remnant of massive stars
    // Supported by neutron degeneracy + nuclear forces
    massMin: 1.4,
    massMax: 2.5, // TOV limit
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["neutronDegeneracy"],
    fateLockedBy: "neutronDegeneracyDominance",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
  },

  blackHole: {
    // Gravitational singularity behind event horizon
    // No accessible internal structure
    massMin: 2.5, // stellar-mass BH minimum
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["eventHorizon"],
    fateLockedBy: "eventHorizonFormation",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
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

```

Now let me create the INTERSTELLAR_SCALE_FATES.ts with renamed types, removed definingProcesses, and updated childFateWeights:

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
  sizePcMin: number // characteristic size in parsecs
  sizePcMax?: number
  gasRich: boolean
  starFormationActive: boolean
  gravitationallyBound: boolean

  fateLockedBy: InterstellarScaleLock
  typicalTimescaleMyr: number // note: Myr, not Gyr—this scale evolves faster

  allowedTransitions: InterstellarScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * Defines what fraction of child (stellar) cells have each fate.
   *
   * Interstellar fates have a characteristic timescale of ~10-100 Myr:
   *   • GMC lifetimes: ~20-30 Myr
   *   • Open cluster dissolution: ~100 Myr
   *   • HII region lifetimes: ~10 Myr
   *   • Superbubble persistence: ~30-50 Myr
   *
   * Example:
   *   giantMolecularCloud.childFateWeights = {
   *     denseCore: 0.3,     // collapsing cores
   *     star: 0.15,         // recently formed stars
   *     diffuseGas: 0.4,    // ambient cloud material
   *   }
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * This table defines the **qualitative physical regimes of stellar neighborhoods**—
 * structures at ~100 pc scale that sit between galaxies and individual stellar systems.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
 *
 * This is faster than galactic evolution (~Gyr) but spans many stellar generations.
 * The interstellar fate determines the LOCAL environment for star formation—things
 * like stellar density, metallicity coherence, and gas availability.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Interstellar fates are distinguished by:
 *
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode the lifecycle of ISM structures:
 *
 *   diffuseISM → giantMolecularCloud (cloud formation)
 *   giantMolecularCloud → HIIRegion / openCluster (star formation + feedback)
 *   HIIRegion → superbubble (supernovae from OB stars)
 *   superbubble → diffuseISM (cooling and mixing)
 *   openCluster → stellarStream / evolvedField (dissolution)
 *   globularCluster → stellarStream (tidal stripping, rare)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GALACTIC_SCALE_FATES` describe **galaxy-wide morphology and gas content**
 * • `INTERSTELLAR_SCALE_FATES` describe **local ISM structure and star clusters**
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * The galactic fate sets the overall star formation rate and gas fraction.
 * The interstellar fate determines WHERE stars form and in what environment.
 * The stellar fate describes the individual objects that result.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game, interstellar fates matter because:
 *
 *   • Stars in the same cluster have similar ages and metallicities
 *   • Nearby stars in a cluster are truly close (potential travel targets)
 *   • GMCs and HII regions are hazardous (radiation, gas)
 *   • Evolved field regions have stable, well-separated stellar systems
 */
export const INTERSTELLAR_SCALE_FATES: Record<
  InterstellarScaleFateKey,
  InterstellarScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    // Active star-forming cloud: mix of dense cores and diffuse gas
    // Gravitational collapse, turbulent fragmentation, magnetic support
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.4, // ambient molecular gas
      denseCore: 0.35, // collapsing cores, decision point
      star: 0.15, // recently formed stars
      brownDwarf: 0.07, // failed stars
      substellarObject: 0.03, // planetary-mass objects
    },
  },

  HIIRegion: {
    // Ionized region around young OB stars: bright, hot, expanding
    // Photoionization, radiation pressure, stellar winds
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    allowedTransitions: ["superbubble", "diffuseISM"],
    childFateWeights: {
      star: 0.4, // young OB stars dominating
      diffuseGas: 0.3, // ionized gas (HII)
      denseCore: 0.1, // triggered star formation at edges
      brownDwarf: 0.12, // low-mass products
      substellarObject: 0.08, // ejected objects
    },
  },

  superbubble: {
    // Hot cavity carved by supernovae: sparse, energetic
    // Supernova explosions, stellar wind bubbles, shock heating
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.3, // hot, ionized gas
      star: 0.25, // surviving stars
      whiteDwarf: 0.18, // remnants of intermediate-mass stars
      neutronStar: 0.12, // core-collapse remnants
      blackHole: 0.06, // rare massive remnants
      brownDwarf: 0.05, // low-mass survivors
      substellarObject: 0.04, // dynamically ejected objects
    },
  },

  diffuseISM: {
    // Ambient interstellar medium: low density, stable
    // Thermal equilibrium, cosmic ray heating, radiative cooling
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
      whiteDwarf: 0.1, // old remnants
      brownDwarf: 0.08, // low-mass objects
      substellarObject: 0.04, // rogue planets
      neutronStar: 0.02, // old pulsars
      blackHole: 0.01, // rare stellar-mass BHs
    },
  },

  openCluster: {
    // Young bound cluster: concentrated, coeval population
    // Two-body relaxation, mass segregation, tidal stripping
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100,
    allowedTransitions: ["stellarStream", "evolvedField"],
    childFateWeights: {
      star: 0.6, // dominant population
      brownDwarf: 0.15, // low-mass members
      whiteDwarf: 0.1, // if cluster is old enough
      substellarObject: 0.08, // ejected planets
      neutronStar: 0.05, // from massive star deaths
      blackHole: 0.02, // rare
    },
  },

  globularCluster: {
    // Ancient dense cluster: old stars, exotic binaries
    // Core collapse, mass segregation, blue straggler formation
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000,
    allowedTransitions: ["stellarStream"],
    childFateWeights: {
      star: 0.4, // low-mass MS and evolved stars
      whiteDwarf: 0.3, // many old WDs
      neutronStar: 0.1, // millisecond pulsars
      brownDwarf: 0.1, // ancient low-mass
      blackHole: 0.05, // stellar-mass BHs
      substellarObject: 0.05, // ancient ejected objects
    },
  },

  stellarStream: {
    // Tidally disrupted cluster: stretched, kinematically coherent
    // Tidal stripping, differential rotation, phase mixing
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000,
    allowedTransitions: ["evolvedField"],
    childFateWeights: {
      star: 0.45, // stream members
      whiteDwarf: 0.25, // old remnants
      brownDwarf: 0.12, // low-mass members
      neutronStar: 0.08, // old pulsars
      substellarObject: 0.06, // stripped planets
      blackHole: 0.04, // rare
    },
  },

  evolvedField: {
    // Old field population: widely separated, evolved stars
    // Passive stellar evolution, dynamical heating
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 5000,
    allowedTransitions: [],
    childFateWeights: {
      star: 0.35, // long-lived low-mass stars and giants
      whiteDwarf: 0.3, // accumulated over Gyr
      brownDwarf: 0.15, // ancient low-mass
      substellarObject: 0.08, // rogue planets
      neutronStar: 0.07, // old pulsars
      blackHole: 0.05, // stellar-mass BHs
    },
  },
}

```

Now let me update GALACTIC_SCALE_FATES.ts to import from INTERSTELLAR_SCALE_FATES:

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<RegionalScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each regional fate.
   *
   * These weights answer: "In this galactic regime, what mix of regional
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<InterstellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each interstellar fate.
   *
   * These weights answer: "In this galactic regime, what mix of interstellar
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<InterstellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `REGIONAL_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each interstellar fate.
   *
   * These weights answer: "In this galactic regime, what mix of interstellar
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<InterstellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `INTERSTELLAR_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over regional fates
 *
 * A galaxy fate constrains what regional structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number // stellar mass in solar masses (M☉)
  stellarMassMax?: number
  gasRich: boolean
  starFormationActive: boolean
  dominantStellarPopulation: "young" | "mixed" | "old"

  fateLockedBy: GalacticScaleLock
  typicalTimescaleGyr: number

  definingProcesses: string[]
  allowedTransitions: GalacticScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * This field defines the **marginal distribution** over child fates: what
   * fraction of the child grid should have each interstellar fate.
   *
   * These weights answer: "In this galactic regime, what mix of interstellar
   * structures exists?" They do NOT answer: "Where in the galaxy does each
   * structure appear?"
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
   *   spiralGalaxy.childFateWeights = {
   *     giantMolecularCloud: 0.2,  // active star formation in arms
   *     diffuseISM: 0.3,           // inter-arm regions
   *     openCluster: 0.1,          // young clusters in disk
   *   }
   *
   *   This says: "In a spiral galaxy tile, about 20% of child cells are GMCs,
   *   30% are diffuse ISM, 10% are open clusters."
   */
  childFateWeights?: Partial<Record<InterstellarScaleFateKey, number>>
}

/**
 * GALACTIC_SCALE_FATES
 * --------------------
 *
 * This table defines the **qualitative physical regimes of galaxies**—structures that
 * sit between group/cluster scales above and stellar scales below in the cosmic hierarchy.
 *
 * Like `GROUP_SCALE_FATES` and `STELLAR_SCALE_FATES`, this model treats galaxies not as
 * morphological labels ("spiral" vs "elliptical") but as **physical states** separated
 * by **irreversible thresholds**.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A "GALAXY" IS IN THIS MODEL
 *
 * A galaxy is a **dark-matter–dominated halo** at the ~100 kpc scale, hosting:
 *   • a stellar component (disk, bulge, halo)
 *   • gas reservoirs (cold molecular, warm atomic, hot coronal)
 *   • a central supermassive black hole (in most cases)
 *
 * Galaxies are distinguished from groups by:
 *   • containing a single dominant stellar system (not multiple independent galaxies)
 *   • having gas and stars well-mixed within the halo
 *   • evolving primarily through internal processes, not galaxy-galaxy interactions
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Galaxies are classified along three orthogonal axes:
 *
 *   1) **Morphological structure**
 *      – Is the stellar distribution disk-dominated, spheroid-dominated, or diffuse?
 *
 *   2) **Gas content and star formation**
 *      – Does the galaxy have a gas reservoir? Is star formation active?
 *
 *   3) **Dynamical maturity**
 *      – Has the galaxy reached a stable morphology, or is it still transforming?
 *
 * These axes define **distinct regimes** with different stellar populations,
 * chemical enrichment, and long-term evolution.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * A galaxy's identity becomes irreversible when it crosses one of the following thresholds:
 *
 *   • morphologicalRelaxation
 *       – Violent relaxation (from major mergers) produces a pressure-supported
 *         elliptical structure. Disk rebuilding is extremely unlikely.
 *
 *   • gasExhaustion
 *       – The gas reservoir is permanently depleted (stripped, heated, or consumed).
 *         Star formation cannot resume without external resupply.
 *
 *   • tidalDisruption
 *       – The galaxy is being torn apart by a larger system's tidal field.
 *         Its identity as a coherent galaxy will not persist.
 *
 * Once a lock occurs, the galaxy cannot return to earlier regimes.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible evolution paths, such as:
 *
 *   diffuseHalo → dwarfIrregular / dwarfSpheroid
 *   dwarfIrregular → dwarfSpheroid / spiralGalaxy
 *   spiralGalaxy → lenticularGalaxy / ellipticalGalaxy / activeGalactic
 *   lenticularGalaxy → ellipticalGalaxy / quenchedRemnant
 *   activeGalactic → ellipticalGalaxy / quenchedRemnant
 *
 * Disallowed transitions (e.g., ellipticalGalaxy → spiralGalaxy) are intentionally
 * absent, reflecting the irreversibility of morphological relaxation and gas loss.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GROUP_SCALE_FATES` describe **halo-scale environments** that contain galaxies
 * • `GALACTIC_SCALE_FATES` describe **galaxy-scale structure and evolution**
 * • `INTERSTELLAR_SCALE_FATES` describe **ISM structure and star clusters** (~100 pc)
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * Together, they form a consistent, multi-scale description of structure formation.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CROSS-SCALE CONSTRAINTS (childFateWeights)
 *
 * Each fate answers two orthogonal questions:
 *
 *   1. **What can this galaxy become?**
 *      → `allowedTransitions` — same-scale evolution over time
 *
 *   2. **What does this galaxy produce below it?**
 *      → `childFateWeights` — probability distribution over interstellar fates
 *
 * A galaxy fate constrains what interstellar structures can exist inside it:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters common
 *   • ellipticalGalaxy → evolved field, globular clusters, no GMCs
 *   • dwarfIrregular → patchy GMCs, superbubbles, sparse clusters
 *
 * These weights are **priors derived from physics**, not observational statistics.
 * They encode causation: "this physical regime produces these kinds of children."
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Favor **physical thresholds** over observational labels
 * • Encode **irreversibility explicitly**
 * • Treat galaxies as **processes**, not static objects
 *
 * This allows the same structure to be used for simulation, reasoning, or validation
 * without baking in survey-dependent definitions like Hubble types.
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
    gasRich: true,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 2,
    definingProcesses: [
      "inefficient cooling",
      "reionization suppression",
      "weak gravitational potential",
    ],
    allowedTransitions: ["dwarfIrregular", "dwarfSpheroid"],
    // Diffuse, low-mass halo: sparse stellar content
    // Mostly empty space with occasional evolved stars
    childFateWeights: {
      diffuseISM: 0.6, // low-density gas dominates
      evolvedField: 0.3, // sparse old stellar population
      giantMolecularCloud: 0.08, // rare, inefficient cooling
      openCluster: 0.02, // very rare
    },
  },

  dwarfIrregular: {
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    definingProcesses: [
      "stochastic star formation",
      "supernova-driven outflows",
      "gas cycling",
    ],
    allowedTransitions: ["dwarfSpheroid", "spiralGalaxy"],
    // Active dwarf: bursty star formation
    // Patchy GMCs and superbubbles from stochastic feedback
    childFateWeights: {
      giantMolecularCloud: 0.25, // active star-forming regions
      superbubble: 0.2, // feedback-driven cavities
      diffuseISM: 0.25, // ambient gas between bursts
      HIIRegion: 0.15, // around recent star formation
      openCluster: 0.1, // sparse young clusters
      evolvedField: 0.05, // some older population
    },
  },

  dwarfSpheroid: {
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 5,
    definingProcesses: [
      "gas stripping",
      "ram pressure",
      "tidal harassment",
      "supernova blowout",
    ],
    allowedTransitions: [], // terminal state for dwarf track
    // Quiescent dwarf: old stars, no gas
    // Dominated by evolved field with ancient globulars
    childFateWeights: {
      evolvedField: 0.6, // old stellar population dominates
      globularCluster: 0.15, // ancient bound clusters
      stellarStream: 0.15, // tidally disrupted structures
      diffuseISM: 0.1, // tenuous residual gas
    },
  },

  spiralGalaxy: {
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
    gasRich: true,
    starFormationActive: true,
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    definingProcesses: [
      "disk rotation",
      "spiral density waves",
      "bar instabilities",
      "molecular cloud formation",
    ],
    allowedTransitions: [
      "lenticularGalaxy",
      "ellipticalGalaxy",
      "activeGalactic",
    ],
    // Disk galaxy: full ISM lifecycle in spiral arms
    // Rich mix of star-forming regions, clusters, and evolved populations
    childFateWeights: {
      giantMolecularCloud: 0.2, // molecular clouds in arms
      HIIRegion: 0.1, // around young OB associations
      diffuseISM: 0.25, // inter-arm regions
      openCluster: 0.15, // young disk clusters
      superbubble: 0.1, // feedback-driven cavities
      evolvedField: 0.15, // old disk population
      globularCluster: 0.03, // halo population
      stellarStream: 0.02, // disrupted structures
    },
  },

  lenticularGalaxy: {
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: false,
    typicalTimescaleGyr: 4,
    definingProcesses: [
      "gas stripping",
      "strangulation",
      "faded spiral arms",
      "bulge growth",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // Disk with no gas: aging stellar population
    // No star formation, aging clusters dissolving
    childFateWeights: {
      evolvedField: 0.5, // dominant old population
      diffuseISM: 0.15, // tenuous residual gas
      globularCluster: 0.1, // ancient halo population
      stellarStream: 0.1, // disrupted clusters
      openCluster: 0.1, // dissolving remnants
      superbubble: 0.05, // ancient cavities
    },
  },

  ellipticalGalaxy: {
    stellarMassMin: 1e10,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "morphologicalRelaxation",
    typicalTimescaleGyr: 6,
    definingProcesses: [
      "major mergers",
      "violent relaxation",
      "dry mergers",
      "hot gas corona",
    ],
    allowedTransitions: ["activeGalactic", "quenchedRemnant"],
    // Pressure-supported: very old stars dominate
    // No ISM structure, rich globular cluster system
    childFateWeights: {
      evolvedField: 0.55, // dominant old population
      globularCluster: 0.2, // rich GC system from mergers
      stellarStream: 0.15, // tidal debris from mergers
      diffuseISM: 0.1, // hot X-ray halo, no cold gas
    },
  },

  activeGalactic: {
    stellarMassMin: 1e10,
    gasRich: false, // gas consumed by AGN
    starFormationActive: false, // AGN suppresses SF
    dominantStellarPopulation: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 0.5,
    definingProcesses: [
      "SMBH accretion",
      "AGN feedback",
      "jet launching",
      "gas heating",
    ],
    allowedTransitions: ["ellipticalGalaxy", "quenchedRemnant"],
    // AGN-dominated: central activity, gas heating
    // AGN feedback suppresses star formation, heats ISM
    childFateWeights: {
      diffuseISM: 0.35, // AGN-heated gas
      evolvedField: 0.3, // existing old population
      superbubble: 0.15, // AGN-driven outflows
      globularCluster: 0.1, // unaffected by AGN
      stellarStream: 0.1, // tidal structures
    },
  },

  quenchedRemnant: {
    stellarMassMin: 1e9,
    gasRich: false,
    starFormationActive: false,
    dominantStellarPopulation: "old",
    fateLockedBy: "gasExhaustion",
    typicalTimescaleGyr: 8,
    definingProcesses: [
      "complete gas loss",
      "passive aging",
      "no rejuvenation",
      "stellar mass loss",
    ],
    allowedTransitions: [], // terminal state
    // Dead galaxy: only stellar remnants remain
    // Slowly fading stellar population, no new structures
    childFateWeights: {
      evolvedField: 0.65, // dominant old population
      globularCluster: 0.15, // surviving ancient clusters
      stellarStream: 0.15, // accumulated tidal debris
      diffuseISM: 0.05, // minimal hot halo
    },
  },
}

```

Now let me update index.ts:

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100    →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (regions)   (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (regional scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: stellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { REGIONAL_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • REGIONAL_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (regional scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: stellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { REGIONAL_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • INTERSTELLAR_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (regional scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: stellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { REGIONAL_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • INTERSTELLAR_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (interstellar scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: stellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { REGIONAL_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable.
 *
 * The game has no notable graphics engine. Instead, it is essentially a business
 * application: spreadsheets, schematics, data files. The player launches probes,
 * studies star systems, and eventually sends colonization missions—all through
 * tables and forms.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   • has a **fate** (its current physical regime)
 *   • contains **child parcels** at the next scale down
 *   • has **coordinates** (x, y) within its parent's grid
 *
 * A parcel IS multi-scale. A galaxy is not "a collection of stars"—it is a
 * kpc100 parcel whose children happen to be stellar-scale parcels. The hierarchy
 * is intrinsic to what a parcel is.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES AND CONSTRAINTS
 *
 * Each scale has one or more **fate tables** that define what physical regimes
 * are possible at that scale. See the individual fate files for details:
 *
 *   • WEB_SCALE_FATES — voids, filaments, nodes (10 Mpc)
 *   • GROUP_SCALE_FATES — galaxy groups (1 Mpc)
 *   • CLUSTER_SCALE_FATES — galaxy clusters (1 Mpc)
 *   • GALACTIC_SCALE_FATES — galaxy types (100 kpc)
 *   • INTERSTELLAR_SCALE_FATES — ISM structure, star clusters (100 pc)
 *   • STELLAR_SCALE_FATES — stars, planets, remnants (1 pc)
 *
 * Fates answer two orthogonal questions:
 *
 *   1. **What can this parcel become?**
 *      → `allowedTransitions` (same-scale evolution over time)
 *
 *   2. **What does this parcel produce below it?**
 *      → `childFateWeights` (cross-scale constraint on children)
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces mostly elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces protostellar cores and young
 * stars. The parent fate determines the distribution.
 *
 * These weights are **priors**, not hard rules. Rare configurations are still
 * possible—a spiral galaxy in a cluster, a young star in an elliptical. The
 * weights encode likelihood, not permission.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Instead:
 *
 *   1. Parcels exist as **probability distributions** until observed.
 *   2. An **observation** collapses a distribution into a concrete fate.
 *   3. Observations are **deterministic** given a seed (reproducible).
 *   4. Observations are **written to a database** and persist.
 *   5. Observations **constrain future observations** in both directions.
 *
 * This is like procedural generation with lazy evaluation and constraint
 * propagation. We only compute what we need to answer a question.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *     (A fossilGroup contains mostly elliptical galaxies.)
 *
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   • Nearby cells have correlated fates (clustering)
 *   • Tiles seamlessly join at boundaries (tiling)
 *   • Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (interstellar scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PRINCIPLE
 *
 * Store **causes**, not consequences.
 *
 * Fates encode physical thresholds and regimes, not observational labels.
 * Child weights encode what physics produces, not what surveys find.
 * The model is aligned with causation, not correlation.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: geometry & transport
   *  - captures the real transition (gas thermalization), not an artificial size jump
   *  - one dominant halo per occupied cell, most cells empty
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },
  /**
   * 1x1 Mpc grid: binding & hot gas
   *  - one void / filament / node per cell, minimal mixing
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
  /**
   * 100x100 kpc grid: galaxies
   *  - one galaxy per cell in most environments
   *  - resolves ISM vs halo cleanly
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   *  - individual stars, binaries, planetary systems
   *  - stellar remnants (white dwarfs, neutron stars, black holes)
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Interstellar-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import type { GALACTIC_SCALE_FATES } from "~/model/GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "~/model/GROUP_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES
type GroupFateKey = keyof typeof GROUP_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *         "pc100": [5,3],   // regional scale (GMCs, clusters)
 *         "pc1": [42,17],   // stellar scale
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the group-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of group fates.
 * For now, uses a uniform distribution (all group fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain group fate weights.
 */
function observeGroupFate(
  coords: Coordinates,
  universeSeed: number
): GroupFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe group fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all group fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<GroupFateKey, number>> = {
    unboundAssociation: 0.2,
    boundGroup: 0.25,
    gasRichGroup: 0.2,
    gasPoorGroup: 0.15,
    fossilGroup: 0.1,
    infallingGroup: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeGroupFate(coords, universeSeed)
  const parentCharacteristics = GROUP_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

```

```typescript
/**
 * OBSERVATION-BASED UNIVERSE QUERIES
 * ===================================
 *
 * This module implements the **sparse observation model** described in
 * ~/model.
 *
 * The key insight is that we don't simulate the entire universe up front.
 * Instead, we make **observations** that collapse probability distributions
 * into concrete fates, one parcel at a time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW OBSERVATIONS WORK
 *
 * An observation is a function:
 *
 *   (coordinates, seed) → fate
 *
 * Given the same coordinates and seed, the same fate is always returned. This
 * makes the simulation **deterministic and reproducible**.
 *
 * Observations are **hierarchical**. To observe a parcel at scale N, you may
 * need to first observe its parent at scale N-1, because the parent's fate
 * constrains the child's probability distribution via `childFateWeights`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINT PROPAGATION
 *
 * Constraints flow **both directions** in the hierarchy:
 *
 * **Top-down** (parent → child): The parent's `childFateWeights` define a prior
 *   distribution over child fates. A fossil group favors elliptical galaxies.
 *
 * **Bottom-up** (child → parent): If we observe children before the parent,
 *   those observations constrain what parent fates are plausible. Five spirals
 *   in a tile? Probably not a fossil group.
 *
 * This bidirectionality means we're not just sampling—we're solving for a
 * consistent configuration across scales. The sample space is not "individual
 * fates" but "coherent tile configurations."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PERSISTENCE AND REVISION
 *
 * Observations are written to a database and persist across queries.
 *
 * However, observations are **not immutable**. When new observations create
 * inconsistencies (paradoxes), earlier observations may be revised to restore
 * consistency. The simulation prioritizes coherence over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLEMENTATION STATUS
 *
 * Phase 1 (Perlin noise + thresholds):
 *   - [ ] A database to store observations
 *   - [x] Parent fate lookup before child observation
 *   - [x] `childFateWeights` on all fate tables
 *   - [x] Perlin noise field generation (see noise.ts)
 *   - [x] Threshold derivation from childFateWeights
 *   - [~] Tile boundary continuity (Perlin is naturally continuous)
 *
 * Phase 2 (full hierarchy):
 *   - [ ] Web-scale (Mpc10) observation with childFateWeights
 *   - [ ] Cluster-scale fates (parallel to group-scale)
 *   - [ ] Interstellar-scale (pc100) observation within galaxies
 *   - [ ] Stellar-scale (pc1) observation within regions
 *
 * Phase 3 (bidirectional constraints):
 *   - [ ] Bottom-up inference: child observations → parent fate constraints
 *   - [ ] Paradox detection and resolution
 *   - [ ] Observation revision when needed
 */

import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinates, ScaleKey } from "~/model"
import type { GALACTIC_SCALE_FATES } from "~/model/GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "~/model/GROUP_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES
type GroupFateKey = keyof typeof GROUP_SCALE_FATES

/**
 * Fates that count as "real galaxies" (not just diffuse halos).
 *
 * A diffuseHalo is a kpc100 parcel that failed to form a galaxy—it has minimal
 * stellar content and no distinct structure. The other fates represent actual
 * galaxies with stars, gas, and potentially a central black hole.
 */
const GALAXY_FATES: GalacticFateKey[] = [
  "dwarfIrregular",
  "dwarfSpheroid",
  "spiralGalaxy",
  "lenticularGalaxy",
  "ellipticalGalaxy",
  "activeGalactic",
  "quenchedRemnant",
]

/**
 * An observation records the fate of a parcel at specific coordinates.
 *
 * Once made, an observation is immutable—the fate cannot change. Future
 * observations of child or sibling parcels are conditioned on this result.
 */
type Observation = {
  coordinates: Coordinates
  scale: ScaleKey
  fate: string
  mass?: number // solar masses (if applicable)
  seed: number // the deterministic seed used for this observation
}

type FindGalaxiesArgs = {
  limit: number
  universeSeed?: number
}

type FindGalaxiesResult = {
  observations: Observation[]
  galaxies: Coordinates[]
}

/**
 * Makes observations of the universe until it finds a certain number of galaxies.
 *
 * Returns 1) the set of observations made, 2) the coordinates of the galaxies found.
 *
 * Coordinates should be sets of x,y pairs at as many scales as needed, e.g:
 *
 *       {
 *         "Mpc10": [20,25],
 *         "Mpc1": [4,0],
 *         "kpc100": [0,0],
 *         "pc100": [5,3],   // interstellar scale (GMCs, clusters)
 *         "pc1": [42,17],   // stellar scale
 *       }
 */
export function findGalaxies({
  limit,
  universeSeed = 42,
}: FindGalaxiesArgs): FindGalaxiesResult {
  const observations: Observation[] = []
  const galaxies: Coordinates[] = []

  let attempts = 0
  const maxAttempts = limit * 100 // avoid infinite loops

  while (galaxies.length < limit && attempts < maxAttempts) {
    attempts++

    // Generate coordinates at each scale, drilling down from Mpc10 to kpc100
    const coords = generateRandomCoordinates(universeSeed + attempts)

    // Observe the kpc100 parcel - what galactic fate is there?
    const galacticFate = observeGalacticFate(coords, universeSeed)

    observations.push({
      coordinates: coords,
      scale: "kpc100",
      fate: galacticFate,
      seed: computeSeed(coords, universeSeed),
    })

    // Is this a galaxy?
    if (GALAXY_FATES.includes(galacticFate)) {
      galaxies.push(coords)
    }
  }

  return { observations, galaxies }
}

/**
 * Generate random coordinates at all scales from Mpc10 down to kpc100.
 *
 * Each scale's coordinates are within a 10x10 grid relative to their parent.
 */
function generateRandomCoordinates(seed: number): Coordinates {
  return {
    Mpc10: [
      Math.floor(seededRandom(seed) * 10),
      Math.floor(seededRandom(seed + 1) * 10),
    ],
    Mpc1: [
      Math.floor(seededRandom(seed + 2) * 10),
      Math.floor(seededRandom(seed + 3) * 10),
    ],
    kpc100: [
      Math.floor(seededRandom(seed + 4) * 10),
      Math.floor(seededRandom(seed + 5) * 10),
    ],
  }
}

/**
 * Compute a deterministic seed for a given set of coordinates.
 */
function computeSeed(coords: Coordinates, universeSeed: number): number {
  let hash = universeSeed
  for (const [scale, [x, y]] of Object.entries(coords)) {
    hash = hash * 31 + x
    hash = hash * 31 + y
    hash = hash * 31 + scale.length // incorporate scale name
  }
  return hash
}

/**
 * Simple seeded pseudo-random number generator (0-1).
 * Used for generating search coordinates, not for fate sampling.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

/**
 * Observe the group-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of group fates.
 * For now, uses a uniform distribution (all group fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain group fate weights.
 */
function observeGroupFate(
  coords: Coordinates,
  universeSeed: number
): GroupFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe group fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all group fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<GroupFateKey, number>> = {
    unboundAssociation: 0.2,
    boundGroup: 0.25,
    gasRichGroup: 0.2,
    gasPoorGroup: 0.15,
    fossilGroup: 0.1,
    infallingGroup: 0.1,
  }

  const { keys, thresholds } = computeThresholds(uniformWeights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

/**
 * Observe the galactic-scale fate at the given coordinates.
 *
 * Uses Perlin noise + thresholds from parent's childFateWeights:
 *   1. First observe the parent (Mpc1) to get its group fate
 *   2. Look up the parent's childFateWeights
 *   3. Generate Perlin noise at the kpc100 coordinates
 *   4. Apply thresholds to get the categorical fate
 *
 * The Perlin field ensures spatial coherence: nearby cells have correlated
 * fates. The thresholds (derived from weights) ensure marginals match.
 */
function observeGalacticFate(
  coords: Coordinates,
  universeSeed: number
): GalacticFateKey {
  const kpc100 = coords.kpc100
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!kpc100 || !mpc1 || !mpc10) {
    throw new Error("All coordinates required to observe galactic fate")
  }

  // First, observe the parent's fate
  const parentFate = observeGroupFate(coords, universeSeed)
  const parentCharacteristics = GROUP_SCALE_FATES[parentFate]

  // Get the parent's childFateWeights
  const weights = parentCharacteristics.childFateWeights

  if (!weights || Object.keys(weights).length === 0) {
    // Fallback: if no weights defined, use uniform distribution
    return "diffuseHalo"
  }

  // Compute a seed for this Mpc1 tile (for the galactic-scale noise field)
  // This ensures all kpc100 cells in the same Mpc1 tile share a coherent field
  const tileSeed =
    universeSeed * 7 +
    mpc10[0] * 10000 +
    mpc10[1] * 1000 +
    mpc1[0] * 100 +
    mpc1[1]

  // Sample Perlin noise at the kpc100 position within the Mpc1 tile
  const noiseValue = perlin2d(kpc100[0], kpc100[1], tileSeed)

  // Convert weights to thresholds and sample
  const { keys, thresholds } = computeThresholds(weights)
  return sampleFromThresholds(noiseValue, keys, thresholds)
}

```

All done! No linter errors. Here's a summary of the revision:

## Changes Made

### 1. Renamed REGIONAL → INTERSTELLAR
- Created `INTERSTELLAR_SCALE_FATES.ts`
- Deleted `REGIONAL_SCALE_FATES.ts`
- Updated all imports and references

### 2. Revised STELLAR_SCALE_FATES with "lanes" principle

**New 8 fates (down from 12):**

| Fate | Support | Lock | Description |
|------|---------|------|-------------|
| `diffuseGas` | none | — | Ambient ISM, not self-gravitating |
| `denseCore` | thermalGas | — | Self-gravitating, decision point |
| `star` | nuclear | `fusionIgnition` | Any hydrogen-burning object |
| `whiteDwarf` | electronDegeneracy | `electronDegeneracyDominance` | Electron-degenerate remnant |
| `neutronStar` | neutronDegeneracy | `neutronDegeneracyDominance` | Neutron-degenerate remnant |
| `blackHole` | eventHorizon | `eventHorizonFormation` | Singularity |
| `brownDwarf` | electronDegeneracy | `electronDegeneracyDominance` | Never achieved H fusion |
| `substellarObject` | material/degeneracy | `electronDegeneracyDominance` | Below BD mass (PMO) |

**Removed:**
- `protostellarCore`, `protoplanetaryDisk` (merged into `denseCore`)
- `mainSequenceStar`, `evolvedStar` (merged into `star`)
- `planetarySystem` (deferred to AU scale)

### 3. Removed `definingProcesses` 
- Removed from characteristics type and all entries
- Added brief comments where context was important

### 4. Updated all childFateWeights
- INTERSTELLAR now references new stellar fate keys
- Weights adjusted to use the 8-fate system

### Key design principle reinforced:
> **Fates are LANES, not STAGES.** A parcel's fate describes its current physical state, determined by what support mechanism resists gravity. Transitions represent threshold events, not gradual evolution.

---

**User**

> denseCore becoming star, brownDwarf, etc



I wonder if we made a mistake here. If a denseCore _always_ evolves into one of these other stellar scale fates, then it is not a fate of its own. It's just a lifecycle stage that multiple fates share.



You mentioned



> The interstellar scale "paints" the initial distribution, but individual parcels can still undergo these transitions.



... but I think a key detail about these fates is that when the parent parcel "paints" the initial distribution, *it is painting the final outcome for the subparcels*. It is not painting an initial state. The state of any given parcel at any given time will depend on a multitude of factors, events, etc. What has been painted from the start is the final destination.



When I say that parcels can transition from one fate to another, it's not that there are "early fates" and "late fates", it's that some outside force can change the fate of then parcel.



And when I say that smaller scale parcels fates play out on a shorter timescale (and aren't "forever") I don't mean that the parcel goes through one fate and then another. I am saying: as you zoom out to longer and longer timescales, the probability of one of these larger (spatially) scale outside forces comes through and wipes out the current fate in place of another.



So I want to be very clear, it's not as if the smaller scale parcel is "evolving" into another fate. It's more like the physics/matter/energy is destroyed and a new set of physics/matter/energy is left in its place.

---

**Cursor**

This is a crucial clarification that changes how I understand the model. Let me make sure I've got it:

## The Key Insight

**Fates are destinations, not stages.** When a parent "paints" child fates, it's painting what those parcels **will be**, not what they start as.

So `denseCore` is wrong because:
- It's a transient stage that ALWAYS becomes something else
- It's not a stable state that a parcel "is"
- The GMC should paint `star`, `brownDwarf`, `diffuseGas` directly—the collapsing core phase is just the mechanism by which those outcomes are reached

## Revised Understanding

The stellar scale fates should be **stable endpoints**:

| Fate | Stable? | Why |
|------|---------|-----|
| `diffuseGas` | ✓ | Ambient gas, remains until external event |
| ~~`denseCore`~~ | ✗ | Always becomes something else—remove |
| `star` | ✓ | Stable for stellar lifetime (Myr-Gyr) |
| `whiteDwarf` | ✓ | Stable forever |
| `neutronStar` | ✓ | Stable forever |
| `blackHole` | ✓ | Stable forever |
| `brownDwarf` | ✓ | Stable forever |
| `substellarObject` | ✓ | Stable forever |

## About `star → remnant` Transitions

When a star "transitions" to a white dwarf, it's not evolving—**the star is destroyed and replaced by a white dwarf**. This is an external event (fuel exhaustion) that replaces one physical regime with another.

This is still a valid `allowedTransition` because it encodes "what can replace this fate when an event occurs", not "what does this fate naturally evolve into."

## About `diffuseGas` Transitions

Should `diffuseGas` have transitions? In the current model, it has `allowedTransitions: ["denseCore"]`. But if:
- `denseCore` is removed
- Parents paint final destinations

Then `diffuseGas` should have **no transitions**. It's a stable endpoint. When the interstellar fate changes (e.g., `diffuseISM` → `giantMolecularCloud`), the child fates get repainted—some `diffuseGas` cells become `star` cells. But that's a repaint from above, not a transition within the stellar scale.

## Proposed Changes

1. **Remove `denseCore`** from stellar fates
2. **Remove transitions from `diffuseGas`** (it's stable until repainted)
3. **Keep `star → remnant` transitions** (external replacement events)
4. **Update INTERSTELLAR childFateWeights** to paint final outcomes directly

Does this match your understanding? If so, I'll implement it.

---

**User**

Regarding diffuseGas, I think it's fine if there are no transitions. I have more to say on that, but why don't you go ahead and make those changes.

---

**Cursor**

```typescript
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

export type StellarScaleFateKey =
  | "diffuseGas"
  | "star"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "substellarObject"

type StellarScaleFateLock =
  | "fusionIgnition" // hydrogen fusion began
  | "electronDegeneracyDominance" // electron degeneracy is sole support
  | "neutronDegeneracyDominance" // neutron degeneracy is sole support
  | "eventHorizonFormation" // singularity formed
  | false

type StellarScaleFateCharacteristics = {
  massMin?: number // solar masses
  massMax?: number // solar masses
  elementsProduced: Elem[]
  support: SupportType[] | false

  fateLockedBy: StellarScaleFateLock
  typicalTimescaleMyr: number

  allowedTransitions: StellarScaleFateKey[]
}

/**
 * STELLAR_SCALE_FATES
 * -------------------
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
 * TRANSITIONS ARE REPLACEMENT EVENTS
 *
 * When a fate "transitions" to another (e.g., star → whiteDwarf), it's not
 * evolution—it's replacement. The star is destroyed and a white dwarf is left
 * in its place. This is caused by an external event (fuel exhaustion).
 *
 * Smaller-scale fates have shorter "lifetimes" not because they evolve, but
 * because external forces are more likely to intervene and replace them.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SEVEN STELLAR FATES
 *
 * GAS (stable until external event):
 *   • diffuseGas — ambient ISM, not self-gravitating
 *
 * NUCLEAR-BURNING (locked, then replaced by remnant):
 *   • star — any object with sustained hydrogen (or later) fusion
 *
 * DEGENERATE REMNANTS (locked forever):
 *   • whiteDwarf — electron-degenerate, no fusion
 *   • neutronStar — neutron-degenerate, no fusion
 *   • brownDwarf — electron-degenerate, never achieved H fusion
 *
 * GRAVITATIONAL (locked forever):
 *   • blackHole — event horizon, no internal structure accessible
 *
 * SUBSTELLAR (locked forever):
 *   • substellarObject — below brown dwarf mass (PMO, rogue planet)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game:
 *   • `star` — potential host for habitable planets
 *   • `whiteDwarf` — dim, but may have surviving planets
 *   • `neutronStar` / `blackHole` — hazardous, scientifically interesting
 *   • `diffuseGas` — no stars, just ISM
 *   • `brownDwarf` / `substellarObject` — dim, cold, unlikely targets
 *
 * Planets will be handled at a future AU scale.
 */
export const STELLAR_SCALE_FATES: Record<
  StellarScaleFateKey,
  StellarScaleFateCharacteristics
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
    // When fuel exhausts, replaced by a remnant (WD, NS, or BH)
    massMin: 0.08,
    massMax: 150,
    elementsProduced: ["He", "C", "N", "O"], // varies by mass, simplified
    support: ["nuclear"],
    fateLockedBy: "fusionIgnition",
    typicalTimescaleMyr: 10000, // varies enormously by mass
    allowedTransitions: ["whiteDwarf", "neutronStar", "blackHole"],
  },

  whiteDwarf: {
    // Electron-degenerate remnant of low/intermediate mass stars
    // Carbon-oxygen or oxygen-neon core, no fusion
    massMin: 0.5, // remnant mass
    massMax: 1.4, // Chandrasekhar limit
    elementsProduced: ["He", "C", "N", "O"],
    support: ["electronDegeneracy"],
    fateLockedBy: "electronDegeneracyDominance",
    typicalTimescaleMyr: Infinity, // effectively permanent
    allowedTransitions: [],
  },

  neutronStar: {
    // Neutron-degenerate remnant of massive stars
    // Supported by neutron degeneracy + nuclear forces
    massMin: 1.4,
    massMax: 2.5, // TOV limit
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["neutronDegeneracy"],
    fateLockedBy: "neutronDegeneracyDominance",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
  },

  blackHole: {
    // Gravitational singularity behind event horizon
    // No accessible internal structure
    massMin: 2.5, // stellar-mass BH minimum
    elementsProduced: ["He", "C", "N", "O", "Ne", "Mg", "Si", "S", "Fe", "Ni"],
    support: ["eventHorizon"],
    fateLockedBy: "eventHorizonFormation",
    typicalTimescaleMyr: Infinity,
    allowedTransitions: [],
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

```

Now let me update the INTERSTELLAR_SCALE_FATES to remove `denseCore` references from childFateWeights:

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
  sizePcMin: number // characteristic size in parsecs
  sizePcMax?: number
  gasRich: boolean
  starFormationActive: boolean
  gravitationallyBound: boolean

  fateLockedBy: InterstellarScaleLock
  typicalTimescaleMyr: number // note: Myr, not Gyr—this scale evolves faster

  allowedTransitions: InterstellarScaleFateKey[]

  /**
   * CHILD FATE WEIGHTS (Marginal Distribution)
   * ------------------------------------------
   *
   * Defines what fraction of child (stellar) cells have each fate.
   *
   * These weights paint **final outcomes**, not initial states. When a GMC
   * paints its children, it's saying "this cell WILL become a star" or
   * "this cell WILL become a brown dwarf"—not "this cell is currently
   * a collapsing core that might become something."
   *
   * Interstellar fates have a characteristic timescale of ~10-100 Myr:
   *   • GMC lifetimes: ~20-30 Myr
   *   • Open cluster dissolution: ~100 Myr
   *   • HII region lifetimes: ~10 Myr
   *   • Superbubble persistence: ~30-50 Myr
   *
   * Example:
   *   giantMolecularCloud.childFateWeights = {
   *     star: 0.3,          // will form stars
   *     brownDwarf: 0.15,   // will form brown dwarfs
   *     diffuseGas: 0.4,    // will remain gas (no star formation)
   *   }
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * This table defines the **qualitative physical regimes of stellar neighborhoods**—
 * structures at ~100 pc scale that sit between galaxies and individual stellar systems.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
 *
 * This is faster than galactic evolution (~Gyr) but spans many stellar generations.
 * The interstellar fate determines the LOCAL environment for star formation—things
 * like stellar density, metallicity coherence, and gas availability.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Interstellar fates are distinguished by:
 *
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode the lifecycle of ISM structures:
 *
 *   diffuseISM → giantMolecularCloud (cloud formation)
 *   giantMolecularCloud → HIIRegion / openCluster (star formation + feedback)
 *   HIIRegion → superbubble (supernovae from OB stars)
 *   superbubble → diffuseISM (cooling and mixing)
 *   openCluster → stellarStream / evolvedField (dissolution)
 *   globularCluster → stellarStream (tidal stripping, rare)
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `GALACTIC_SCALE_FATES` describe **galaxy-wide morphology and gas content**
 * • `INTERSTELLAR_SCALE_FATES` describe **local ISM structure and star clusters**
 * • `STELLAR_SCALE_FATES` describe **individual stellar systems and remnants**
 *
 * The galactic fate sets the overall star formation rate and gas fraction.
 * The interstellar fate determines WHERE stars form and in what environment.
 * The stellar fate describes the individual objects that result.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GAME RELEVANCE
 *
 * For the colonization game, interstellar fates matter because:
 *
 *   • Stars in the same cluster have similar ages and metallicities
 *   • Nearby stars in a cluster are truly close (potential travel targets)
 *   • GMCs and HII regions are hazardous (radiation, gas)
 *   • Evolved field regions have stable, well-separated stellar systems
 */
export const INTERSTELLAR_SCALE_FATES: Record<
  InterstellarScaleFateKey,
  InterstellarScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    // Active star-forming cloud: produces stars, brown dwarfs, substellar objects
    // The childFateWeights paint the FINAL outcomes—what each cell will become
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.4, // will remain gas (no star formation)
      star: 0.35, // will become stars
      brownDwarf: 0.15, // will become brown dwarfs
      substellarObject: 0.1, // will become planetary-mass objects
    },
  },

  HIIRegion: {
    // Ionized region around young OB stars: bright, hot, expanding
    // Stars already formed; gas is ionized and dispersing
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    allowedTransitions: ["superbubble", "diffuseISM"],
    childFateWeights: {
      star: 0.45, // young OB stars dominating
      diffuseGas: 0.25, // ionized gas (HII)
      brownDwarf: 0.18, // low-mass products
      substellarObject: 0.12, // ejected objects
    },
  },

  superbubble: {
    // Hot cavity carved by supernovae: sparse, energetic
    // Contains survivors and remnants of massive stars
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.25, // hot, ionized gas
      star: 0.25, // surviving stars
      whiteDwarf: 0.2, // remnants of intermediate-mass stars
      neutronStar: 0.15, // core-collapse remnants
      blackHole: 0.06, // rare massive remnants
      brownDwarf: 0.05, // low-mass survivors
      substellarObject: 0.04, // dynamically ejected objects
    },
  },

  diffuseISM: {
    // Ambient interstellar medium: low density, stable
    // Old field stars and remnants drifting through
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
      whiteDwarf: 0.1, // old remnants
      brownDwarf: 0.08, // low-mass objects
      substellarObject: 0.04, // rogue planets
      neutronStar: 0.02, // old pulsars
      blackHole: 0.01, // rare stellar-mass BHs
    },
  },

  openCluster: {
    // Young bound cluster: concentrated, coeval population
    // Stars already formed; now evolving together
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100,
    allowedTransitions: ["stellarStream", "evolvedField"],
    childFateWeights: {
      star: 0.6, // dominant population
      brownDwarf: 0.15, // low-mass members
      whiteDwarf: 0.1, // if cluster is old enough
      substellarObject: 0.08, // ejected planets
      neutronStar: 0.05, // from massive star deaths
      blackHole: 0.02, // rare
    },
  },

  globularCluster: {
    // Ancient dense cluster: old stars, many remnants
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000,
    allowedTransitions: ["stellarStream"],
    childFateWeights: {
      star: 0.4, // low-mass MS and evolved stars
      whiteDwarf: 0.3, // many old WDs
      neutronStar: 0.1, // millisecond pulsars
      brownDwarf: 0.1, // ancient low-mass
      blackHole: 0.05, // stellar-mass BHs
      substellarObject: 0.05, // ancient ejected objects
    },
  },

  stellarStream: {
    // Tidally disrupted cluster: stretched, kinematically coherent
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000,
    allowedTransitions: ["evolvedField"],
    childFateWeights: {
      star: 0.45, // stream members
      whiteDwarf: 0.25, // old remnants
      brownDwarf: 0.12, // low-mass members
      neutronStar: 0.08, // old pulsars
      substellarObject: 0.06, // stripped planets
      blackHole: 0.04, // rare
    },
  },

  evolvedField: {
    // Old field population: widely separated, evolved stars
    // Terminal state for stellar populations
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 5000,
    allowedTransitions: [],
    childFateWeights: {
      star: 0.35, // long-lived low-mass stars and giants
      whiteDwarf: 0.3, // accumulated over Gyr
      brownDwarf: 0.15, // ancient low-mass
      substellarObject: 0.08, // rogue planets
      neutronStar: 0.07, // old pulsars
      blackHole: 0.05, // stellar-mass BHs
    },
  },
}

```

Let me check for any other references to `denseCore` in the project:

Let me also verify there are no stale comments referencing `denseCore`:

Good—those are intentional documentation explaining why we *don't* model collapsing cores as fates. 

Done! I've made the following changes:

**STELLAR_SCALE_FATES.ts:**
- Removed `denseCore` from the fate type and table (7 fates now instead of 8)
- Removed transitions from `diffuseGas` (it's stable until parent repaints)
- Updated documentation to emphasize "fates are destinations, not stages"
- Clarified that transitions are "replacement events" not evolution

**INTERSTELLAR_SCALE_FATES.ts:**
- Removed all `denseCore` references from `childFateWeights`
- Redistributed weights to paint final outcomes directly:
  - GMC: `star: 0.35`, `brownDwarf: 0.15`, `substellarObject: 0.1`, `diffuseGas: 0.4`
  - HII: removed `denseCore`, adjusted weights
- Updated documentation to clarify that child weights paint "final outcomes, not initial states"

The model now properly expresses the principle that **parent parcels paint the final destination for their children**. A GMC doesn't paint "collapsing cores"—it paints "this cell will become a star" or "this cell will remain gas."

---

**User**

Great. Let's move on to the gasCloud question I alluded to.



A ways back in the chat you mentioned:



 > gasCloud → diffuseGas (more specific: actually collapsing to form a star)



I didn't want to confuse you at the time, but I wondered then whether we should make it explicit that a parcel could have something like a "null fate". Meaning: there is no meaningful differentiation at this scale. The same physics  apply at the smaller scale that apply at the larger scale.



More specifically, maybe the diffuseGas stellar fate is just the null option for regions inside a giantMolecularCloud interstellar region.



What do you think about that idea?



My primary hesitation is that it could introduce complexity. Also, these truly would have to be a "terminal scale"... we couldn't skip the stellar scale and then star painting again at the planetary scale. Otherwise you need heterogenous sets of child weights and that just seems like too much.

---

**Cursor**

This is a great conceptual question. Let me think through it:

**The insight is correct**: `diffuseGas` at stellar scale inside a GMC really is "more of the same stuff." It's not a distinct object—it's just a 1 pc patch of the same molecular cloud material that defines the parent. Semantically, it's saying "nothing interesting here at this resolution."

**But I'd argue against formalizing a null fate**, for the reasons you identified plus one more:

The current approach already handles this gracefully. `diffuseGas` at pc1 effectively IS the null option—it means "no stellar object formed here." When we eventually add AU1 (planetary scale), `diffuseGas` would simply have no `childFateWeights` (or trivial ones), naturally terminating the hierarchy for that cell.

The key insight is: **the null behavior emerges from the fate, it doesn't need to be a separate concept.**

Consider the alternatives:

| Approach | Complexity | Semantics |
|----------|------------|-----------|
| **Implicit null** (current): `diffuseGas` = "nothing here" | Simple: uniform data model, every cell has a fate | Clear: "gas that didn't form anything" |
| **Explicit null**: special fate that skips a scale | Complex: heterogeneous children, special-case sampling | Clearer: explicitly says "no differentiation" |

The explicit approach is more honest philosophically, but adds complexity without changing behavior. The implicit approach works because:

1. `diffuseGas` has no transitions (it's stable)
2. `diffuseGas` would have no/trivial child weights at AU1
3. The hierarchy naturally terminates without special logic

**Where explicit null WOULD matter**: if we wanted cells to "skip" a scale and resume differentiation later. E.g., "this pc1 cell is null, but at AU1 we find rogue planets." But as you note, that creates heterogeneous child weight sets—a complexity cost that probably isn't worth it.

**My recommendation**: Keep `diffuseGas` as-is, document that it's the "nothing interesting at this resolution" fate, and let the null behavior emerge implicitly from empty/absent `childFateWeights`. If we ever need explicit null semantics for performance or other reasons, we can add them then.

Does that match your intuition, or do you see a use case where explicit null would be necessary?

---

**User**

Great. Well reasoned.



Alright, I think we've made a ton of progress in this thread.



I'd like to wrap up by making sure that we've captured the insights.



Please review this thread, and identify all of the times you reconceptualized something in a different way, or arrived at a new, unforseen insight about how the model is meant to function. This could be things I pointed out, or observations you made on your own.



For each reconceptualization, note:

1) What your previous (discarded) understanding was

2) Note any sources of that old understanding 

3) Your new understanding

4) What was the key observation that led to the shift in understanding

---

**Cursor**

This is a great exercise for ensuring the model's conceptual foundations are clear. Let me review the thread and identify the key reconceptualizations:

---

## 1. Fates are Destinations, Not Initial States

**Previous understanding:** `childFateWeights` describe what currently exists in a region. A GMC contains "collapsing cores," "diffuse gas," and "recently formed stars."

**Source of old understanding:** Intuitive reading of "fates" as current states; I initially included `denseCore` in childFateWeights as if describing the current composition.

**New understanding:** When a parent paints children, it paints **final outcomes**. A GMC doesn't contain "collapsing cores"—it contains cells that *will become* stars, cells that *will become* brown dwarfs, and cells that *will remain* gas.

**Key observation:** Your statement: *"when the parent parcel 'paints' the initial distribution, it is painting the final outcome for the subparcels. It is not painting an initial state."*

---

## 2. Transitions are Replacement Events, Not Evolution

**Previous understanding:** `star → whiteDwarf` represents the star "evolving" into a white dwarf—a continuous process where the parcel changes.

**Source of old understanding:** Familiarity with stellar evolution as taught in astrophysics; the language of "transitions" suggests gradual change.

**New understanding:** Transitions represent **destruction and replacement**. When a star "transitions" to a white dwarf, the star is destroyed (envelope ejected, core collapses) and a white dwarf is left in its place. The transition is a threshold event, not a gradual process.

**Key observation:** Your clarification: *"it's more like the physics/matter/energy is destroyed and a new set of physics/matter/energy is left in its place."*

---

## 3. Smaller Timescales Mean Higher Replacement Probability, Not Internal Evolution

**Previous understanding:** Stellar-scale fates have "shorter timescales" because they evolve faster internally.

**Source of old understanding:** Conflating "characteristic timescale" with "lifecycle duration."

**New understanding:** Smaller-scale fates have shorter effective lifetimes because **external forces are more likely to intervene**. A stellar parcel's fate can be replaced by a larger-scale event (galactic merger, supernova from a neighbor). The parcel doesn't evolve—it gets overwritten.

**Key observation:** Your statement: *"as you zoom out to longer and longer timescales, the probability of one of these larger (spatially) scale outside forces comes through and wipes out the current fate in place of another."*

---

## 4. denseCore is Not a Fate (It's a Lifecycle Stage)

**Previous understanding:** `denseCore` is a valid stellar fate—a self-gravitating gas core that can transition to star, brown dwarf, or disperse.

**Source of old understanding:** I was modeling the star formation process as a state machine: gas → core → star. This violates the "fates are destinations" principle.

**New understanding:** If a denseCore *always* becomes something else (star, BD, or disperses), it's not a fate—it's a transient stage. The parent should directly paint the final outcome (star, brownDwarf, diffuseGas), not the intermediate stage.

**Key observation:** Your question: *"If a denseCore always evolves into one of these other stellar scale fates, then it is not a fate of its own. It's just a lifecycle stage that multiple fates share."*

---

## 5. "Lanes, Not Stages" — Fates are Parallel Regimes

**Previous understanding:** `mainSequenceStar → evolvedStar → whiteDwarf` is a valid fate sequence, where each represents a distinct physical state.

**Source of old understanding:** I was encoding stellar evolution (MS → RGB → AGB → WD) as distinct fates with transitions between them.

**New understanding:** A main sequence star and a red giant are **the same fate** (`star`)—they have the same support mechanism (nuclear fusion). The fate describes the *physical regime*, not the evolutionary phase. Different masses and ages within the same support regime are not different fates.

**Key observation:** The realization that fates should be distinguished by **support mechanism** (what resists gravity), not by evolutionary phase. Both MS and RGB stars are fusion-supported → same lane.

---

## 6. The Interstellar Scale (~100 pc) is Essential

**Previous understanding:** We could jump directly from kpc100 (galaxies) to pc1 (stars), with ~100,000x scale factor.

**Source of old understanding:** Initial model design had fewer scales; user preference for ~100x jumps suggested minimizing scale count.

**New understanding:** The ~100 pc scale captures **distinct physics with its own characteristic timescale** (~10-100 Myr):
- GMC lifetimes: ~20-30 Myr
- Open cluster dissolution: ~100 Myr  
- HII region lifetimes: ~10 Myr

This is neither galactic (~Gyr) nor stellar (~Myr to ~Gyr for individual objects). It's the scale of **star formation environments and stellar neighborhoods**.

**Key observation:** The characteristic timescale argument—each scale should have physics that operates on a qualitatively distinct timescale. GMCs and clusters have their own timescales that don't fit at either galactic or stellar scale.

---

## 7. diffuseGas as Implicit Null (Not a Formal Null Fate)

**Previous understanding:** We might need a formal "null fate" concept to represent "no meaningful differentiation at this scale."

**Source of old understanding:** Recognizing that `diffuseGas` at pc1 inside a GMC is semantically redundant with the parent's gas-rich state.

**New understanding:** `diffuseGas` **already serves as the implicit null**. It means "nothing interesting formed here at this resolution." The null behavior emerges naturally from the fate having no meaningful child weights. No formal null semantics needed.

**Key observation:** The realization that null behavior can emerge implicitly (empty `childFateWeights`) rather than requiring explicit null representation. This avoids the complexity of heterogeneous child types.

---

## 8. definingProcesses is Unnecessary Mechanical Overhead

**Previous understanding:** `definingProcesses` is useful metadata that documents what makes each fate distinct.

**Source of old understanding:** I added it as inline documentation to help humans understand the physics.

**New understanding:** The essential fields are `childFateWeights`, `allowedTransitions`, and `fateLockedBy`. Process descriptions belong in **comments**, not in the data model. Keep the model minimal.

**Key observation:** Your directive to focus on the mechanical core: *"So far the model is focused on 1) 'painting' sub-parcels within a parcel, 2) understanding which state transitions are possible."*

---

## Summary of Core Principles Clarified

| Principle | Implication |
|-----------|-------------|
| Fates are destinations | Paint final outcomes, not current states |
| Transitions are replacement | External events destroy/replace, not evolve |
| Lanes, not stages | Same support mechanism = same fate |
| Characteristic timescales | Each scale has distinct physics timescale |
| Implicit null | Empty childFateWeights = no children |
| Minimal model | Only mechanical fields; context in comments |

---

Would you like me to create a summary document capturing these principles for future reference?

---

**User**

>  Transitions represent destruction and replacement. When a star "transitions" to a white dwarf, the star is destroyed (envelope ejected, core collapses) and a white dwarf is left in its place. The transition is a threshold event, not a gradual process.

This doesn't sound quite right. I meant to communicate that a gas parcel might have a white dwarf pass into it, sucking up the gas and then becoming a neutron star. The gas parcel in that instance was "destroyed" and then replaced with something else.

Or a collection of stars might collapse via gravitation into a single black hole. Nothing changed at the interstellar scale. But at the stellar scale, those stars were all wiped out and only a black hole was left. That's not an evolution of stars, that's an external vent when a bunch of stars bombard another star.

Does that change the validity of any of your recent edits to the codebase?

---

**Cursor**

You're right—I misunderstood. Let me clarify what you're saying:

**My incorrect interpretation:**
- `star → whiteDwarf` = internal fuel exhaustion destroys star, leaves WD
- The "destruction and replacement" is still an internal process

**Your actual meaning:**
- Transitions are caused by **external events** affecting the parcel
- Example: A WD drifts into a gas parcel, accretes the gas, becomes NS → the *gas parcel* was destroyed
- Example: Multiple stars gravitationally collapse into a BH → the *star parcels* were destroyed by an event at a larger scale (cluster dynamics)

This is a more radical point: **internal stellar evolution (MS → WD) is NOT a transition at all.** A star that was painted "star" stays "star" until an external event replaces it.

This DOES affect my recent edits. Let me check the current state:

I see the problem. The documentation and transitions currently encode **internal stellar evolution** (fuel exhaustion → remnant), but you're saying transitions should only be **external events**.

Key issues in my current edits:
1. Line 79: "caused by an external event (fuel exhaustion)" — fuel exhaustion is NOT external
2. Line 134: "When fuel exhausts, replaced by a remnant" — internal evolution
3. Line 141: `star.allowedTransitions: ["whiteDwarf", "neutronStar", "blackHole"]` — if internal evolution isn't a transition, these might be wrong

**The deeper question:** Should `star → whiteDwarf` be a transition at all?

If transitions are only for external events:
- `star → blackHole` via multi-star collision = valid external event
- `star → whiteDwarf` via fuel exhaustion = NOT valid (internal evolution)

Instead, the model might work like this:
1. GMC paints children (star, brownDwarf, diffuseGas)
2. GMC transitions to openCluster
3. openCluster repaints children (different weights)
4. openCluster transitions to evolvedField  
5. evolvedField repaints with more whiteDwarf, fewer star

**The white dwarf "appears" not because stars evolved, but because the PARENT repainted when it transitioned.**

Let me fix the documentation and reconsider the transitions:

```typescript
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

export type StellarScaleFateKey =
  | "diffuseGas"
  | "star"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole"
  | "brownDwarf"
  | "substellarObject"

type StellarScaleFateLock =
  | "fusionIgnition" // hydrogen fusion began
  | "electronDegeneracyDominance" // electron degeneracy is sole support
  | "neutronDegeneracyDominance" // neutron degeneracy is sole support
  | "eventHorizonFormation" // singularity formed
  | false

type StellarScaleFateCharacteristics = {
  massMin?: number // solar masses
  massMax?: number // solar masses
  elementsProduced: Elem[]
  support: SupportType[] | false

  fateLockedBy: StellarScaleFateLock
  typicalTimescaleMyr: number

  allowedTransitions: StellarScaleFateKey[]
}

/**
 * STELLAR_SCALE_FATES
 * -------------------
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
 *   • A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   • Multiple stars in a dense cluster gravitationally collapse into a
 *     black hole. The STAR PARCELS were destroyed and replaced.
 *
 *   • A supernova from a nearby star disrupts a gas cloud. The GAS PARCEL
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
 *   • diffuseGas — ambient ISM, not self-gravitating
 *
 * NUCLEAR-BURNING:
 *   • star — any object with sustained hydrogen (or later) fusion
 *
 * DEGENERATE REMNANTS:
 *   • whiteDwarf — electron-degenerate, no fusion
 *   • neutronStar — neutron-degenerate, no fusion
 *   • brownDwarf — electron-degenerate, never achieved H fusion
 *
 * GRAVITATIONAL:
 *   • blackHole — event horizon, no internal structure accessible
 *
 * SUBSTELLAR:
 *   • substellarObject — below brown dwarf mass (PMO, rogue planet)
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
 *   • `star` — potential host for habitable planets
 *   • `whiteDwarf` — dim, but may have surviving planets
 *   • `neutronStar` / `blackHole` — hazardous, scientifically interesting
 *   • `diffuseGas` — no stars, just ISM
 *   • `brownDwarf` / `substellarObject` — dim, cold, unlikely targets
 *
 * Planets will be handled at a future AU scale.
 */
export const STELLAR_SCALE_FATES: Record<
  StellarScaleFateKey,
  StellarScaleFateCharacteristics
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

```

Good. Here's what I changed:

**Documentation updates:**
- Replaced "TRANSITIONS ARE REPLACEMENT EVENTS" with "TRANSITIONS ARE EXTERNAL EVENTS"
- Added concrete examples (WD accreting gas → NS, multi-star collapse → BH)
- Added new section "WHY STARS DON'T TRANSITION TO REMNANTS" explaining the repainting mechanism

**Transition changes:**
| Fate | Old | New | Reasoning |
|------|-----|-----|-----------|
| `star` | `["whiteDwarf", "neutronStar", "blackHole"]` | `["blackHole"]` | Only external event (multi-star collapse) preserved |
| `whiteDwarf` | `[]` | `["neutronStar"]` | WD accreting gas → NS is external event |
| `neutronStar` | `[]` | `["blackHole"]` | NS accreting gas → BH is external event |

**Key insight preserved:** When a parent transitions (e.g., `openCluster → evolvedField`), it repaints children with new weights. That's how the population "ages"—not by stars internally transitioning to remnants, but by the parent reflecting the new composition when it's repainted.

Does this match your intended model? The remaining transitions are all external events:
- `star → blackHole` (multi-star collapse)
- `whiteDwarf → neutronStar` (accretion)
- `neutronStar → blackHole` (accretion)

---

**User**

Awesome.



I think several of your reconceptualizations above are facets of the same idea:

1. Fates are Destinations, Not Initial States

3. Smaller Timescales Mean Higher Replacement Probability, Not Internal Evolution

4. denseCore is Not a Fate (It's a Lifecycle Stage)

5. "Lanes, Not Stages" — Fates are Parallel Regimes



... Please go through the entire project and edit the comments you see, making sure everything is compatible with this idea.



And be aggressive about deleting commentary. Definitely if it's contradictory, but even if it just seems unnecessary, or slightly confusing, just delete it. I'll review everything carefully so we don't have to worry about something important getting lost.



I think this is one of the most important concepts of the model, so I want to make sure it's baked in to our explanations.

---

**Cursor**

I'll review all the fate files and the index to ensure consistency with this core principle. Let me read through them:

Now I'll systematically update each file. Let me create a task list and work through them:

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * Physical regimes of stellar neighborhoods at ~100 pc scale.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs)
 *   • Star clusters (open, globular)
 *   • HII regions
 *   • Superbubbles
 *   • Diffuse ISM
 *
 * Characteristic timescale: ~10-100 Myr
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * When an interstellar fate paints its stellar children, it paints final
 * outcomes. A GMC doesn't paint "collapsing cores"—it paints the stars,
 * brown dwarfs, and gas that will exist when the process completes.
 *
 * Transitions between interstellar fates are caused by external events:
 *   • GMC → HIIRegion (massive stars ionize the cloud)
 *   • openCluster → stellarStream (tidal forces disrupt the cluster)
 *
 * When an interstellar fate transitions, it repaints its stellar children
 * with the new fate's weights.
 */
export const INTERSTELLAR_SCALE_FATES: Record<
  InterstellarScaleFateKey,
  InterstellarScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.4,
      star: 0.35,
      brownDwarf: 0.15,
      substellarObject: 0.1,
    },
  },

  HIIRegion: {
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    allowedTransitions: ["superbubble", "diffuseISM"],
    childFateWeights: {
      star: 0.45,
      diffuseGas: 0.25,
      brownDwarf: 0.18,
      substellarObject: 0.12,
    },
  },

  superbubble: {
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.25,
      star: 0.25,
      whiteDwarf: 0.2,
      neutronStar: 0.15,
      blackHole: 0.06,
      brownDwarf: 0.05,
      substellarObject: 0.04,
    },
  },

  diffuseISM: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    allowedTransitions: ["giantMolecularCloud"],
    childFateWeights: {
      diffuseGas: 0.5,
      star: 0.25,
      whiteDwarf: 0.1,
      brownDwarf: 0.08,
      substellarObject: 0.04,
      neutronStar: 0.02,
      blackHole: 0.01,
    },
  },

  openCluster: {
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100,
    allowedTransitions: ["stellarStream", "evolvedField"],
    childFateWeights: {
      star: 0.6,
      brownDwarf: 0.15,
      whiteDwarf: 0.1,
      substellarObject: 0.08,
      neutronStar: 0.05,
      blackHole: 0.02,
    },
  },

  globularCluster: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000,
    allowedTransitions: ["stellarStream"],
    childFateWeights: {
      star: 0.4,
      whiteDwarf: 0.3,
      neutronStar: 0.1,
      brownDwarf: 0.1,
      blackHole: 0.05,
      substellarObject: 0.05,
    },
  },

  stellarStream: {
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000,
    allowedTransitions: ["evolvedField"],
    childFateWeights: {
      star: 0.45,
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
      star: 0.35,
      whiteDwarf: 0.3,
      brownDwarf: 0.15,
      substellarObject: 0.08,
      neutronStar: 0.07,
      blackHole: 0.05,
    },
  },
}

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
  stellarMassMin: number
  stellarMassMax?: number
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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
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
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
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
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
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
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

type ClusterScaleFateKey =
  | "protoCluster"
  | "poorCluster"
  | "massiveCluster"
  | "mergingCluster"
  | "relaxedCluster"
  | "coolCoreCluster"
  | "nonCoolCoreCluster"
  | "fossilCluster"
  | "collapsingCluster"

type ClusterScaleLock =
  | "gravitationalBinding" // cluster-scale virialization
  | "thermalization" // hot ICM dominates baryons
  | "dynamicalRelaxation" // substructure erased
  | "coolingFeedbackBalance" // AGN ↔ cooling equilibrium
  | false

type ClusterScaleFateCharacteristics = {
  massMin: number
  massMax?: number
  dominantBaryonPhase: "plasma" | "mixed"
  gravitationallyBound: boolean

  fateLockedBy: ClusterScaleLock
  typicalTimescaleGyr: number

  allowedTransitions: ClusterScaleFateKey[]

  /**
   * Defines what fraction of child (galactic) cells have each fate.
   * Cluster environments suppress star formation and strip gas.
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * CLUSTER_SCALE_FATES
 * -------------------
 *
 * Physical regimes of galaxy clusters—the largest gravitationally bound structures.
 *
 * Clusters are deep dark-matter halos where:
 *   • Most baryons reside in hot, diffuse plasma
 *   • Gas cooling times are long compared to dynamical times
 *   • Galaxy fates are dominated by environment
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A cluster fate paints its galactic children. The weights define what
 * galaxy types will exist in the cluster:
 *
 *   • massiveCluster → ellipticals, lenticulars, dwarf spheroids
 *   • protoCluster → still has spirals (transformation ongoing)
 *
 * Transitions are caused by external events (cluster-cluster mergers,
 * continued accretion). When a cluster fate transitions, it repaints its
 * galactic children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS
 *
 *   • gravitationalBinding — system virialized into a single cluster halo
 *   • thermalization — shock heating produces long-lived hot ICM
 *   • dynamicalRelaxation — major substructure erased
 *   • coolingFeedbackBalance — AGN ↔ cooling equilibrium established
 */
export const CLUSTER_SCALE_FATES: Record<
  ClusterScaleFateKey,
  ClusterScaleFateCharacteristics
> = {
  protoCluster: {
    massMin: 1e13,
    massMax: 1e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    allowedTransitions: ["poorCluster", "mergingCluster"],
    childFateWeights: {
      spiralGalaxy: 0.25,
      lenticularGalaxy: 0.2,
      ellipticalGalaxy: 0.15,
      dwarfIrregular: 0.1,
      dwarfSpheroid: 0.1,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05,
      diffuseHalo: 0.05,
    },
  },

  collapsingCluster: {
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1.5,
    allowedTransitions: ["poorCluster", "mergingCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.25,
      ellipticalGalaxy: 0.2,
      spiralGalaxy: 0.15,
      quenchedRemnant: 0.15,
      dwarfSpheroid: 0.1,
      activeGalactic: 0.08,
      dwarfIrregular: 0.05,
      diffuseHalo: 0.02,
    },
  },

  poorCluster: {
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.25,
      ellipticalGalaxy: 0.2,
      spiralGalaxy: 0.15,
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05,
      dwarfIrregular: 0.05,
      diffuseHalo: 0.05,
    },
  },

  massiveCluster: {
    massMin: 5e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "thermalization",
    typicalTimescaleGyr: 3,
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35,
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.05,
      activeGalactic: 0.05,
      diffuseHalo: 0.05,
    },
  },

  mergingCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    allowedTransitions: ["relaxedCluster", "nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.25,
      lenticularGalaxy: 0.2,
      quenchedRemnant: 0.15,
      activeGalactic: 0.15,
      dwarfSpheroid: 0.1,
      spiralGalaxy: 0.08,
      diffuseHalo: 0.07,
    },
  },

  relaxedCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 4,
    allowedTransitions: ["coolCoreCluster", "nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35,
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  coolCoreCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "coolingFeedbackBalance",
    typicalTimescaleGyr: 5,
    allowedTransitions: ["nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.4,
      lenticularGalaxy: 0.2,
      dwarfSpheroid: 0.15,
      activeGalactic: 0.1,
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.03,
      diffuseHalo: 0.02,
    },
  },

  nonCoolCoreCluster: {
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    allowedTransitions: ["coolCoreCluster"],
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
    // Terminal state
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 6,
    allowedTransitions: [],
    childFateWeights: {
      ellipticalGalaxy: 0.5,
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05,
    },
  },
}

```

```typescript
import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

type GroupScaleFateKey =
  | "unboundAssociation"
  | "boundGroup"
  | "gasRichGroup"
  | "gasPoorGroup"
  | "fossilGroup"
  | "infallingGroup"

type GroupLock =
  | "gravitationalBinding" // becomes a real group
  | "dynamicalExhaustion" // internal merging largely complete
  | "externalCapture" // absorbed into larger halo
  | false

type GroupScaleCharacteristics = {
  haloMassMin: number
  haloMassMax?: number

  gravitationallyBound: boolean
  dominantBaryonPhase: "mixed" | "stellar" | "plasma"

  fateLockedBy: GroupLock
  typicalTimescaleGyr: number

  allowedTransitions: GroupScaleFateKey[]

  /**
   * Defines what fraction of child (galactic) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * GROUP_SCALE_FATES
 * -----------------
 *
 * Physical regimes of galaxy groups at ~1 Mpc scale.
 *
 * Groups are dark-matter–dominated halos hosting multiple galaxies whose
 * mutual interactions affect their fates. Groups are:
 *   • The most common galaxy environment
 *   • Dynamically active
 *   • Often transient on cosmological timescales
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A group fate paints its galactic children. The weights define what
 * galaxy types will exist in the group:
 *
 *   • fossilGroup → ellipticals and quenched remnants
 *   • gasRichGroup → spirals and irregulars
 *
 * Transitions are caused by external events (gas stripping, capture by
 * larger halo). When a group fate transitions, it repaints its galactic
 * children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS
 *
 *   • gravitationalBinding — system virialized into a single halo
 *   • dynamicalExhaustion — most galaxies merged into central dominant
 *   • externalCapture — group accreted by larger halo
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
    allowedTransitions: ["boundGroup"],
    childFateWeights: {
      diffuseHalo: 0.3,
      dwarfIrregular: 0.25,
      spiralGalaxy: 0.25,
      dwarfSpheroid: 0.1,
      ellipticalGalaxy: 0.05,
      lenticularGalaxy: 0.05,
    },
  },

  boundGroup: {
    haloMassMin: 1e12,
    haloMassMax: 1e13,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    allowedTransitions: ["gasRichGroup", "gasPoorGroup", "infallingGroup"],
    childFateWeights: {
      spiralGalaxy: 0.3,
      dwarfIrregular: 0.2,
      lenticularGalaxy: 0.15,
      dwarfSpheroid: 0.15,
      ellipticalGalaxy: 0.1,
      diffuseHalo: 0.1,
    },
  },

  gasRichGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "mixed",
    fateLockedBy: false,
    typicalTimescaleGyr: 1.5,
    allowedTransitions: ["gasPoorGroup", "infallingGroup"],
    childFateWeights: {
      spiralGalaxy: 0.35,
      dwarfIrregular: 0.25,
      activeGalactic: 0.1,
      lenticularGalaxy: 0.1,
      dwarfSpheroid: 0.1,
      ellipticalGalaxy: 0.05,
      diffuseHalo: 0.05,
    },
  },

  gasPoorGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    allowedTransitions: ["fossilGroup", "infallingGroup"],
    childFateWeights: {
      lenticularGalaxy: 0.3,
      ellipticalGalaxy: 0.2,
      dwarfSpheroid: 0.2,
      spiralGalaxy: 0.1,
      quenchedRemnant: 0.1,
      dwarfIrregular: 0.05,
      diffuseHalo: 0.05,
    },
  },

  fossilGroup: {
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "stellar",
    fateLockedBy: "dynamicalExhaustion",
    typicalTimescaleGyr: 5,
    allowedTransitions: ["infallingGroup"],
    childFateWeights: {
      ellipticalGalaxy: 0.5,
      quenchedRemnant: 0.2,
      dwarfSpheroid: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05,
    },
  },

  infallingGroup: {
    // Terminal state: being absorbed
    haloMassMin: 1e12,
    gravitationallyBound: true,
    dominantBaryonPhase: "plasma",
    fateLockedBy: "externalCapture",
    typicalTimescaleGyr: 1,
    allowedTransitions: [],
    childFateWeights: {
      lenticularGalaxy: 0.3,
      quenchedRemnant: 0.25,
      dwarfSpheroid: 0.2,
      ellipticalGalaxy: 0.15,
      diffuseHalo: 0.1,
    },
  },
}

```

```typescript
type WebScaleFateKey = "void" | "sheet" | "filament" | "node" | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
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
  | "emptyCell"

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) cells have each fate.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
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
 *   • void → mostly empty, rare isolated groups
 *   • node → clusters form at filament intersections
 *
 * The only true irreversibility is **capture into a bound halo**, at which
 * point the parcel exits the web-scale model entirely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   • 0D (nodes) — filament intersections, cluster formation sites
 *   • 1D (filaments) — matter transport corridors
 *   • 2D (sheets) — weak overdensities, early group formation
 *   • 3D (voids) — underdense regions, suppressed structure formation
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
      emptyCell: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
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
      emptyCell: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
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
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      emptyCell: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
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
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
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
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
type BaryonicCoolingFateKey =
  | "radiationCoupled"
  | "acousticFluid"
  | "recombinedGas"
  | "noCooling"
  | "popIIIStarFormation"
  | "metalCooling"

type BaryometricCharacteristics = {
  minTemperature?: number
  maxTemperature?: number
  freeElectronAbundance?: number
  thomsonToExpansionRatio?: number
  h2Fraction?: number
  metallicity?: number
  requiresDarkMatterHalo?: boolean
  canGravitate?: boolean
  primordialLithiumPreserved?: boolean
  lithiumDestroyed?: boolean
}

/**
 * BARYON_COOLING_FATES
 * --------------------
 *
 * Early-universe and diffuse-regime thermal states of baryonic matter,
 * *before* it becomes a bound object with a locked fate.
 *
 * These are thermodynamic regimes that determine whether matter CAN collapse,
 * not what it becomes once it does. Cooling fates gate access to structural
 * fates (stars, galaxies) but do not replace them.
 *
 *   • BARYON_COOLING_FATES: "Can this matter cool and collapse?"
 *   • STELLAR_SCALE_FATES: "What does it become once it does?"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE IDEA
 *
 * In the early universe, **cooling—not mass—was the limiting factor**.
 * Most baryons never formed stars because they:
 *   • Remained coupled to radiation
 *   • Lacked molecular or metal cooling channels
 *   • Never fell into deep gravitational potential wells
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REVERSIBILITY
 *
 * Unlike structural fates (which can be locked), cooling fates are reversible
 * and environment-dependent. They do not lock on their own.
 */
export const BARYON_COOLING_FATES: Record<
  BaryonicCoolingFateKey,
  BaryometricCharacteristics
> = {
  radiationCoupled: {
    minTemperature: 1e6,
    freeElectronAbundance: 1.0,
    thomsonToExpansionRatio: 1e5,
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  acousticFluid: {
    minTemperature: 3000,
    maxTemperature: 1e6,
    freeElectronAbundance: 0.99,
    thomsonToExpansionRatio: 10,
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  recombinedGas: {
    maxTemperature: 3000,
    freeElectronAbundance: 1e-4,
    thomsonToExpansionRatio: 0.1,
    canGravitate: true,
    primordialLithiumPreserved: true,
  },

  noCooling: {
    freeElectronAbundance: 1e-4,
    h2Fraction: 1e-7,
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: false,
    primordialLithiumPreserved: true,
  },

  popIIIStarFormation: {
    h2Fraction: 1e-4,
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
  },

  metalCooling: {
    metallicity: 1e-4,
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
  },
}

```

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive
 * a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   • Has a **fate** (its physical regime)
 *   • Contains **child parcels** at the next scale down
 *   • Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**,
 * not initial states. A GMC doesn't paint "collapsing cores"—it paints the
 * stars, brown dwarfs, and gas that will exist when the process completes.
 *
 * This is crucial: **child fate probabilities are a property of the parent's
 * physics**. A fossil group produces elliptical galaxies. A spiral galaxy
 * produces GMCs and open clusters. A GMC produces stars.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. When a star "transitions" to a black hole, it's because multiple
 * stars collided—an event at a larger scale. When a gas parcel "transitions"
 * to a neutron star, it's because a compact object drifted in and accreted it.
 *
 * When a parent fate transitions, it **repaints its children** with the new
 * fate's weights. This is how populations "age"—the parent reflects the new
 * composition, not by children internally transitioning.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   • **Top-down**: A parent fate constrains child fate probabilities.
 *   • **Bottom-up**: Child observations constrain parent fate probabilities.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid. Child parcels may have their coordinate planes oriented
 * differently relative to their parent, allowing a tree of 2D simulations
 * to fill a 3D volume.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: groups and clusters
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

All files updated. Let me also check for any other files that might reference outdated concepts:

The remaining matches are:
1. `evolvedField` - this is a legitimate fate name (not problematic)
2. References to "stage" that explain what fates are NOT ("not a stage", "we don't model stages")
3. References to "evolution" that explain what transitions are NOT ("internal evolution is not a transition")

These are all intentional—they're explaining the principle by contrasting with what the model does NOT do. 

Done! Here's a summary of the changes made across all files:

## Summary of Changes

**Removed from all fate files:**
- `definingProcesses` field (moved essential context to brief comments)
- Verbose documentation about axes of classification, design philosophy sections
- References to "lifecycle" and "evolutionary stages"

**Added/clarified in all fate files:**
- Brief "FATES ARE DESTINATIONS" section explaining that parent paints final outcomes
- Brief explanation that transitions are external events, not internal processes
- When a fate transitions, it repaints its children

**Specific files:**

| File | Lines Before | Lines After | Key Changes |
|------|--------------|-------------|-------------|
| `INTERSTELLAR_SCALE_FATES.ts` | 323 | 204 | Removed 119 lines of verbose docs |
| `GALACTIC_SCALE_FATES.ts` | 403 | 223 | Removed `definingProcesses`, trimmed docs |
| `CLUSTER_SCALE_FATES.ts` | 362 | 228 | Removed `definingProcesses`, trimmed docs |
| `GROUP_SCALE_FATES.ts` | 353 | 172 | Removed `definingProcesses`, trimmed docs |
| `WEB_SCALE_FATES.ts` | 230 | 145 | Removed `definingProcesses`, trimmed docs |
| `BARYON_COOLING_FATES.ts` | 165 | 103 | Removed outdated references, trimmed docs |
| `index.ts` | 222 | 117 | Simplified to core concepts only |

**Core principle now baked in:**
> **Fates are destinations, not stages. When a parent paints children, it paints final outcomes. Transitions are external events that destroy and replace, causing the parent to repaint its children.**

---

**User**

@app/model/INTERSTELLAR_SCALE_FATES.ts:127 What does this mean Stars already formed?

---

**Cursor**

```typescript
HIIRegion: {
  // Ionized region around young OB stars: bright, hot, expanding
  // Stars already formed; gas is ionized and dispersing
  sizePcMin: 1,
  ...
}
```

Good catch. That comment is problematic given our principle that fates are destinations, not stages.

The comment was trying to explain why `starFormationActive: false`—HII regions don't have ongoing star formation because massive OB stars have already ionized the gas and feedback suppresses further formation.

But "Stars already formed" sounds like we're describing a temporal sequence (GMC → HII), which contradicts our model. When we paint an HIIRegion, we're painting a **destination**, not describing what happened before.

A cleaner comment would focus on what an HII region **is**, not its history:

```typescript
HIIRegion: {
  // Ionized gas dominated by young OB stars
  // Feedback suppresses new star formation
  sizePcMin: 1,
```

Or even simpler:

```typescript
HIIRegion: {
  // Ionized by OB stars; no ongoing star formation
  sizePcMin: 1,
```

If you want me to fix this, switch to agent mode.

```typescript
HIIRegion: {
  // Ionized gas dominated by young OB stars
  // Feedback suppresses new star formation
  sizePcMin: 1,
```

```typescript
HIIRegion: {
  // Ionized by OB stars; no ongoing star formation
  sizePcMin: 1,
```

---

**User**

@app/model/INTERSTELLAR_SCALE_FATES.ts:136-139 Why did you remove these comments?



      star: 0.45, // young OB stars dominating

      diffuseGas: 0.25, // ionized gas (HII)

      brownDwarf: 0.18, // low-mass products

      substellarObject: 0.12, // ejected objects

---

**Cursor**

I was too aggressive in trimming. Those inline comments are helpful—they explain what each weight represents in the specific context of an HII region. They don't violate any principles; they just clarify meaning.

I should restore them:

```typescript
childFateWeights: {
  star: 0.45, // young OB stars dominating
  diffuseGas: 0.25, // ionized gas (HII)
  brownDwarf: 0.18, // low-mass products
  substellarObject: 0.12, // ejected objects
},
```

The same applies to other fate entries where I removed similar contextual comments. Switch to agent mode if you'd like me to restore them throughout the file.

```typescript
childFateWeights: {
  star: 0.45, // young OB stars dominating
  diffuseGas: 0.25, // ionized gas (HII)
  brownDwarf: 0.18, // low-mass products
  substellarObject: 0.12, // ejected objects
},
```

---

**User**

Hm. Those explanations will exist in the @STELLAR_SCALE_FATES.ts won't they? So maybe they're unnecesary.

---

**Cursor**

You're right that the basic definitions live in STELLAR_SCALE_FATES. But some inline comments add **context-specific** meaning that wouldn't be there:

| Comment | Value? |
|---------|--------|
| "young OB stars dominating" | ✓ Context-specific (HII regions have massive stars) |
| "ionized gas (HII)" | ✓ Context-specific (gas phase in this environment) |
| "low-mass products" | ✗ Redundant (brown dwarfs are always low-mass) |
| "ejected objects" | ✓ Context-specific (explains why substellar objects appear here) |

So the principle could be: **keep comments that explain why this weight makes sense in this context; remove comments that just restate the fate definition.**

For HII region, that might look like:

```typescript
childFateWeights: {
  star: 0.45, // massive OB stars ionizing the region
  diffuseGas: 0.25, // ionized (HII)
  brownDwarf: 0.18,
  substellarObject: 0.12, // ejected from forming systems
},
```

Or you could just leave them all bare and let the parent-level comment carry the context. Either approach is defensible—it's a style preference.

```typescript
childFateWeights: {
  star: 0.45, // massive OB stars ionizing the region
  diffuseGas: 0.25, // ionized (HII)
  brownDwarf: 0.18,
  substellarObject: 0.12, // ejected from forming systems
},
```

---

**User**

> keep comments that explain why this weight makes sense in this context; remove comments that just restate the fate definition.

I like that. Please put instructions to that effect in the comment here @app/model/INTERSTELLAR_SCALE_FATES.ts:34-35  in a way that will be helpful to LLMs.

---

**Cursor**

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
   *
   * INLINE COMMENTS: Only add comments that explain why this weight makes
   * sense in THIS context. Don't restate what the child fate is (that's
   * documented in STELLAR_SCALE_FATES). Good: "// massive OB stars ionizing
   * the region". Bad: "// electron-degenerate remnant".
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * Physical regimes of stellar neighborhoods at ~100 pc scale.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * These different fates occur based on a number of factors:
*   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
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
 *   • GMC → HIIRegion (massive stars ionize the cloud)
 *   • openCluster → stellarStream (tidal forces disrupt the cluster)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
 *       – Tidal forces have dispersed the structure. A cluster becomes a stream;
 *         a cloud is sheared apart.
 *
 */
export const INTERSTELLAR_SCALE_FATES: Record<
  InterstellarScaleFateKey,
  InterstellarScaleFateCharacteristics
> = {
  giantMolecularCloud: {
    // Active star-forming cloud: produces stars, brown dwarfs, substellar objects
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: true,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["HIIRegion", "openCluster", "diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.4,
      star: 0.35,
      brownDwarf: 0.15,
      substellarObject: 0.1, // planetary-mass objects
    },
  },

  HIIRegion: {
    // Ionized by OB stars; no ongoing star formation
    sizePcMin: 1,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "feedbackDisruption",
    typicalTimescaleMyr: 10,
    allowedTransitions: ["superbubble", "diffuseISM"],
    childFateWeights: {
      star: 0.45,
      diffuseGas: 0.25,
      brownDwarf: 0.18,
      substellarObject: 0.12,
    },
  },

  superbubble: {
    sizePcMin: 50,
    sizePcMax: 500,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 30,
    allowedTransitions: ["diffuseISM"],
    childFateWeights: {
      diffuseGas: 0.25,
      star: 0.25,
      whiteDwarf: 0.2,
      neutronStar: 0.15,
      blackHole: 0.06,
      brownDwarf: 0.05,
      substellarObject: 0.04,
    },
  },

  diffuseISM: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: true,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleMyr: 100,
    allowedTransitions: ["giantMolecularCloud"],
    childFateWeights: {
      diffuseGas: 0.5,
      star: 0.25,
      whiteDwarf: 0.1,
      brownDwarf: 0.08,
      substellarObject: 0.04,
      neutronStar: 0.02,
      blackHole: 0.01,
    },
  },

  openCluster: {
    sizePcMin: 1,
    sizePcMax: 30,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 100,
    allowedTransitions: ["stellarStream", "evolvedField"],
    childFateWeights: {
      star: 0.6,
      brownDwarf: 0.15,
      whiteDwarf: 0.1,
      substellarObject: 0.08,
      neutronStar: 0.05,
      blackHole: 0.02,
    },
  },

  globularCluster: {
    sizePcMin: 10,
    sizePcMax: 100,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: true,
    fateLockedBy: "clusterBinding",
    typicalTimescaleMyr: 10000,
    allowedTransitions: ["stellarStream"],
    childFateWeights: {
      star: 0.4,
      whiteDwarf: 0.3,
      neutronStar: 0.1,
      brownDwarf: 0.1,
      blackHole: 0.05,
      substellarObject: 0.05,
    },
  },

  stellarStream: {
    sizePcMin: 100,
    sizePcMax: 1000,
    gasRich: false,
    starFormationActive: false,
    gravitationallyBound: false,
    fateLockedBy: "tidalDisruption",
    typicalTimescaleMyr: 1000,
    allowedTransitions: ["evolvedField"],
    childFateWeights: {
      star: 0.45,
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
      star: 0.35,
      whiteDwarf: 0.3,
      brownDwarf: 0.15,
      substellarObject: 0.08,
      neutronStar: 0.07,
      blackHole: 0.05,
    },
  },
}

```

Done. The comment now reads:

```typescript
/**
 * Defines what fraction of child (stellar) cells have each fate.
 * These weights paint **final outcomes**, not initial states.
 *
 * INLINE COMMENTS: Only add comments that explain why this weight makes
 * sense in THIS context. Don't restate what the child fate is (that's
 * documented in STELLAR_SCALE_FATES). Good: "// massive OB stars ionizing
 * the region". Bad: "// electron-degenerate remnant".
 */
childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
```

```typescript
/**
 * Defines what fraction of child (stellar) cells have each fate.
 * These weights paint **final outcomes**, not initial states.
 *
 * INLINE COMMENTS: Only add comments that explain why this weight makes
 * sense in THIS context. Don't restate what the child fate is (that's
 * documented in STELLAR_SCALE_FATES). Good: "// massive OB stars ionizing
 * the region". Bad: "// electron-degenerate remnant".
 */
childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
```

---

**User**

Go ahead and apply that policy throughout this file, as you suggested.

---

**Cursor**

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
   *
   * INLINE COMMENTS: Only add comments that explain why this weight makes
   * sense in THIS context. Don't restate what the child fate is (that's
   * documented in STELLAR_SCALE_FATES). Good: "// massive OB stars ionizing
   * the region". Bad: "// electron-degenerate remnant".
   */
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * Physical regimes of stellar neighborhoods at ~100 pc scale.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * These different fates occur based on a number of factors:
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
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
 *   • GMC → HIIRegion (massive stars ionize the cloud)
 *   • openCluster → stellarStream (tidal forces disrupt the cluster)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
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

```

Done. Here's the policy applied:

| Fate | Comments Added |
|------|----------------|
| **giantMolecularCloud** | `diffuseGas` → "molecular cloud material that won't form stars" |
| **HIIRegion** | `star` → "massive OB stars ionizing the region", `diffuseGas` → "ionized (HII)", `substellarObject` → "ejected from forming systems" |
| **superbubble** | `diffuseGas` → "hot, tenuous plasma", `neutronStar` → "from core-collapse supernovae", `blackHole` → "from most massive progenitors" |
| **diffuseISM** | `diffuseGas` → "warm/cool atomic hydrogen", `star` → "field stars passing through" |
| **openCluster** | `star` → "coeval population" |
| **globularCluster** | `star` → "ancient, low-mass survivors", `whiteDwarf` → "accumulated over ~10 Gyr", `neutronStar` → "includes millisecond pulsars" |
| **stellarStream** | `star` → "stripped from parent cluster" |
| **evolvedField** | `star` → "long-lived, low-mass", `whiteDwarf` → "accumulated over Gyr" |

Entries without comments are those where the weight doesn't have context-specific meaning worth noting.

---

**User**

Actually, this @app/model/INTERSTELLAR_SCALE_FATES.ts:35-39 guideline feels like it's more of a general guideline for all of the fates files.



Please create an AGENTS.md file inside app/model/ with this guideline.

---

**Cursor**

```markdown
# Guidelines for LLMs editing fate files

## Core principle: Fates are destinations

When a parent parcel "paints" its children, it paints **final outcomes**, not initial states. A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs, and gas that will exist when the process completes.

## Transitions are external events

Transitions between fates are caused by **external forces**, not internal processes. When a star "transitions" to a black hole, it's because multiple stars collided—an event at a larger scale.

When a parent fate transitions, it **repaints its children** with the new fate's weights. This is how populations "age"—not by children internally transitioning.

## Inline comments on childFateWeights

Only add comments that explain why a weight makes sense in THIS context. Don't restate what the child fate is (that's documented in the child's fate file).

**Good:** `star: 0.45, // massive OB stars ionizing the region`

**Bad:** `whiteDwarf: 0.2, // electron-degenerate remnant`

The good example explains context (why stars in an HII region are specifically OB stars). The bad example just restates the definition of a white dwarf.

```

Now let me update the comment in INTERSTELLAR_SCALE_FATES.ts to reference the AGENTS.md file instead of duplicating the guideline:

```typescript
import type { StellarScaleFateKey } from "./STELLAR_SCALE_FATES"

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
  childFateWeights?: Partial<Record<StellarScaleFateKey, number>>
}

/**
 * INTERSTELLAR_SCALE_FATES
 * ------------------------
 *
 * Physical regimes of stellar neighborhoods at ~100 pc scale.
 *
 * This is the scale of:
 *   • Giant Molecular Clouds (GMCs) — the birthplaces of stars
 *   • Star clusters — bound stellar systems with shared origins
 *   • HII regions — ionized gas around young OB stars
 *   • Superbubbles — hot cavities carved by supernovae
 *   • The diffuse interstellar medium (ISM)
 *
 * These different fates occur based on a number of factors:
 *   1) **Gas content and phase**
 *      – Is the region gas-rich or gas-poor? Molecular, atomic, or ionized?
 *   2) **Star formation state**
 *      – Is the region actively forming stars, post-starburst, or quiescent?
 *   3) **Gravitational binding**
 *      – Is the stellar population bound (cluster) or dispersing (association)?
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SCALE MATTERS
 *
 * The ~100 pc scale has a distinct **characteristic timescale** of ~10-100 Myr:
 *
 *   • GMC lifetimes: ~20-30 Myr (form, host star formation, disrupted by feedback)
 *   • Open cluster dissolution: ~100 Myr (evaporate into the field)
 *   • HII region lifetimes: ~10 Myr (expand and fade)
 *   • Superbubble persistence: ~30-50 Myr (cool and collapse)
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
 *   • GMC → HIIRegion (massive stars ionize the cloud)
 *   • openCluster → stellarStream (tidal forces disrupt the cluster)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Interstellar fates become irreversible when:
 *
 *   • clusterBinding
 *       – A gravitationally bound star cluster has formed. Its stars share
 *         a common origin and will remain kinematically coherent.
 *
 *   • feedbackDisruption
 *       – Stellar feedback (supernovae, winds, radiation) has destroyed the
 *         parent GMC. The gas is dispersed and cannot reform on this timescale.
 *
 *   • tidalDisruption
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

```

Done. Created `app/model/AGENTS.md` with the guidelines, and updated the comment in INTERSTELLAR_SCALE_FATES.ts to reference it instead of duplicating the content.

---

**User**

Go ahead and make the same revisions to your comment changes in CLUSTER_SCALE_FATES

---

**Cursor**

```typescript
import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

type ClusterScaleFateKey =
  | "protoCluster"
  | "poorCluster"
  | "massiveCluster"
  | "mergingCluster"
  | "relaxedCluster"
  | "coolCoreCluster"
  | "nonCoolCoreCluster"
  | "fossilCluster"
  | "collapsingCluster"

type ClusterScaleLock =
  | "gravitationalBinding" // cluster-scale virialization
  | "thermalization" // hot ICM dominates baryons
  | "dynamicalRelaxation" // substructure erased
  | "coolingFeedbackBalance" // AGN ↔ cooling equilibrium
  | false

type ClusterScaleFateCharacteristics = {
  massMin: number
  massMax?: number
  dominantBaryonPhase: "plasma" | "mixed"
  gravitationallyBound: boolean

  fateLockedBy: ClusterScaleLock
  typicalTimescaleGyr: number

  allowedTransitions: ClusterScaleFateKey[]

  /**
   * Defines what fraction of child (galactic) cells have each fate.
   * These weights paint **final outcomes**, not initial states.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>
}

/**
 * CLUSTER_SCALE_FATES
 * -------------------
 *
 * Physical regimes of galaxy clusters—the largest gravitationally bound structures.
 *
 * Clusters are deep dark-matter halos where:
 *   • Most baryons reside in hot, diffuse plasma
 *   • Gas cooling times are long compared to dynamical times
 *   • Galaxy fates are dominated by environment
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS
 *
 * A cluster fate paints its galactic children. The weights define what
 * galaxy types will exist in the cluster:
 *
 *   • massiveCluster → ellipticals, lenticulars, dwarf spheroids
 *   • protoCluster → still has spirals (transformation ongoing)
 *
 * Transitions are caused by external events (cluster-cluster mergers,
 * continued accretion). When a cluster fate transitions, it repaints its
 * galactic children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS
 *
 *   • gravitationalBinding — system virialized into a single cluster halo
 *   • thermalization — shock heating produces long-lived hot ICM
 *   • dynamicalRelaxation — major substructure erased
 *   • coolingFeedbackBalance — AGN ↔ cooling equilibrium established
 */
export const CLUSTER_SCALE_FATES: Record<
  ClusterScaleFateKey,
  ClusterScaleFateCharacteristics
> = {
  protoCluster: {
    // Assembling cluster: groups still infalling
    massMin: 1e13,
    massMax: 1e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: false,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    allowedTransitions: ["poorCluster", "mergingCluster"],
    childFateWeights: {
      spiralGalaxy: 0.25, // still arriving from field
      lenticularGalaxy: 0.2, // transformation beginning
      ellipticalGalaxy: 0.15,
      dwarfIrregular: 0.1,
      dwarfSpheroid: 0.1,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05, // triggered by interactions
      diffuseHalo: 0.05,
    },
  },

  collapsingCluster: {
    // Active assembly: rapid transformation
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1.5,
    allowedTransitions: ["poorCluster", "mergingCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.25, // rapid stripping
      ellipticalGalaxy: 0.2,
      spiralGalaxy: 0.15, // surviving but being transformed
      quenchedRemnant: 0.15,
      dwarfSpheroid: 0.1,
      activeGalactic: 0.08, // merger-triggered
      dwarfIrregular: 0.05,
      diffuseHalo: 0.02,
    },
  },

  poorCluster: {
    // Bound but not massive
    massMin: 1e14,
    massMax: 5e14,
    dominantBaryonPhase: "mixed",
    gravitationallyBound: true,
    fateLockedBy: "gravitationalBinding",
    typicalTimescaleGyr: 2,
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    childFateWeights: {
      lenticularGalaxy: 0.25,
      ellipticalGalaxy: 0.2,
      spiralGalaxy: 0.15, // at outskirts
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      activeGalactic: 0.05,
      dwarfIrregular: 0.05, // rare, infalling
      diffuseHalo: 0.05,
    },
  },

  massiveCluster: {
    // Deep potential, hot ICM
    massMin: 5e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "thermalization",
    typicalTimescaleGyr: 3,
    allowedTransitions: ["mergingCluster", "relaxedCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35, // dominant population
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.15,
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.05, // rare, at outskirts
      activeGalactic: 0.05,
      diffuseHalo: 0.05,
    },
  },

  mergingCluster: {
    // Active cluster-cluster merger
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 1,
    allowedTransitions: ["relaxedCluster", "nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.25,
      lenticularGalaxy: 0.2,
      quenchedRemnant: 0.15,
      activeGalactic: 0.15, // merger-triggered AGN
      dwarfSpheroid: 0.1,
      spiralGalaxy: 0.08,
      diffuseHalo: 0.07, // tidal debris from interactions
    },
  },

  relaxedCluster: {
    // Dynamically relaxed
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 4,
    allowedTransitions: ["coolCoreCluster", "nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.35,
      lenticularGalaxy: 0.25,
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.05, // rare, recent infall
      diffuseHalo: 0.05,
    },
  },

  coolCoreCluster: {
    // Central cooling, AGN feedback balance
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "coolingFeedbackBalance",
    typicalTimescaleGyr: 5,
    allowedTransitions: ["nonCoolCoreCluster"],
    childFateWeights: {
      ellipticalGalaxy: 0.4, // includes BCG
      lenticularGalaxy: 0.2,
      dwarfSpheroid: 0.15,
      activeGalactic: 0.1, // central AGN in BCG
      quenchedRemnant: 0.1,
      spiralGalaxy: 0.03, // very rare
      diffuseHalo: 0.02,
    },
  },

  nonCoolCoreCluster: {
    // Merger-heated, no cool core
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: false,
    typicalTimescaleGyr: 3,
    allowedTransitions: ["coolCoreCluster"],
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
    // Terminal state: one giant elliptical dominates
    massMin: 1e14,
    dominantBaryonPhase: "plasma",
    gravitationallyBound: true,
    fateLockedBy: "dynamicalRelaxation",
    typicalTimescaleGyr: 6,
    allowedTransitions: [],
    childFateWeights: {
      ellipticalGalaxy: 0.5, // central giant dominates
      dwarfSpheroid: 0.2,
      quenchedRemnant: 0.15,
      lenticularGalaxy: 0.1,
      diffuseHalo: 0.05, // intracluster light
    },
  },
}

```

Done. Updated CLUSTER_SCALE_FATES.ts with:

1. Reference to AGENTS.md in the `childFateWeights` type comment
2. Brief fate-level comments (e.g., "Active assembly: rapid transformation")
3. Context-specific inline comments where they add value:

| Fate | Comments Added |
|------|----------------|
| **protoCluster** | `spiralGalaxy` → "still arriving from field", `lenticularGalaxy` → "transformation beginning", `activeGalactic` → "triggered by interactions" |
| **collapsingCluster** | `lenticularGalaxy` → "rapid stripping", `spiralGalaxy` → "surviving but being transformed", `activeGalactic` → "merger-triggered" |
| **poorCluster** | `spiralGalaxy` → "at outskirts", `dwarfIrregular` → "rare, infalling" |
| **massiveCluster** | `ellipticalGalaxy` → "dominant population", `spiralGalaxy` → "rare, at outskirts" |
| **mergingCluster** | `activeGalactic` → "merger-triggered AGN", `diffuseHalo` → "tidal debris from interactions" |
| **relaxedCluster** | `spiralGalaxy` → "rare, recent infall" |
| **coolCoreCluster** | `ellipticalGalaxy` → "includes BCG", `activeGalactic` → "central AGN in BCG", `spiralGalaxy` → "very rare" |
| **fossilCluster** | `ellipticalGalaxy` → "central giant dominates", `diffuseHalo` → "intracluster light" |

---

**User**

@app/model/GALACTIC_SCALE_FATES.ts:20 If we're removing the comment, can we change this property to include the units?



And add a note to the AGENTS.md about including the units in the property names.

---

**Cursor**

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
 */
export const GALACTIC_SCALE_FATES: Record<
  GalacticScaleFateKey,
  GalacticScaleFateCharacteristics
> = {
  diffuseHalo: {
    stellarMassMin: 1e4,
    stellarMassMax: 1e7,
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
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
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
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
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
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e6,
    stellarMassMax: 1e9,
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
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
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
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e5,
    stellarMassMax: 1e8,
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
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e9,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e10,
    stellarMassMax: 1e12,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e10,
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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
    stellarMassMin: 1e9,
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

```

```typescript
import type { InterstellarScaleFateKey } from "./INTERSTELLAR_SCALE_FATES"

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
 * fate paints its interstellar children, it paints what will exist there:
 *
 *   • spiralGalaxy → GMCs, HII regions, open clusters
 *   • ellipticalGalaxy → evolved field, globular clusters
 *
 * Transitions between galactic fates are caused by external events:
 *   • spiralGalaxy → ellipticalGalaxy (major merger)
 *   • spiralGalaxy → lenticularGalaxy (gas stripping)
 *
 * When a galactic fate transitions, it repaints its interstellar children.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 *   • morphologicalRelaxation — violent relaxation produces pressure-supported
 *     elliptical structure; disk rebuilding is extremely unlikely
 *
 *   • gasExhaustion — gas reservoir permanently depleted; star formation
 *     cannot resume without external resupply
 *
 *   • tidalDisruption — galaxy is being torn apart by a larger system
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

```

```markdown
# Guidelines for LLMs editing fate files

## Core principle: Fates are destinations

When a parent parcel "paints" its children, it paints **final outcomes**, not initial states. A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs, and gas that will exist when the process completes.

## Inline comments on childFateWeights

Only add comments that explain why a weight makes sense in THIS context. Don't restate what the child fate is (that's documented in the child's fate file).

**Good:** `star: 0.45, // massive OB stars ionizing the region`

**Bad:** `whiteDwarf: 0.2, // electron-degenerate remnant`

The good example explains context (why stars in an HII region are specifically OB stars). The bad example just restates the definition of a white dwarf.

## Units in property names

Include units in property names instead of documenting them in comments:

**Good:** `stellarMassMinMsun`, `typicalTimescaleGyr`, `sizePcMin`

**Bad:** `stellarMassMin: number // solar masses`

Common unit suffixes: `Msun` (solar masses), `Gyr`/`Myr` (time), `Pc` (parsecs), `Mpc`/`Kpc` (megaparsecs/kiloparsecs).

```

Done. Updated:

1. **GALACTIC_SCALE_FATES.ts**: Renamed `stellarMassMin` → `stellarMassMinMsun` and `stellarMassMax` → `stellarMassMaxMsun`

2. **AGENTS.md**: Added new section:

```markdown
## Units in property names

Include units in property names instead of documenting them in comments:

**Good:** `stellarMassMinMsun`, `typicalTimescaleGyr`, `sizePcMin`

**Bad:** `stellarMassMin: number // solar masses`

Common unit suffixes: `Msun` (solar masses), `Gyr`/`Myr` (time), `Pc` (parsecs), `Mpc`/`Kpc` (megaparsecs/kiloparsecs).
```

```markdown
## Units in property names

Include units in property names instead of documenting them in comments:

**Good:** `stellarMassMinMsun`, `typicalTimescaleGyr`, `sizePcMin`

**Bad:** `stellarMassMin: number // solar masses`

Common unit suffixes: `Msun` (solar masses), `Gyr`/`Myr` (time), `Pc` (parsecs), `Mpc`/`Kpc` (megaparsecs/kiloparsecs).
```

---

**User**

 @app/model/WEB_SCALE_FATES.ts:23 Why is this called "cell"?

---

**Cursor**

Good catch. "Cell" is inconsistent with the "parcel" terminology used throughout the model. This fate represents a Mpc1 child where no groups or clusters form—essentially "nothing here."

Better names might be:
- `empty` — simple, clear
- `noStructure` — more descriptive
- `emptySpace` — matches the physical meaning

Would you like me to rename it? My preference would be just `empty` for simplicity.

---

**User**

Let's do "empty".

---

**Cursor**

```typescript
type WebScaleFateKey = "void" | "sheet" | "filament" | "node" | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
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
  | "empty"

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) cells have each fate.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
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
 *   • void → mostly empty, rare isolated groups
 *   • node → clusters form at filament intersections
 *
 * The only true irreversibility is **capture into a bound halo**, at which
 * point the parcel exits the web-scale model entirely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   • 0D (nodes) — filament intersections, cluster formation sites
 *   • 1D (filaments) — matter transport corridors
 *   • 2D (sheets) — weak overdensities, early group formation
 *   • 3D (voids) — underdense regions, suppressed structure formation
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
      emptyCell: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
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
      emptyCell: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
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
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      emptyCell: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
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
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
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
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
type WebScaleFateKey = "void" | "sheet" | "filament" | "node" | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
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
  | "empty"

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
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
 *   • void → mostly empty, rare isolated groups
 *   • node → clusters form at filament intersections
 *
 * The only true irreversibility is **capture into a bound halo**, at which
 * point the parcel exits the web-scale model entirely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   • 0D (nodes) — filament intersections, cluster formation sites
 *   • 1D (filaments) — matter transport corridors
 *   • 2D (sheets) — weak overdensities, early group formation
 *   • 3D (voids) — underdense regions, suppressed structure formation
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
      emptyCell: 0.9,
      unboundAssociation: 0.08,
      boundGroup: 0.02,
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
      emptyCell: 0.6,
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
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
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      emptyCell: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
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
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
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
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

```typescript
type WebScaleFateKey = "void" | "sheet" | "filament" | "node" | "infallRegion"

type WebLock =
  | "haloCapture" // matter enters a bound group/cluster halo
  | false

/**
 * Child fates at Mpc1 scale.
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
  | "empty"

type WebScaleFateCharacteristics = {
  typicalDensityContrast: number
  dominantBaryonPhase: "plasma"
  gravitationallyBound: boolean

  fateLockedBy: WebLock
  typicalScaleMpc: number
  allowedTransitions: WebScaleFateKey[]

  /**
   * Defines what fraction of child (Mpc1) parcels have each fate.
   * See AGENTS.md for guidelines on inline comments.
   */
  childFateWeights?: Partial<Record<Mpc1ScaleFateKey, number>>
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
 *   • void → mostly empty, rare isolated groups
 *   • node → clusters form at filament intersections
 *
 * The only true irreversibility is **capture into a bound halo**, at which
 * point the parcel exits the web-scale model entirely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DIMENSIONALITY
 *
 *   • 0D (nodes) — filament intersections, cluster formation sites
 *   • 1D (filaments) — matter transport corridors
 *   • 2D (sheets) — weak overdensities, early group formation
 *   • 3D (voids) — underdense regions, suppressed structure formation
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
      unboundAssociation: 0.08,
      boundGroup: 0.02,
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
      unboundAssociation: 0.25,
      boundGroup: 0.1,
      gasRichGroup: 0.05,
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
      unboundAssociation: 0.25,
      boundGroup: 0.25,
      gasRichGroup: 0.2,
      gasPoorGroup: 0.1,
      empty: 0.1,
      protoCluster: 0.05,
      fossilGroup: 0.03,
      infallingGroup: 0.02,
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
      protoCluster: 0.2,
      collapsingCluster: 0.15,
      boundGroup: 0.15,
      gasRichGroup: 0.15,
      infallingGroup: 0.1,
      relaxedCluster: 0.1,
      gasPoorGroup: 0.05,
      mergingCluster: 0.05,
      coolCoreCluster: 0.05,
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
      infallingGroup: 0.3,
      collapsingCluster: 0.2,
      relaxedCluster: 0.15,
      mergingCluster: 0.1,
      coolCoreCluster: 0.1,
      gasPoorGroup: 0.08,
      fossilGroup: 0.05,
      fossilCluster: 0.02,
    },
  },
}

```

Done. Renamed `emptyCell` → `empty` throughout, and also changed "cells" → "parcels" in the comment for consistency.

---

**User**

@app/model/WEB_SCALE_FATES.ts:26 What are the units on this?

---

**Cursor**

Density contrast is **dimensionless**—it's the ratio δ = (ρ - ρ̄) / ρ̄ where ρ̄ is the cosmic mean density.

- `0.1` = 10% denser than cosmic mean
- `1.0` = twice the cosmic mean
- `30` = 31× the cosmic mean

So no unit suffix needed, but the name could be clearer. Options:

1. Leave as-is (dimensionless quantities don't need units)
2. Rename to `densityContrastVsCosmicMean` to be explicit
3. Add a brief comment in the type: `// relative to cosmic mean (dimensionless)`

What's your preference?

---

**User**

@app/model/WEB_SCALE_FATES.ts:68-69 What does this mean?

---

**Cursor**

```plaintext
* the parcel leaves the web-scale model entirely and enters
* `GROUP_SCALE_FATES` or `CLUSTER_SCALE_FATES`.
```

Good question—that phrasing is confusing. It sounds like a parcel changes scales, which isn't how the model works.

What it's trying to say is: `infallRegion` is a **terminal state** for web-scale parcels (locked by `haloCapture`). Once a web-scale region becomes an infall region, it won't transition to other web-scale fates—it's permanently dominated by bound structures (its children are groups/clusters being captured).

But the phrasing "leaves the web-scale model and enters GROUP_SCALE_FATES" is misleading because:
1. The web-scale parcel doesn't "become" a group—it *contains* groups as children
2. Scales are hierarchical, not alternatives

Should I simplify or remove that sentence? Something like:

> The only true irreversibility is **capture into a bound halo** (`infallRegion`), which is a terminal state.

---

**User**

@app/model/index.ts:39-40 I feel like this FATES ARE DESTINATIONS section doesn't adequately convey what we decided in this conversation. Can you do better?

---

**Cursor**

```typescript
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive
 * a space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not because they evolve
 * faster, but because external forces are more likely to intervene.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not
 * *how many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented differently**
 * relative to their parent. This allows a tree of 2D simulations to fill a 3D
 * volume:
 *
 *   Milky Way (disk plane, galactic scale)
 *     ├── Orion Molecular Cloud Complex (interstellar scale, aligned with disk)
 *     │     ├── Orion Nebula Cluster (open cluster within GMC)
 *     │     │     └── Young stellar systems (tilted to cluster plane)
 *     │     └── Barnard's Loop (superbubble, aligned)
 *     ├── Local Bubble (superbubble containing Sol)
 *     │     └── Sol system (stellar scale, tilted 60° to galactic plane)
 *     └── Sagittarius Dwarf (satellite galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers
 * 3D structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: groups and clusters
   */
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STELLAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

Done. The revised section now captures:

1. **"Lanes, not stages"** — fates are parallel regimes, not sequential
2. **Final outcomes** — parent paints where children end up, not where they are now
3. **Transient phases are mechanisms** — collapsing cores, MS evolution aren't modeled as fates
4. **Concrete examples** of external events (WD accreting gas, multi-star collapse)
5. **Parent repainting** — how populations "age" without children internally evolving
6. **Timescale clarification** — shorter lifetimes mean higher intervention probability, not faster evolution

