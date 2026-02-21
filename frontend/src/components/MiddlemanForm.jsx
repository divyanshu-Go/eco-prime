import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createMiddlemanData } from "../models/middlemanModel";

export default function MiddlemanForm() {
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

      // Upload files to IPFS
      let transferCid = null,
        storageCid = null,
        transportCid = null;

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

      // Build JSON via model
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
      const receipt = await sendTx(
        contracts.herb,
        "addMiddlemanData",
        account,
        batchRef,
        metadataCid
      );

      setTxStatus(`✅ Data added! Tx: ${receipt.transactionHash}`);
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
        <input
          type="text"
          placeholder="Batch Reference"
          value={batchRef}
          onChange={(e) => setBatchRef(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="From (Collector ID)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="To (Middleman ID)"
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

        <label className="block">
          Transfer Proof:
          <input
            type="file"
            onChange={(e) => setTransferFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>
        <label className="block">
          Storage File:
          <input
            type="file"
            onChange={(e) => setStorageFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>
        <label className="block">
          Transport File:
          <input
            type="file"
            onChange={(e) => setTransportFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-green-600 text-white w-full"
        >
          {loading ? "Processing..." : "Add Middleman Data"}
        </button>
      </form>
      {txStatus && <p className="mt-3">{txStatus}</p>}
    </div>
  );
}
