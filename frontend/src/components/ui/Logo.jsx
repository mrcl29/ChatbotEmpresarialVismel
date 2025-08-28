// frontend/src/components/ui/Logo.jsx
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp";

const Logo = ({ size = 48, to = "/", className = "", ...rest }) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center space-x-2 group ${className}`}
    >
      <img
        src={logo}
        alt="Logo de Vismel"
        width={size}
        height={size}
        className="transition-transform duration-200 group-hover:scale-105"
        {...rest}
      />
    </Link>
  );
};

export default Logo;
