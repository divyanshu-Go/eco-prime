// frontend/src/App.jsx
import React, { useState } from "react";
import './App.css';
import { PAGES } from "./pages/routes";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import CollectorPage from "./pages/CollectorPage";
import MiddlemanPage from "./pages/MiddlemanPage";
import LabPage from "./pages/LabPage";
import ManufacturerPage from "./pages/ManufacturerPage";
import ViewerPage from "./pages/ViewerPage";

function App() {
  const [activePage, setActivePage] = useState(PAGES.DASHBOARD);

  const renderPage = () => {
    switch (activePage) {
      case PAGES.DASHBOARD:    return <Dashboard navigate={setActivePage} />;
      case PAGES.ADMIN:        return <AdminPage />;
      case PAGES.COLLECTOR:    return <CollectorPage />;
      case PAGES.MIDDLEMAN:    return <MiddlemanPage />;
      case PAGES.LAB:          return <LabPage />;
      case PAGES.MANUFACTURER: return <ManufacturerPage />;
      case PAGES.VIEWER:       return <ViewerPage />;
      default:                 return <Dashboard navigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main className="main-content" style={{ flex: 1 }}>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;