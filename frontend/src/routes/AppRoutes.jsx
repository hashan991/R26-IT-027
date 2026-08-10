import { Routes, Route, Navigate } from "react-router-dom";

import BeanUploadPage from "../features/bean-defect-detection/pages/BeanUploadPage";
import HomePage from "../pages/HomePage";
import BeanQualityPage from "../features/bean-defect-detection/pages/BeanQualityPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/bean" element={<BeanUploadPage />} />
      <Route path="/beans" element={<BeanQualityPage />} />

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;
