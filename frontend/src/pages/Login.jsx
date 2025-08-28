// frontend/src/pages/Login.jsx
// import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Logo from "../components/ui/Logo.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
// import RegisterForm from "../components/auth/RegisterForm.jsx";
import Loader from "../components/ui/Loader.jsx";

const Login = () => {
  const { user, loading } = useAuth();
  // const [isRegistering, setIsRegistering] = useState(false);

  if (loading) return <Loader fullScreen />;
  if (user) return <Navigate to="/home" />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm flex flex-col items-center">
        <Logo size={172} />
        {/* {isRegistering ? <RegisterForm /> : <LoginForm />} */}
        <LoginForm />
        {/* <button
          className="mt-4 text-sm text-gray-800 bg-white hover:underline cursor-pointer"
          onClick={() => setIsRegistering((prev) => !prev)}
        >
          {isRegistering ? "Iniciar sesión" : "Registrarse"}
        </button> */}
      </div>
    </div>
  );
};

export default Login;
