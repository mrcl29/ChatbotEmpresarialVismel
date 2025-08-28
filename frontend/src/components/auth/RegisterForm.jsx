// frontend/src/components/auth/RegisterForm.jsx
import useAuth from "../../hooks/useAuth.js";
import AuthForm from "./AuthForm.jsx";

const RegisterForm = () => {
  const { register } = useAuth();

  return (
    <AuthForm
      title="Registrarse"
      fields={[
        { name: "username", placeholder: "Usuario" },
        { name: "password", type: "password", placeholder: "Contraseña" },
        {
          name: "confirmPassword",
          type: "password",
          placeholder: "Confirmar contraseña",
        },
      ]}
      onSubmit={({ username, password }) => register(username, password)}
    />
  );
};

export default RegisterForm;
