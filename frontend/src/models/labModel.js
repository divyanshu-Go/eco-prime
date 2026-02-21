/**
 * Build Lab JSON metadata
 */
export function createLabData({ labId, batchRef, moisturePercent, pesticideCid, heavyCid, dnaCid, pdfCid, pass }) {
  return {
    type: "lab",
    labId,
    batchRef,
    tests: {
      moisturePercent,
      pesticideReportCid: pesticideCid ? `ipfs://${pesticideCid}` : null,
      heavyMetalsReportCid: heavyCid ? `ipfs://${heavyCid}` : null,
      dnaBarcodeCid: dnaCid ? `ipfs://${dnaCid}` : null,
      labReportPdfCid: pdfCid ? `ipfs://${pdfCid}` : null,
    },
    pass,
    timestamp: Math.floor(Date.now() / 1000),
  };
}
