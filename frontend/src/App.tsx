import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/HomePage";
import CustomerPage from "./pages/CustomerPage";
import CustomerTrackingPage from "./pages/CustomerTrackingPage";
import DispatcherPage from "./pages/DispatcherPage";
import NotFoundPage from "./pages/NotFoundPage";
import InventoryPage from "./pages/InventoryPage";
import TechniciansPage from "./pages/TechniciansPage";
import AIPage from "./pages/AIPage";

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route
            path="/customer/tracking/:jobId"
            element={<CustomerTrackingPage />}
          />
          <Route path="/dispatcher" element={<DispatcherPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
