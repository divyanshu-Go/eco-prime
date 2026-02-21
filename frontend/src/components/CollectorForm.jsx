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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus("Connecting wallet...");
      const { account, contracts } = await connectWalletAndContracts();

      // Upload photo if provided
      let photoCid = null;
      if (file) {
        setTxStatus("Uploading photo to IPFS...");
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

      setTxStatus("Uploading metadata JSON to IPFS...");
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus("Sending transaction to blockchain...");
      const receipt = await sendTx(
        contracts.herb,
        "createBatch",
        account,
        batchRef,
        metadataCid
      );

      setTxStatus(`✅ Batch created! Transaction hash: ${receipt.transactionHash}`);
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
          placeholder="Batch Reference"
          value={batchRef}
          onChange={(e) => setBatchRef(e.target.value)}
          required
          className="input"
        />
        <input
          type="text"
          placeholder="Species"
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
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          required
          className="input"
        />
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
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="input"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn bg-blue-600 text-white w-full"
        >
          {loading ? "Processing..." : "Create Batch"}
        </button>
      </form>
      {txStatus && <p className="mt-3">{txStatus}</p>}
    </div>
  );
}
