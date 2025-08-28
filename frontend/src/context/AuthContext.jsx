// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { loginAPI, registerAPI } from "../api/auth.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTokenSync = (token) => {
    setToken(token);
    sessionStorage.setItem("token", token);
  };

  const removeTokenSync = () => {
    setToken(null);
    sessionStorage.removeItem("token");
  };

  const logout = useCallback(() => {
    setUser(null);
    removeTokenSync();
  }, []);

  const controlUserToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return false;
      } else {
        setUser({
          id: decoded.id,
          username: decoded.username,
          rol: decoded.rol,
          name: decoded.name,
          sessionID: decoded.sessionID,
        });
        setTokenSync(token);
        return true;
      }
    } catch (error) {
      console.error("Token inválido:", error);
      logout();
      return false;
    }
  };

  // Restaurar usuario si hay token guardado
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      controlUserToken(storedToken);
    }
    setLoading(false);
  }, [logout]);

  // Interval para logout automático si expira el token mientras se usa la app
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = sessionStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          }
        } catch {
          logout();
        }
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [logout]);

  const login = async (username, password) => {
    const result = await loginAPI(username, password);

    if (result.success && result.token) {
      const valid = controlUserToken(result.token);
      return { success: valid, message: result.message };
    }

    return result;
  };

  const register = async (username, password) => {
    const result = await registerAPI(username, password);

    if (result.success && result.token) {
      const valid = controlUserToken(result.token);
      return { success: valid, message: result.message };
    }

    return result;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
