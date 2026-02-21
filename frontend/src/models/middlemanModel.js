/**
 * Build Middleman JSON metadata
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
