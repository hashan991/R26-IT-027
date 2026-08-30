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

// =========================================================
// SAVE FINAL BEAN QUALITY REPORT
// =========================================================

export const saveBeanQualityReport = async (report) => {
  const response = await api.post("/api/beans/quality-report/save", {
    report,
  });

  return response.data;
};

// =========================================================
// GET SAVED QUALITY REPORT HISTORY
// =========================================================

export const getBeanQualityReportHistory = async (limit = 50) => {
  const response = await api.get("/api/beans/quality-report/history", {
    params: {
      limit,
    },
  });

  return response.data;
};

// =========================================================
// GET ONE SAVED QUALITY REPORT
// =========================================================

export const getSavedBeanQualityReport = async (reportId) => {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(
    `/api/beans/quality-report/saved/${encodeURIComponent(reportId)}`,
  );

  return response.data;
};

// =========================================================
// DELETE SAVED QUALITY REPORT
// =========================================================

export const deleteBeanQualityReport = async (reportId) => {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  const response = await api.delete(
    `/api/beans/quality-report/saved/${encodeURIComponent(reportId)}`,
  );

  return response.data;
};
