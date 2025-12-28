/**
 * NOTE: Color arrays should be ordered from LEAST active → MOST active.
 */

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

type FateColor = {
  key: string
  hex: string
  description: string
}

// TODO: Make FateColor generic so we can be more strict about the key: FateColor<WebScaleFateKey>
export const WEB_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "empty",
    hex: "#000000",
    description: "Pure black. No structure, no matter — the cosmic void.",
  },
  {
    key: "void",
    hex: "#0a0a0f",
    description:
      "Near-black with a hint of blue. Vast underdense regions where structure formation is suppressed.",
  },
  {
    key: "sheet",
    hex: "#1a1a2e",
    description:
      "Dark blue-gray. Weak overdensities, the walls between voids where early groups form.",
  },
  {
    key: "filament",
    hex: "#2d3a4a",
    description:
      "Steel blue. Matter transport corridors connecting nodes, where groups and clusters form.",
  },
  {
    key: "node",
    hex: "#4a5568",
    description:
      "Slate gray. Filament intersections where clusters form — the densest web-scale structures.",
  },
  {
    key: "infallRegion",
    hex: "#6b7280",
    description:
      "Warm gray. Terminal state — matter captured into bound halos, no longer part of the free web.",
  },
]

/**
 * Colors for halo-scale fates (Mpc1 scale) — children of web-scale parents.
 * Includes both stable halo fates and transitional states.
 */
export const HALO_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "unboundAssociation",
    hex: "#1a1a2e",
    description:
      "Dark indigo. Loose associations of galaxies not yet gravitationally bound.",
  },
  {
    key: "boundGroup",
    hex: "#2d3a4a",
    description: "Steel blue. Gravitationally bound but not yet virialized.",
  },
  {
    key: "gasRichGroup",
    hex: "#3a6b8c",
    description:
      "Ocean blue. Gas-rich group where cooling works and spirals thrive.",
  },
  {
    key: "gasPoorGroup",
    hex: "#5a7a8a",
    description: "Dusty teal. Gas depleted, star formation quenched.",
  },
  {
    key: "fossilGroup",
    hex: "#7a8a7a",
    description:
      "Sage gray. Single giant elliptical dominates after mergers complete.",
  },
  {
    key: "infallingGroup",
    hex: "#6b5a7a",
    description: "Dusty purple. Groups falling into larger structures.",
  },
  {
    key: "protoCluster",
    hex: "#4a5a8a",
    description:
      "Deep blue-gray. Early cluster formation, multiple groups assembling.",
  },
  {
    key: "collapsingCluster",
    hex: "#5a4a7a",
    description: "Violet-gray. Actively collapsing, shocks forming.",
  },
  {
    key: "relaxedCluster",
    hex: "#8a5a6a",
    description: "Dusty rose. Virialized but cooling not yet established.",
  },
  {
    key: "coolCoreCluster",
    hex: "#9a6a5a",
    description: "Warm copper. Central cooling with AGN feedback equilibrium.",
  },
  {
    key: "mergingCluster",
    hex: "#aa5a5a",
    description: "Brick red. Major merger in progress, highly disturbed.",
  },
  {
    key: "nonCoolCoreCluster",
    hex: "#8a6a6a",
    description: "Muted rose. Merger-heated, no central cooling established.",
  },
  {
    key: "fossilCluster",
    hex: "#6a6a6a",
    description:
      "Neutral gray. Terminal state — one giant elliptical dominates.",
  },
]

export const GALACTIC_SCALE_FATE_COLOR_ARRAY: FateColor[] = [
  {
    key: "diffuseHalo",
    hex: "#0d1117",
    description:
      "Near-black. A 'failed galaxy' with minimal stellar content — just dark matter and sparse gas. Should almost disappear into cosmic void.",
  },
  {
    key: "quenchedRemnant",
    hex: "#4b5563",
    description:
      "Gray. Completely dead — no star formation, no AGN, just quietly fading. The obvious choice for something with no activity left.",
  },
  {
    key: "dwarfSpheroid",
    hex: "#c9a66b",
    description:
      "Warm tan. Old, gas-poor, dominated by ancient red giants. The golden warmth evokes an aged stellar population — no blue young stars remain.",
  },
  {
    key: "ellipticalGalaxy",
    hex: "#c2555a",
    description:
      "Rose-red. The most massive galaxies, dominated by old red stars. Deep rose suggests power and age — the 'red and dead' giants of clusters.",
  },
  {
    key: "lenticularGalaxy",
    hex: "#d4915d",
    description:
      "Amber. Transitional — disk structure remains but star formation has quenched. Warmer than spiral's teal but not as dead as spheroidals. A 'sunset' galaxy.",
  },
  {
    key: "dwarfIrregular",
    hex: "#4a7c9b",
    description:
      "Dusty blue. Gas-rich, chaotic, actively star-forming. The blue suggests young hot O/B stars, but muted to reflect their messy, clumpy nature. Think LMC/SMC.",
  },
  {
    key: "activeGalactic",
    hex: "#8b5cf6",
    description:
      "Violet. Powered by an accreting supermassive black hole, emitting across the spectrum including X-rays. Purple suggests high-energy, exotic physics.",
  },
  {
    key: "spiralGalaxy",
    hex: "#3fb5a3",
    description:
      "Cyan-teal. Active star formation in spiral arms. The cyan suggests young blue stars but with enough green to feel 'alive' and growing.",
  },
]

/**
 * The empty fate color — used for cosmic voids and fallback states.
 */
export const EMPTY_FATE_COLOR = WEB_SCALE_FATE_COLOR_ARRAY[0] // "empty" is first in array

/**
 * All fate colors combined, keyed by fate name.
 * Includes web-scale, galactic-scale, and future scale fates.
 */
export const COLORS_BY_KEY = [
  ...WEB_SCALE_FATE_COLOR_ARRAY,
  ...HALO_SCALE_FATE_COLOR_ARRAY,
  ...GALACTIC_SCALE_FATE_COLOR_ARRAY,
].reduce((acc, { key, hex, description }) => {
  acc[key] = {
    hex,
    label: camelToTitle(key),
    description,
  }
  return acc
}, {} as Record<string, { hex: string; label: string; description: string }>)
