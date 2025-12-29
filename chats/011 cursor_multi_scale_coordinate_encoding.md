# Multi-scale coordinate encoding strategy
_Exported on 12/28/2025 at 20:38:00 PST from Cursor (2.1.50)_

---

**User**

@app/components/Map.tsx:21-37 Let's talk about coordinates.



Can you recommend for me some sort of encoding which looks like this:

 - It encodes x,y coordinates at a "bottom" scale, which could be any of the scales: Mpc10, Mpc1, kpc100, etc.

 - It also encodes coordinates at zero or more contiguous larger scales. So, starting from the bottom a given coordinate might encode pc1..pc100, pc1..Mpc1, Mpc1..Mpc10, or whatever.

 - Wherever coordinates stop being provided, that just means we're at the origin at all the larger scales. So, a coordinate could literally just be x,y in pc1, but that would mean we're at 0,0 in pc100, 0,0 in kpc100, 0,0 in Mpc1, etc.



I don't think we need any kind of universe seed, because universes are BIG. I think there will be plenty of gameplay even within a single galaxy. And in a meaningful sense, moving over to another galaxy, or another cluster, or whatever _is_ changing the "seed".



It would be easy to model this in a verbose way, as an array of coordinates:



[

  { scale: "pc100", x: 1, y: 4 },

  { scale: "kpc100", x: 6, y:6 },

  { scale: "Mpc1", x: 0, y: 1}

]



But that feels quite heavy.



My intuition is this could all be baked into a single number using bitwise arithmetic.



Or maybe it's an [x,y, bottomScale] tuple but the x and y encode all of the coordinates at all the scales?



What do you think? Is any of this making sense?

---

**Cursor**

This is a really interesting coordinate design problem! Let me look at your actual scale system to give you a concrete recommendation.

Yes! This totally makes sense, and I love the thinking. Looking at your scale hierarchy:

```12:32:app/model/index.ts
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
```

The grid sizes between scales are:
- **Mpc10 → Mpc1**: 10×10 grid (0-9)
- **Mpc1 → kpc100**: 10×10 grid (0-9)  
- **kpc100 → pc100**: 1000×1000 grid (0-999)
- **pc100 → pc1**: 100×100 grid (0-99)

## Recommendation: `[x, y, bottomScale]` tuple

Your intuition is right! You can pack all coordinates into a single `x` and `y` using positional encoding:

```typescript
type ScaleKey = "pc1" | "pc100" | "kpc100" | "Mpc1" | "Mpc10"

type CoordinatePoint = [x: number, y: number, bottomScale: ScaleKey]
```

The `x` and `y` values are **hierarchical integers** where each "digit group" represents a different scale. The multipliers cascade based on grid sizes:

| Scale | Grid Size | Multiplier (from pc1) |
|-------|-----------|----------------------|
| pc1 | 100×100 | 1 |
| pc100 | 1000×1000 | 100 |
| kpc100 | 10×10 | 100,000 |
| Mpc1 | 10×10 | 1,000,000 |
| Mpc10 | — | 10,000,000 |

### Encoding

```typescript
// To encode coordinates at all scales into a single x value:
const x = pc1_x 
        + pc100_x  * 100 
        + kpc100_x * 100_000 
        + Mpc1_x   * 1_000_000 
        + Mpc10_x  * 10_000_000
```

### Decoding

```typescript
function decodeX(x: number): Record<ScaleKey, number> {
  return {
    Mpc10:  Math.floor(x / 10_000_000),
    Mpc1:   Math.floor(x / 1_000_000) % 10,
    kpc100: Math.floor(x / 100_000) % 10,
    pc100:  Math.floor(x / 100) % 1000,
    pc1:    x % 100,
  }
}
```

### Examples

```typescript
// Origin of the universe at pc1 resolution
const origin: CoordinatePoint = [0, 0, "pc1"]

// Position (3, 7) in kpc100, at galaxy (1, 2) in Mpc1, all else origin
// x = 0 + 0*100 + 3*100_000 + 1*1_000_000 + 0*10_000_000 = 1_300_000
const point: CoordinatePoint = [1_300_000, 2_700_000, "kpc100"]

// Just coordinates at the Mpc1 scale (galaxy cluster level)
const cluster: CoordinatePoint = [5, 3, "Mpc1"]
```

### Why this works well

1. **Compact**: Single `[x, y, scale]` tuple
2. **Safe integers**: Max value ~10^11, well under JavaScript's `Number.MAX_SAFE_INTEGER` (9×10^15)
3. **Human-readable-ish**: You can eyeball that `1_300_000` is "about 1 Mpc1 + 3 kpc100"
4. **Easy math**: Adding 1 at pc1 = `x + 1`, adding 1 at pc100 = `x + 100`, etc.
5. **Bottom scale flexibility**: Same encoding works whether you're zoomed to pc1 or Mpc1 — the `bottomScale` just tells you which digits matter
6. **No universe seed needed**: As you said, navigating to a different cluster effectively *is* a different seed

### The `bottomScale` meaning

The `bottomScale` tells you the resolution of the coordinate:
- `"pc1"` → all digits meaningful down to parsec level
- `"kpc100"` → ignore pc1 and pc100 digits (they're implicitly 0)

This matches your requirement that "wherever coordinates stop being provided, that just means we're at the origin at all the larger scales" — except inverted. The *smaller* scales default to 0.

Want me to sketch out a `Coordinate` class or utility functions for this?

```typescript
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
```

```typescript
type ScaleKey = "pc1" | "pc100" | "kpc100" | "Mpc1" | "Mpc10"

type CoordinatePoint = [x: number, y: number, bottomScale: ScaleKey]
```

```typescript
// To encode coordinates at all scales into a single x value:
const x = pc1_x 
        + pc100_x  * 100 
        + kpc100_x * 100_000 
        + Mpc1_x   * 1_000_000 
        + Mpc10_x  * 10_000_000
```

```typescript
function decodeX(x: number): Record<ScaleKey, number> {
  return {
    Mpc10:  Math.floor(x / 10_000_000),
    Mpc1:   Math.floor(x / 1_000_000) % 10,
    kpc100: Math.floor(x / 100_000) % 10,
    pc100:  Math.floor(x / 100) % 1000,
    pc1:    x % 100,
  }
}
```

```typescript
// Origin of the universe at pc1 resolution
const origin: CoordinatePoint = [0, 0, "pc1"]

// Position (3, 7) in kpc100, at galaxy (1, 2) in Mpc1, all else origin
// x = 0 + 0*100 + 3*100_000 + 1*1_000_000 + 0*10_000_000 = 1_300_000
const point: CoordinatePoint = [1_300_000, 2_700_000, "kpc100"]

// Just coordinates at the Mpc1 scale (galaxy cluster level)
const cluster: CoordinatePoint = [5, 3, "Mpc1"]
```

---

**User**

Let's spend some time with this.



I think the decimal math approach makes sense, since that's how the scales are spaced by decimal factors.



But your function presumes pc1 is always the bottom scale. Reason what that function would look like if it accepted arbitrary bottom scales.

---

**Cursor**

```typescript
function decode(x: number, bottomScale: ScaleKey): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)
  
  let remaining = x
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = remaining % width
    remaining = Math.floor(remaining / width)
  }
  
  return result
}
```

Good catch! Let me reason through this properly.

## The Key Insight

The multipliers are **cumulative products** of scale widths, starting from the bottom scale. So the decode function needs to:

1. Know the ordered list of scales
2. Know each scale's "width" (how many cells fit in one parent cell)
3. Start from `bottomScale` and work upward

## The Data

```typescript
const SCALE_ORDER: ScaleKey[] = ["pc1", "pc100", "kpc100", "Mpc1", "Mpc10"]

// How many cells of THIS scale fit within one cell of the NEXT LARGER scale
const SCALE_WIDTH: Record<ScaleKey, number> = {
  pc1:    100,   // 100 pc1 cells per pc100 cell
  pc100:  1000,  // 1000 pc100 cells per kpc100 cell  
  kpc100: 10,    // 10 kpc100 cells per Mpc1 cell
  Mpc1:   10,    // 10 Mpc1 cells per Mpc10 cell
  Mpc10:  10,    // top level (arbitrary bound)
}
```

## Generic Decode

```typescript
function decode(
  x: number, 
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)
  
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(x / multiplier) % width
    multiplier *= width
  }
  
  return result
}
```

## Generic Encode

```typescript
function encode(
  coords: Partial<Record<ScaleKey, number>>, 
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)
  
  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }
  
  return result
}
```

## Tracing Through Examples

**Example 1**: `x = 35`, `bottomScale = "kpc100"`

| i | scale | width | multiplier | `floor(35/m) % w` | result |
|---|-------|-------|------------|-------------------|--------|
| 2 | kpc100 | 10 | 1 | 35 % 10 = **5** | kpc100: 5 |
| 3 | Mpc1 | 10 | 10 | 3 % 10 = **3** | Mpc1: 3 |
| 4 | Mpc10 | 10 | 100 | 0 % 10 = **0** | Mpc10: 0 |

→ `{ kpc100: 5, Mpc1: 3, Mpc10: 0 }`

**Example 2**: `x = 1_234_567`, `bottomScale = "pc1"`

| i | scale | width | multiplier | `floor(x/m) % w` | result |
|---|-------|-------|------------|------------------|--------|
| 0 | pc1 | 100 | 1 | 1234567 % 100 = **67** | pc1: 67 |
| 1 | pc100 | 1000 | 100 | 12345 % 1000 = **345** | pc100: 345 |
| 2 | kpc100 | 10 | 100,000 | 12 % 10 = **2** | kpc100: 2 |
| 3 | Mpc1 | 10 | 1,000,000 | 1 % 10 = **1** | Mpc1: 1 |
| 4 | Mpc10 | 10 | 10,000,000 | 0 % 10 = **0** | Mpc10: 0 |

→ `{ pc1: 67, pc100: 345, kpc100: 2, Mpc1: 1, Mpc10: 0 }`

## The Pattern

The algorithm builds the multiplier **lazily** as it iterates. At each scale:
- Divide by current multiplier → shifts off all smaller scales
- Mod by width → isolates just this scale's digit
- Multiply multiplier by width → ready for next scale

This works for any `bottomScale` because we just start the iteration at a different index, and the multipliers cascade correctly from there.

Does this feel right to you? The nice property is that the same `x` value means different things depending on `bottomScale` — which matches the semantic that "35 at kpc100 scale" is a totally different place than "35 at pc1 scale".

```typescript
const SCALE_ORDER: ScaleKey[] = ["pc1", "pc100", "kpc100", "Mpc1", "Mpc10"]

// How many cells of THIS scale fit within one cell of the NEXT LARGER scale
const SCALE_WIDTH: Record<ScaleKey, number> = {
  pc1:    100,   // 100 pc1 cells per pc100 cell
  pc100:  1000,  // 1000 pc100 cells per kpc100 cell  
  kpc100: 10,    // 10 kpc100 cells per Mpc1 cell
  Mpc1:   10,    // 10 Mpc1 cells per Mpc10 cell
  Mpc10:  10,    // top level (arbitrary bound)
}
```

```typescript
function decode(
  x: number, 
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)
  
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(x / multiplier) % width
    multiplier *= width
  }
  
  return result
}
```

```typescript
function encode(
  coords: Partial<Record<ScaleKey, number>>, 
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)
  
  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }
  
  return result
}
```

---

**User**

That looks great.



I'm also curious what the limits are on how many scales can be combined into a single value.



Let's assume we include include:

 - upc1 (microparsecs) for planetary systems (planets with moons, etc)

 - npc1 (nanoparsecs) for individual planets, moons, etc

 - ppc1 (picoparsecs) for mantle plumes, plutons, etc

 - fpc1 (femtoparsecs) for trees, caves, etc

 - apc1 (attoparsecs) for leaves, bits of soil/rock/etc



What would be some examples of coordinate groups that max out JavaScript's Number precision?



And should we be utilizing decimals in order to make better use of the precision? What would that look like?

---

**Cursor**

Great question! Let me work through the math.

## The Full Scale Hierarchy

With your proposed micro-scales, here's the complete picture:

| Scale | Description | Width (cells per parent) |
|-------|-------------|--------------------------|
| apc1 | attoparsec (leaves, soil) | 1,000 |
| fpc1 | femtoparsec (trees, caves) | 1,000 |
| ppc1 | picoparsec (mantle plumes) | 1,000 |
| npc1 | nanoparsec (planets) | 1,000 |
| upc1 | microparsec (planetary systems) | 1,000,000 |
| pc1 | parsec (stars) | 100 |
| pc100 | 100 parsecs | 1,000 |
| kpc100 | 100 kiloparsecs | 10 |
| Mpc1 | megaparsec | 10 |
| Mpc10 | 10 megaparsecs | 10 |

## JavaScript's Limit

`Number.MAX_SAFE_INTEGER` = 2^53 - 1 ≈ **9 × 10^15**

The total multiplier from `apc1` all the way to `Mpc10`:

```
1000 × 1000 × 1000 × 1000 × 1,000,000 × 100 × 1000 × 10 × 10 = 10^25
```

That's **10 billion times larger** than safe integer range. We can't fit everything.

## What Scale Ranges Actually Fit?

**From upc1 → Mpc10**: ✅ FITS

```
1,000,000 × 100 × 1000 × 10 × 10 = 10^13
```

Max coordinate value: ~99,999,999,999,999 (≈ 10^14) — safely under 10^15

**From npc1 → Mpc10**: ❌ EXCEEDS

```
1000 × 1,000,000 × 100 × 1000 × 10 × 10 = 10^16
```

**From apc1 → upc1**: ✅ FITS

```
1000 × 1000 × 1000 × 1000 = 10^12
```

**From apc1 → pc1**: ❌ EXCEEDS

```
1000 × 1000 × 1000 × 1000 × 1,000,000 = 10^18
```

## The Natural Coordinate Groups

The math suggests two "safe integer bands":

| Group | Scales | Max Multiplier |
|-------|--------|----------------|
| **Macro** | upc1 → Mpc10 | 10^13 ✅ |
| **Micro** | apc1 → upc1 | 10^12 ✅ |

You **cannot** bridge `pc1 → upc1` (factor of 10^6) while also including multiple micro-scales.

## Do Decimals Help?

**Short answer: No, not really.**

JavaScript's 64-bit floats have a **53-bit mantissa** — that's your precision, regardless of where the decimal point sits. Whether you store `9007199254740991` or `0.009007199254740991`, you get the same ~15-16 significant digits.

There's one trick though: if you used the decimal places to represent "sub-cell" position within the bottom scale, you could get fractional coordinates "for free":

```typescript
// x = 1234567.75 means:
// - Integer part (1234567): hierarchical scale coordinates
// - Fractional part (0.75): position within the bottom-scale cell

const cellCoords = Math.floor(x)  // 1234567
const subCellPosition = x % 1     // 0.75 (75% across the cell)
```

But this doesn't extend your scale range — it just gives you sub-cell precision.

## Practical Recommendation

For your game, I'd suggest:

```typescript
type CoordinatePoint = {
  macro: number      // upc1 → Mpc10 (planetary system to cosmic web)
  micro?: number     // apc1 → upc1 (leaves to planetary system)
  bottomScale: ScaleKey
}
```

**Examples:**

```typescript
// A star system in galaxy cluster 3,5
const starSystem: CoordinatePoint = {
  macro: encode({ upc1: 500_000, pc1: 45, Mpc1: 3, Mpc10: 5 }, "upc1"),
  bottomScale: "upc1"
}

// A specific tree on a planet in that system
const tree: CoordinatePoint = {
  macro: encode({ upc1: 500_000, pc1: 45, Mpc1: 3, Mpc10: 5 }, "upc1"),
  micro: encode({ apc1: 234, fpc1: 567, ppc1: 89, npc1: 12 }, "apc1"),
  bottomScale: "apc1"
}
```

The `micro` field is only populated when you're zoomed in past `upc1`. At planetary-system scale and above, you just use `macro`.

This gives you **25 orders of magnitude** of addressable space (attoparsecs to 10-megaparsec cosmic web cells) using just two safe integers.

```plaintext
1000 × 1000 × 1000 × 1000 × 1,000,000 × 100 × 1000 × 10 × 10 = 10^25
```

```plaintext
1,000,000 × 100 × 1000 × 10 × 10 = 10^13
```

```plaintext
1000 × 1,000,000 × 100 × 1000 × 10 × 10 = 10^16
```

```plaintext
1000 × 1000 × 1000 × 1000 = 10^12
```

```plaintext
1000 × 1000 × 1000 × 1000 × 1,000,000 = 10^18
```

```typescript
// x = 1234567.75 means:
// - Integer part (1234567): hierarchical scale coordinates
// - Fractional part (0.75): position within the bottom-scale cell

const cellCoords = Math.floor(x)  // 1234567
const subCellPosition = x % 1     // 0.75 (75% across the cell)
```

```typescript
type CoordinatePoint = {
  macro: number      // upc1 → Mpc10 (planetary system to cosmic web)
  micro?: number     // apc1 → upc1 (leaves to planetary system)
  bottomScale: ScaleKey
}
```

```typescript
// A star system in galaxy cluster 3,5
const starSystem: CoordinatePoint = {
  macro: encode({ upc1: 500_000, pc1: 45, Mpc1: 3, Mpc10: 5 }, "upc1"),
  bottomScale: "upc1"
}

// A specific tree on a planet in that system
const tree: CoordinatePoint = {
  macro: encode({ upc1: 500_000, pc1: 45, Mpc1: 3, Mpc10: 5 }, "upc1"),
  micro: encode({ apc1: 234, fpc1: 567, ppc1: 89, npc1: 12 }, "apc1"),
  bottomScale: "apc1"
}
```

---

**User**

Great. Let's add those scales to SCALES. Also add mpc (milliparsecs) so we don't have any jumps bigger than 1000x. Please also note that's a requirement in the dockblock for SCALES.



IMPORTANT: We do not want to combine macro and micro scales. We also do not want to define universal scales. We will always start from the correct bottom scale for analysis. That's a key facet of this architecture: It is scale invariant. I am not trying to encode universe-scale data at apc1. I am trying to encode data at the scale range that makes sense for it. I will never use macro scales and micro scales together. We will instead derive the _properties_ of the macro scale (we're in a galaxy, we're far from any stars, etc) and then just do the micro simulation without any knowledge of where exactly that galaxy is in the universe.



Make sense?



So I think our coordinates will be { scale, x, y } tuples.

---

**Cursor**

That makes perfect sense! Scale invariance is a much cleaner architecture. You derive the *context* from larger scales, then simulate within a self-contained scale range. The coordinates only need to encode position within that range.

Let me look at the current `SCALES` to propose the additions:

```typescript
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}
```

Got it! Here's the proposed update:

```typescript
/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}
```

The `Coordinate` type replaces the old `Coordinates` partial record. Clean and simple — just `{ scale, x, y }` where `x` and `y` are hierarchical integers encoding all scales from `scale` upward.

You're in ask mode, so switch to agent mode if you'd like me to apply these changes directly.

```typescript
/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}
```

---

**User**

Go ahead and make those changes. And then adjust the Map component to take a Coordinate instead of the existing scale-locked coordinates  + universeSeed.



I don't know if you'll need to change findGalaxies? Maybe not yet, if it's isolated from Map. Let's focus on Map first.

---

**Cursor**

Let me create a todo list and start implementing:

```typescript
/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  Mpc10: 10, // top level (arbitrary bound)
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution encoded
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are implicitly at origin (0,0).
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>
```

I had a typo in my match. Let me fix that:

```typescript
import { WEB_SCALE_FATES } from "./01_WEB_SCALE_FATES"
import { HALO_SCALE_FATES } from "./02_HALO_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./03_GALACTIC_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./05_STAR_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  Mpc10: 10, // top level (arbitrary bound)
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution encoded
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are implicitly at origin (0,0).
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescriptreact
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
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The halo-scale fate determines what galactic fates appear in this tile.
   * Each halo fate has childFateWeights that define the probability
   * distribution over galactic fates.
   */
  haloFate: HaloScaleFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The scale should be "Mpc1" for halo-scale maps.
   * The x,y values encode positions at Mpc1 and Mpc10 scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  haloFate,
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

```

```javascript
const tileSeed =
  universeSeed * 7 +
  mpc10[0] * 10000 +
  mpc10[1] * 1000 +
  mpc1[0] * 100 +
  mpc1[1]
```

```javascript
const tileSeed = coordinate.x * 1000 + coordinate.y, let me think about this more carefully. The coordinate.x encodes Mpc1_x + Mpc10_x * 10 (assuming scale is "Mpc1"). So:- coordinate.x = Mpc1_x + Mpc10_x * 10- coordinate.y = Mpc1_y + Mpc10_y * 10The old seed formula was:

```

```plaintext

This is essentially creating a unique hash from all coordinates. We can simplify since:- coordinate.x already encodes Mpc1_x and Mpc10_x hierarchically- coordinate.y already encodes Mpc1_y and Mpc10_yA simple seed would be:
```

```plaintext

Or to give more spread:
```

```plaintext

Actually, I should keep it consistent with how the encoding works. Since max x and y values for Mpc1 scale would be 10 * 10 = 100 (Mpc1 0-9, Mpc10 0-9), we can use:


```

```plaintext

This gives unique seeds for any reasonable coordinate and provides better randomness to avoid collisions across different scales.
```

```typescriptreact
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
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The halo-scale fate determines what galactic fates appear in this tile.
   * Each halo fate has childFateWeights that define the probability
   * distribution over galactic fates.
   */
  haloFate: HaloScaleFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The scale should be "Mpc1" for halo-scale maps.
   * The x,y values encode positions at Mpc1 and Mpc10 scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  haloFate,
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

```

```typescriptreact
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
import type { Coordinate } from "~/model"

type MapProps = {
  /**
   * The halo-scale fate determines what galactic fates appear in this tile.
   * Each halo fate has childFateWeights that define the probability
   * distribution over galactic fates.
   */
  haloFate: HaloScaleFateKey

  /**
   * Hierarchical coordinate identifying this tile.
   * The scale should be "Mpc1" for halo-scale maps.
   * The x,y values encode positions at Mpc1 and Mpc10 scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  haloFate,
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
  }, [haloFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

```typescriptreact
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
      {/* Mpc10: (5,3), Mpc1: (2,7) → x = 2 + 5*10 = 52, y = 7 + 3*10 = 37 */}
      <Map haloFate="gasRichGroup" coordinate={{ scale: "Mpc1", x: 52, y: 37 }} />
    </Demo>

    <h2>Fossil Group</h2>
    <Demo inline>
      {/* Mpc10: (5,3), Mpc1: (4,2) → x = 4 + 5*10 = 54, y = 2 + 3*10 = 32 */}
      <Map haloFate="fossilGroup" coordinate={{ scale: "Mpc1", x: 54, y: 32 }} />
    </Demo>

    <h2>Cool-Core Cluster</h2>
    <Demo inline>
      {/* Mpc10: (5,3), Mpc1: (8,1) → x = 8 + 5*10 = 58, y = 1 + 3*10 = 31 */}
      <Map haloFate="coolCoreCluster" coordinate={{ scale: "Mpc1", x: 58, y: 31 }} />
    </Demo>
  </Doc>
)

```

```typescriptreact
import React, { useRef, useEffect } from "react"
import { COLORS_BY_KEY, EMPTY_FATE_COLOR } from "~/helpers/colors"
import {
  perlin2d,
  computeThresholds,
  sampleFromThresholds,
} from "~/helpers/noise"
import type { Coordinate } from "~/model"
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
   * Hierarchical coordinate identifying this tile.
   * The scale should be "Mpc1" for halo-scale maps.
   * The x,y values encode positions at Mpc1 and Mpc10 scales.
   */
  coordinate: Coordinate

  /** Pixel size of each cell. Default 40. */
  cellSize?: number

  /** Number of cells per side. Default 10 (10x10 grid). */
  gridSize?: number
}

export const Map: React.FC<MapProps> = ({
  haloFate,
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
  }, [haloFate, coordinate, cellSize, gridSize])

  return (
    <canvas
      data-component="Map"
      ref={canvasRef}
      width={gridSize * cellSize}
      height={gridSize * cellSize}
    />
  )
}

```

Done! Here's a summary of the changes:

## Changes Made

### `app/model/index.ts`
- Added a docblock to `SCALES` documenting the ≤1000x constraint between adjacent scales
- Added new micro-scales: `mpc1` (milliparsec), `npc1` (nanoparsec), `ppc1` (picoparsec), `fpc1` (femtoparsec), `apc1` (attoparsec)
- Added `SCALE_ORDER` array (smallest to largest) for coordinate encoding
- Added `SCALE_WIDTH` record (cells per parent at each scale)
- Added `Coordinate` type: `{ scale: ScaleKey, x: number, y: number }`
- Added `encodeCoordinate()` and `decodeCoordinate()` utility functions
- Kept `Coordinates` as deprecated for backward compatibility with `findGalaxies.ts`

### `app/components/Map.tsx`
- Replaced `mpc10`, `mpc1`, `universeSeed` props with a single `coordinate: Coordinate` prop
- Tile seed now computed directly from the hierarchical `coordinate.x` and `coordinate.y`

### `app/components/Map.docs.tsx`
- Updated all examples to use the new `coordinate` prop
- Added comments showing how the old coordinates map to the new encoding

The `findGalaxies.ts` still uses the old `Coordinates` type — we can migrate that separately when you're ready.

---

**User**

I added some todos, can you apply any of them?

---

**Cursor**

Let me read the current state of the file to see your TODOs and address them:

I see three TODOs. Let me address them all:

1. **Add examples to SCALES docblock**
2. **Change Mpc10 width to 1000** (you're right - the observable universe is ~28,500 Mpc diameter, so 1000×1000 Mpc10 = 10,000 Mpc coverage is plenty)
3. **Fix the Coordinate comment** - you're correct, scales smaller than `scale` don't exist at this simulation level, not "at origin"

```typescript
import { WEB_SCALE_FATES } from "./01_WEB_SCALE_FATES"
import { HALO_SCALE_FATES } from "./02_HALO_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./03_GALACTIC_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./05_STAR_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 *
 * Example: A coordinate at scale "Mpc1" with x=52, y=37 encodes:
 *   - Mpc1:  (2, 7)   ← 52 % 10 = 2,  37 % 10 = 7
 *   - Mpc10: (5, 3)   ← 52 / 10 = 5,  37 / 10 = 3
 *
 * Example: A coordinate at scale "pc1" with x=4523, y=891 encodes:
 *   - pc1:   (23, 91)  ← x % 100,      y % 100
 *   - pc100: (45, 8)   ← (x / 100) % 1000, (y / 100) % 1000
 *   - kpc100: (0, 0)   ← (x / 100000) % 10, etc.
 *   - ...and so on up to Mpc10
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  // TODO: should this be more like 1000? Are there structures above the web scale? I think an obervable universe of 1000x1000 Mpc should be plenty.
  Mpc10: 10, // top level (arbitrary bound)
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution encoded
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are implicitly at origin (0,0).
 * // TODO: Should this be scales *larger* than scale? Scales smaller than scale don't exist at this level of simulation, right?
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { WEB_SCALE_FATES } from "./01_WEB_SCALE_FATES"
import { HALO_SCALE_FATES } from "./02_HALO_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./03_GALACTIC_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./05_STAR_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 *
 * Example: A coordinate at scale "Mpc1" with x=52, y=37 encodes:
 *   - Mpc1:  (2, 7)   ← 52 % 10 = 2,  37 % 10 = 7
 *   - Mpc10: (5, 3)   ← 52 / 10 = 5,  37 / 10 = 3
 *
 * Example: A coordinate at scale "pc1" with x=4523, y=891 encodes:
 *   - pc1:   (23, 91)  ← x % 100,      y % 100
 *   - pc100: (45, 8)   ← (x / 100) % 1000, (y / 100) % 1000
 *   - kpc100: (0, 0)   ← (x / 100000) % 10, etc.
 *   - ...and so on up to Mpc10
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution encoded
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are implicitly at origin (0,0).
 * // TODO: Should this be scales *larger* than scale? Scales smaller than scale don't exist at this level of simulation, right?
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

```typescript
import { WEB_SCALE_FATES } from "./01_WEB_SCALE_FATES"
import { HALO_SCALE_FATES } from "./02_HALO_SCALE_FATES"
import { GALACTIC_SCALE_FATES } from "./03_GALACTIC_SCALE_FATES"
import { INTERSTELLAR_SCALE_FATES } from "./04_INTERSTELLAR_SCALE_FATES"
import { STAR_SCALE_FATES } from "./05_STAR_SCALE_FATES"

/**
 * BARYON — A UNIVERSE SIMULATION MODEL
 * ====================================
 *
 * A model for simulating the universe at multiple scales, intended to drive a
 * space sandbox game called "Baryon".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GAME
 *
 * The player directs an effort for a species to emigrate from their homeworld
 * as their star expands and their system becomes uninhabitable. The game is
 * essentially a business application: spreadsheets, schematics, data files.
 *
 * The game is "won" when an outpost becomes self-sufficient and sustainable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE ARCHITECTURE: HIERARCHICAL PARCELS
 *
 * The universe is modeled as a hierarchy of **parcels**—abstract regions of
 * matter at different scales:
 *
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1) (web)
 *   (groups)   (galaxies)  (interstellar)  (stars)    (planets)
 *
 * Each parcel:
 *   - Has a **fate** (its physical regime)
 *   - Contains **child parcels** at the next scale down
 *   - Has **coordinates** (x, y) within its parent's grid
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATES ARE DESTINATIONS, NOT STAGES
 *
 * Fates are **parallel physical regimes** ("lanes"), not sequential stages in
 * an evolution. A parcel's fate describes where it ends up, not where it is
 * now.
 *
 * When a parent parcel "paints" its children, it paints **final outcomes**:
 *
 *   - A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs,
 *     and gas that will eventually exist there.
 *
 *   - An open cluster doesn't paint "young stars"—it paints the mix of stars,
 *     remnants, and ejected objects that will eventually populate the region.
 *
 * The transient phases (collapsing cores, main sequence evolution, etc.) are
 * just mechanisms—they're not modeled as separate fates.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS ARE EXTERNAL EVENTS
 *
 * Transitions between fates are caused by **external forces**, not internal
 * processes. Examples:
 *
 *   - A white dwarf drifts into a gas parcel, accretes the gas, becomes a
 *     neutron star. The GAS PARCEL was destroyed and replaced.
 *
 *   - Multiple stars in a dense cluster gravitationally collapse into a black
 *     hole. The STAR PARCELS were destroyed and replaced.
 *
 * Internal evolution (a star exhausting fuel, a cluster aging) is NOT modeled
 * as transitions. Instead, when the PARENT fate transitions, it repaints its
 * children with new weights that reflect the changed composition. This is how
 * populations "age"—the parent repaints, not the children internally evolving.
 *
 * Smaller-scale fates have shorter effective lifetimes not only because they
 * evolve faster, but because at longer timescales, interventions from larger
 * scale regimes are increasingly probable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPARSE OBSERVATION MODEL
 *
 * The simulation is **sparsely populated**. We do not pre-compute the entire
 * universe. Parcels exist as probability distributions until observed.
 * Observations are deterministic given a seed and persist in a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BIDIRECTIONAL CONSTRAINTS
 *
 * Observations propagate constraints **both up and down** the hierarchy:
 *
 *   - **Top-down**: A parent fate constrains child fate probabilities.
 *   - **Bottom-up**: Child observations constrain parent fate probabilities.
 *     (If we've observed 5 spirals in a tile, it's probably not a fossilGroup.)
 *
 * This bidirectionality means the order of observations matters less than it
 * might seem. Observing children first constrains what parent fates are
 * plausible; observing the parent first constrains what children are likely.
 *
 * When observations conflict (paradoxes), we may need to retroactively revise
 * earlier observations. This is acceptable—the simulation prioritizes
 * consistency over immutability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPATIAL COHERENCE (FIELD-BASED SAMPLING)
 *
 * Child fates within a parent tile are not independent. They have spatial
 * structure: clustering, gradients, voids.
 *
 * The sampling model works in two layers:
 *
 *   1. **childFateWeights** — The **marginal distribution**: what fraction of
 *      cells in this tile have each fate, summed over the whole tile.
 *
 *   2. **fieldParameters** (future) — The **spatial structure**: how fates are
 *      arranged within the tile. A continuous field (like density) is sampled,
 *      then thresholded into categorical fates.
 *
 * The field approach ensures:
 *   - Nearby cells have correlated fates (clustering)
 *   - Tiles seamlessly join at boundaries (tiling)
 *   - Observations constrain the underlying field, not just individual cells
 *
 * The thresholds are derived from childFateWeights, so the marginals are
 * guaranteed to match. The field controls *where* each fate appears, not *how
 * many*.
 *
 * NOTE: Field-based sampling is not yet implemented. Currently, fates are
 * sampled independently using childFateWeights as a categorical distribution.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 2D SIMULATION WITH ORIENTABLE COORDINATES
 *
 * The simulation is fundamentally **2D**. Each parcel has (x, y) coordinates
 * within a grid at its scale.
 *
 * However, child parcels may have their coordinate planes **oriented
 * differently** relative to their parent. This allows a tree of 2D simulations
 * to fill a 3D volume:
 *
 *   Milky Way (disk plane, galactic scale) ├── Orion Molecular Cloud Complex
 *     (interstellar scale, aligned with disk) │     ├── Orion Nebula Cluster
 *     (open cluster within GMC) │     │     └── Young stellar systems (tilted
 *     to cluster plane) │     └── Barnard's Loop (superbubble, aligned) ├──
 *     Local Bubble (superbubble containing Sol) │     └── Sol system (stellar
 *     scale, tilted 60° to galactic plane) └── Sagittarius Dwarf (satellite
 *     galaxy, oriented 90° to disk)
 *
 * Each node simulates in its own 2D plane. The tree of orientations recovers 3D
 * structure when needed. For the game's spreadsheet UI, the player typically
 * views one parcel's local 2D grid at a time.
 */

/**
 * SCALES defines the spatial hierarchy of the simulation.
 *
 * Each scale represents a grid resolution. Scales are ordered from largest
 * (Mpc10) to smallest (apc1). Adjacent scales must differ by at most 1000x
 * to ensure hierarchical coordinates fit within JavaScript's safe integer range.
 *
 * A Coordinate encodes position from a "bottom scale" upward. Larger-scale
 * context (e.g., galaxy type, stellar density) is derived as properties,
 * not embedded in coordinates. This keeps the system scale-invariant.
 *
 * Example: A coordinate at scale "Mpc1" with x=52, y=37 encodes:
 *   - Mpc1:  (2, 7)   ← 52 % 10 = 2,  37 % 10 = 7
 *   - Mpc10: (5, 3)   ← 52 / 10 = 5,  37 / 10 = 3
 *
 * Example: A coordinate at scale "pc1" with x=4523, y=891 encodes:
 *   - pc1:   (23, 91)  ← x % 100,      y % 100
 *   - pc100: (45, 8)   ← (x / 100) % 1000, (y / 100) % 1000
 *   - kpc100: (0, 0)   ← (x / 100000) % 10, etc.
 *   - ...and so on up to Mpc10
 */
export const SCALES = {
  /**
   * 10x10 Mpc grid: cosmic web geometry
   */
  Mpc10: {
    fates: { WEB_SCALE_FATES },
  },

  /**
   * 1x1 Mpc grid: dark matter halos (groups and clusters)
   */
  Mpc1: {
    fates: { HALO_SCALE_FATES },
  },

  /**
   * 100x100 kpc grid: galaxies
   */
  kpc100: {
    fates: { GALACTIC_SCALE_FATES },
  },

  /**
   * ~100 pc grid: interstellar neighborhoods
   *  - GMCs, star clusters, HII regions, superbubbles
   *  - ISM structure and star formation environments
   *  - characteristic timescale: ~10-100 Myr
   */
  pc100: {
    fates: { INTERSTELLAR_SCALE_FATES },
  },

  /**
   * ~1 pc grid: stellar systems
   */
  pc1: {
    fates: { STAR_SCALE_FATES },
  },

  /**
   * ~1 milliparsec grid: outer planetary systems, Oort clouds
   */
  mpc1: {
    fates: {
      // OUTER_SYSTEM_FATES,
    },
  },

  /**
   * ~1 microparsec grid: inner planetary systems, planets with moons
   */
  upc1: {
    fates: {
      // PLANETARY_SCALE_FATES,
    },
  },

  /**
   * ~1 nanoparsec grid: individual planets, large moons
   */
  npc1: {
    fates: {
      // WORLD_SCALE_FATES,
    },
  },

  /**
   * ~1 picoparsec grid: continental features, mantle plumes, plutons
   */
  ppc1: {
    fates: {
      // CONTINENTAL_SCALE_FATES,
    },
  },

  /**
   * ~1 femtoparsec grid: landscape features, forests, caves
   */
  fpc1: {
    fates: {
      // LANDSCAPE_SCALE_FATES,
    },
  },

  /**
   * ~1 attoparsec grid: individual objects, trees, rocks, organisms
   */
  apc1: {
    fates: {
      // OBJECT_SCALE_FATES,
    },
  },
}

export type ScaleKey = keyof typeof SCALES

/**
 * Ordered list of scales from smallest to largest.
 * Used for hierarchical coordinate encoding/decoding.
 */
export const SCALE_ORDER: ScaleKey[] = [
  "apc1",
  "fpc1",
  "ppc1",
  "npc1",
  "upc1",
  "mpc1",
  "pc1",
  "pc100",
  "kpc100",
  "Mpc1",
  "Mpc10",
]

/**
 * How many cells of THIS scale fit within one cell of the NEXT LARGER scale.
 * All values are ≤1000 to ensure safe integer arithmetic.
 */
export const SCALE_WIDTH: Record<ScaleKey, number> = {
  apc1: 1000, // 1000 apc1 per fpc1
  fpc1: 1000, // 1000 fpc1 per ppc1
  ppc1: 1000, // 1000 ppc1 per npc1
  npc1: 1000, // 1000 npc1 per upc1
  upc1: 1000, // 1000 upc1 per mpc1
  mpc1: 1000, // 1000 mpc1 per pc1
  pc1: 100, // 100 pc1 per pc100
  pc100: 1000, // 1000 pc100 per kpc100
  kpc100: 10, // 10 kpc100 per Mpc1
  Mpc1: 10, // 10 Mpc1 per Mpc10
  Mpc10: 1000, // 1000×1000 grid covers 10,000 Mpc — plenty for observable universe
}

/**
 * A hierarchical coordinate encoding position across multiple scales.
 *
 * - `scale`: The "bottom" scale — the finest resolution being simulated
 * - `x`, `y`: Hierarchical integers encoding positions from `scale` upward
 *
 * The x,y values pack coordinates at all scales from `scale` up to the largest.
 * Scales smaller than `scale` are not part of this coordinate system — they
 * belong to a different simulation context entirely.
 */
export type Coordinate = {
  scale: ScaleKey
  x: number
  y: number
}

/**
 * Decode a hierarchical coordinate value into per-scale positions.
 */
export function decodeCoordinate(
  value: number,
  bottomScale: ScaleKey
): Partial<Record<ScaleKey, number>> {
  const result: Partial<Record<ScaleKey, number>> = {}
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const width = SCALE_WIDTH[scale]
    result[scale] = Math.floor(value / multiplier) % width
    multiplier *= width
  }

  return result
}

/**
 * Encode per-scale positions into a single hierarchical coordinate value.
 */
export function encodeCoordinate(
  coords: Partial<Record<ScaleKey, number>>,
  bottomScale: ScaleKey
): number {
  const startIndex = SCALE_ORDER.indexOf(bottomScale)

  let result = 0
  let multiplier = 1
  for (let i = startIndex; i < SCALE_ORDER.length; i++) {
    const scale = SCALE_ORDER[i]
    const value = coords[scale] ?? 0
    result += value * multiplier
    multiplier *= SCALE_WIDTH[scale]
  }

  return result
}

/**
 * @deprecated Use Coordinate instead. This type is kept for backward
 * compatibility with findGalaxies.ts
 */
export type Coordinates = Partial<Record<ScaleKey, [number, number]>>

```

Done! All three TODOs addressed:

1. **Added examples to SCALES docblock** — showing how `x=52` at scale "Mpc1" decodes to Mpc1:(2) + Mpc10:(5), etc.

2. **Changed Mpc10 width to 1000** — a 1000×1000 grid of 10 Mpc cells covers 10,000 Mpc, which is plenty for the observable universe (~28,500 Mpc diameter)

3. **Fixed the Coordinate docblock** — clarified that scales smaller than `scale` aren't "at origin," they simply don't exist in that simulation context (which is the whole point of scale invariance!)

