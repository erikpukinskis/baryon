# Cluster and group fates distinction
_Exported on 12/28/2025 at 20:36:37 PST from Cursor (2.1.50)_

---

**User**

I'm trying to remember why we have separate CLUSTER and GROUP fates if they occupy the same scale.

---

**Cursor**

Looking at the files, I can see that **they actually don't occupy the same mass scale**:

**Groups** (`GROUP_SCALE_FATES`):
- Mass range: **10¹¹ – 10¹³ M☉**
- `unboundAssociation`: 10¹¹ – 10¹² M☉
- `boundGroup` and others: 10¹² – 10¹³ M☉

**Clusters** (`CLUSTER_SCALE_FATES`):
- Mass range: **10¹³ – 10¹⁵+ M☉**
- `protoCluster`: 10¹³ – 10¹⁴ M☉ (where groups get absorbed)
- Mature clusters: 10¹⁴+ M☉

The key distinctions are:

1. **Physical regime**: Groups have `dominantBaryonPhase: "mixed"` or `"stellar"`, while clusters are dominated by `"plasma"` (hot intracluster medium). This reflects that clusters are massive enough for shock heating to thermalize the gas.

2. **Fate connectivity**: Groups have `infallingGroup` as a terminal state with `fateLockedBy: "externalCapture"` — this is the pathway *into* clusters. Once a group is absorbed into a cluster halo, it's no longer a group.

3. **Different physics**: 
   - Groups are dynamically active with ongoing mergers between member galaxies
   - Clusters have established hot ICM where galaxy transformation is driven by ram pressure stripping and strangulation rather than galaxy-galaxy interactions

So the separation reflects a real physical boundary: groups are the building blocks that fall into clusters, and once absorbed, the physics changes fundamentally. The overlap at 10¹³ M☉ is the transition zone (`protoCluster`) where groups are actively assembling into what will become a cluster.

---

**User**

I don't get it though... some clusters have spiralGalaxy as a child, and some groups have spiralGalaxy as a child too?



So, which contains which?

---

**Cursor**

Great question! Let me check the model index to see how the hierarchy is actually structured:

```typescript
Mpc1: {
  fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
},
```

```plaintext
Mpc10 (cosmic web)  →  Mpc1 (groups OR clusters)  →  kpc100 (galaxies)
```

This clarifies everything. Look at line 147-149:

```30:31:app/model/index.ts
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
```

```147:149:app/model/index.ts
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
```

**Groups and clusters are alternative fates at the SAME scale (Mpc1)**, not nested structures!

The hierarchy is:
```
Mpc10 (cosmic web) → Mpc1 (group OR cluster) → kpc100 (galaxies)
```

Neither contains the other. They're **sibling fates** for the same parcel size. A 1 Mpc region can be:
- A group (lower mass, 10¹²–10¹³ M☉)
- A cluster (higher mass, 10¹⁴+ M☉)
- Something else (void, filament section, etc.)

Both contain galaxies as their children at the next scale down. The difference is the **environment** they provide:
- Groups → more spirals, irregulars (gentle environment)
- Clusters → more ellipticals, lenticulars (harsh ram pressure, hot ICM)

The `infallingGroup` fate represents what happens at the boundary: when a group-scale parcel gets gravitationally captured by a neighboring cluster-scale parcel, the group's galaxies get "repainted" with cluster-appropriate fates (more quenched, more lenticulars) as they experience the cluster environment.

```typescript
 *   Mpc10    →  Mpc1    →  kpc100   →  pc100        →  pc1     →  (AU1)
 *   (web)       (groups)   (galaxies)  (interstellar)  (stars)    (planets)
```

```typescript
  Mpc1: {
    fates: { GROUP_SCALE_FATES, CLUSTER_SCALE_FATES },
  },
```

```plaintext
Mpc10 (cosmic web) → Mpc1 (group OR cluster) → kpc100 (galaxies)
```

