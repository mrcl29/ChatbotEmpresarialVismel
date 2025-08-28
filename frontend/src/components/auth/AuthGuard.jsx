// frontend/src/components/auth/AuthGuard.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import Loader from "../ui/Loader.jsx";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (user && allowedRoles.length && !allowedRoles.includes(user.rol)) {
      toast.error("Acceso Denegado", { id: "acceso-denegado" });
      setDenied(true);
    }
  }, [user, allowedRoles]);

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/" />;
  if (denied) return <Navigate to="/home" />;

  return children;
};

export default AuthGuard;
