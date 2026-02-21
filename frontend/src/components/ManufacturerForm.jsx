// frontend/src/components/ManufacturerForm.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
// BUG FIX: was importing createMiddlemanData — now correctly imports createManufacturerData
import { createManufacturerData } from "../models/manufacturerModel";

export default function ManufacturerForm() {
  const [batchId, setBatchId] = useState("");
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

      let processingCid = null, qrRootCid = null;

      if (processingFile) {
        setTxStatus("📤 Uploading processing file...");
        processingCid = await uploadFileToIPFS(processingFile);
      }
      if (qrRootFile) {
        setTxStatus("📤 Uploading QR root file...");
        qrRootCid = await uploadFileToIPFS(qrRootFile);
      }

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
      // Contract takes uint256 batchId
      const receipt = await sendTx(
        contracts.herb,
        "addManufacturerData",
        account,
        batchId,
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

        {/* Numeric batch ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch ID <span className="text-blue-600">(number from Step 1)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 1"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
            className="input"
          />
        </div>

        <input
          type="text"
          placeholder="Batch Reference (for your records)"
          value={batchRef}
          onChange={(e) => setBatchRef(e.target.value)}
          className="input"
        />

        <label className="block text-sm text-gray-600">
          Processing Document (optional):
          <input type="file" onChange={(e) => setProcessingFile(e.target.files[0])} className="input mt-1" />
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
          placeholder="Final Batch Quantity (units)"
          value={finalBatchQty}
          onChange={(e) => setFinalBatchQty(e.target.value)}
          required
          className="input"
        />

        <label className="block text-sm text-gray-600">
          QR Root File (optional):
          <input type="file" onChange={(e) => setQrRootFile(e.target.files[0])} className="input mt-1" />
        </label>

        <input
          type="text"
          placeholder="GMP Certificate ID"
          value={gmpId}
          onChange={(e) => setGmpId(e.target.value)}
          required
          className="input"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn bg-purple-600 text-white w-full"
        >
          {loading ? "Processing..." : "Add Manufacturer Data"}
        </button>
      </form>
      {txStatus && <p className="mt-3 text-sm break-all">{txStatus}</p>}
    </div>
  );
}