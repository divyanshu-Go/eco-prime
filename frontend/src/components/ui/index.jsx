// frontend/src/components/ui/index.jsx
import React from "react";

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, badge }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {badge && badge}
    </div>
  );
}

export function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

// ── Page Header ───────────────────────────────────────────────
export function PageHeader({ stepLabel, title, description }) {
  return (
    <div className="page-header">
      {stepLabel && <div className="step-label">{stepLabel}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────
export function FormField({ label, optional, children }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      {children}
    </div>
  );
}

export function Input({ span, ...props }) {
  return <input className="form-input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="form-input" {...props}>
      {children}
    </select>
  );
}

// ── Form Grid ─────────────────────────────────────────────────
export function FormGrid({ cols = 2, children }) {
  const cls = cols === 1 ? "cols-1" : cols === 3 ? "cols-3" : "";
  return <div className={`form-grid ${cls}`}>{children}</div>;
}

// ── FormGroup with span ───────────────────────────────────────
export function SpanField({ span = 2, label, optional, children }) {
  return (
    <div className={`form-group ${span === 2 ? "span-2" : "span-3"}`}>
      {label && (
        <label className="form-label">
          {label}
          {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      {children}
    </div>
  );
}

// ── Status Bar ────────────────────────────────────────────────
export function StatusBar({ message, type = "idle" }) {
  if (!message) return null;
  const cls =
    type === "success" ? "success" : type === "error" ? "error" : "";
  return <div className={`status-bar ${cls}`}>{message}</div>;
}

// ── Divider ───────────────────────────────────────────────────
export function Divider() {
  return <div className="divider" />;
}

// ── Submit Button ─────────────────────────────────────────────
export function SubmitButton({ loading, label, loadingLabel, ...props }) {
  return (
    <button
      type="submit"
      className="btn btn-primary btn-full"
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <span style={{ animation: "pulse 1s infinite" }}>⋯</span>
          {loadingLabel || "Processing..."}
        </>
      ) : label}
    </button>
  );
}