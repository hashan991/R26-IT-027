import { Routes, Route, Navigate } from "react-router-dom";

import BeanUploadPage from "../features/bean-defect-detection/pages/BeanUploadPage";

import SealUploadPage from "../features/packet-seal-detection/pages/SealUploadPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/beans" replace />} />

      <Route path="/beans" element={<BeanUploadPage />} />

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />

      <Route path="/seals" element={<SealUploadPage />} />
      
    </Routes>
  );
}

export default AppRoutes;
