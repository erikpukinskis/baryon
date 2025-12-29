import { Demo, Doc } from "codedocs/macro"
import React from "react"
import { Legend } from "./Legend"
import { Map } from "./Map"
import {
  GALACTIC_SCALE_FATE_COLOR_ARRAY,
  HALO_SCALE_FATE_COLOR_ARRAY,
  INTERSTELLAR_SCALE_FATE_COLOR_ARRAY,
  WEB_SCALE_FATE_COLOR_ARRAY,
} from "~/helpers/colors"
import {
  COSMOLOGICAL_FATE,
  GALACTIC_SCALE_FATES,
  HALO_SCALE_FATES,
  WEB_SCALE_FATES,
} from "~/model"

export const MapDocs = (
  <Doc path="/Components/Map">
    <h2>Cosmological Scale (1000×1000)</h2>
    <Demo only inline>
      <Map
        childFateWeights={COSMOLOGICAL_FATE}
        coordinate={{ scale: "Mpc10", x: 0, y: 0 }}
        gridSize={1000}
        cellSize={0.5}
      />
    </Demo>
    <Legend colors={WEB_SCALE_FATE_COLOR_ARRAY} />

    <h2>Web-scale Parcels</h2>
    <h3>Filament</h3>
    <Demo inline>
      <Map
        childFateWeights={WEB_SCALE_FATES.filament.childFateWeights}
        coordinate={{ scale: "Mpc10", x: 5, y: 3 }}
      />
    </Demo>
    <Legend colors={HALO_SCALE_FATE_COLOR_ARRAY} />

    <h2>Halo-scale Parcels</h2>
    <h3>Gas-Rich Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.gasRichGroup.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 52, y: 37 }}
      />
    </Demo>
    <Legend colors={GALACTIC_SCALE_FATE_COLOR_ARRAY} />

    <h3>Fossil Group</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.fossilGroup.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 54, y: 32 }}
      />
    </Demo>

    <h3>Cool-Core Cluster</h3>
    <Demo inline>
      <Map
        childFateWeights={HALO_SCALE_FATES.coolCoreCluster.childFateWeights}
        coordinate={{ scale: "Mpc1", x: 58, y: 31 }}
      />
    </Demo>

    <h2>Galactic-scale Parcels</h2>
    <h3>Spiral Galaxy (100×100)</h3>
    <Demo inline>
      <Map
        childFateWeights={GALACTIC_SCALE_FATES.spiralGalaxy.childFateWeights}
        coordinate={{ scale: "kpc100", x: 523, y: 371 }}
        gridSize={100}
        cellSize={4}
      />
    </Demo>
    <Legend colors={INTERSTELLAR_SCALE_FATE_COLOR_ARRAY} />
  </Doc>
)
