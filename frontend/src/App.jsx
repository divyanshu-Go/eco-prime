// src/App.jsx
import React from "react";
import './App.css';
import RegisterWorker from "./components/RegisterWorker";
import CollectorForm from "./components/CollectorForm";
import MiddlemanForm from "./components/MiddlemanForm";
import LabForm from "./components/LabForm";
import ManufacturerForm from "./components/ManufacturerForm";
import BatchViewer from "./components/BatchViewer";

function App() {
  
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <RegisterWorker />
      <CollectorForm />
      <MiddlemanForm />
      <LabForm />
      <ManufacturerForm />
      <BatchViewer />
    </div>
  );
}

export default App;
