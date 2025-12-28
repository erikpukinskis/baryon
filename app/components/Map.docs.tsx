import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import { GALACTIC_SCALE_FATE_COLOR_ARRAY } from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h2>Gas-Rich Group</h2>
    <Demo inline>
      <Map
        haloFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>

    <h2>Fossil Group</h2>
    <Demo inline>
      <Map
        haloFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      <Map
        haloFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)
