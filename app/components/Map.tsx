import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  type Coordinate,
  type ParentFateKey,
  getFateCharacteristics,
} from "~/model"

type MapProps = {
  /**
   * The fate of the parent parcel. This determines what child fates appear
   * in this tile via childFateWeights.
   *
   * For example:
   * - A halo fate (e.g. "gasRichGroup") determines galactic fates
   * - A web fate (e.g. "filament") determines halo fates
   * - A galactic fate (e.g. "spiralGalaxy") determines interstellar fates
   */
  parentFate: ParentFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The x,y values encode positions across multiple scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  parentFate,
  coordinate,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // TODO: validate that parentFate matches the coordinate scale?

    // Get parent's childFateWeights
    const parentCharacteristics = getFateCharacteristics(parentFate)
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        const noiseValue = perlin2d(x, y, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate].hex
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }, [parentFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}
