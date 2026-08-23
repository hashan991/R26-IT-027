import { createContext, useContext, useState } from "react";

import {
  loginUser,
  saveAuthData,
  getStoredUser,
  getAccessToken,
  logoutUser,
} from "../services/authService";

// =========================================================
// CREATE CONTEXT
// =========================================================

const AuthContext = createContext(null);

// =========================================================
// AUTH PROVIDER
// =========================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  const [token, setToken] = useState(getAccessToken());

  const [loading, setLoading] = useState(false);

  // =======================================================
  // LOGIN
  // =======================================================

  const login = async (email, password) => {
    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      saveAuthData(data);

      setUser(data.user);
      setToken(data.access_token);

      return data;
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {
    logoutUser();

    setUser(null);
    setToken(null);
  };

  // =======================================================
  // AUTHENTICATION STATUS
  // =======================================================

  const isAuthenticated = Boolean(user && token);

  // =======================================================
  // CONTEXT VALUE
  // =======================================================

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
