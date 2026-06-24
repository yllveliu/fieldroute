import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const HomePage = React.lazy(() => import("./pages/HomePage"));
const CustomerPage = React.lazy(() => import("./pages/CustomerPage"));
const CustomerTrackingPage = React.lazy(() => import("./pages/CustomerTrackingPage"));
const TrackingPage = React.lazy(() => import("./pages/TrackingPage"));
const DispatcherPage = React.lazy(() => import("./pages/DispatcherPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const InventoryPage = React.lazy(() => import("./pages/InventoryPage"));
const TechniciansPage = React.lazy(() => import("./pages/TechniciansPage"));
const TechnicianJobPage = React.lazy(() => import("./pages/TechnicianJobPage"));
const AIPage = React.lazy(() => import("./pages/AIPage"));
const AdminConsolePage = React.lazy(() => import("./pages/AdminConsolePage"));
const AdminApplicationsPage = React.lazy(() => import("./pages/AdminApplicationsPage"));
const ApplicationStatusPage = React.lazy(() => import("./pages/ApplicationStatusPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));

function PageSpinner(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Standalone — no AppLayout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/application-status" element={<ApplicationStatusPage />} />
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

            {/* Customer */}
            <Route path="/customer" element={<ProtectedRoute allow={["customer", "technician"]}><CustomerPage /></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute allow={["customer", "technician"]}><TrackingPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminConsolePage /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute allow={["admin"]}><AdminApplicationsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
