// frontend/src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "../components/auth/AuthGuard.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import {
  Login,
  Logout,
  Home,
  Dashboard,
  Chatbot,
  Users,
  Unauthorized,
  NotFound,
} from "../pages";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Ruta protegida por AuthGuard */}
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard allowedRoles={["admin", "developer"]}>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/users"
          element={
            <AuthGuard allowedRoles={["admin", "developer"]}>
              <Users />
            </AuthGuard>
          }
        />
        <Route
          path="/chatbot"
          element={
            <AuthGuard allowedRoles={["admin", "developer"]}>
              <Chatbot />
            </AuthGuard>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
