import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createLabData } from "../models/labModel";

export default function LabForm() {
  const [batchRef, setBatchRef] = useState("");
  const [labId, setLabId] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [pass, setPass] = useState(true);

  const [pesticideFile, setPesticideFile] = useState(null);
  const [heavyMetalsFile, setHeavyMetalsFile] = useState(null);
  const [dnaFile, setDnaFile] = useState(null);
  const [reportPdf, setReportPdf] = useState(null);

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus("🔗 Connecting wallet...");
      const { account, contracts } = await connectWalletAndContracts();

      let pesticideCid = null,
        heavyCid = null,
        dnaCid = null,
        pdfCid = null;

      if (pesticideFile) {
        setTxStatus("📤 Uploading pesticide report...");
        pesticideCid = await uploadFileToIPFS(pesticideFile);
      }
      if (heavyMetalsFile) {
        setTxStatus("📤 Uploading heavy metals report...");
        heavyCid = await uploadFileToIPFS(heavyMetalsFile);
      }
      if (dnaFile) {
        setTxStatus("📤 Uploading DNA barcode...");
        dnaCid = await uploadFileToIPFS(dnaFile);
      }
      if (reportPdf) {
        setTxStatus("📤 Uploading lab report PDF...");
        pdfCid = await uploadFileToIPFS(reportPdf);
      }

      // Build metadata JSON
      const metadata = createLabData({
        labId,
        batchRef,
        moisturePercent: Number(moisturePercent),
        pesticideCid,
        heavyCid,
        dnaCid,
        pdfCid,
        pass,
      });

      setTxStatus("📤 Uploading metadata JSON...");
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus("🚀 Sending transaction...");
      const receipt = await sendTx(
        contracts.herb,
        "addLabData",
        account,
        batchRef,
        metadataCid
      );

      setTxStatus(`✅ Lab data added! Tx: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Lab Form</h2>
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
          placeholder="Lab ID"
          value={labId}
          onChange={(e) => setLabId(e.target.value)}
          required
          className="input"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Moisture %"
          value={moisturePercent}
          onChange={(e) => setMoisturePercent(e.target.value)}
          required
          className="input"
        />

        <div>
          <label className="block mb-1">Pass / Fail:</label>
          <select
            value={pass}
            onChange={(e) => setPass(e.target.value === "true")}
            className="input"
          >
            <option value="true">Pass ✅</option>
            <option value="false">Fail ❌</option>
          </select>
        </div>

        <label className="block">
          Pesticide Report:
          <input
            type="file"
            onChange={(e) => setPesticideFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>
        <label className="block">
          Heavy Metals Report:
          <input
            type="file"
            onChange={(e) => setHeavyMetalsFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>
        <label className="block">
          DNA Barcode File:
          <input
            type="file"
            onChange={(e) => setDnaFile(e.target.files[0])}
            className="input mt-1"
          />
        </label>
        <label className="block">
          Lab Report PDF:
          <input
            type="file"
            onChange={(e) => setReportPdf(e.target.files[0])}
            className="input mt-1"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-blue-600 text-white w-full"
        >
          {loading ? "Processing..." : "Add Lab Data"}
        </button>
      </form>
      {txStatus && <p className="mt-3">{txStatus}</p>}
    </div>
  );
}
