import { styled } from "@stitches/react"
import React from "react"

/**
 * Convert camelCase to Title Case with spaces.
 * e.g., "spiralGalaxy" → "Spiral Galaxy"
 */
function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

const ContainerElement = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  // paddingBlock: "12px",
  rowGap: "4px",
  columnGap: "16px",

  variants: {
    direction: {
      horizontal: {
        flexDirection: "row",
      },
      vertical: {
        flexDirection: "column",
      },
    },
  },

  defaultVariants: {
    direction: "horizontal",
  },
})

const ItemElement = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
})

const SwatchElement = styled("div", {
  width: "16px",
  height: "16px",
  borderRadius: "3px",
  flexShrink: 0,
})

const LabelElement = styled("span", {
  fontSize: "13px",
  whiteSpace: "nowrap",
})

type LegendProps = {
  /**
   * Array of color items. Each item has a key, hex color, and optional description.
   * Items will be displayed in the order they appear in the array.
   */
  colors: Array<{
    key: string
    hex: string
    description?: string
  }>

  /**
   * Optional custom labels. If not provided, labels are derived from
   * the color keys by converting camelCase to Title Case.
   */
  labels?: Record<string, string>

  /** Layout direction. Default "horizontal". */
  direction?: "horizontal" | "vertical"
}

export const Legend: React.FC<LegendProps> = ({
  colors,
  labels,
  direction = "horizontal",
}) => {
  return (
    <ContainerElement direction={direction}>
      {colors.map((item) => (
        <ItemElement key={item.key}>
          <SwatchElement css={{ backgroundColor: item.hex }} />
          <LabelElement>
            {labels?.[item.key] ?? camelToTitle(item.key)}
          </LabelElement>
        </ItemElement>
      ))}
    </ContainerElement>
  )
}
