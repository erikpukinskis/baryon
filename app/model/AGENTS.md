# Guidelines for LLMs editing fate files

## Core principle: Fates are destinations

When a parent parcel "paints" its children, it paints **final outcomes**, not initial states. A GMC doesn't paint "collapsing cores"—it paints the stars, brown dwarfs, and gas that will exist when the process completes.

## Inline comments on childFateWeights

Only add comments that explain why a weight makes sense in THIS context. Don't restate what the child fate is (that's documented in the child's fate file).

**Good:** `star: 0.45, // massive OB stars ionizing the region`

**Bad:** `whiteDwarf: 0.2, // electron-degenerate remnant`

The good example explains context (why stars in an HII region are specifically OB stars). The bad example just restates the definition of a white dwarf.

## Units in property names

Include units in property names instead of documenting them in comments:

**Good:** `stellarMassMinMsun`, `typicalTimescaleGyr`, `sizePcMin`

**Bad:** `stellarMassMin: number // solar masses`

Common unit suffixes: `Msun` (solar masses), `Gyr`/`Myr` (time), `Pc` (parsecs), `Mpc`/`Kpc` (megaparsecs/kiloparsecs).
