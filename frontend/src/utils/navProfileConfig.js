// frontend/src/utils/navProfileConfig.js

const navProfileItems = [
  {
    value: "/users",
    label: "Usuarios",
    roles: ["admin", "developer"],
  },
  {
    value: "/logout",
    label: "Cerrar sesión",
    isLogout: true,
    roles: [],
  },
];

export default navProfileItems;
