# Cluster and group scale fates combination
_Exported on 12/28/2025 at 20:37:30 PST from Cursor (2.1.50)_

---

**User**

What do you think about the possibility of combining the CLUSTER_SCALE_FATES and GROUP_SCALE_FATES into one?



Originally I had them separated because they have very different physics:

 - Groups: gas can cool, remain bound to galaxies

 - Clusters: gas is shock-heated to the virial temperature and stays hot



And we noted that they have different fate locks.



But we can model that now, different fates can have different fate locks.



And it was weird that they occupied the same spatial scale... I think I had a workaround to make that work, but that's another reason why it'd be nice to combine them.

---

**Cursor**

Let me read both files to understand their current structure and give you a thoughtful analysis.

```plaintext
Mpc1: {
  fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
},
```

This is a great question. Let me share my analysis:

## Arguments for Combining

**1. They're already at the same scale (Mpc1)**

Looking at `index.ts`:

```147:149:app/model/index.ts
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
```

Having two fate files at one scale is the odd one out in your hierarchy. It creates a special case that code has to handle.

**2. It's a continuous mass spectrum**

Groups (10¹¹–10¹³ M☉) and clusters (10¹³+) are really the same physical object—a dark matter halo—at different masses. The transition at ~10¹³ M☉ is gradual, not a sharp boundary. A "proto-cluster" and a "bound group" are essentially the same thing at slightly different masses.

**3. The physics difference is already captured per-fate**

This is the key insight. The difference between "gas can cool" vs "gas is shock-heated" isn't a *file-level* distinction—it's a *fate-level* distinction:

- `gasRichGroup` has `dominantBaryonPhase: "mixed"` 
- `massiveCluster` has `dominantBaryonPhase: "plasma"`

The fate itself knows its physics. The file boundary adds nothing.

**4. Natural transitions become explicit**

Right now you have `infallingGroup` as a terminal state being "absorbed"—but absorbed into what? A cluster. Having them together makes transitions like `boundGroup` → `protoCluster` (via accretion) or `gasRichGroup` → `infallingGroup` → (cluster integration) more coherent.

## What It Would Look Like

You'd unify the lock types:

```typescript
type HaloScaleLock =
  | "gravitationalBinding"    // shared by both
  | "thermalization"          // cluster-specific
  | "dynamicalRelaxation"     // cluster-specific  
  | "coolingFeedbackBalance"  // cluster-specific
  | "dynamicalExhaustion"     // group-specific
  | "externalCapture"         // group-specific
  | false
```

And standardize the mass property (`haloMassMinMsun` vs `massMin`—groups already use the better naming convention).

A good name might be `HALO_SCALE_FATES` since that's what they both fundamentally are: dark matter halos at different masses hosting galaxy populations.

## One Caution

The combined file would have ~15 fates, which is manageable but on the larger side. You might consider whether some of the cluster fates are redundant. For example, `relaxedCluster` → `coolCoreCluster` | `nonCoolCoreCluster` feels like it could potentially collapse.

---

**My recommendation**: Combine them. The separation was a modeling-time decision that made sense before per-fate locks were supported. Now it's just adding complexity and a special case to your scale→fate mapping.

Want me to draft the combined `HALO_SCALE_FATES.ts`?

```typescript
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
```

```typescript
type HaloScaleLock =
  | "gravitationalBinding"    // shared by both
  | "thermalization"          // cluster-specific
  | "dynamicalRelaxation"     // cluster-specific  
  | "coolingFeedbackBalance"  // cluster-specific
  | "dynamicalExhaustion"     // group-specific
  | "externalCapture"         // group-specific
  | false
```

---

**User**

What is halo?

---

**Cursor**

Great question! In astrophysics, a **dark matter halo** is an invisible gravitational structure made of dark matter that surrounds and contains visible structures like galaxies, galaxy groups, and galaxy clusters.

## The Key Concept

Visible matter (stars, gas, galaxies) doesn't hold itself together—dark matter does. Think of a halo as an invisible "container" or "well" of gravity:

| Halo Mass | What Lives Inside |
|-----------|-------------------|
| ~10¹⁰–10¹² M☉ | A single galaxy (like the Milky Way) |
| ~10¹²–10¹³ M☉ | A galaxy **group** (a few galaxies orbiting together) |
| ~10¹³–10¹⁵ M☉ | A galaxy **cluster** (hundreds to thousands of galaxies) |

## Why "Halo"?

The name comes from how dark matter is distributed: it forms a roughly spherical cloud (or "halo") extending well beyond the visible matter. The Milky Way's visible disk is ~100,000 light-years across, but its dark matter halo extends ~1 million light-years.

## In Your Model

Your `GROUP_SCALE_FATES` and `CLUSTER_SCALE_FATES` are really describing different **mass regimes of the same thing**—dark matter halos. The physics changes because:

- **Low-mass halos** (groups): Gas can radiatively cool and fall onto galaxies
- **High-mass halos** (clusters): Infalling gas gets shock-heated to ~10⁷–10⁸ K and stays hot (the ICM—intracluster medium)

That's why `HALO_SCALE_FATES` would be a good unified name—it reflects that groups and clusters are really the same underlying structure, just at different masses with different thermodynamic behavior.

---

**User**

Could we reduce the number of fates in the combined scale?



Please review FATES ARE DESTINATIONS, NOT STAGES from index.ts, and make sure you are only including truly separate "lanes" of evolution.

---

**Cursor**

Excellent question. Let me apply that principle rigorously.

## Analyzing Current Fates Against "Destinations, Not Stages"

Looking at the 15 current fates, many are **stages** along an evolutionary path rather than distinct **destinations**:

### Stages to Cut (Transient Phases)

| Fate | Why it's a stage |
|------|------------------|
| `unboundAssociation` | Will become bound or disperse—not a destination |
| `boundGroup` | Intermediate before gas-rich/poor differentiation |
| `protoCluster` | Assembling—will become a cluster |
| `collapsingCluster` | Active assembly phase |
| `poorCluster` | Just a less massive cluster, same ultimate physics |
| `massiveCluster` | Just a more massive cluster, same physics |
| `mergingCluster` | An **event**, not a destination |
| `relaxedCluster` | Transition state toward cool-core or non-cool-core |
| `infallingGroup` | The group is **destroyed**—its galaxies get repainted by the absorbing cluster. This is a transition mechanism, not a fate. |

### True Destinations (Distinct "Lanes")

These have genuinely different **equilibrium physics** that produce different galaxy populations:

| Fate | Why it's a destination |
|------|------------------------|
| **gasRichGroup** | Low-mass halo where gas can cool → spirals, irregulars |
| **gasPoorGroup** | Low-mass halo, gas depleted → lenticulars, quenched dwarfs |
| **fossilGroup** | Low-mass halo, dynamical friction exhausted → single dominant elliptical |
| **coolCoreCluster** | High-mass halo with AGN/cooling equilibrium → BCG + ellipticals |
| **nonCoolCoreCluster** | High-mass halo, merger-heated, no central cooling → ellipticals |
| **fossilCluster** | High-mass halo, one giant elliptical dominates (2+ mag gap) |

## Proposed: 6 Fates (down from 15)

```
gasRichGroup       ──┐
gasPoorGroup       ──┼── low-mass halos (10¹²–10¹³ M☉)
fossilGroup        ──┘

coolCoreCluster    ──┐
nonCoolCoreCluster ──┼── high-mass halos (10¹⁴+ M☉)
fossilCluster      ──┘
```

### What This Preserves

- **Gas physics distinction**: Gas-rich (cooling works) vs. hot ICM (gas shock-heated)
- **Dynamical exhaustion**: Fossil systems where merging is complete
- **Cool-core vs. non-cool-core**: The real bimodality in cluster central physics
- **Different childFateWeights**: Each of these 6 produces a genuinely different galaxy population

### What About Transitions?

The transitions between these destinations are caused by **external events**:
- `gasRichGroup` → `gasPoorGroup`: ram pressure stripping, starvation
- `gasPoorGroup` → `fossilGroup`: dynamical friction (mergers)
- `gasRichGroup` → `coolCoreCluster`: accretion grows mass above ~10¹³ M☉
- `coolCoreCluster` ↔ `nonCoolCoreCluster`: cluster-cluster mergers heat/cool cycles
- Any → `fossilCluster`: long dynamical friction timescale

Want me to draft the combined 6-fate `HALO_SCALE_FATES.ts`? You'll need to switch to Agent mode for that.

```plaintext
gasRichGroup       ──┐
gasPoorGroup       ──┼── low-mass halos (10¹²–10¹³ M☉)
fossilGroup        ──┘

coolCoreCluster    ──┐
nonCoolCoreCluster ──┼── high-mass halos (10¹⁴+ M☉)
fossilCluster      ──┘
```

---

**User**

Great, let's do it.

---

**Cursor**

Now I understand the usage. Let me create the consolidated `HALO_SCALE_FATES.ts`:

```typescript
import type { GalacticScaleFateKey } from "./GALACTIC_SCALE_FATES"

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

```

```typescript
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { HALO_SCALE_FATES } from "./HALO_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
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
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
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
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
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
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
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
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
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
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
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

```typescript
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { HALO_SCALE_FATES } from "./HALO_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
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
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
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
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
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
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
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
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
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
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
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
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
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
import { HALO_SCALE_FATES, type HaloScaleFateKey } from "~/model/HALO_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES

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
import { HALO_SCALE_FATES, type HaloScaleFateKey } from "~/model/HALO_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES

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
 * Observe the halo-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of halo fates.
 * For now, uses a uniform distribution (all halo fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain halo fate weights.
 */
function observeHaloFate(
  coords: Coordinates,
  universeSeed: number
): HaloScaleFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe halo fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all halo fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<HaloScaleFateKey, number>> = {
    gasRichGroup: 0.25,
    gasPoorGroup: 0.25,
    fossilGroup: 0.1,
    coolCoreCluster: 0.15,
    nonCoolCoreCluster: 0.15,
    fossilCluster: 0.1,
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
import { HALO_SCALE_FATES, type HaloScaleFateKey } from "~/model/HALO_SCALE_FATES"

type GalacticFateKey = keyof typeof GALACTIC_SCALE_FATES

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
 * Observe the halo-scale fate at the given Mpc1 coordinates.
 *
 * Uses Perlin noise to sample from the space of halo fates.
 * For now, uses a uniform distribution (all halo fates equally likely).
 *
 * TODO: Use parent (Mpc10) web-scale fate to constrain halo fate weights.
 */
function observeHaloFate(
  coords: Coordinates,
  universeSeed: number
): HaloScaleFateKey {
  const mpc1 = coords.Mpc1
  const mpc10 = coords.Mpc10

  if (!mpc1 || !mpc10) {
    throw new Error("Mpc1 and Mpc10 coordinates required to observe halo fate")
  }

  // Compute a seed for this Mpc1 tile based on its absolute position
  const tileSeed = universeSeed + mpc10[0] * 1000 + mpc10[1] * 100

  // Sample Perlin noise at the Mpc1 position within the Mpc10 tile
  const noiseValue = perlin2d(mpc1[0], mpc1[1], tileSeed)

  // For now, use uniform weights across all halo fates
  // TODO: Get weights from parent (web-scale) fate
  const uniformWeights: Partial<Record<HaloScaleFateKey, number>> = {
    gasRichGroup: 0.25,
    gasPoorGroup: 0.25,
    fossilGroup: 0.1,
    coolCoreCluster: 0.15,
    nonCoolCoreCluster: 0.15,
    fossilCluster: 0.1,
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
  const parentFate = observeHaloFate(coords, universeSeed)
  const parentCharacteristics = HALO_SCALE_FATES[parentFate]

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

Done! I've consolidated 15 fates down to 6:

## Summary

**Old (15 fates across 2 files):**
- `GROUP_SCALE_FATES`: unboundAssociation, boundGroup, gasRichGroup, gasPoorGroup, fossilGroup, infallingGroup
- `CLUSTER_SCALE_FATES`: protoCluster, collapsingCluster, poorCluster, massiveCluster, mergingCluster, relaxedCluster, coolCoreCluster, nonCoolCoreCluster, fossilCluster

**New (6 fates in 1 file):**

| Fate | Mass Range | Key Physics |
|------|------------|-------------|
| `gasRichGroup` | 10¹²–10¹³ M☉ | Gas can cool → spirals, irregulars |
| `gasPoorGroup` | 10¹²–10¹³ M☉ | Gas depleted → lenticulars, quenched |
| `fossilGroup` | 10¹²–10¹³ M☉ | Merging exhausted → single elliptical |
| `coolCoreCluster` | 10¹⁴+ M☉ | AGN/cooling equilibrium → BCG + ellipticals |
| `nonCoolCoreCluster` | 10¹⁴+ M☉ | Merger-heated → ellipticals |
| `fossilCluster` | 10¹⁴+ M☉ | Terminal → giant elliptical + dwarfs |

**Files changed:**
- Created `HALO_SCALE_FATES.ts`
- Updated `index.ts` to import the new file
- Updated `findGalaxies.ts` to use `HaloScaleFateKey` and `observeHaloFate`
- Deleted `GROUP_SCALE_FATES.ts` and `CLUSTER_SCALE_FATES.ts`

All tests pass ✓

---

**User**

Please rename STELLAR_SCALE_FATES to STAR_SCALE_FATES

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

```

```typescript
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { HALO_SCALE_FATES } from "./HALO_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./STAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
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
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
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
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
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
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
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
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
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
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
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
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
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

```typescript
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES"
import { HALO_SCALE_FATES } from "./HALO_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./STAR_SCALE_FATES"
import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
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
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
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
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
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
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
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
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
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
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
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
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
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
    fates: { STAR_SCALE_FATES },
  },

  // AU1: {
  //   fates: { PLANETARY_SCALE_FATES }
  // }
}

export type ScaleKey = keyof typeof SCALES

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import type { StarScaleFateKey } from "./STAR_SCALE_FATES"

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

```

```typescript
import type { StarScaleFateKey } from "./STAR_SCALE_FATES"

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
 *  - BARYON_COOLING_FATES: "Can this matter cool and collapse?"
 *  - STAR_SCALE_FATES: "What does it become once it does?"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE IDEA
 *
 * In the early universe, **cooling—not mass—was the limiting factor**.
 * Most baryons never formed stars because they:
 *   - Remained coupled to radiation
 *   - Lacked molecular or metal cooling channels
 *   - Never fell into deep gravitational potential wells
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

Done! Renamed `STELLAR_SCALE_FATES` → `STAR_SCALE_FATES`:

- Created `STAR_SCALE_FATES.ts` with `StarScaleFateKey` type
- Updated imports in `index.ts`, `INTERSTELLAR_SCALE_FATES.ts`, and `BARYON_COOLING_FATES.ts`
- Deleted old `STELLAR_SCALE_FATES.ts`

All tests pass ✓

