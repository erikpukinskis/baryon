import { DocsApp } from "codedocs/macro"
import "codedocs/style.css"
import React from "react"
import { render } from "react-dom"
import { HomePageDocs } from "./HomePage.docs"
import { LegendDocs } from "~/components/Legend.docs"
import { MapDocs } from "~/components/Map.docs"

render(
  <DocsApp
    icon="rocket"
    logo="Baryon"
    docs={[HomePageDocs, MapDocs, LegendDocs]}
  />,
  document.getElementById("root")
)
