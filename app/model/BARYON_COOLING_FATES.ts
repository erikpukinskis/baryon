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
