import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   * // TODO add back an example here
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic noise generation.
   * NOTE: In the future this will not just be used as a seed, it will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  childFateWeights,
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

    if (!childFateWeights || Object.keys(childFateWeights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(childFateWeights)

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Paint each cell
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Sample Perlin noise at this position
        // Scale coordinates to avoid sampling at exact integers (which always returns 0.5)
        const noiseValue = perlin2d(x * 0.1, y * 0.1, tileSeed)

        // Convert to fate
        const fate = sampleFromThresholds(noiseValue, keys, thresholds)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate]?.hex ?? EMPTY_FATE_COLOR.hex
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [childFateWeights, coordinate, gridSize])

  // Canvas is always 1 pixel per cell; CSS scales to desired display size
  const displaySize = gridSize * cellSize

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize}
      height={gridSize}
      style={{
        width: displaySize,
        height: displaySize,
        imageRendering: "pixelated",
      }}
    />
  )
}
