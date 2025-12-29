# Support array type for hybrid fates
_Exported on 12/28/2025 at 20:34:30 PST from Cursor (2.1.50)_

---

**User**

Please change support to SupportType[] to support these hybrid fates.

---

**Cursor**

Looking at the code, I can see there are `support` values like `'hybrid'` and `'material'` that aren't in the `SupportType` union. The user wants to change `support` to be an array so we can represent hybrid/combination support types.

I'll need to:
1. Add `'material'` to the `SupportType` union
2. Change `support: SupportType` to `support: SupportType[]`
3. Update all the entries in `PARCEL_FATES` to use arrays

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'none'          // diffuse, no pressure maximum
    | 'thermalGas'    // gas pressure
    | 'degeneracy'    // electron / neutron degeneracy
    | 'nuclear'       // fusion-regulated (stars)
    | 'material'      // electromagnetic / lattice strength
    | 'gravityOnly';  // black hole


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[];
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: 'degeneracy'        // gravity + (partial) electron degeneracy
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: 'hybrid'            // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: 'material'          // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: 'none'
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: 'degeneracy'
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: 'degeneracy'
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: 'degeneracy'
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: 'gravityOnly'
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: 'none'
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

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'none'          // diffuse, no pressure maximum
    | 'thermalGas'    // gas pressure
    | 'degeneracy'    // electron / neutron degeneracy
    | 'nuclear'       // fusion-regulated (stars)
    | 'material'      // electromagnetic / lattice strength
    | 'gravityOnly';  // black hole


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[];
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']      // gravity + (partial) electron degeneracy
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material', 'thermalGas']  // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material']        // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: ['none']
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: ['gravityOnly']
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: ['none']
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

Done! I made the following changes:

1. Added `'material'` to the `SupportType` union (for electromagnetic/lattice strength support)
2. Changed `support: SupportType` to `support: SupportType[]` in `FateCharacteristics`
3. Updated all entries in `PARCEL_FATES` to use arrays:
   - `gasGiant` now uses `['material', 'thermalGas']` to properly represent the hybrid "material core + gas pressure" support
   - `planet` uses `['material']` 
   - All other entries are wrapped in arrays (e.g., `['degeneracy']`, `['none']`, etc.)

---

**User**

@index.ts:23-24 Should this be ['degeneracy', 'gravity']?

---

**Cursor**

Yes, based on the comment "gravity + (partial) electron degeneracy", it should include both:

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'thermalGas'    // gas pressure
    | 'degeneracy'    // electron / neutron degeneracy
    | 'nuclear'       // fusion-regulated (stars)
    | 'material'      // electromagnetic / lattice strength
    | 'gravity';  // black hole


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[] | false;
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy', 'gravity']
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material', 'thermalGas']  // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material']        // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: false
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: ['gravityOnly']
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: false
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

There's a stray `'gravityOnly'` that needs to be updated to `'gravity'`:

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'thermalGas'    // gas pressure
    | 'degeneracy'    // electron / neutron degeneracy
    | 'nuclear'       // fusion-regulated (stars)
    | 'material'      // electromagnetic / lattice strength
    | 'gravity';  // black hole


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[] | false;
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy', 'gravity']
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material', 'thermalGas']  // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material']        // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: false
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: ['gravity']
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: false
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

Done! Updated PMO to `['degeneracy', 'gravity']` and also fixed a leftover `'gravityOnly'` → `'gravity'` in the blackHole entry to match your updated type.

---

**User**

why "thermal" gas?

---

**Cursor**

Good question! The `thermalGas` name distinguishes it from degeneracy pressure. In physics:

- **Thermal gas pressure** comes from the random kinetic motion of particles at a given temperature (PV = nRT)
- **Degeneracy pressure** is quantum mechanical and doesn't depend on temperature at all

For a gas giant's envelope, it's specifically the thermal motion of the gas molecules providing the pressure support, not quantum effects.

That said, "gas pressure" is inherently thermal, so the name is a bit redundant. Would you prefer to rename it to just `'gas'`?

---

**User**

No, thermalGas is ok. that distinction makes sense. Maybe clarify the comments on the SupportType union?

---

**Cursor**

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'thermalGas'    // kinetic pressure from random thermal motion (PV = nRT)
    | 'degeneracy'    // quantum pressure from Pauli exclusion (temperature-independent)
    | 'nuclear'       // fusion energy release regulates contraction
    | 'material'      // electromagnetic bonds / crystal lattice strength
    | 'gravity';      // no internal support; held by event horizon


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[] | false;
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy', 'gravity']
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material', 'thermalGas']  // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material']        // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: false
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: ['gravity']
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: false
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

Done! The comments now clarify the physical distinction between each support type:

```3:8:/Users/erikpukinskis/x/spacesim/starsheet/index.ts
type SupportType =
    | 'thermalGas'    // kinetic pressure from random thermal motion (PV = nRT)
    | 'degeneracy'    // quantum pressure from Pauli exclusion (temperature-independent)
    | 'nuclear'       // fusion energy release regulates contraction
    | 'material'      // electromagnetic bonds / crystal lattice strength
    | 'gravity';      // no internal support; held by event horizon
```

```typescript
type SupportType =
    | 'thermalGas'    // kinetic pressure from random thermal motion (PV = nRT)
    | 'degeneracy'    // quantum pressure from Pauli exclusion (temperature-independent)
    | 'nuclear'       // fusion energy release regulates contraction
    | 'material'      // electromagnetic bonds / crystal lattice strength
    | 'gravity';      // no internal support; held by event horizon
```

---

**User**

gravity is support for more than just black holes, isn't it? Maybe update these comments, incorporating how they're used below?

---

**Cursor**

You're right! Looking at the usage:
- `gravity` is used in PMO (with degeneracy) and blackHole
- `degeneracy` is used in PMO, brownDwarf, whiteDwarf, neutronStar
- `thermalGas` is used in gasGiant
- `material` is used in gasGiant and planet
- `nuclear` isn't used yet

```typescript
type Elem = 'H' | 'He' | 'C' | 'N' | 'O' | 'Ne' | 'Mg' | 'Si' | 'S' | 'Fe' | 'Ni';

type SupportType =
    | 'thermalGas'    // kinetic pressure from thermal motion; gas giant envelopes
    | 'degeneracy'    // quantum Pauli exclusion; brown/white dwarfs, neutron stars, PMOs
    | 'nuclear'       // fusion regulates contraction; main sequence stars
    | 'material'      // EM bonds / lattice strength; planets, rocky cores
    | 'gravity';      // self-gravity; contributes to PMOs, sole support for black holes


type FateCharacteristics = {
    massMax: number;          // initial mass in solar masses (M☉)
    elementsProduced: Elem[];
    hasStablePressureMaximum: boolean;
    support: SupportType[] | false;
};

const PARCEL_FATES: Record<string, FateCharacteristics> = {
    PMO: {
        massMax: 0.013,              // ~13 Jupiter masses
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy', 'gravity']
    },

    gasGiant: {
        massMax: 0.013,              // overlaps PMOs in mass
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material', 'thermalGas']  // material core + gas pressure
    },

    planet: {
        massMax: 0.01,               // generous upper bound (~10 Jupiter masses)
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['material']        // electromagnetic / lattice strength
    },

    plasmaReservoir: {
        massMax: Infinity,
        elementsProduced: [],
        hasStablePressureMaximum: false,
        support: false
    },

    brownDwarf: {
        massMax: 0.08,
        elementsProduced: [],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    whiteDwarf: {
        massMax: 8,
        elementsProduced: ['He', 'C', 'N', 'O'],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    neutronStar: {
        massMax: 20,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: true,
        support: ['degeneracy']
    },

    blackHole: {
        massMax: 140,
        elementsProduced: [
            'He','C','N','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false, // no pressure maximum; horizon instead
        support: ['gravity']
    },

    noRemnant: {
        massMax: 260,
        elementsProduced: [
            'He','C','O','Ne','Mg','Si','S','Fe','Ni'
        ],
        hasStablePressureMaximum: false,
        support: false
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

Done! The comments now reflect actual usage:

```3:8:/Users/erikpukinskis/x/spacesim/starsheet/index.ts
type SupportType =
    | 'thermalGas'    // kinetic pressure from thermal motion; gas giant envelopes
    | 'degeneracy'    // quantum Pauli exclusion; brown/white dwarfs, neutron stars, PMOs
    | 'nuclear'       // fusion regulates contraction; main sequence stars
    | 'material'      // EM bonds / lattice strength; planets, rocky cores
    | 'gravity';      // self-gravity; contributes to PMOs, sole support for black holes
```

```typescript
type SupportType =
    | 'thermalGas'    // kinetic pressure from thermal motion; gas giant envelopes
    | 'degeneracy'    // quantum Pauli exclusion; brown/white dwarfs, neutron stars, PMOs
    | 'nuclear'       // fusion regulates contraction; main sequence stars
    | 'material'      // EM bonds / lattice strength; planets, rocky cores
    | 'gravity';      // self-gravity; contributes to PMOs, sole support for black holes
```

