// frontend/src/components/ui/Menu.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const Menu = ({ title, subtitle = "", options = [] }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleSelect = (option) => {
    setOpen(false);
    navigate(option.value);
  };

  const Control = () => null;

  const customStyles = {
    menu: (base) => ({
      ...base,
      position: "absolute",
      top: "100%",
      right: 0,
      width: "12rem", // 192px, tailwind: w-48
      marginTop: "0.5rem",
      zIndex: 10,
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      borderRadius: "0.375rem",
      backgroundColor: "white",
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      backgroundColor: state.isFocused ? "#e8e8e8" : "white", // gray-100
      color: state.data.isLogout ? "#dc2626" : "black", // red-600
      padding: "0.5rem 1rem",
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
    dropdownIndicator: () => ({}),
    indicatorSeparator: () => ({}),
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="flex items-center justify-center">
      <button
        onClick={toggleMenu}
        className="flex w-full h-full items-center space-x-6 focus:outline-none cursor-pointer"
      >
        <div className="flex flex-col text-right">
          <span className="text-lg font-extrabold text-black">{title}</span>
          <span className="text-sm font-semibold text-gray-700">
            {subtitle}
          </span>
        </div>

        <MdOutlineKeyboardArrowDown size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-10">
          <Select
            options={options}
            onChange={handleSelect}
            components={{ Control, DropdownIndicator: () => null }}
            menuIsOpen
            styles={customStyles}
            isSearchable={false}
            isClearable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Menu;
