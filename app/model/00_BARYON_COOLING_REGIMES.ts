import type { WebScaleFateKey } from "./01_WEB_SCALE_FATES"

export type BaryonicCoolingRegimeKey =
  | "radiationCoupled"
  | "acousticFluid"
  | "recombinedGas"
  | "noCooling"
  | "popIIIStarFormation"
  | "metalCooling"

type BaryometricCharacteristics = {
  minTemperatureK?: number
  maxTemperatureK?: number
  freeElectronAbundance?: number
  thomsonToExpansionRatio?: number
  h2Fraction?: number
  metallicity?: number
  requiresDarkMatterHalo?: boolean
  canGravitate?: boolean
  primordialLithiumPreserved?: boolean
  lithiumDestroyed?: boolean

  /**
   * Defines what fraction of child (web-scale) parcels have each fate.
   * Only regimes where canGravitate=true produce cosmic web structure.
   */
  childFateWeights: Partial<Record<WebScaleFateKey, number>>
}

/**
 * BARYON_COOLING_REGIMES
 * ----------------------
 *
 * Early-universe and diffuse-regime thermal states of baryonic matter,
 * *before* it becomes a bound object with a locked fate.
 *
 * These are thermodynamic REGIMES—not fates. They determine whether matter
 * CAN collapse, not what it becomes once it does. Regimes gate access to
 * structural fates (stars, galaxies) but do not replace them.
 *
 *  - BARYON_COOLING_REGIMES: "Can this matter cool and collapse?"
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
 * REGIMES ARE NOT FATES
 *
 * Unlike structural fates (which lock), cooling regimes are:
 *   - REVERSIBLE: Matter can transition back and forth
 *   - TIME-DEPENDENT: The regime at time T₁ doesn't determine time T₂
 *   - DERIVED: The regime is computed from underlying physical quantities
 *     (temperature, density, ionization) via threshold logic
 *
 * The underlying quantities are tracked as splines over cosmic time.
 * At any observation time, evaluate the splines → derive the regime.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHILD FATE WEIGHTS
 *
 * Only regimes where canGravitate=true produce cosmic web structure.
 * Earlier regimes (radiationCoupled, acousticFluid) have no children because
 * gravitational collapse is suppressed—the universe is still homogeneous.
 */
export const BARYON_COOLING_REGIMES: Record<
  BaryonicCoolingRegimeKey,
  BaryometricCharacteristics
> = {
  radiationCoupled: {
    minTemperatureK: 1e6,
    freeElectronAbundance: 1.0,
    thomsonToExpansionRatio: 1e5,
    canGravitate: false,
    primordialLithiumPreserved: true,
    childFateWeights: {}, // No structure forms—radiation pressure prevents collapse
  },

  acousticFluid: {
    minTemperatureK: 3000,
    maxTemperatureK: 1e6,
    freeElectronAbundance: 0.99,
    thomsonToExpansionRatio: 10,
    canGravitate: false,
    primordialLithiumPreserved: true,
    childFateWeights: {}, // No structure forms—acoustic oscillations, not collapse
  },

  recombinedGas: {
    maxTemperatureK: 3000,
    freeElectronAbundance: 1e-4,
    thomsonToExpansionRatio: 0.1,
    canGravitate: true,
    primordialLithiumPreserved: true,
    childFateWeights: {
      void: 0.6, // Voids dominate by volume
      sheet: 0.2, // Walls between voids
      filament: 0.15, // The "highways"
      node: 0.04, // Rare dense intersections
      infallRegion: 0.01, // Already captured into halos
    },
  },

  noCooling: {
    freeElectronAbundance: 1e-4,
    h2Fraction: 1e-7,
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: false,
    primordialLithiumPreserved: true,
    childFateWeights: {
      void: 0.85, // Mostly empty—can't collapse without cooling
      sheet: 0.15, // Some weak structure from dark matter
    },
  },

  popIIIStarFormation: {
    h2Fraction: 1e-4,
    metallicity: 0,
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
    childFateWeights: {
      void: 0.5, // Still mostly empty at cosmic scales
      sheet: 0.25,
      filament: 0.15,
      node: 0.08,
      infallRegion: 0.02,
    },
  },

  metalCooling: {
    metallicity: 1e-4,
    requiresDarkMatterHalo: true,
    canGravitate: true,
    lithiumDestroyed: true,
    childFateWeights: {
      void: 0.55, // Slightly more structure than primordial
      sheet: 0.2,
      filament: 0.15,
      node: 0.07,
      infallRegion: 0.03,
    },
  },
}
