// src/models/collectorModel.js
export function createCollectorData({ account, batchRef, species, qty, lat, lon, age, moisture, photoCid, notes }) {
  return {
    type: "collector",
    batchRef,
    collectorId: `COL-${account}`,
    species,
    quantityKg: qty,
    location: { lat, lon },
    harvestTimestamp: Math.floor(Date.now() / 1000),
    rootAgeYears: age,
    moisturePercent: moisture,
    photo: photoCid,
    notes,
  };
}
