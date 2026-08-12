import api from "../../../shared/services/api";

export const getSensorStatus = async () => {
  const response = await api.get("/api/beans/sensors/status");

  return response.data;
};

export const getLatestSensorReading = async () => {
  const response = await api.get("/api/beans/sensors/latest");

  return response.data;
};
