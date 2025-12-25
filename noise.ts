/**
 * DETERMINISTIC NOISE FUNCTIONS
 * =============================
 *
 * These functions generate spatially coherent, deterministic values from
 * coordinates. They are used to sample fates in a way that:
 *
 *   - Is fully deterministic (same input → same output, always)
 *   - Has spatial coherence (nearby coordinates → similar values)
 *   - Tiles seamlessly across boundaries
 *
 * The noise value is then converted to a categorical fate via thresholds
 * derived from childFateWeights.
 */

/**
 * 2D Perlin noise implementation.
 *
 * Returns a value in [0, 1] for any (x, y) coordinate.
 * The same coordinates always produce the same value.
 *
 * @param x - X coordinate (can be any number)
 * @param y - Y coordinate (can be any number)
 * @param seed - Seed for this noise field (different seeds = different patterns)
 */
export function perlin2d(x: number, y: number, seed: number = 0): number {
  // Offset by seed to create different patterns
  x += seed * 17.1;
  y += seed * 31.7;

  // Grid cell coordinates
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  // Interpolation weights (smoothstep)
  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);

  // Gradient dot products at each corner
  const n00 = gradientDot(x0, y0, x, y);
  const n10 = gradientDot(x1, y0, x, y);
  const n01 = gradientDot(x0, y1, x, y);
  const n11 = gradientDot(x1, y1, x, y);

  // Bilinear interpolation
  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);
  const value = lerp(nx0, nx1, sy);

  // Normalize from [-1, 1] to [0, 1]
  return (value + 1) / 2;
}

/**
 * Smoothstep interpolation (for smoother noise)
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Compute gradient vector at grid point and dot with distance vector.
 * Uses a hash function to deterministically select gradient direction.
 */
function gradientDot(
  gridX: number,
  gridY: number,
  x: number,
  y: number
): number {
  // Hash the grid coordinates to get a pseudo-random gradient
  const hash = hashCoords(gridX, gridY);

  // Use hash to select one of 8 gradient directions
  const angle = (hash % 8) * (Math.PI / 4);
  const gradX = Math.cos(angle);
  const gradY = Math.sin(angle);

  // Distance from grid point to sample point
  const dx = x - gridX;
  const dy = y - gridY;

  // Dot product
  return dx * gradX + dy * gradY;
}

/**
 * Simple hash function for grid coordinates.
 * Produces a deterministic integer from any (x, y) pair.
 */
function hashCoords(x: number, y: number): number {
  // Large primes for mixing
  const h = Math.abs(
    Math.floor(
      Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    )
  );
  return h;
}

/**
 * Compute cumulative thresholds from weights.
 *
 * Given weights like { a: 0.3, b: 0.5, c: 0.2 }, returns:
 *   - keys: ['a', 'b', 'c']
 *   - thresholds: [0.3, 0.8, 1.0]
 *
 * A noise value of 0.5 would fall in band 'b' (between 0.3 and 0.8).
 */
export function computeThresholds<K extends string>(
  weights: Partial<Record<K, number>>
): { keys: K[]; thresholds: number[] } {
  const entries = Object.entries(weights) as [K, number][];

  // Sort by weight descending so high-probability fates get low thresholds
  // (This means "common" fates appear in the middle of the noise range,
  // which tends to give larger contiguous regions)
  entries.sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, w]) => sum + w, 0);

  let cumulative = 0;
  const keys: K[] = [];
  const thresholds: number[] = [];

  for (const [key, weight] of entries) {
    cumulative += weight / total;
    keys.push(key);
    thresholds.push(cumulative);
  }

  return { keys, thresholds };
}

/**
 * Sample a categorical fate from a noise value using thresholds.
 *
 * @param value - Noise value in [0, 1]
 * @param keys - Fate keys in threshold order
 * @param thresholds - Cumulative thresholds
 * @returns The fate key that this value falls into
 */
export function sampleFromThresholds<K extends string>(
  value: number,
  keys: K[],
  thresholds: number[]
): K {
  for (let i = 0; i < thresholds.length; i++) {
    if (value < thresholds[i]) {
      return keys[i];
    }
  }
  // Fallback to last key (shouldn't happen if thresholds sum to 1)
  return keys[keys.length - 1];
}

