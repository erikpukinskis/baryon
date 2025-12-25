type ClusterScaleFateKey =
    | 'protoCluster'
    | 'poorCluster'
    | 'massiveCluster'
    | 'mergingCluster'
    | 'relaxedCluster'
    | 'coolCoreCluster'
    | 'nonCoolCoreCluster'
    | 'fossilCluster'
    | 'collapsingCluster'; // added for web-scale compatibility

type ClusterScaleLock =
    | 'gravitationalBinding'     // cluster-scale virialization
    | 'thermalization'           // hot ICM dominates baryons
    | 'dynamicalRelaxation'      // substructure erased
    | 'coolingFeedbackBalance'   // AGN ↔ cooling equilibrium
    | false;

/**
 * Galactic fate keys, imported conceptually for type reference.
 * Clusters constrain what galaxies can exist inside them.
 */
type GalacticScaleFateKey =
    | 'diffuseHalo'
    | 'dwarfIrregular'
    | 'dwarfSpheroid'
    | 'spiralGalaxy'
    | 'lenticularGalaxy'
    | 'ellipticalGalaxy'
    | 'activeGalactic'
    | 'quenchedRemnant';

type ClusterScaleFateCharacteristics = {
    massMin: number;             // halo mass in solar masses (M☉)
    massMax?: number;
    dominantBaryonPhase: 'plasma' | 'mixed';
    gravitationallyBound: boolean;

    fateLockedBy: ClusterScaleLock;
    typicalTimescaleGyr: number;

    definingProcesses: string[]; // qualitative physics drivers
    allowedTransitions: ClusterScaleFateKey[];

    /**
     * Probability distribution over galactic-scale child fates.
     * Cluster environments strongly suppress star formation and strip gas,
     * favoring quiescent morphologies (ellipticals, lenticulars, spheroids).
     */
    childFateWeights?: Partial<Record<GalacticScaleFateKey, number>>;
};

/**
 * CLUSTER_SCALE_FATES
 * ------------------
 *
 * This table defines the **qualitative dynamical and thermodynamic regimes of galaxy clusters**,
 * the largest gravitationally bound structures in the universe.
 *
 * As with `PARCEL_FATES` and `GROUP_SCALE_FATES`, clusters are modeled not as size or richness
 * categories, but as **physical regimes** separated by **irreversible thresholds** in binding,
 * heating, and relaxation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A “CLUSTER” IS IN THIS MODEL
 *
 * A cluster is a **deep dark-matter halo** whose gravitational potential is strong enough that:
 *
 *   • the majority of baryons reside in a **hot, diffuse plasma**
 *   • gas cooling times are long compared to dynamical times
 *   • individual galaxy evolution is dominated by environment
 *
 * Clusters are the **endpoints of hierarchical structure formation** for baryonic matter
 * on megaparsec scales.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CORE AXES OF CLASSIFICATION
 *
 * Cluster fates are distinguished along three primary axes:
 *
 *   1) **Binding depth**
 *      – Has the system virialized into a single, cluster-scale halo?
 *
 *   2) **Thermal state of baryons**
 *      – Is the intracluster medium (ICM) fully shock-heated and dominant?
 *
 *   3) **Dynamical maturity**
 *      – Has substructure been erased, or is the cluster still assembling?
 *
 * These axes define regimes with qualitatively different galaxy evolution,
 * gas behavior, and observational signatures.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FATE LOCKS (IRREVERSIBILITY)
 *
 * Cluster evolution becomes irreversible when one or more of the following thresholds
 * are crossed:
 *
 *   • gravitationalBinding
 *       – The system becomes a permanently bound cluster-scale halo.
 *
 *   • thermalization
 *       – Shock heating produces a long-lived, hot intracluster medium that dominates baryons.
 *
 *   • dynamicalRelaxation
 *       – Major substructure is erased and the potential becomes smooth.
 *
 *   • coolingFeedbackBalance
 *       – Long-term equilibrium between radiative cooling and AGN feedback is established.
 *
 * Once these locks occur, the cluster cannot revert to a group-scale or filamentary regime.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRANSITIONS
 *
 * Allowed transitions encode physically plausible cluster evolution paths, such as:
 *
 *   protoCluster → poorCluster → massiveCluster
 *   massiveCluster ↔ mergingCluster → relaxedCluster
 *   relaxedCluster → coolCoreCluster / nonCoolCoreCluster
 *
 * Transitions reflect **history and environment**, not just mass.
 * Major mergers can temporarily move a cluster out of a relaxed state,
 * but not undo its fundamental binding or scale.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RELATION TO OTHER MODELS
 *
 * • `PARCEL_FATES` describe **object-scale matter physics**
 * • `GROUP_SCALE_FATES` describe **intermediate halo-scale assembly**
 * • `CLUSTER_SCALE_FATES` describe **large-scale environmental endpoints**
 *
 * Together, these models form a hierarchical, multi-scale description of how matter
 * organizes itself in the universe.
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *
 * • Treat clusters as **dynamical processes**, not static catalog entries
 * • Encode **irreversibility explicitly**
 * • Separate **mass thresholds** from **physical regime changes**
 *
 * This allows cluster behavior to be reasoned about consistently across simulations,
 * observations, and conceptual models without relying on survey-specific definitions.
 */
export const CLUSTER_SCALE_FATES: Record<ClusterScaleFateKey, ClusterScaleFateCharacteristics> = {

    protoCluster: {
        massMin: 1e13,
        massMax: 1e14,
        dominantBaryonPhase: 'mixed',
        gravitationallyBound: false,
        fateLockedBy: false,
        typicalTimescaleGyr: 1,
        definingProcesses: [
            'hierarchical accretion',
            'group infall',
            'incomplete virialization'
        ],
        allowedTransitions: [
            'poorCluster',
            'mergingCluster'
        ],
        // Assembling cluster: mix of infalling groups
        // Still has spirals, transformation beginning
        childFateWeights: {
            spiralGalaxy: 0.25,      // still arriving from field
            lenticularGalaxy: 0.2,   // transformation starting
            ellipticalGalaxy: 0.15,  // group mergers
            dwarfIrregular: 0.1,     // infalling dwarfs
            dwarfSpheroid: 0.1,      // stripping beginning
            quenchedRemnant: 0.1,    // recently quenched
            activeGalactic: 0.05,    // AGN triggered by interactions
            diffuseHalo: 0.05,       // tidal debris
        }
    },

    collapsingCluster: {
        massMin: 1e14,
        massMax: 5e14,
        dominantBaryonPhase: 'mixed',
        gravitationallyBound: true,
        fateLockedBy: false,
        typicalTimescaleGyr: 1.5,
        definingProcesses: [
            'active assembly',
            'multiple group mergers',
            'ICM formation beginning'
        ],
        allowedTransitions: [
            'poorCluster',
            'mergingCluster'
        ],
        // Active collapse: rapid transformation
        childFateWeights: {
            lenticularGalaxy: 0.25,  // rapid stripping
            ellipticalGalaxy: 0.2,   // mergers common
            spiralGalaxy: 0.15,      // surviving but doomed
            quenchedRemnant: 0.15,   // recently quenched
            dwarfSpheroid: 0.1,      // stripped dwarfs
            activeGalactic: 0.08,    // merger-triggered AGN
            dwarfIrregular: 0.05,    // rare, being stripped
            diffuseHalo: 0.02,       // tidal debris
        }
    },

    poorCluster: {
        massMin: 1e14,
        massMax: 5e14,
        dominantBaryonPhase: 'mixed',
        gravitationallyBound: true,
        fateLockedBy: 'gravitationalBinding',
        typicalTimescaleGyr: 2,
        definingProcesses: [
            'group mergers',
            'halo virialization',
            'shock heating'
        ],
        allowedTransitions: [
            'mergingCluster',
            'relaxedCluster'
        ],
        // Bound but not massive: mixed populations
        childFateWeights: {
            lenticularGalaxy: 0.25,  // stripping ongoing
            ellipticalGalaxy: 0.2,   // from mergers
            spiralGalaxy: 0.15,      // at outskirts
            dwarfSpheroid: 0.15,     // stripped satellites
            quenchedRemnant: 0.1,    // quenched galaxies
            activeGalactic: 0.05,    // occasional AGN
            dwarfIrregular: 0.05,    // rare, infalling
            diffuseHalo: 0.05,       // tidal streams
        }
    },

    massiveCluster: {
        massMin: 5e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: 'thermalization',
        typicalTimescaleGyr: 3,
        definingProcesses: [
            'deep potential well',
            'hot intracluster medium',
            'long cooling times'
        ],
        allowedTransitions: [
            'mergingCluster',
            'relaxedCluster'
        ],
        // Massive, hot: mostly quiescent galaxies
        childFateWeights: {
            ellipticalGalaxy: 0.35,  // dominant population
            lenticularGalaxy: 0.25,  // common
            dwarfSpheroid: 0.15,     // stripped satellites
            quenchedRemnant: 0.1,    // post-AGN
            spiralGalaxy: 0.05,      // rare, at outskirts
            activeGalactic: 0.05,    // central AGN
            diffuseHalo: 0.05,       // tidal debris
        }
    },

    mergingCluster: {
        massMin: 1e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: false,
        typicalTimescaleGyr: 1,
        definingProcesses: [
            'cluster–cluster mergers',
            'shock fronts',
            'bulk gas motions',
            'substructure survival'
        ],
        allowedTransitions: [
            'relaxedCluster',
            'nonCoolCoreCluster'
        ],
        // Active merger: enhanced interactions, AGN
        childFateWeights: {
            ellipticalGalaxy: 0.25,  // from pre-existing
            lenticularGalaxy: 0.2,   // common
            quenchedRemnant: 0.15,   // merger quenching
            activeGalactic: 0.15,    // merger-triggered AGN
            dwarfSpheroid: 0.1,      // stripped satellites
            spiralGalaxy: 0.08,      // surviving at outskirts
            diffuseHalo: 0.07,       // tidal streams common
        }
    },

    relaxedCluster: {
        massMin: 1e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: 'dynamicalRelaxation',
        typicalTimescaleGyr: 4,
        definingProcesses: [
            'violent relaxation complete',
            'smooth potential',
            'isotropic galaxy velocities'
        ],
        allowedTransitions: [
            'coolCoreCluster',
            'nonCoolCoreCluster'
        ],
        // Relaxed: old populations dominate
        childFateWeights: {
            ellipticalGalaxy: 0.35,  // dominant
            lenticularGalaxy: 0.25,  // common
            dwarfSpheroid: 0.2,      // abundant satellites
            quenchedRemnant: 0.1,    // old quenched
            spiralGalaxy: 0.05,      // rare, infalling
            diffuseHalo: 0.05,       // ancient tidal debris
        }
    },

    coolCoreCluster: {
        massMin: 1e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: 'coolingFeedbackBalance',
        typicalTimescaleGyr: 5,
        definingProcesses: [
            'short central cooling times',
            'AGN feedback',
            'entropy stratification'
        ],
        allowedTransitions: [
            'nonCoolCoreCluster' // major merger can disrupt
        ],
        // Cool core: central BCG with AGN, old population
        childFateWeights: {
            ellipticalGalaxy: 0.4,   // dominant, including BCG
            lenticularGalaxy: 0.2,   // common
            dwarfSpheroid: 0.15,     // satellites
            activeGalactic: 0.1,     // central AGN in BCG
            quenchedRemnant: 0.1,    // old quenched
            spiralGalaxy: 0.03,      // very rare
            diffuseHalo: 0.02,       // minor debris
        }
    },

    nonCoolCoreCluster: {
        massMin: 1e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: false,
        typicalTimescaleGyr: 3,
        definingProcesses: [
            'merger heating',
            'high core entropy',
            'suppressed cooling'
        ],
        allowedTransitions: [
            'coolCoreCluster'
        ],
        // Merger-heated: similar to relaxed but more disturbed
        childFateWeights: {
            ellipticalGalaxy: 0.35,  // dominant
            lenticularGalaxy: 0.25,  // common
            dwarfSpheroid: 0.15,     // satellites
            quenchedRemnant: 0.1,    // post-merger
            activeGalactic: 0.05,    // less than cool-core
            spiralGalaxy: 0.05,      // rare, infalling
            diffuseHalo: 0.05,       // tidal debris
        }
    },

    fossilCluster: {
        massMin: 1e14,
        dominantBaryonPhase: 'plasma',
        gravitationallyBound: true,
        fateLockedBy: 'dynamicalRelaxation',
        typicalTimescaleGyr: 6,
        definingProcesses: [
            'early formation',
            'galaxy cannibalism',
            'lack of late infall'
        ],
        allowedTransitions: [],
        // Fossil: one giant elliptical dominates, few satellites
        childFateWeights: {
            ellipticalGalaxy: 0.5,   // central giant dominates
            dwarfSpheroid: 0.2,      // surviving small satellites
            quenchedRemnant: 0.15,   // post-merger remnants
            lenticularGalaxy: 0.1,   // few remaining
            diffuseHalo: 0.05,       // intracluster light
        }
    }
};