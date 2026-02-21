// frontend/src/components/MiddlemanForm.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createMiddlemanData } from "../models/middlemanModel";

export default function MiddlemanForm() {
  const [batchId, setBatchId] = useState("");
  const [batchRef, setBatchRef] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [transferFile, setTransferFile] = useState(null);
  const [storageFile, setStorageFile] = useState(null);
  const [transportFile, setTransportFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus("🔗 Connecting wallet...");
      const { account, contracts } = await connectWalletAndContracts();

      let transferCid = null, storageCid = null, transportCid = null;

      if (transferFile) {
        setTxStatus("📤 Uploading transfer proof...");
        transferCid = await uploadFileToIPFS(transferFile);
      }
      if (storageFile) {
        setTxStatus("📤 Uploading storage file...");
        storageCid = await uploadFileToIPFS(storageFile);
      }
      if (transportFile) {
        setTxStatus("📤 Uploading transport file...");
        transportCid = await uploadFileToIPFS(transportFile);
      }

      const metadata = createMiddlemanData({
        batchRef,
        from,
        to,
        transferCid,
        storageCid,
        transportCid,
        finalWeight: Number(finalWeight),
      });

      setTxStatus("📤 Uploading metadata JSON...");
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus("🚀 Sending transaction...");
      // Contract takes uint256 batchId — must pass the numeric ID, not batchRef string
      const receipt = await sendTx(
        contracts.herb,
        "addMiddlemanData",
        account,
        batchId,
        metadataCid
      );

      setTxStatus(`✅ Middleman data added! Tx: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Middleman Form</h2>
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Numeric batch ID — the key fix */}
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
        <input
          type="text"
          placeholder="From (Collector ID or name)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="To (Middleman ID or name)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Final Weight (Kg)"
          value={finalWeight}
          onChange={(e) => setFinalWeight(e.target.value)}
          required
          className="input"
        />

        <label className="block text-sm text-gray-600">
          Transfer Proof (optional):
          <input type="file" onChange={(e) => setTransferFile(e.target.files[0])} className="input mt-1" />
        </label>
        <label className="block text-sm text-gray-600">
          Storage Document (optional):
          <input type="file" onChange={(e) => setStorageFile(e.target.files[0])} className="input mt-1" />
        </label>
        <label className="block text-sm text-gray-600">
          Transport Document (optional):
          <input type="file" onChange={(e) => setTransportFile(e.target.files[0])} className="input mt-1" />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-green-600 text-white w-full"
        >
          {loading ? "Processing..." : "Add Middleman Data"}
        </button>
      </form>
      {txStatus && <p className="mt-3 text-sm break-all">{txStatus}</p>}
    </div>
  );
}