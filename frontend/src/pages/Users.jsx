// frontend/src/pages/Users.jsx
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Select from "react-select";
import toast from "react-hot-toast";
import { getAllUsersAPI, getAllRolesAPI, updateUsersAPI } from "../api/user";
import useAuth from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

// Estilos minimalistas para la tabla
const customStyles = {
  rows: {
    style: {
      minHeight: "3rem",
      textAlign: "center",
    },
  },
  headCells: {
    style: {
      fontSize: "1rem",
      fontWeight: "bold",
      backgroundColor: "#000000",
      color: "#ffffff",
      textAlign: "center",
      justifyContent: "center",
    },
  },
  cells: {
    style: {
      fontSize: "0.9rem",
      padding: "0.75rem",
      justifyContent: "center",
      textAlign: "center",
    },
  },
};

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedUsers, setEditedUsers] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        getAllUsersAPI(token),
        getAllRolesAPI(token),
      ]);
      if (!uRes.success || !rRes.success) {
        toast.error(uRes.message || rRes.message || "Error al cargar datos");
      } else {
        setUsers(uRes.usuarios);
        setOriginalUsers(uRes.usuarios);
        setRoles(rRes.roles.map((r) => r.rol));
      }
      setLoading(false);
    };
    if (token) fetchData();
  }, [token]);

  const onRoleChange = (id, newRol) => {
    setUsers((old) =>
      old.map((u) => (u.id === id ? { ...u, rol: newRol } : u))
    );
    const orig = originalUsers.find((u) => u.id === id);
    setEditedUsers((old) => {
      if (!orig) return old;
      if (orig.rol === newRol) {
        const copy = { ...old };
        delete copy[id];
        return copy;
      }
      return { ...old, [id]: { ...orig, rol: newRol } };
    });
  };

  const onDelete = (id) => {
    setUsers((old) => old.filter((u) => u.id !== id));
    setEditedUsers((old) => {
      const c = { ...old };
      delete c[id];
      return c;
    });
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Usuario", selector: (row) => row.username, sortable: true },
    {
      name: "Rol",
      cell: (row) => {
        const options = roles.map((r) => ({ value: r, label: r }));
        return (
          <div className="min-w-[5rem] w-full max-w-[15rem] mx-auto">
            <Select
              value={options.find((o) => o.value === row.rol)}
              options={options}
              onChange={(sel) => onRoleChange(row.id, sel.value)}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base, state) => ({
                  ...base,
                  cursor: "pointer",
                  minHeight: "1rem",
                  fontSize: "1rem",
                  borderColor: state.isFocused ? "black" : base.borderColor,
                  boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
                  "&:hover": {
                    borderColor: "black",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 20,
                }),
                option: (base, state) => ({
                  ...base,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  backgroundColor: state.isSelected
                    ? "#000000"
                    : state.isFocused
                    ? "#e8e8e8" // Tailwind's gray-100
                    : "white",
                  color: state.isSelected ? "white" : "black",
                }),
                singleValue: (base) => ({
                  ...base,
                  cursor: "pointer",
                }),
              }}
            />
          </div>
        );
      },
    },
    {
      name: "",
      cell: (row) => (
        <button
          onClick={() => onDelete(row.id)}
          className="text-red-600 hover:text-red-800"
        >
          🗑️
        </button>
      ),
      ignoreRowClick: true,
      width: "60px",
    },
  ];

  const onSave = async () => {
    const modified = Object.values(editedUsers);
    if (modified.length === 0) {
      toast("No hay cambios para guardar.");
      return;
    }
    try {
      const res = await updateUsersAPI(token, modified);
      if (res.success) {
        toast.success(res.message);
        setOriginalUsers(users);
        setEditedUsers({});
      } else toast.error(res.message);
    } catch {
      toast.error("Error inesperado al actualizar usuarios");
    }
  };

  if (loading) return <Loader className="mt-5" />;

  return (
    <div className="p-10">
      <DataTable
        columns={columns}
        data={users}
        customStyles={customStyles}
        noHeader
        highlightOnHover
        responsive
      />
      <Button
        onClick={onSave}
        className="fixed bottom-[1rem] left-[1rem] z-50 py-[0.7rem] rounded max-w-xl opacity-50 hover:opacity-100 transition duration-200 hover:bg-gray-900"
        disabled={Object.keys(editedUsers).length === 0}
      >
        Guardar cambios
      </Button>
      <div className="h-[2rem]" /> {/* 6rem de altura (96px) */}
    </div>
  );
};

export default Users;
