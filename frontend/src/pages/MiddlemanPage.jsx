// frontend/src/pages/MiddlemanPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createMiddlemanData } from "../models/middlemanModel";
import { PageHeader, Card, CardHeader, CardBody, FormGrid, FormField, StatusBar, SubmitButton } from "../components/ui";

export default function MiddlemanPage() {
  const [fields, setFields] = useState({
    batchId: "", batchRef: "", from: "", to: "", finalWeight: "",
  });
  const [transferFile, setTransferFile]   = useState(null);
  const [storageFile, setStorageFile]     = useState(null);
  const [transportFile, setTransportFile] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [txStatus, setTxStatus]           = useState({ msg: "", type: "idle" });

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus({ msg: "🔗 Connecting wallet...", type: "idle" });
      const { account, contracts } = await connectWalletAndContracts();

      let transferCid = null, storageCid = null, transportCid = null;
      if (transferFile)  { setTxStatus({ msg: "📤 Uploading transfer proof...", type: "idle" });  transferCid  = await uploadFileToIPFS(transferFile); }
      if (storageFile)   { setTxStatus({ msg: "📤 Uploading storage document...", type: "idle" }); storageCid   = await uploadFileToIPFS(storageFile); }
      if (transportFile) { setTxStatus({ msg: "📤 Uploading transport document...", type: "idle" }); transportCid = await uploadFileToIPFS(transportFile); }

      const metadata = createMiddlemanData({
        batchRef:    fields.batchRef,
        from:        fields.from,
        to:          fields.to,
        transferCid, storageCid, transportCid,
        finalWeight: Number(fields.finalWeight),
      });

      setTxStatus({ msg: "📤 Uploading metadata JSON...", type: "idle" });
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus({ msg: "🚀 Sending transaction...", type: "idle" });
      const receipt = await sendTx(contracts.herb, "addMiddlemanData", account, fields.batchId, metadataCid);

      setTxStatus({ msg: `✅ Middleman data added — Tx: ${receipt.transactionHash}`, type: "success" });
    } catch (err) {
      console.error(err);
      setTxStatus({ msg: `❌ ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        stepLabel="Step 2 — Middleman"
        title="Add Logistics Data"
        description="Record transfer, storage, and transport details. Requires collector data to exist on-chain first. Use the Batch ID from Step 1."
      />

      <form onSubmit={handleSubmit}>
        {/* Batch reference */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Batch Reference" subtitle="Link this submission to an existing batch" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Batch ID">
                <input className="form-input" type="number" placeholder="Numeric ID from Step 1 (e.g. 1)"
                  value={fields.batchId} onChange={set("batchId")} required />
              </FormField>
              <FormField label="Batch Reference" optional>
                <input className="form-input" type="text" placeholder="e.g. HERB-2025-001"
                  value={fields.batchRef} onChange={set("batchRef")} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Transfer details */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Transfer Details" subtitle="Handover parties and weight" />
          <CardBody>
            <FormGrid cols={3}>
              <FormField label="From (Collector ID)">
                <input className="form-input" type="text" placeholder="e.g. COL-001"
                  value={fields.from} onChange={set("from")} required />
              </FormField>
              <FormField label="To (Middleman ID)">
                <input className="form-input" type="text" placeholder="e.g. MID-001"
                  value={fields.to} onChange={set("to")} required />
              </FormField>
              <FormField label="Final Weight (Kg)">
                <input className="form-input" type="number" placeholder="0.00"
                  value={fields.finalWeight} onChange={set("finalWeight")} required />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Documents */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Supporting Documents" subtitle="Upload files to IPFS — CIDs stored in metadata" />
          <CardBody>
            <FormGrid cols={1}>
              <FormField label="Transfer Proof" optional>
                <input className="form-input" type="file" onChange={(e) => setTransferFile(e.target.files[0])} />
              </FormField>
              <FormField label="Storage Document" optional>
                <input className="form-input" type="file" onChange={(e) => setStorageFile(e.target.files[0])} />
              </FormField>
              <FormField label="Transport Document" optional>
                <input className="form-input" type="file" onChange={(e) => setTransportFile(e.target.files[0])} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        <SubmitButton loading={loading} label="Add Middleman Data" loadingLabel="Processing..." />
      </form>

      <StatusBar message={txStatus.msg} type={txStatus.type} />
    </div>
  );
}