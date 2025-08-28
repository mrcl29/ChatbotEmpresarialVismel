// frontend/src/components/auth/LoginForm.jsx
import useAuth from "../../hooks/useAuth.js";
import AuthForm from "./AuthForm.jsx";

const LoginForm = () => {
  const { login } = useAuth();

  return (
    <AuthForm
      title="Iniciar Sesión"
      fields={[
        { name: "username", placeholder: "Usuario" },
        { name: "password", type: "password", placeholder: "Contraseña" },
      ]}
      onSubmit={({ username, password }) => login(username, password)}
    />
  );
};

export default LoginForm;
