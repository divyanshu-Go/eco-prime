// frontend/src/pages/ManufacturerPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createManufacturerData } from "../models/manufacturerModel";
import { PageHeader, Card, CardHeader, CardBody, FormGrid, FormField, StatusBar, SubmitButton } from "../components/ui";

export default function ManufacturerPage() {
  const [fields, setFields] = useState({
    batchId: "", batchRef: "", formulation: "", finalBatchQty: "", gmpId: "",
  });
  const [processingFile, setProcessingFile] = useState(null);
  const [qrRootFile, setQrRootFile]         = useState(null);
  const [loading, setLoading]               = useState(false);
  const [txStatus, setTxStatus]             = useState({ msg: "", type: "idle" });

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus({ msg: "🔗 Connecting wallet...", type: "idle" });
      const { account, contracts } = await connectWalletAndContracts();

      let processingCid = null, qrRootCid = null;
      if (processingFile) { setTxStatus({ msg: "📤 Uploading processing file...", type: "idle" }); processingCid = await uploadFileToIPFS(processingFile); }
      if (qrRootFile)     { setTxStatus({ msg: "📤 Uploading QR root file...", type: "idle" });     qrRootCid     = await uploadFileToIPFS(qrRootFile); }

      const metadata = createManufacturerData({
        batchRef:     fields.batchRef,
        processingCid,
        formulation:  fields.formulation,
        finalBatchQty: Number(fields.finalBatchQty),
        qrRootCid,
        gmpId:        fields.gmpId,
      });

      setTxStatus({ msg: "📤 Uploading metadata JSON...", type: "idle" });
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus({ msg: "🚀 Sending transaction...", type: "idle" });
      const receipt = await sendTx(contracts.herb, "addManufacturerData", account, fields.batchId, metadataCid);

      setTxStatus({ msg: `✅ Manufacturer data added — Tx: ${receipt.transactionHash}`, type: "success" });
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
        stepLabel="Step 4 — Manufacturer"
        title="Add Processing Data"
        description="Record final formulation and GMP certification. Requires lab data on-chain. This completes the supply chain record."
      />

      <form onSubmit={handleSubmit}>
        {/* Batch reference */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Batch Reference" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Batch ID">
                <input className="form-input" type="number" placeholder="Numeric ID from Step 1"
                  value={fields.batchId} onChange={set("batchId")} required />
              </FormField>
              <FormField label="Batch Reference" optional>
                <input className="form-input" type="text" placeholder="e.g. HERB-2025-001"
                  value={fields.batchRef} onChange={set("batchRef")} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Processing details */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Processing Details" subtitle="Final product specifications" />
          <CardBody>
            <FormGrid cols={3}>
              <FormField label="Formulation">
                <input className="form-input" type="text" placeholder="e.g. Powder 5%"
                  value={fields.formulation} onChange={set("formulation")} required />
              </FormField>
              <FormField label="Final Batch Quantity">
                <input className="form-input" type="number" placeholder="Units"
                  value={fields.finalBatchQty} onChange={set("finalBatchQty")} required />
              </FormField>
              <FormField label="GMP Certificate ID">
                <input className="form-input" type="text" placeholder="e.g. GMP-2025-XYZ"
                  value={fields.gmpId} onChange={set("gmpId")} required />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Files */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Supporting Documents" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Processing Document" optional>
                <input className="form-input" type="file" onChange={(e) => setProcessingFile(e.target.files[0])} />
              </FormField>
              <FormField label="QR Root File" optional>
                <input className="form-input" type="file" onChange={(e) => setQrRootFile(e.target.files[0])} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        <SubmitButton loading={loading} label="Add Manufacturer Data" loadingLabel="Processing..." />
      </form>

      <StatusBar message={txStatus.msg} type={txStatus.type} />
    </div>
  );
}