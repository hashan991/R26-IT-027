import api from "../../../shared/services/api";

// ======================================================
// GET CURRENT USER PROFILE
// ======================================================

export const getMyProfile = async () => {
  const response = await api.get("/api/auth/profile");
  return response.data;
};

// ======================================================
// UPDATE PROFILE
// Only first_name and last_name are editable
// ======================================================

export const updateMyProfile = async (profileData) => {
  const response = await api.patch("/api/auth/profile", {
    first_name: profileData.first_name,
    last_name: profileData.last_name,
  });

  return response.data;
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changeMyPassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  const response = await api.post("/api/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

  return response.data;
};

// ======================================================
// DELETE CURRENT USER ACCOUNT
// ======================================================

export const deleteMyAccount = async () => {
  const response = await api.delete("/api/auth/profile");

  return response.data;
};
