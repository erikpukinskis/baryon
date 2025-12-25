import { describe, it, expect } from "vitest"
import { findGalaxies } from "./findGalaxies"

describe("findGalaxies", () => {
  it("should find galaxies with a given seed", () => {
    const result = findGalaxies({ limit: 10, universeSeed: 42 })

    expect(result.galaxies.length).toBe(10)
    expect(result.observations.length).toBeGreaterThan(0)
  })

  it("should return galaxies with valid coordinates", () => {
    const result = findGalaxies({ limit: 10, universeSeed: 42 })

    for (const galaxy of result.galaxies) {
      expect(galaxy).toHaveProperty("Mpc10")
      expect(galaxy).toHaveProperty("Mpc1")
      expect(galaxy).toHaveProperty("kpc100")
    }
  })

  it("should return observations with valid coordinates and fates", () => {
    const result = findGalaxies({ limit: 10, universeSeed: 42 })

    for (const obs of result.observations) {
      expect(obs).toHaveProperty("coordinates")
      expect(obs.coordinates).toHaveProperty("Mpc10")
      expect(obs.coordinates).toHaveProperty("Mpc1")
      expect(obs.coordinates).toHaveProperty("kpc100")
      expect(obs).toHaveProperty("fate")
      expect(typeof obs.fate).toBe("string")
    }
  })

  it("should produce deterministic results with the same seed", () => {
    const result1 = findGalaxies({ limit: 5, universeSeed: 42 })
    const result2 = findGalaxies({ limit: 5, universeSeed: 42 })

    expect(result1.galaxies).toEqual(result2.galaxies)
    expect(result1.observations).toEqual(result2.observations)
  })

  it("should produce different results with different seeds", () => {
    const result1 = findGalaxies({ limit: 5, universeSeed: 42 })
    const result2 = findGalaxies({ limit: 5, universeSeed: 123 })

    expect(result1.galaxies).not.toEqual(result2.galaxies)
  })
})
