/**
 * Simple test script for findGalaxies
 *
 * Run with: npx ts-node test-findGalaxies.ts
 */

import { findGalaxies } from "./findGalaxies";

console.log("Finding 10 galaxies...\n");

const result = findGalaxies({ limit: 10, universeSeed: 42 });

console.log(
  `Found ${result.galaxies.length} galaxies after ${result.observations.length} observations:\n`
);

for (const galaxy of result.galaxies) {
  console.log(
    `  Galaxy at Mpc10(${galaxy.Mpc10}), Mpc1(${galaxy.Mpc1}), kpc100(${galaxy.kpc100})`
  );
}

console.log("\n--- Sample of observations ---\n");

// Show first 20 observations
for (const obs of result.observations.slice(0, 20)) {
  const { Mpc10, Mpc1, kpc100 } = obs.coordinates;
  console.log(
    `  ${obs.fate.padEnd(
      18
    )} at Mpc10(${Mpc10}), Mpc1(${Mpc1}), kpc100(${kpc100})`
  );
}

if (result.observations.length > 20) {
  console.log(`  ... and ${result.observations.length - 20} more observations`);
}

// Show fate distribution
console.log("\n--- Fate distribution ---\n");

const fateCounts: Record<string, number> = {};
for (const obs of result.observations) {
  fateCounts[obs.fate] = (fateCounts[obs.fate] || 0) + 1;
}

const sorted = Object.entries(fateCounts).sort((a, b) => b[1] - a[1]);
for (const [fate, count] of sorted) {
  const pct = ((count / result.observations.length) * 100).toFixed(1);
  console.log(`  ${fate.padEnd(18)} ${count.toString().padStart(3)} (${pct}%)`);
}
