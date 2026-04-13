import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ rolesPermitidos }) {
  // SECCIÓN: Verificación de autenticación
  const usuarioString = localStorage.getItem("usuario");

  if (!usuarioString) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioString);

  // SECCIÓN: Verificación de permisos por rol
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" replace />;
  }

  // SECCIÓN: Renderizado condicional
  return <Outlet />;
}

export default ProtectedRoute;