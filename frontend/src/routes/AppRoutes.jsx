import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";

import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";


import BeanQualityPage from "../features/bean-defect-detection/pages/BeanQualityPage";

import SalesPredictionPage from "../features/sales-prediction/pages/SalesPredictionPage";

import SealUploadPage from "../features/packet-seal-detection/pages/SealUploadPage";

import UserManagementPage from "../features/admin/pages/UserManagementPage";

import MyProfilePage from "../features/profile/pages/MyProfilePage";

import RoleRoute from "../shared/components/RoleRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHomePage from "../pages/DashboardHomePage";

import ReportHistoryPage from "../features/bean-defect-detection/pages/ReportHistoryPage";
import SavedQualityReportPage from "../features/bean-defect-detection/pages/SavedQualityReportPage";

// =====================================================
// POWDER QUALITY MODULE
// =====================================================

import PowderDashboardLayout from "../features/powder-quality-checking/layouts/DashboardLayout";

import PowderDashboard from "../features/powder-quality-checking/pages/Dashboard";
import BatchIntelligence from "../features/powder-quality-checking/pages/BatchIntelligence";
import ReportsSystem from "../features/powder-quality-checking/pages/ReportsSystem";
import CoffeeInspectionReport from "../features/powder-quality-checking/pages/report/CoffeeInspectionReport";

import { RefreshProvider } from "../features/powder-quality-checking/context/RefreshContext";

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* =====================================================
          MAIN PROTECTED DASHBOARD ROUTES
      ===================================================== */}

      <Route element={<DashboardLayout />}>
        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "BEAN_QUALITY_INSPECTOR",
                "POWDER_QUALITY_INSPECTOR",
                "PACKAGING_QUALITY_INSPECTOR",
                "SALES_ANALYST",
              ]}
            >
              <DashboardHomePage />
            </RoleRoute>
          }
        />

        {/* =====================================================
            MY PROFILE
        ===================================================== */}

        <Route
          path="/profile"
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "BEAN_QUALITY_INSPECTOR",
                "POWDER_QUALITY_INSPECTOR",
                "PACKAGING_QUALITY_INSPECTOR",
                "SALES_ANALYST",
              ]}
            >
              <MyProfilePage />
            </RoleRoute>
          }
        />

        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <UserManagementPage />
            </RoleRoute>
          }
        />

        {/* =====================================================
            BEAN QUALITY
        ===================================================== */}

        <Route
          path="/beans"
          element={
            <RoleRoute allowedRoles={["ADMIN", "BEAN_QUALITY_INSPECTOR"]}>
              <BeanQualityPage />
            </RoleRoute>
          }
        />

        <Route
          path="/beans/reports"
          element={
            <RoleRoute allowedRoles={["ADMIN", "BEAN_QUALITY_INSPECTOR"]}>
              <ReportHistoryPage />
            </RoleRoute>
          }
        />

        <Route
          path="/beans/reports/:reportId"
          element={
            <RoleRoute allowedRoles={["ADMIN", "BEAN_QUALITY_INSPECTOR"]}>
              <SavedQualityReportPage />
            </RoleRoute>
          }
        />

        {/* =====================================================
            PACKAGING / SEAL QUALITY
        ===================================================== */}

        <Route
          path="/seals"
          element={
            <RoleRoute allowedRoles={["ADMIN", "PACKAGING_QUALITY_INSPECTOR"]}>
              <SealUploadPage />
            </RoleRoute>
          }
        />

        {/* =====================================================
            SALES PREDICTION
        ===================================================== */}

        <Route
          path="/sales"
          element={
            <RoleRoute allowedRoles={["ADMIN", "SALES_ANALYST"]}>
              <SalesPredictionPage />
            </RoleRoute>
          }
        />

        {/* =====================================================
          POWDER QUALITY MODULE
      ===================================================== */}

      <Route
      path="/powder"
      element={
        <RoleRoute allowedRoles={["ADMIN","POWDER_QUALITY_INSPECTOR"]}>
            <RefreshProvider>
                <PowderDashboardLayout />
            </RefreshProvider>
        </RoleRoute>
      }
      >


      <Route index element={<PowderDashboard />} />


      <Route 
      path="dashboard" 
      element={<PowderDashboard />} 
      />


      <Route
      path="batch-intelligence"
      element={<BatchIntelligence />}
      />


      <Route
      path="reports-system"
      element={<ReportsSystem />}
      />


      </Route>

        {/* =====================================================
          POWDER QUALITY REPORT
      ===================================================== */}

        <Route
          path="/powder/report/:batchId"
          element={
            <RoleRoute allowedRoles={["ADMIN", "POWDER_QUALITY_INSPECTOR"]}>
              <RefreshProvider>
                <CoffeeInspectionReport />
              </RefreshProvider>
            </RoleRoute>
          }
        />
      </Route>

      {/* =====================================================
          404
      ===================================================== */}

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;
