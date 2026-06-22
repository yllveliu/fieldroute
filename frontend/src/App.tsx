import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/context/AuthContext";
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
import AdminApplicationsPage from "./pages/AdminApplicationsPage";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// The "/" index redirects each role to its real landing page (and renders the
// admin dashboard for admins). Keeping "/" un-gated avoids redirect loops,
// since ProtectedRoute sends role-mismatches back here.
function AppIndex(): React.ReactElement {
  const { user } = useAuth();
  switch (user?.role) {
    case "admin":
      return <HomePage />;
    case "dispatcher":
      return <Navigate to="/dispatcher" replace />;
    case "technician":
      return <Navigate to="/technician/job" replace />;
    case "customer":
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        {/* Standalone — no AppLayout (no sidebar / top bar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/application-status" element={<ApplicationStatusPage />} />
        {/* Public shareable tracking link */}
        <Route path="/customer/tracking/:jobId" element={<CustomerTrackingPage />} />

        <Route element={<ErrorBoundary><AppLayout /></ErrorBoundary>}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppIndex />
              </ProtectedRoute>
            }
          />

          {/* Dispatcher */}
          <Route path="/dispatcher" element={<ProtectedRoute allow={["dispatcher"]}><DispatcherPage /></ProtectedRoute>} />
          <Route path="/technicians" element={<ProtectedRoute allow={["dispatcher"]}><TechniciansPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute allow={["dispatcher"]}><AIPage /></ProtectedRoute>} />

          {/* Technician */}
          <Route path="/technician/job" element={<ProtectedRoute allow={["technician"]}><TechnicianJobPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allow={["technician", "dispatcher", "admin"]}><InventoryPage /></ProtectedRoute>} />

          {/* Customer (technicians may also request/track services) */}
          <Route path="/customer" element={<ProtectedRoute allow={["customer", "technician"]}><CustomerPage /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute allow={["customer", "technician"]}><TrackingPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminConsolePage /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allow={["admin"]}><AdminApplicationsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
