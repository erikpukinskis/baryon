import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { GALACTIC_SCALE_FATE_COLOR_ARRAY } from "~/helpers/colors"

export const LegendDocs = (
  <Doc path="/Components/Legend">
    <h2>Horizontal (default)</h2>
    <Demo inline>
      <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />
    </Demo>

    <h2>Vertical</h2>
    <Demo inline>
      <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} direction="vertical" />
    </Demo>

    <h2>Custom Colors</h2>
    <Demo inline>
      <Legend
        colors={[
          { key: "hot", hex: "#ef4444", description: "Very hot" },
          { key: "warm", hex: "#f59e0b", description: "Warm" },
          { key: "cool", hex: "#3b82f6", description: "Cool" },
        ]}
      />
    </Demo>
  </Doc>
)
