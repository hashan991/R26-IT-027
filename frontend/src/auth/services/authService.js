import api from "../../shared/services/api";

// =========================================================
// REGISTER USER
// =========================================================

export const registerUser = async (userData) => {
  const response = await api.post("/api/auth/register", userData);

  return response.data;
};

// =========================================================
// LOGIN USER
// =========================================================

export const loginUser = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);

  return response.data;
};

// =========================================================
// SAVE AUTH DATA
// =========================================================

export const saveAuthData = (loginData) => {
  localStorage.setItem("access_token", loginData.access_token);

  localStorage.setItem("user", JSON.stringify(loginData.user));
};

// =========================================================
// GET TOKEN
// =========================================================

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

// =========================================================
// GET CURRENT USER
// =========================================================

export const getStoredUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// =========================================================
// CHECK AUTHENTICATION
// =========================================================

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

// =========================================================
// LOGOUT
// =========================================================

export const logoutUser = () => {
  localStorage.removeItem("access_token");

  localStorage.removeItem("user");
};
