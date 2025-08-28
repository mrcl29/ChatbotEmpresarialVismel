// frontend/src/components/auth/AuthForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../ui/Loader.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";

const AuthForm = ({ title, fields, onSubmit, successRedirect = "/dashboard" }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    Object.fromEntries(fields.map((field) => [field.name, ""]))
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { success, message } = await onSubmit(form);
    setLoading(false);

    const msg = message || "Error al cargar datos";

    if (success) {
      toast.success(msg);
      navigate(successRedirect);
    } else {
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {loading && <Loader />}
      <h2 className="text-xl font-bold my-4 text-center">{title}</h2>
      {fields.map(({ name, type = "text", placeholder }) => (
        <Input
          key={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          disabled={loading}
          className="mb-3"
        />
      ))}
      <Button disabled={loading}>{title}</Button>
    </form>
  );
};

export default AuthForm;
