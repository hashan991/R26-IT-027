import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";

import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";

import BeanUploadPage from "../features/bean-defect-detection/pages/BeanUploadPage";

import SalesPredictionPage from "../features/sales-prediction/pages/SalesPredictionPage";

import BeanQualityPage from "../features/bean-defect-detection/pages/BeanQualityPage";

import UserManagementPage from "../features/admin/pages/UserManagementPage";

import MyProfilePage from "../features/profile/pages/MyProfilePage";

import RoleRoute from "../shared/components/RoleRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHomePage from "../pages/DashboardHomePage";

import SealUploadPage from "../features/packet-seal-detection/pages/SealUploadPage";


function AppRoutes() {
  return (
    <Routes>

  


      <Route path="/sales" element={<SalesPredictionPage />} />
      

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* =====================================================
          PROTECTED DASHBOARD ROUTES
      ===================================================== */}

      <Route element={<DashboardLayout />}>
        {/* DASHBOARD */}

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
          path="/bean"
          element={
            <RoleRoute allowedRoles={["ADMIN", "BEAN_QUALITY_INSPECTOR"]}>
              <BeanUploadPage />
            </RoleRoute>
          }
        />

        <Route
          path="/beans"
          element={
            <RoleRoute allowedRoles={["ADMIN", "BEAN_QUALITY_INSPECTOR"]}>
              <BeanQualityPage />
            </RoleRoute>
          }
        />

        {/* PACKAGING / SEAL */}
        <Route
          path="/seals"
          element={
            <RoleRoute allowedRoles={["ADMIN", "PACKAGING_QUALITY_INSPECTOR"]}>
              <SealUploadPage />
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
