// frontend/src/pages/Dashboard.jsx
import React from "react";
import { PAGES } from "./routes";

const FLOW_ITEMS = [
  {
    page: PAGES.COLLECTOR,
    step: "Step 1",
    title: "Collector",
    icon: "🌿",
    desc: "Record harvest location, species, quantity, and upload a field photo.",
  },
  {
    page: PAGES.MIDDLEMAN,
    step: "Step 2",
    title: "Middleman",
    icon: "🚚",
    desc: "Log transfer documentation, storage conditions, and transport records.",
  },
  {
    page: PAGES.LAB,
    step: "Step 3",
    title: "Lab",
    icon: "🔬",
    desc: "Upload pesticide, heavy metals, and DNA test reports. Set pass/fail.",
  },
  {
    page: PAGES.MANUFACTURER,
    step: "Step 4",
    title: "Manufacturer",
    icon: "🏭",
    desc: "Record final formulation, batch quantity, and GMP certification.",
  },
];

export default function Dashboard({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <div className="dashboard-hero">
        <h2>Herbal Supply Chain<br />on the Blockchain</h2>
        <p>
          A role-based traceability proof-of-concept. Each supply chain actor
          uploads metadata to IPFS and records a content identifier on Ethereum —
          creating a tamper-proof, sequential audit trail from field to factory.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate(PAGES.ADMIN)}>
            Start — Register Workers
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(PAGES.VIEWER)}>
            View a Batch →
          </button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Supply Chain Workflow
        </p>
        <div className="flow-cards">
          {FLOW_ITEMS.map((item) => (
            <div key={item.page} className="flow-card" onClick={() => navigate(item.page)}>
              <div className="fc-step">{item.step}</div>
              <div className="fc-title">{item.icon} {item.title}</div>
              <div className="fc-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Architecture: </span>
        Each form uploads JSON metadata (+ optional files) to IPFS, receives a content identifier (CID), then sends only that CID to the smart contract on Sepolia.
        The contract enforces role permissions via <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: "0.75rem" }}>RegisteredWorker</code> and rejects out-of-order submissions.
        The Batch Viewer reconstructs the full audit trail by fetching each CID from IPFS.
      </div>
    </div>
  );
}