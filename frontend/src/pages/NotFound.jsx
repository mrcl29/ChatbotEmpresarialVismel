import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo.jsx";
import Button from "../components/ui/Button.jsx";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center gap-2">
      <Logo size={172} />
      <h1 className="text-5xl font-bold text-blue-800 mb-4 mt-10">
        404 - Página no encontrada
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Button
        onClick={() => navigate("/home")}
        className="max-w-100 bg-black text-white py-2 rounded hover:bg-gray-800 cursor-pointer font-semibold"
      >
        {"Ir a inicio"}
      </Button>
    </div>
  );
};

export default NotFound;
