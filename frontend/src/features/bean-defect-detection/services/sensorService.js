import api from "../../../shared/services/api";

export const getSensorStatus = async () => {
  const response = await api.get("/api/beans/sensors/status");

  return response.data;
};

export const getLatestSensorReading = async () => {
  const response = await api.get("/api/beans/sensors/latest");

  return response.data;
};

// =========================================================
// QUALITY INDICATOR
// =========================================================

export const sendSensorIndicatorCommand = async (command) => {
  const response = await api.post(
    `/api/beans/sensors/indicator/${command}`
  );

  return response.data;
};