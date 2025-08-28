import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/Navbar.jsx";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="h-[6rem]" />
      <main className="flex flex-col flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
