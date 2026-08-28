import api from "../../../shared/services/api";


// ==================================================
// INSPECTION SESSION (PACKET ID)
// ==================================================
// One inspection session = one physical coffee packet.
// Starting a session generates a packet_id that the backend
// automatically attaches to BOTH the real-time AI result and
// the physical leak test result, so they can be matched
// together for the final report.
// ==================================================

export const startInspectionSession = async () => {
  const response = await api.post(
    "/api/seals/inspection/start"
  );

  return response.data;
};

export const getCurrentInspectionSession = async () => {
  const response = await api.get(
    "/api/seals/inspection/current"
  );

  return response.data;
};

export const finalizeInspectionSession = async (packetId) => {
  const response = await api.post(
    "/api/seals/inspection/finalize",
    null,
    packetId ? { params: { packet_id: packetId } } : undefined
  );

  return response.data;
};


// ==================================================
// AI SEAL DEFECT DETECTION (MANUAL IMAGE UPLOAD)
// ==================================================
export const predictSealDefects = async (imageFile) => {

  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await api.post(
    "/api/seals/predict",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


// ==================================================
// PACKET LEAK DEVICE (ARDUINO)
// ==================================================
export const getLeakDeviceStatus = async () => {

  const response = await api.get(
    "/api/seals/device/status"
  );

  return response.data;
};

export const runLeakDeviceTest = async () => {

  const response = await api.post(
    "/api/seals/device/test"
  );

  return response.data;
};


// ==================================================
// REAL-TIME TWO-STAGE SEAL INSPECTION
// ==================================================
export const startRealtimeSealInspection = async () => {
  const response = await api.post(
    "/api/seals/realtime/start"
  );

  return response.data;
};

export const getRealtimeSealResult = async () => {
  const response = await api.get(
    "/api/seals/realtime/result"
  );

  return response.data;
};

export const stopRealtimeSealInspection = async () => {
  const response = await api.post(
    "/api/seals/realtime/stop"
  );

  return response.data;
};

export const getRealtimeVideoUrl = () => {
  const baseURL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  return `${baseURL}/api/seals/realtime/video`;
};


// ==================================================
// FINAL INSPECTION REPORT
// ==================================================
export const getInspectionReportStatus = async () => {
  const response = await api.get(
    "/api/seals/report/status"
  );

  return response.data;
};

export const generateInspectionReport = async () => {
  const response = await api.post(
    "/api/seals/report/generate"
  );

  return response.data;
};

export const getReportDownloadUrl = (downloadUrl) => {
  if (!downloadUrl) return "";

  const baseURL = (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  return `${baseURL}${downloadUrl}`;
};


// ==================================================
// HISTORY
// ==================================================
export const getLeakTestHistory = async () => {
  const response = await api.get(
    "/api/seals/leak/history"
  );

  return response.data;
};

export const getSealInspectionHistory = async () => {

  const response = await api.get(
    "/api/seals/history"
  );

  return response.data;

};