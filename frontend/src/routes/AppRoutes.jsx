import { Routes, Route, Navigate } from "react-router-dom";

import BeanUploadPage from "../features/bean-defect-detection/pages/BeanUploadPage";
import SalesPredictionPage from "../features/sales-prediction/pages/SalesPredictionPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sales" replace />} />

      <Route path="/beans" element={<BeanUploadPage />} />
      <Route path="/sales" element={<SalesPredictionPage />} />
      

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;
