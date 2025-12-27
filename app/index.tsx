import React from "react"
import { render } from "react-dom"
import { Map } from "~/components/Map"

render(
  <Map haloFate="gasRichGroup" mpc10={[5, 3]} mpc1={[2, 7]} />,
  document.getElementById("root")
)
