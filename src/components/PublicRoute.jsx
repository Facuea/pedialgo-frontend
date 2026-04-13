import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
  const usuarioString = localStorage.getItem("usuario");

  // SECCIÓN: Usuario no autenticado
  if (!usuarioString) {
    return <Outlet />;
  }

  // SECCIÓN: Redirección según rol de usuario
  const user = JSON.parse(usuarioString);

  if (user.rol === "SUPER_ADMIN") {
    return <Navigate to="/plataforma/dashboard" replace />;
  }

  // SECCIÓN: Lógica para usuarios con locales
  if (user.locales && user.locales.length > 0) {
    const localActivo = localStorage.getItem("localActivo");
    
    if (localActivo || user.locales.length === 1) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/admin/seleccionar-local" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;