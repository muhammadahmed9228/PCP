import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import UciDashboardLayout from "../layouts/UciDashboardLayout"; // Placeholder for Phase 3 layout
import AicDashboardLayout from "../layouts/AicDashboardLayout";
import TeamLoginPage from "../features/auth/pages/TeamLoginPage";
import FieldTeamDashboardLayout from "../layouts/FieldTeamDashboardLayout";

// Shared PrivateRoute component to enforce authentication boundaries[span_0](start_span)[span_0](end_span)
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />; // Or route to an appropriate fallback
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard/uci" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard/uci" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Protected Routes: UCI Features */}
      <Route
        path="/dashboard/uci/*"
        element={
          <PrivateRoute allowedRoles={["UCI"]}>
            <UciDashboardLayout />
          </PrivateRoute>
        }
      />

      {/* Protected Routes: AIC Features */}
      <Route
        path="/dashboard/aic/*"
        element={
          <PrivateRoute allowedRoles={["AIC"]}>
            <AicDashboardLayout />
          </PrivateRoute>
        }
      />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />


      // Public Route
      <Route path="/team/login" element={isAuthenticated ? <Navigate to="/dashboard/team" replace /> : <TeamLoginPage />} />

// Protected Route
      <Route
        path="/dashboard/team/*"
        element={
          <PrivateRoute allowedRoles={["FieldTeam"]}>
            <FieldTeamDashboardLayout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
