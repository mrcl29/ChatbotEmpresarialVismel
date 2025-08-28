// frontend/src/components/ui/NavItem.jsx
import { NavLink } from "react-router-dom";

const NavItem = ({ to, label, className = "", ...rest }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center text-base font-bold h-full max-w-[10rem] w-full ${
          isActive ? "bg-black text-white" : "bg-white text-black"
        } hover:bg-black hover:text-white hover:text-lg transition-all ease-in duration-100 hover:duration-300 ${className}`
      }
    >
      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;
