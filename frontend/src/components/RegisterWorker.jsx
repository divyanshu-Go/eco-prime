import React, { useState } from "react";
import { connectWalletAndContracts, sendTx, callView } from "../web3";

const rolesMap = {
  Collector: 1,
  Middleman: 2,
  Lab: 4,
  Manufacturer: 8,
};

export default function RegisterWorker() {
  const [account, setAccount] = useState("");
  const [contracts, setContracts] = useState(null);
  const [workerAddress, setWorkerAddress] = useState("");
  const [role, setRole] = useState(1);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    const { account, contracts } = await connectWalletAndContracts();
    setAccount(account);
    setContracts(contracts);
    setStatus(`Connected: ${account}`);
  };

  const assignRole = async () => {
    try {
      await sendTx(contracts.registry, "setWorkerRole", account, workerAddress, role);
      setStatus(`✅ Role assigned to ${workerAddress}`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const removeRole = async () => {
    try {
      await sendTx(contracts.registry, "removeWorkerRole", account, workerAddress, role);
      setStatus(`✅ Role removed from ${workerAddress}`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const checkRole = async () => {
    try {
      const has = await callView(contracts.registry, "hasRole", workerAddress, role);
      setStatus(has ? "✅ Worker has role" : "❌ Worker does not have role");
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Register Worker</h2>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Worker Address"
              value={workerAddress}
              onChange={(e) => setWorkerAddress(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="mb-2">
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
              className="border p-2 w-full rounded"
            >
              {Object.entries(rolesMap).map(([name, value]) => (
                <option key={value} value={value}>
                  {name} ({value})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={assignRole}
              className="px-3 py-2 bg-green-600 text-white rounded"
            >
              Assign Role
            </button>
            <button
              onClick={removeRole}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Remove Role
            </button>
            <button
              onClick={checkRole}
              className="px-3 py-2 bg-gray-600 text-white rounded"
            >
              Check Role
            </button>
          </div>
        </>
      )}

      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
}
