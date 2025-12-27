import type { GalacticScaleFateKey } from "~/model/03_GALACTIC_SCALE_FATES"

/**
 * Color palette for galactic-scale fates.
 *
 * The palette creates a visual gradient from "active" (cooler/brighter colors)
 * to "dead" (warmer/muted colors), reflecting the life cycle of galaxies.
 */
export const GALACTIC_SCALE_FATE_COLORS: Record<GalacticScaleFateKey, string> =
  {
    /**
     * Near-black. A "failed galaxy" with minimal stellar content — just dark
     * matter and sparse gas. Should almost disappear into cosmic void.
     */
    diffuseHalo: "#0d1117",

    /**
     * Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests
     * young hot O/B stars, but muted to reflect their messy, clumpy nature.
     * Think LMC/SMC.
     */
    dwarfIrregular: "#4a7c9b",

    /**
     * Warm tan. Old, gas-poor, dominated by ancient red giants. The golden
     * warmth evokes an aged stellar population — no blue young stars remain.
     */
    dwarfSpheroid: "#c9a66b",

    /**
     * Cyan-teal. Active star formation in spiral arms. The cyan suggests young
     * blue stars but with enough green to feel "alive" and growing.
     */
    spiralGalaxy: "#3fb5a3",

    /**
     * Amber. Transitional — disk structure remains but star formation has
     * quenched. Warmer than spiral's teal but not as dead as spheroidals.
     * A "sunset" galaxy.
     */
    lenticularGalaxy: "#d4915d",

    /**
     * Rose-red. The most massive galaxies, dominated by old red stars. Deep
     * rose suggests power and age — the "red and dead" giants of clusters.
     */
    ellipticalGalaxy: "#c2555a",

    /**
     * Violet. Powered by an accreting supermassive black hole, emitting across
     * the spectrum including X-rays. Purple suggests high-energy, exotic physics.
     */
    activeGalactic: "#8b5cf6",

    /**
     * Gray. Completely dead — no star formation, no AGN, just quietly fading.
     * The obvious choice for something with no activity left.
     */
    quenchedRemnant: "#4b5563",
  }
