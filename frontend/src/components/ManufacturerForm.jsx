import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createManufacturerData } from "../models/manufacturerModel";

export default function ManufacturerForm() {
  const [batchRef, setBatchRef] = useState("");
  const [processingFile, setProcessingFile] = useState(null);
  const [qrRootFile, setQrRootFile] = useState(null);

  const [formulation, setFormulation] = useState("");
  const [finalBatchQty, setFinalBatchQty] = useState("");
  const [gmpId, setGmpId] = useState("");

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus("🔗 Connecting wallet...");
      const { account, contracts } = await connectWalletAndContracts();

      let processingCid = null;
      let qrRootCid = null;

      if (processingFile) {
        setTxStatus("📤 Uploading processing file...");
        processingCid = await uploadFileToIPFS(processingFile);
      }
      if (qrRootFile) {
        setTxStatus("📤 Uploading QR root file...");
        qrRootCid = await uploadFileToIPFS(qrRootFile);
      }

      // Build metadata JSON
      const metadata = createManufacturerData({
        batchRef,
        processingCid,
        formulation,
        finalBatchQty: Number(finalBatchQty),
        qrRootCid,
        gmpId,
      });

      setTxStatus("📤 Uploading metadata JSON...");
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus("🚀 Sending transaction...");
      const receipt = await sendTx(
        contracts.herb,
        "addManufacturerData",
        account,
        batchRef,
        metadataCid
      );

      setTxStatus(`✅ Manufacturer data added! Tx: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Manufacturer Form</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Batch Reference"
          value={batchRef}
          onChange={(e) => setBatchRef(e.target.value)}
          required
          className="input"
        />

        <label className="block">
          Processing File (optional):
          <input
            type="file"
            onChange={(e) => setProcessingFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>

        <input
          type="text"
          placeholder="Formulation (e.g. Powder 5%)"
          value={formulation}
          onChange={(e) => setFormulation(e.target.value)}
          required
          className="input"
        />

        <input
          type="number"
          placeholder="Final Batch Qty"
          value={finalBatchQty}
          onChange={(e) => setFinalBatchQty(e.target.value)}
          required
          className="input"
        />

        <label className="block">
          QR Root File (optional):
          <input
            type="file"
            onChange={(e) => setQrRootFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>

        <input
          type="text"
          placeholder="GMP ID"
          value={gmpId}
          onChange={(e) => setGmpId(e.target.value)}
          required
          className="input"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn bg-blue-600 text-white w-full"
        >
          {loading ? "Processing..." : "Add Manufacturer Data"}
        </button>
      </form>
      {txStatus && <p className="mt-3">{txStatus}</p>}
    </div>
  );
}
