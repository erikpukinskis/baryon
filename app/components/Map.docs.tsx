import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map parentFate="filament" coordinate={{ scale: "Mpc10", x: 5, y: 3 }} />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        parentFate="gasRichGroup"
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        parentFate="fossilGroup"
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        parentFate="coolCoreCluster"
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>
  </Doc>
)
