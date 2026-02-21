/**
 * Build Middleman JSON metadata
 * models/middlemanModel.js
 */
export function createMiddlemanData({ batchRef, from, to, transferCid, storageCid, transportCid, finalWeight }) {
  return {
    type: "middleman",
    batchRef,
    from,
    to,
    transferSignatureCid: transferCid ? `ipfs://${transferCid}` : null,
    storageCid: storageCid ? `ipfs://${storageCid}` : null,
    transportCid: transportCid ? `ipfs://${transportCid}` : null,
    finalWeightKg: finalWeight,
  };
}
