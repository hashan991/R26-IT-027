import api from "../../../shared/services/api";

// =========================================================
// GET QUALITY REPORT MODULE STATUS
// =========================================================

export const getQualityReportStatus = async () => {
  const response = await api.get("/api/beans/quality-report/status");

  return response.data;
};

// =========================================================
// GENERATE FINAL BEAN QUALITY REPORT
// =========================================================

export const generateBeanQualityReport = async (
  sensorResult,
  physicalResult,
) => {
  const response = await api.post("/api/beans/quality-report/generate", {
    sensor_result: sensorResult,
    physical_result: physicalResult,
  });

  return response.data;
};
