import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  generateDefaultField,
  rayMarchFromAbove,
} from "~/helpers/sparseFourier"
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The fate weights to sample from when painting child cells.
   * Keys are fate names, values are relative weights (will be normalized).
   *
   * NOTE: Currently unused. The fate is determined by 3D wavelet field
   * geometry via ray marching. Kept for backward compatibility.
   */
  childFateWeights: Partial<Record<string, number>>

  /**
   * Hierarchical coordinate identifying this tile.
   * Used as a seed for deterministic wavelet field generation.
   * In the future, this will also be used to look up observations.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
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

    // Compute tile seed from hierarchical coordinate
    const tileSeed = coordinate.x * 10000 + coordinate.y

    // Generate 3D wavelet field for this tile
    const field = generateDefaultField(tileSeed, gridSize)

    // Paint each cell by ray marching from above
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Scale coordinates to world space
        const worldX = (x / gridSize) * (field.maxX - field.minX) + field.minX
        const worldY = (y / gridSize) * (field.maxY - field.minY) + field.minY

        // Ray march from above to find first non-void
        const fate = rayMarchFromAbove(worldX, worldY, field)

        // Paint the cell
        ctx.fillStyle = COLORS_BY_KEY[fate]?.hex ?? EMPTY_FATE_COLOR.hex
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [coordinate, gridSize])

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
