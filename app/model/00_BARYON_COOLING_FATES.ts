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
