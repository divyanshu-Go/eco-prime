// frontend/src/pages/LabPage.jsx
import React, { useState } from "react";
import { connectWalletAndContracts, sendTx } from "../web3";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../ipfs";
import { createLabData } from "../models/labModel";
import { PageHeader, Card, CardHeader, CardBody, FormGrid, FormField, StatusBar, SubmitButton } from "../components/ui";

export default function LabPage() {
  const [fields, setFields] = useState({
    batchId: "", batchRef: "", labId: "", moisturePercent: "",
  });
  const [pass, setPass]                     = useState(true);
  const [pesticideFile, setPesticideFile]   = useState(null);
  const [heavyMetalsFile, setHeavyMetals]   = useState(null);
  const [dnaFile, setDnaFile]               = useState(null);
  const [reportPdf, setReportPdf]           = useState(null);
  const [loading, setLoading]               = useState(false);
  const [txStatus, setTxStatus]             = useState({ msg: "", type: "idle" });

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setTxStatus({ msg: "🔗 Connecting wallet...", type: "idle" });
      const { account, contracts } = await connectWalletAndContracts();

      let pesticideCid = null, heavyCid = null, dnaCid = null, pdfCid = null;
      if (pesticideFile)  { setTxStatus({ msg: "📤 Uploading pesticide report...", type: "idle" });    pesticideCid = await uploadFileToIPFS(pesticideFile); }
      if (heavyMetalsFile){ setTxStatus({ msg: "📤 Uploading heavy metals report...", type: "idle" }); heavyCid     = await uploadFileToIPFS(heavyMetalsFile); }
      if (dnaFile)        { setTxStatus({ msg: "📤 Uploading DNA barcode...", type: "idle" });          dnaCid       = await uploadFileToIPFS(dnaFile); }
      if (reportPdf)      { setTxStatus({ msg: "📤 Uploading lab report PDF...", type: "idle" });       pdfCid       = await uploadFileToIPFS(reportPdf); }

      const metadata = createLabData({
        labId:          fields.labId,
        batchRef:       fields.batchRef,
        moisturePercent: Number(fields.moisturePercent),
        pesticideCid, heavyCid, dnaCid, pdfCid, pass,
      });

      setTxStatus({ msg: "📤 Uploading metadata JSON...", type: "idle" });
      const metadataCid = await uploadJsonToIPFS(metadata);

      setTxStatus({ msg: "🚀 Sending transaction...", type: "idle" });
      const receipt = await sendTx(contracts.herb, "addLabData", account, fields.batchId, metadataCid);

      setTxStatus({ msg: `✅ Lab data added — Tx: ${receipt.transactionHash}`, type: "success" });
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
        stepLabel="Step 3 — Lab"
        title="Add Testing Data"
        description="Upload quality test results and supporting reports. Requires middleman data on-chain. Use the Batch ID from Step 1."
      />

      <form onSubmit={handleSubmit}>
        {/* Batch + Lab identity */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Batch & Lab Identity" />
          <CardBody>
            <FormGrid cols={3}>
              <FormField label="Batch ID">
                <input className="form-input" type="number" placeholder="Numeric ID from Step 1"
                  value={fields.batchId} onChange={set("batchId")} required />
              </FormField>
              <FormField label="Batch Reference" optional>
                <input className="form-input" type="text" placeholder="e.g. HERB-2025-001"
                  value={fields.batchRef} onChange={set("batchRef")} />
              </FormField>
              <FormField label="Lab ID">
                <input className="form-input" type="text" placeholder="e.g. LAB-001"
                  value={fields.labId} onChange={set("labId")} required />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Test results */}
        <Card style={{ marginBottom: 16 }}>
          <CardHeader title="Test Results" subtitle="Moisture reading and overall pass/fail verdict" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Moisture % (Lab Measured)">
                <input className="form-input" type="number" step="0.1" placeholder="0.0"
                  value={fields.moisturePercent} onChange={set("moisturePercent")} required />
              </FormField>
              <FormField label="Quality Verdict">
                <select className="form-input" value={pass} onChange={(e) => setPass(e.target.value === "true")}>
                  <option value="true">Pass ✅</option>
                  <option value="false">Fail ❌</option>
                </select>
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        {/* Lab documents */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="Lab Reports" subtitle="All files uploaded to IPFS — CIDs stored in metadata" />
          <CardBody>
            <FormGrid cols={2}>
              <FormField label="Pesticide Report" optional>
                <input className="form-input" type="file" onChange={(e) => setPesticideFile(e.target.files[0])} />
              </FormField>
              <FormField label="Heavy Metals Report" optional>
                <input className="form-input" type="file" onChange={(e) => setHeavyMetals(e.target.files[0])} />
              </FormField>
              <FormField label="DNA Barcode File" optional>
                <input className="form-input" type="file" onChange={(e) => setDnaFile(e.target.files[0])} />
              </FormField>
              <FormField label="Lab Report PDF" optional>
                <input className="form-input" type="file" onChange={(e) => setReportPdf(e.target.files[0])} />
              </FormField>
            </FormGrid>
          </CardBody>
        </Card>

        <SubmitButton loading={loading} label="Add Lab Data" loadingLabel="Processing..." />
      </form>

      <StatusBar message={txStatus.msg} type={txStatus.type} />
    </div>
  );
}