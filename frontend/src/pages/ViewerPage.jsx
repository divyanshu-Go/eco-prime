// frontend/src/pages/ViewerPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, callView } from "../web3";
import { fetchJsonFromCID, gatewayUrlFromCID } from "../ipfs";
import { PageHeader, Card, CardHeader, CardBody, StatusBar } from "../components/ui";

function ProgressStage({ label, icon, done }) {
  return (
    <div className={`progress-stage ${done ? "done" : ""}`}>
      <div className="ps-icon">{done ? "✓" : icon}</div>
      <div className="ps-label">{label}</div>
    </div>
  );
}

function DataSection({ title, section }) {
  if (!section) return null;

  if (!section.cid) {
    return (
      <div className="data-section">
        <div className="data-section-header">
          <h3>{title}</h3>
          <span className="stage-pill pending">Not recorded</span>
        </div>
        <div className="section-empty">No data submitted for this stage yet.</div>
      </div>
    );
  }

  return (
    <div className="data-section">
      <div className="data-section-header">
        <h3>{title}</h3>
        {section.fetchError
          ? <span className="stage-pill" style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>Fetch error</span>
          : <span className="stage-pill done">On-chain ✓</span>
        }
      </div>

      <div className="data-section-body">
        {section.fetchError && (
          <p style={{ color: "var(--red)", fontSize: "0.78rem", marginBottom: 12 }}>⚠ {section.fetchError}</p>
        )}

        {section.data ? (
          <>
            {Object.entries(section.data).map(([key, value]) => {
              // IPFS URI — image
              if (typeof value === "string" && value.startsWith("ipfs://")) {
                const url = gatewayUrlFromCID(value);
                if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
                  return (
                    <div key={key} className="data-field" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                      <div className="df-key">{key}</div>
                      <img src={url} alt={key} style={{ maxWidth: 200, borderRadius: 6, border: "1px solid var(--border)", marginTop: 6 }} />
                    </div>
                  );
                }
                return (
                  <div key={key} className="data-field">
                    <div className="df-key">{key}</div>
                    <div className="df-val">
                      <a href={url} target="_blank" rel="noreferrer" className="cid-link">View file ↗</a>
                    </div>
                  </div>
                );
              }

              // Nested object
              if (typeof value === "object" && value !== null) {
                return (
                  <div key={key} className="data-field" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="df-key">{key}</div>
                    <pre style={{ fontSize: "0.75rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, padding: "8px 12px", marginTop: 6, overflowX: "auto", color: "var(--text-secondary)", width: "100%" }}>
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                );
              }

              // Null or empty
              if (value === null || value === "") return null;

              return (
                <div key={key} className="data-field">
                  <div className="df-key">{key}</div>
                  <div className="df-val">{String(value)}</div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            CID recorded on-chain but metadata could not be retrieved from IPFS.
          </p>
        )}

        {/* Raw IPFS link */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: 8 }}>Raw IPFS metadata:</span>
          <a href={gatewayUrlFromCID(section.cid)} target="_blank" rel="noreferrer" className="cid-link">
            {section.cid.slice(0, 20)}…{section.cid.slice(-6)} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const [batchId, setBatchId]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [error, setError]       = useState("");

  const handleFetch = async (e) => {
    e?.preventDefault();
    if (!batchId) return;
    try {
      setLoading(true);
      setError("");
      setBatchData(null);

      const { contracts } = await connectWalletAndContracts();
      const raw = await callView(contracts.herb, "getFullBatch", batchId);

      const batchRef       = raw.batchRef       ?? raw[0] ?? "";
      const collectorCid   = raw.collectorCid   ?? raw[1] ?? "";
      const middlemanCid   = raw.middlemanCid   ?? raw[2] ?? "";
      const labCid         = raw.labCid         ?? raw[3] ?? "";
      const manufacturerCid = raw.manufacturerCid ?? raw[4] ?? "";

      // Stage flags
      let hasCollector = false, hasMiddleman = false, hasLab = false, hasManufacturer = false;
      try {
        const summary = await callView(contracts.herb, "getBatchSummary", batchId);
        hasCollector    = summary.hasCollector    ?? summary[1] ?? false;
        hasMiddleman    = summary.hasMiddleman    ?? summary[2] ?? false;
        hasLab          = summary.hasLab          ?? summary[3] ?? false;
        hasManufacturer = summary.hasManufacturer ?? summary[4] ?? false;
      } catch (_) {
        hasCollector    = !!collectorCid;
        hasMiddleman    = !!middlemanCid;
        hasLab          = !!labCid;
        hasManufacturer = !!manufacturerCid;
      }

      // Fetch IPFS JSONs in parallel
      const entries = [
        { role: "collector",    cid: collectorCid },
        { role: "middleman",    cid: middlemanCid },
        { role: "lab",          cid: labCid },
        { role: "manufacturer", cid: manufacturerCid },
      ];

      const results = await Promise.all(
        entries.map(async (entry) => {
          if (!entry.cid) return { ...entry, data: null };
          try {
            const data = await fetchJsonFromCID(entry.cid);
            return { ...entry, data };
          } catch (err) {
            return { ...entry, data: null, fetchError: err.message || String(err) };
          }
        })
      );

      const rm = results.reduce((acc, r) => {
        acc[r.role] = { cid: r.cid, data: r.data, fetchError: r.fetchError };
        return acc;
      }, {});

      setBatchData({ batchRef, hasCollector, hasMiddleman, hasLab, hasManufacturer, ...rm });
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch batch: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        stepLabel="Audit"
        title="Batch Viewer"
        description="Enter a Batch ID to reconstruct the full on-chain supply chain record. Each stage's metadata is fetched directly from IPFS."
      />

      {/* Search */}
      <Card style={{ marginBottom: 24 }}>
        <CardBody>
          <form onSubmit={handleFetch} style={{ display: "flex", gap: 10 }}>
            <input
              className="form-input"
              type="number"
              placeholder="Enter Batch ID (e.g. 1)"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? "Fetching..." : "View Batch"}
            </button>
          </form>
          {error && <div className="status-bar error" style={{ marginTop: 12 }}>{error}</div>}
        </CardBody>
      </Card>

      {/* Results */}
      {batchData && (
        <div>
          {/* Batch header */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Batch #{batchId}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{batchData.batchRef}</div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="viewer-progress" style={{ marginBottom: 24 }}>
            <ProgressStage label="Collector"    icon="🌿" done={batchData.hasCollector} />
            <ProgressStage label="Middleman"    icon="🚚" done={batchData.hasMiddleman} />
            <ProgressStage label="Lab"          icon="🔬" done={batchData.hasLab} />
            <ProgressStage label="Manufacturer" icon="🏭" done={batchData.hasManufacturer} />
          </div>

          {/* Data sections */}
          <DataSection title="🌿 Collector Data"    section={batchData.collector} />
          <DataSection title="🚚 Middleman Data"    section={batchData.middleman} />
          <DataSection title="🔬 Lab Data"          section={batchData.lab} />
          <DataSection title="🏭 Manufacturer Data" section={batchData.manufacturer} />
        </div>
      )}
    </div>
  );
}