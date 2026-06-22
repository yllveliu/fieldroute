import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import HomePage from "./pages/HomePage";
import CustomerPage from "./pages/CustomerPage";
import CustomerTrackingPage from "./pages/CustomerTrackingPage";
import TrackingPage from "./pages/TrackingPage";
import DispatcherPage from "./pages/DispatcherPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import InventoryPage from "./pages/InventoryPage";
import TechniciansPage from "./pages/TechniciansPage";
import TechnicianJobPage from "./pages/TechnicianJobPage";
import AIPage from "./pages/AIPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminConsolePage from "./pages/AdminConsolePage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        {/* Standalone — no AppLayout (no sidebar / top bar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ErrorBoundary><AppLayout /></ErrorBoundary>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route
            path="/customer/tracking/:jobId"
            element={<CustomerTrackingPage />}
          />
          <Route
            path="/dispatcher"
            element={
              <ProtectedRoute>
                <DispatcherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicians"
            element={
              <ProtectedRoute>
                <TechniciansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/job"
            element={
              <ProtectedRoute requiredRole="technician">
                <TechnicianJobPage />
              </ProtectedRoute>
            }
          />
          <Route path="/ai" element={<AIPage />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredRole="dispatcher">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="dispatcher">
                <AdminConsolePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
