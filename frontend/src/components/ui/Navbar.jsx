// frontend/src/components/ui/Navbar.jsx
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import navItems from "../../utils/navConfig";
import NavItem from "./NavItem.jsx";
import Logo from "./Logo.jsx";
import Menu from "./Menu.jsx";
import navProfileItems from "../../utils/navProfileConfig.js";

const Navbar = () => {
  const { user } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false); // Oculta el navbar
      } else {
        setShowNavbar(true); // Muestra el navbar
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.roles || item.roles.length === 0 || item.roles.includes(user?.rol)
  );

  const filteredNavProfileItems = navProfileItems.filter(
    (item) =>
      !item.roles || item.roles.length === 0 || item.roles.includes(user?.rol)
  );

  return (
    <nav
      className={`bg-white shadow min-h-[6rem] max-h-[6rem] fixed top-0 left-0 right-0 px-5 z-100 flex items-stretch justify-between transform transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Logo to="/" size={100} className="my-4" />

      <div className="flex flex-1 justify-center items-center gap-[0.05rem]">
        {filteredNavItems.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} className="" />
        ))}
      </div>

      <Menu
        title={user?.name}
        subtitle={user?.rol.toUpperCase()}
        options={filteredNavProfileItems}
      />
    </nav>
  );
};

export default Navbar;
