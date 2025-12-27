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
      <Map haloFate="gasRichGroup" mpc10={[5, 3]} mpc1={[2, 7]} />
    </Demo>

    <h2>Fossil Group</h2>
    <Demo inline>
      <Map haloFate="fossilGroup" mpc10={[5, 3]} mpc1={[4, 2]} />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      <Map haloFate="coolCoreCluster" mpc10={[5, 3]} mpc1={[8, 1]} />
    </Demo>
  </Doc>
)
