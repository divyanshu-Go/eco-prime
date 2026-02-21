// src/components/BatchViewer.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, callView } from "../web3";
import { fetchJsonFromCID, gatewayUrlFromCID } from "../ipfs";

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

      // call contract
      const raw = await callView(contracts.herb, "getFullBatch", batchId);
      console.log("getFullBatch raw:", raw);

      // extract safely (prefer named properties, fall back to numeric indexes)
      const batchRef = raw.batchRef ?? raw[0] ?? "";
      const collectorCid = raw.collectorCid ?? raw[1] ?? "";
      const middlemanCid = raw.middlemanCid ?? raw[2] ?? "";
      const labCid = raw.labCid ?? raw[3] ?? "";
      const manufacturerCid = raw.manufacturerCid ?? raw[4] ?? "";

      // Prepare entries to fetch from IPFS
      const entries = [
        { role: "collector", cid: collectorCid },
        { role: "middleman", cid: middlemanCid },
        { role: "lab", cid: labCid },
        { role: "manufacturer", cid: manufacturerCid },
      ];

      // Fetch all JSONs in parallel (graceful for missing/failed fetches)
      const fetchPromises = entries.map(async (entry) => {
        if (!entry.cid) return { ...entry, data: null };
        try {
          const data = await fetchJsonFromCID(entry.cid);
          return { ...entry, data };
        } catch (err) {
          console.error(`Failed to fetch ${entry.role} JSON for ${entry.cid}`, err);
          return { ...entry, data: null, fetchError: err.message || String(err) };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Map results for render
      const resultMap = results.reduce((acc, r) => {
        acc[r.role] = { cid: r.cid, data: r.data, fetchError: r.fetchError };
        return acc;
      }, {});

      setBatchData({
        batchRef,
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
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">No data recorded.</p>
      </div>
    );
  }

  return (
    <div className="border rounded p-3 mb-4 bg-gray-50">
      <h3 className="font-semibold mb-2">{title}</h3>
      {section.fetchError && (
        <p className="text-red-600 text-sm">Error fetching JSON: {section.fetchError}</p>
      )}

      {section.data ? (
        <div className="space-y-2">
          {Object.entries(section.data).map(([key, value]) => {
            // If value is an IPFS URI
            if (typeof value === "string" && value.startsWith("ipfs://")) {
              const url = gatewayUrlFromCID(value);

              // If it's an image
              if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
                return (
                  <div key={key}>
                    <p className="font-medium">{key}</p>
                    <img
                      src={url}
                      alt={key}
                      className="max-w-xs border rounded shadow"
                    />
                  </div>
                );
              }

              // If it's a PDF or other file
              return (
                <div key={key}>
                  <p className="font-medium">{key}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View File
                  </a>
                </div>
              );
            }

            // For nested objects (like `location` or `tests`)
            if (typeof value === "object" && value !== null) {
              return (
                <div key={key}>
                  <p className="font-medium">{key}</p>
                  <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              );
            }

            // Default: show as text
            return (
              <p key={key}>
                <span className="font-medium">{key}: </span>
                {String(value)}
              </p>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Metadata present but could not be fetched.</p>
      )}

      <p className="text-xs text-gray-500 mt-2">
        CID:{" "}
        <a
          href={gatewayUrlFromCID(section.cid)}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          {section.cid}
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
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="input flex-1"
          required
        />
        <button type="submit" disabled={loading} className="btn bg-blue-600 text-white">
          {loading ? "Fetching..." : "View"}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {batchData && (
        <div>
          <p className="mb-4">
            <span className="font-semibold">Batch Ref:</span> {batchData.batchRef}
          </p>

          {renderSection("Collector Data", batchData.collector)}
          {renderSection("Middleman Data", batchData.middleman)}
          {renderSection("Lab Data", batchData.lab)}
          {renderSection("Manufacturer Data", batchData.manufacturer)}
        </div>
      )}
    </div>
  );
}
