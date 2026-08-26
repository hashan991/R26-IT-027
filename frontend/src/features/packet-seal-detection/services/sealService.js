import api from "../../../shared/services/api";


// ==================================================
// AI SEAL DEFECT DETECTION
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
// CHECK PACKET LEAK DEVICE CONNECTION
// ==================================================
export const getLeakDeviceStatus = async () => {

  const response = await api.get(
    "/api/seals/device/status"
  );

  return response.data;
};


// ==================================================
// START PACKET LEAK TEST
// ==================================================
export const runLeakDeviceTest = async () => {

  const response = await api.post(
    "/api/seals/device/test"
  );

  return response.data;
};

// ==================================================
// START REAL-TIME SEAL INSPECTION
// ==================================================
export const startRealtimeSealInspection = async () => {
  const response = await api.post(
    "/api/seals/realtime/start"
  );

  return response.data;
};


// ==================================================
// GET REAL-TIME AI RESULT
// ==================================================
export const getRealtimeSealResult = async () => {
  const response = await api.get(
    "/api/seals/realtime/result"
  );

  return response.data;
};


// ==================================================
// STOP REAL-TIME SEAL INSPECTION
// ==================================================
export const stopRealtimeSealInspection = async () => {
  const response = await api.post(
    "/api/seals/realtime/stop"
  );

  return response.data;
};


// ==================================================
// REAL-TIME VIDEO STREAM URL
// ==================================================
export const getRealtimeVideoUrl = () => {
  const baseURL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  return `${baseURL}/api/seals/realtime/video`;
};

// ==================================================
// GET FINAL REPORT STATUS
// ==================================================
export const getInspectionReportStatus = async () => {
  const response = await api.get(
    "/api/seals/report/status"
  );

  return response.data;
};


// ==================================================
// GENERATE FINAL PDF REPORT
// ==================================================
export const generateInspectionReport = async () => {
  const response = await api.post(
    "/api/seals/report/generate"
  );

  return response.data;
};


// ==================================================
// GET PDF DOWNLOAD URL
// ==================================================
export const getReportDownloadUrl = (downloadUrl) => {
  if (!downloadUrl) return "";

  const baseURL = (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  return `${baseURL}${downloadUrl}`;
};

// ==================================================
// GET PACKET LEAK TEST HISTORY
// ==================================================

export const getLeakTestHistory = async () => {
  const response = await api.get(
    "/api/seals/leak/history"
  );

  return response.data;
};

// ==================================================
// GET PACKET SEAL INSPECTION HISTORY
// ==================================================

export const getSealInspectionHistory = async () => {

  const response = await api.get(
    "/api/seals/history"
  );

  return response.data;

};