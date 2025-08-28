// frontend/src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export default useAuth;
