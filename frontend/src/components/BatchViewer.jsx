// src/components/BatchViewer.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, callView } from "../web3";
import { fetchJsonFromCID, gatewayUrlFromCID } from "../ipfs";
import { CircleCheckBig } from "lucide-react";

// Visual stage progress indicator
function StageIndicator({ label, done }) {
  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium border ${
        done
          ? "bg-green-50 border-green-300 text-green-700"
          : "bg-gray-50 border-gray-200 text-gray-400"
      }`}
    >
      <span>{done ? <CircleCheckBig className="w-4 h-4" /> : "○"}</span>
      <span>{label}</span>
    </div>
  );
}

export default function BatchViewer() {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async (e) => {
    e?.preventDefault();
    if (!batchId) return;

    try {
      setLoading(true);
      setError("");
      setBatchData(null);

      const { contracts } = await connectWalletAndContracts();

      // Get full batch CIDs
      const raw = await callView(contracts.herb, "getFullBatch", batchId);

      const batchRef = raw.batchRef ?? raw[0] ?? "";
      const collectorCid = raw.collectorCid ?? raw[1] ?? "";
      const middlemanCid = raw.middlemanCid ?? raw[2] ?? "";
      const labCid = raw.labCid ?? raw[3] ?? "";
      const manufacturerCid = raw.manufacturerCid ?? raw[4] ?? "";

      // Get stage completion flags for progress indicator
      let hasCollector = false, hasMiddleman = false, hasLab = false, hasManufacturer = false;
      try {
        const summary = await callView(contracts.herb, "getBatchSummary", batchId);
        hasCollector = summary.hasCollector ?? summary[1] ?? false;
        hasMiddleman = summary.hasMiddleman ?? summary[2] ?? false;
        hasLab = summary.hasLab ?? summary[3] ?? false;
        hasManufacturer = summary.hasManufacturer ?? summary[4] ?? false;
      } catch (_) {
        // fallback: infer from CIDs
        hasCollector = !!collectorCid;
        hasMiddleman = !!middlemanCid;
        hasLab = !!labCid;
        hasManufacturer = !!manufacturerCid;
      }

      // Fetch all IPFS JSONs in parallel
      const entries = [
        { role: "collector", cid: collectorCid },
        { role: "middleman", cid: middlemanCid },
        { role: "lab", cid: labCid },
        { role: "manufacturer", cid: manufacturerCid },
      ];

      const results = await Promise.all(
        entries.map(async (entry) => {
          if (!entry.cid) return { ...entry, data: null };
          try {
            const data = await fetchJsonFromCID(entry.cid);
            return { ...entry, data };
          } catch (err) {
            console.error(`Failed to fetch ${entry.role} JSON for CID ${entry.cid}`, err);
            return { ...entry, data: null, fetchError: err.message || String(err) };
          }
        })
      );

      const resultMap = results.reduce((acc, r) => {
        acc[r.role] = { cid: r.cid, data: r.data, fetchError: r.fetchError };
        return acc;
      }, {});

      setBatchData({
        batchRef,
        hasCollector,
        hasMiddleman,
        hasLab,
        hasManufacturer,
        collector: resultMap.collector,
        middleman: resultMap.middleman,
        lab: resultMap.lab,
        manufacturer: resultMap.manufacturer,
      });
    } catch (err) {
      console.error(err);
      setError(`❌ Failed to fetch batch: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, section) => {
    if (!section) return null;

    if (!section.cid) {
      return (
        <div className="border rounded p-3 mb-4 bg-gray-50">
          <h3 className="font-semibold mb-1 text-gray-500">{title}</h3>
          <p className="text-sm text-gray-400">No data recorded yet.</p>
        </div>
      );
    }

    return (
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <h3 className="font-semibold mb-3 text-gray-800">{title}</h3>

        {section.fetchError && (
          <p className="text-red-600 text-sm mb-2">⚠ Could not fetch metadata: {section.fetchError}</p>
        )}

        {section.data ? (
          <div className="space-y-2">
            {Object.entries(section.data).map(([key, value]) => {
              // IPFS URI — image
              if (typeof value === "string" && value.startsWith("ipfs://")) {
                const url = gatewayUrlFromCID(value);
                if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
                  return (
                    <div key={key}>
                      <p className="font-medium text-sm text-gray-600">{key}</p>
                      <img src={url} alt={key} className="max-w-xs border rounded shadow mt-1" />
                    </div>
                  );
                }
                // IPFS URI — other file (PDF, etc.)
                return (
                  <div key={key}>
                    <p className="font-medium text-sm text-gray-600">{key}</p>
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                      View File ↗
                    </a>
                  </div>
                );
              }

              // Nested object (location, tests, etc.)
              if (typeof value === "object" && value !== null) {
                return (
                  <div key={key}>
                    <p className="font-medium text-sm text-gray-600">{key}</p>
                    <pre className="text-sm bg-white p-2 rounded border overflow-x-auto mt-1">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                );
              }

              // Plain value
              return (
                <p key={key} className="text-sm">
                  <span className="font-medium text-gray-700">{key}: </span>
                  <span className="text-gray-600">{String(value)}</span>
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">CID recorded on-chain but metadata could not be retrieved from IPFS.</p>
        )}

        {/* CID link — labelled clearly for demo */}
        <p className="text-xs text-gray-400 mt-3 pt-2 border-t">
          Raw metadata on IPFS:{" "}
          <a
            href={gatewayUrlFromCID(section.cid)}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline break-all"
          >
            {section.cid} ↗
          </a>
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Batch Viewer</h2>

      <form onSubmit={handleFetch} className="flex space-x-2 mb-4">
        <input
          type="number"
          placeholder="Enter Batch ID (e.g. 1)"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="input flex-1"
          required
        />
        <button type="submit" disabled={loading} className="btn bg-blue-600 text-white">
          {loading ? "Fetching..." : "View"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {batchData && (
        <div>
          {/* Batch header */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-600 font-medium">Batch #{batchId}</p>
            <p className="font-bold text-gray-800">{batchData.batchRef}</p>
          </div>

          {/* Stage progress indicator */}
          <div className="mb-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Supply Chain Progress</p>
            <div className="flex gap-2 flex-wrap">
              <StageIndicator label="Collector" done={batchData.hasCollector} />
              <StageIndicator label="Middleman" done={batchData.hasMiddleman} />
              <StageIndicator label="Lab" done={batchData.hasLab} />
              <StageIndicator label="Manufacturer" done={batchData.hasManufacturer} />
            </div>
          </div>

          {renderSection("Collector Data", batchData.collector)}
          {renderSection("Middleman Data", batchData.middleman)}
          {renderSection("Lab Data", batchData.lab)}
          {renderSection("Manufacturer Data", batchData.manufacturer)}
        </div>
      )}
    </div>
  );
}