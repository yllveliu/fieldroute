import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/HomePage";
import CustomerPage from "./pages/CustomerPage";
import DispatcherPage from "./pages/DispatcherPage";
import NotFoundPage from "./pages/NotFoundPage";
import InventoryPage from "./pages/InventoryPage";
import TechniciansPage from "./pages/TechniciansPage";

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/dispatcher" element={<DispatcherPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
