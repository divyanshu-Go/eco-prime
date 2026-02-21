// frontend/src/pages/CollectorPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createCollectorData } from "../models/collectorModel";
import { PageHeader, Card, CardHeader, CardBody, FormGrid, FormField, StatusBar, SubmitButton } from "../components/ui";

export default function CollectorPage() {
  const [fields, setFields] = useState({
    batchRef: "", species: "", quantity: "",
    lat: "", lon: "", rootAge: "", moisture: "", notes: "",
  });
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [txStatus, setTxStatus]       = useState({ msg: "", type: "idle" });
  const [createdBatchId, setCreatedBatchId] = useState(null);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setCreatedBatchId(null);
      setTxStatus({ msg: "🔗 Connecting wallet...", type: "idle" });
      const { account, contracts } = await connectWalletAndContracts();

      let photoCid = null;
      if (file) {
        setTxStatus({ msg: "📤 Uploading photo to IPFS...", type: "idle" });
        photoCid = await uploadFileToIPFS(file);
      }

      const metadata = createCollectorData({
        account,
        batchRef: fields.batchRef,
        species:  fields.species,
        qty:      Number(fields.quantity),
        lat:      Number(fields.lat),
        lon:      Number(fields.lon),
        age:      Number(fields.rootAge),
        moisture: Number(fields.moisture),
        photoCid,
        notes:    fields.notes,
      });

      setTxStatus({ msg: "📤 Uploading metadata to IPFS...", type: "idle" });
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus({ msg: "🚀 Sending transaction...", type: "idle" });
      const receipt = await sendTx(contracts.herb, "createBatch", account, fields.batchRef, metadataCid);

      // Extract batch ID from BatchCreated event
      let batchId = null;
      try {
        const ev = receipt.events?.BatchCreated;
        if (ev) batchId = ev.returnValues?.batchId ?? ev.returnValues?.[0];
      } catch (_) {}

      setCreatedBatchId(batchId);
      setTxStatus({ msg: `✅ Batch created — Tx: ${receipt.transactionHash}`, type: "success" });
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
        stepLabel="Step 1 — Collector"
        title="Create Batch"
        description="Record harvest details and upload a field photo. This creates the batch on-chain. Note the Batch ID shown after submission — all subsequent steps require it."
      />

      <form onSubmit={handleSubmit}>
        {/* Batch identity */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Batch Identity" subtitle="Reference and botanical details" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Batch Reference">
                <input className="form-input" type="text" placeholder="e.g. HERB-2025-001"
                  value={fields.batchRef} onChange={set("batchRef")} required />
              </FormField>
              <FormField label="Species">
                <input className="form-input" type="text" placeholder="e.g. Panax ginseng"
                  value={fields.species} onChange={set("species")} required />
              </FormField>
              <FormField label="Quantity (Kg)">
                <input className="form-input" type="number" placeholder="0.00"
                  value={fields.quantity} onChange={set("quantity")} required />
              </FormField>
              <FormField label="Root Age (Years)">
                <input className="form-input" type="number" placeholder="0"
                  value={fields.rootAge} onChange={set("rootAge")} required />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Location + conditions */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Harvest Conditions" subtitle="GPS coordinates and moisture reading" />
          <CardBody>
            <FormGrid cols={3}>
              <FormField label="Latitude">
                <input className="form-input" type="number" placeholder="0.000000"
                  value={fields.lat} onChange={set("lat")} required />
              </FormField>
              <FormField label="Longitude">
                <input className="form-input" type="number" placeholder="0.000000"
                  value={fields.lon} onChange={set("lon")} required />
              </FormField>
              <FormField label="Moisture %">
                <input className="form-input" type="number" placeholder="0.0"
                  value={fields.moisture} onChange={set("moisture")} required />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Files + notes */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Supporting Documents" subtitle="Photo and notes" />
          <CardBody>
            <FormGrid cols={1}>
              <FormField label="Harvest Photo" optional>
                <input className="form-input" type="file" accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])} />
              </FormField>
              <FormField label="Notes" optional>
                <input className="form-input" type="text" placeholder="Any observations or conditions..."
                  value={fields.notes} onChange={set("notes")} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        <SubmitButton loading={loading} label="Create Batch" loadingLabel="Processing..." />
      </form>

      <StatusBar message={txStatus.msg} type={txStatus.type} />

      {/* Prominent batch ID */}
      {createdBatchId !== null && (
        <div className="batch-id-result">
          <div className="label">Batch ID — use this in all subsequent steps</div>
          <div className="id">#{createdBatchId}</div>
          <div className="hint">Save this number. Middleman, Lab, and Manufacturer forms all require it.</div>
        </div>
      )}
    </div>
  );
}