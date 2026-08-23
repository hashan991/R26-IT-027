import api from "../../../shared/services/api";

// =========================================================
// GET ALL USERS
// =========================================================

export const getAllUsers = async () => {
  const response = await api.get("/api/admin/users");

  return response.data;
};

// =========================================================
// GET PENDING USERS
// =========================================================

export const getPendingUsers = async () => {
  const response = await api.get("/api/admin/users/pending");

  return response.data;
};

// =========================================================
// APPROVE USER
// =========================================================

export const approveUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/approve`);

  return response.data;
};

// =========================================================
// DISABLE USER
// =========================================================

export const disableUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/disable`);

  return response.data;
};

// =========================================================
// ENABLE USER
// =========================================================

export const enableUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/enable`);

  return response.data;
};

// =========================================================
// CHANGE USER ROLE
// =========================================================

export const changeUserRole = async (userId, role) => {
  const response = await api.patch(`/api/admin/users/${userId}/role`, {
    role,
  });

  return response.data;
};

// =========================================================
// DELETE USER
// =========================================================

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);

  return response.data;
};
