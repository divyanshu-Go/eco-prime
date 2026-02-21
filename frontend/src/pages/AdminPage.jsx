// frontend/src/pages/AdminPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx, callView } from "../web3";
import { PageHeader, Card, CardHeader, CardBody, FormGrid, FormField, Input, Select, StatusBar } from "../components/ui";

const ROLES_MAP = {
  Collector:    1,
  Middleman:    2,
  Lab:          4,
  Manufacturer: 8,
};

export default function AdminPage() {
  const [account, setAccount]           = useState("");
  const [contracts, setContracts]       = useState(null);
  const [workerAddress, setWorkerAddress] = useState("");
  const [role, setRole]                 = useState(1);
  const [status, setStatus]             = useState({ msg: "", type: "idle" });

  const connectWallet = async () => {
    try {
      const { account, contracts } = await connectWalletAndContracts();
      setAccount(account);
      setContracts(contracts);
      setStatus({ msg: `Connected: ${account}`, type: "success" });
    } catch (err) {
      setStatus({ msg: `❌ ${err.message}`, type: "error" });
    }
  };

  const assignRole = async () => {
    try {
      setStatus({ msg: "Sending transaction...", type: "idle" });
      await sendTx(contracts.registry, "setWorkerRole", account, workerAddress, role);
      setStatus({ msg: `✅ Role assigned to ${workerAddress}`, type: "success" });
    } catch (err) {
      setStatus({ msg: `❌ ${err.message}`, type: "error" });
    }
  };

  const removeRole = async () => {
    try {
      setStatus({ msg: "Sending transaction...", type: "idle" });
      await sendTx(contracts.registry, "removeWorkerRole", account, workerAddress, role);
      setStatus({ msg: `✅ Role removed from ${workerAddress}`, type: "success" });
    } catch (err) {
      setStatus({ msg: `❌ ${err.message}`, type: "error" });
    }
  };

  const checkRole = async () => {
    try {
      const has = await callView(contracts.registry, "hasRole", workerAddress, role);
      setStatus({
        msg: has ? `✅ Address has this role.` : `✗ Address does NOT have this role.`,
        type: has ? "success" : "error",
      });
    } catch (err) {
      setStatus({ msg: `❌ ${err.message}`, type: "error" });
    }
  };

  return (
    <div>
      <PageHeader
        stepLabel="Step 0 — Admin"
        title="Register Worker"
        description="Assign or revoke supply chain roles for wallet addresses. Only the contract owner can perform this action."
      />

      <Card>
        <CardHeader
          title="Role Management"
          subtitle="Roles are stored as bitmask values on RegisteredWorker.sol"
        />
        <CardBody>
          {!account ? (
            <div className="connect-prompt">
              <p>Connect your owner wallet to manage worker roles.</p>
              <button className="btn btn-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              {/* Connected account */}
              <div style={{ marginBottom: 20, padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Connected as: </span>
                <span style={{ color: "var(--accent)" }}>{account}</span>
              </div>

              <FormGrid cols={2}>
                <FormField label="Worker Address" span={2}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="0x..."
                    value={workerAddress}
                    onChange={(e) => setWorkerAddress(e.target.value)}
                    style={{ gridColumn: "span 2" }}
                  />
                </FormField>

                <FormField label="Role">
                  <select
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(Number(e.target.value))}
                  >
                    {Object.entries(ROLES_MAP).map(([name, val]) => (
                      <option key={val} value={val}>{name} (bit {val})</option>
                    ))}
                  </select>
                </FormField>
              </FormGrid>

              {/* Worker address full width */}
              <div className="form-group" style={{ marginTop: 0, marginBottom: 20 }}>
                <label className="form-label">Worker Address</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="0x..."
                  value={workerAddress}
                  onChange={(e) => setWorkerAddress(e.target.value)}
                />
              </div>

              <div className="divider" />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={assignRole} disabled={!workerAddress}>
                  Assign Role
                </button>
                <button className="btn btn-danger" onClick={removeRole} disabled={!workerAddress}>
                  Remove Role
                </button>
                <button className="btn btn-ghost" onClick={checkRole} disabled={!workerAddress}>
                  Check Role
                </button>
              </div>

              <StatusBar message={status.msg} type={status.type} />
            </>
          )}
        </CardBody>
      </Card>

      {/* Role reference */}
      <div style={{ marginTop: 16, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <div style={{ color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8, fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Role Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {Object.entries(ROLES_MAP).map(([name, val]) => (
            <div key={val} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: "0.75rem" }}>{val}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: 2 }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}