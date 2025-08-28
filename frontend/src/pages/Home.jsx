// frontend/src/pages/Home.jsx
import useAuth from "../hooks/useAuth.js";
import Logo from "../components/ui/Logo.jsx";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-start pt-30 bg-gray-100 px-4 text-center gap-2">
      <Logo size={300} />
      <h1 className="text-5xl font-bold">Hola {user?.username || "Usuario"} 👋</h1>
    </div>
  );
};

export default Home;
