// frontend/src/components/layout/Sidebar.jsx
import React from "react";
import { PAGES } from "../../pages/routes";

const NAV_ITEMS = [
  { page: PAGES.ADMIN,        step: "0", label: "Register Worker",  icon: "⚙" },
  { page: PAGES.COLLECTOR,    step: "1", label: "Collector",         icon: "🌿" },
  { page: PAGES.MIDDLEMAN,    step: "2", label: "Middleman",         icon: "🚚" },
  { page: PAGES.LAB,          step: "3", label: "Lab",               icon: "🔬" },
  { page: PAGES.MANUFACTURER, step: "4", label: "Manufacturer",      icon: "🏭" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ cursor: "pointer" }} onClick={() => onNavigate(PAGES.DASHBOARD)}>
        <div className="wordmark">eco-prime</div>
        <div className="tagline">Supply Chain Traceability</div>
      </div>

      {/* Workflow nav */}
      <p className="sidebar-section-label">Workflow</p>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            className={`nav-item ${activePage === item.page ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="step-badge">{item.step}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Viewer — separate section */}
      <p className="sidebar-section-label">Audit</p>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activePage === PAGES.VIEWER ? "active" : ""}`}
          onClick={() => onNavigate(PAGES.VIEWER)}
        >
          <span className="step-badge" style={{ fontSize: "0.7rem" }}>⊙</span>
          <span>Batch Viewer</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="network-badge">
          <span className="network-dot" />
          Sepolia Testnet
        </div>
      </div>
    </aside>
  );
}