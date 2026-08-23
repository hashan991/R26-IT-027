import api from "../../../shared/services/api";

// =========================================================
// UPLOAD IMAGE + RUN PHYSICAL AI
// =========================================================

export const predictBeanDefects = async (imageFile) => {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await api.post("/api/beans/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// =========================================================
// GET PHYSICAL WEIGHT
// =========================================================

export const getPhysicalWeight = async () => {
  const response = await api.get("/api/beans/physical/weight");

  return response.data;
};

// =========================================================
// ZERO / TARE LOAD CELL
// =========================================================

export const zeroPhysicalWeight = async () => {
  const response = await api.post("/api/beans/sensors/weight/zero");

  return response.data;
};

// =========================================================
// GET PHONE CAMERA / ADB STATUS
// =========================================================

export const getPhoneCameraStatus = async () => {
  const response = await api.get("/api/beans/phone-camera/status");

  return response.data;
};

// =========================================================
// OPEN PHONE CAMERA
// =========================================================

export const openPhoneCamera = async () => {
  const response = await api.post("/api/beans/phone-camera/open");

  return response.data;
};

// =========================================================
// CAPTURE ORIGINAL PHONE PHOTO ONLY
// =========================================================

export const capturePhonePhoto = async () => {
  const response = await api.post("/api/beans/phone-camera/capture");

  return response.data;
};

// =========================================================
// CAPTURE ORIGINAL PHONE PHOTO + RUN AI
// =========================================================

export const captureAndAnalyzePhonePhoto = async () => {
  const response = await api.post("/api/beans/phone-camera/capture-analyze");

  return response.data;
};
