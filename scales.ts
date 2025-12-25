import { WEB_SCALE_FATES } from "./WEB_SCALE_FATES";
import { GROUP_SCALE_FATES } from "./GROUP_SCALE_FATES";
import { CLUSTER_SCALE_FATES } from "./CLUSTER_SCALE_FATES";
import { GALACTIC_SCALE_FATES } from "./GALACTIC_SCALE_FATES";
import { STELLAR_SCALE_FATES } from "./STELLAR_SCALE_FATES";

/**
 * STARSHEET — A UNIVERSE SIMULATION MODEL
 * ========================================
 *
 * This project defines a model for simulating the universe at multiple scales,
 * intended to drive a space sandbox game called "Starsheet".
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
};

export type ScaleKey = keyof typeof SCALES;

export type Coordinates = Partial<Record<ScaleKey, [number, number]>>;
