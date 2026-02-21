// frontend/src/components/CollectorForm.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createCollectorData } from "../models/collectorModel";

export default function CollectorForm() {
  const [batchRef, setBatchRef] = useState("");
  const [species, setSpecies] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [rootAge, setRootAge] = useState("");
  const [moisture, setMoisture] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [createdBatchId, setCreatedBatchId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setCreatedBatchId(null);
      setTxStatus("🔗 Connecting wallet...");
      const { account, contracts } = await connectWalletAndContracts();

      // Upload photo if provided
      let photoCid = null;
      if (file) {
        setTxStatus("📤 Uploading photo to IPFS...");
        photoCid = await uploadFileToIPFS(file);
      }

      // Build collector JSON via model
      const metadata = createCollectorData({
        account,
        batchRef,
        species,
        qty: Number(quantity),
        lat: Number(lat),
        lon: Number(lon),
        age: Number(rootAge),
        moisture: Number(moisture),
        photoCid,
        notes,
      });

      setTxStatus("📤 Uploading metadata JSON to IPFS...");
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus("🚀 Sending transaction to blockchain...");
      const receipt = await sendTx(
        contracts.herb,
        "createBatch",
        account,
        batchRef,
        metadataCid
      );

      // Extract batch ID from the BatchCreated event in the receipt
      let batchId = null;
      try {
        const event = receipt.events?.BatchCreated;
        if (event) {
          batchId = event.returnValues?.batchId ?? event.returnValues?.[0];
        }
      } catch (_) {
        // fallback: batch ID not extractable, still show tx hash
      }

      setCreatedBatchId(batchId);
      setTxStatus(`✅ Batch created! Transaction: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Collector Form</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Batch Reference (e.g. HERB-2025-001)"
          value={batchRef}
          onChange={(e) => setBatchRef(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="Species (e.g. Panax ginseng)"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Quantity (Kg)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="input"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
            className="input flex-1"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            required
            className="input flex-1"
          />
        </div>
        <input
          type="number"
          placeholder="Root Age (Years)"
          value={rootAge}
          onChange={(e) => setRootAge(e.target.value)}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Moisture %"
          value={moisture}
          onChange={(e) => setMoisture(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
        />
        <label className="block text-sm text-gray-600">
          Harvest Photo (optional):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-blue-600 text-white w-full"
        >
          {loading ? "Processing..." : "Create Batch"}
        </button>
      </form>

      {/* Status message */}
      {txStatus && (
        <p className="mt-3 text-sm break-all">{txStatus}</p>
      )}

      {/* Prominent batch ID display — critical for demo */}
      {createdBatchId !== null && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded text-center">
          <p className="text-sm text-green-700 font-medium">Batch ID (use this in all subsequent forms)</p>
          <p className="text-3xl font-bold text-green-800 mt-1">#{createdBatchId}</p>
        </div>
      )}
    </div>
  );
}