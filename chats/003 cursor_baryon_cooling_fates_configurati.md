# BARYON_COOLING_FATES configuration values
_Exported on 12/28/2025 at 20:33:57 PST from Cursor (2.1.50)_

---

**User**

@index.ts:81-83 Please add these values where appropriate to the BARYON_COOLING_FATES

---

**Cursor**

I can see the `BARYON_COOLING_FATES` object and the new properties. Based on the physics of primordial lithium:

- **Primordial lithium is preserved** in early/non-stellar phases (before stars can destroy it)
- **Lithium is destroyed** when star formation occurs (stellar interiors burn lithium via proton capture)

Let me add these values to the appropriate entries:

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
    }
};
```

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
    }
};
```

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
        primordialLithiumPreserved: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
    }
};
```

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
        primordialLithiumPreserved: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
    }
};
```

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
        primordialLithiumPreserved: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
        lithiumDestroyed: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
    }
};
```

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SpaceCharacteristics = {
    massMax: number,          // initial mass in solar masses (M☉)
    elementsProduced: Elem[], // net nucleosynthesis output
}

const STELLAR_FATES: Record<string, SpaceCharacteristics> = {
    brownDwarf: {
        massMax: 0.08,
        elementsProduced: []   // no sustained fusion
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O'
        ] // H→He, He→C/O; N via CNO cycle
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // fusion up to Fe + explosive nucleosynthesis
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He',
            'C',
            'N',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // similar ladder, but much falls back
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He',
            'C',
            'O',
            'Ne',
            'Mg',
            'Si',
            'S',
            'Fe',
            'Ni'
        ] // pair-instability: star completely disrupted
    }
};

type BaryometricCharacteristics = {
    minTemperature?: number;          // K
    maxTemperature?: number;          // K
    freeElectronAbundance?: number;   // electrons per baryon
    thomsonToExpansionRatio?: number; // Γ_T / H
    h2Fraction?: number;              // H₂ per H
    metallicity?: number;             // Z / Z☉
    requiresDarkMatterHalo?: boolean;
    canGravitate?: boolean;
    primordialLithiumPreserved?: boolean;
    lithiumDestroyed?: boolean;
};

// The fate of a particular gas parcel as it cools and contracts in the early universe.
const BARYON_COOLING_FATES: Record<string, BaryometricCharacteristics> = {
    radiationCoupled: {
        minTemperature: 1e6,
        freeElectronAbundance: 1.0,
        thomsonToExpansionRatio: 1e5, // photons dominate completely
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    acousticFluid: {
        minTemperature: 3000,
        maxTemperature: 1e6,
        freeElectronAbundance: 0.99,
        thomsonToExpansionRatio: 10,  // still tightly coupled
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    recombinedGas: {
        maxTemperature: 3000,
        freeElectronAbundance: 1e-4,
        thomsonToExpansionRatio: 0.1, // decoupled
        canGravitate: true,
        primordialLithiumPreserved: true,
    },

    noCooling: {
        freeElectronAbundance: 1e-4,
        h2Fraction: 1e-7,             // below cooling threshold
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: false,
        primordialLithiumPreserved: true,
    },

    popIIIStarFormation: {
        h2Fraction: 1e-4,             // sufficient molecular cooling
        metallicity: 0,
        requiresDarkMatterHalo: true,
        canGravitate: true,
        lithiumDestroyed: true,
    },

    metalCooling: {
        metallicity: 1e-4,            // critical metallicity
        requiresDarkMatterHalo: true,
        canGravitate: true,
        lithiumDestroyed: true,
    }
};
```

Done! I added the lithium properties to each fate based on the cosmological physics:

- **`primordialLithiumPreserved: true`** for `radiationCoupled`, `acousticFluid`, `recombinedGas`, and `noCooling` — these are pre-stellar phases where Big Bang nucleosynthesis lithium remains intact

- **`lithiumDestroyed: true`** for `popIIIStarFormation` and `metalCooling` — star formation burns lithium via proton capture (Li + p → 2 He)

