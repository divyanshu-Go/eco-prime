/**
 * frontend/src/models/manufacturerModel.js
 * Build Manufacturer JSON metadata
 */
export function createManufacturerData({
  batchRef,
  processingCid,
  formulation,
  finalBatchQty,
  qrRootCid,
  gmpId,
}) {
  return {
    type: "manufacturer",
    batchRef,
    processingCid: processingCid ? `ipfs://${processingCid}` : null,
    formulation,
    finalBatchQty,
    qrRootCid: qrRootCid ? `ipfs://${qrRootCid}` : null,
    gmpId,
  };
}
