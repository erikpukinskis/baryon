import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import {
  HALO_SCALE_FATES,
  type HaloScaleFateKey,
} from "~/model/02_HALO_SCALE_FATES"

type MapProps = {
  /**
   * The halo-scale fate determines what galactic fates appear in this tile.
   * Each halo fate has childFateWeights that define the probability
   * distribution over galactic fates.
   */
  haloFate: HaloScaleFateKey

  /**
   * Mpc10 coordinates — position of the web-scale parcel.
   * Used to compute the tile seed for deterministic noise.
   */
  mpc10: [number, number]

  /**
   * Mpc1 coordinates — position of this halo parcel within its web parcel.
   * Used to compute the tile seed for deterministic noise.
   */
  mpc1: [number, number]

  /**
   * Universe seed for reproducibility.
   * Same coordinates + seed always produces the same map.
   */
  universeSeed?: number

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  haloFate,
  mpc10,
  mpc1,
  universeSeed = 42,
  cellSize = 40,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get parent's childFateWeights
    const parentCharacteristics = HALO_SCALE_FATES[haloFate]
    const weights = parentCharacteristics.childFateWeights

    if (!weights || Object.keys(weights).length === 0) {
      // Fallback: if no weights, fill with empty
      ctx.fillStyle = EMPTY_FATE_COLOR.hex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    // Compute thresholds from weights
    const { keys, thresholds } = computeThresholds(weights)

    // Compute tile seed (same formula as observeGalacticFate in findGalaxies.ts)
    const tileSeed =
      universeSeed * 7 +
      mpc10[0] * 10000 +
      mpc10[1] * 1000 +
      mpc1[0] * 100 +
      mpc1[1]

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
  }, [haloFate, mpc10, mpc1, universeSeed, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}
