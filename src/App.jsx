import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Paginas de publicidad / CLiente
import LandingPage from './pages/LandingPage';
import PlanesPage from './pages/PlanesPage';
import RegistroPage from './pages/RegistroPage';

// Páginas de Usuario / Cliente
import MenuPage from "./pages/MenuPage";

// Páginas de Administración (Local)
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriasPage from "./pages/CategoriasPage";
import ProductosPage from "./pages/ProductosPage";
import AjustesPage from "./pages/AjustesPage";
import FinanzasPage from "./pages/FinanzasPage";
import SeleccionarLocalPage from "./pages/admin/SeleccionarLocalPage";
import GastosPage from "./pages/GastosPage";
import CuponesAdminPage from "./pages/CuponesAdminPage";
import SuscripcionVencidaPage from "./pages/admin/SuscripcionVencidaPage"; // <-- IMPORTACIÓN AGREGADA

// Páginas de SuperAdmin (Plataforma)
import SuperAdminLocalesPage from "./pages/superadmin/SuperAdminLocalesPage";
import SuperAdminUsuariosPage from "./pages/superadmin/SuperAdminUsuariosPage";
import SuperAdminDashboardPage from "./pages/superadmin/SuperAdminDashboardPage";

// Guardianes de Rutas (Seguridad)
import ProtectedRoute from "./components/ProtectedRoute"; 
import PublicRoute from "./components/PublicRoute";
import versionActual from './version.json';

function App() {
  useEffect(() => {
    const chequearVersion = () => {
      const versionGuardada = localStorage.getItem('appVersion');
      
      if (versionGuardada !== versionActual.version) {
        console.log("Nueva versión detectada. Actualizando caché...");
        
        localStorage.setItem('appVersion', versionActual.version);
        
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        setTimeout(() => {
            window.location.reload(true); 
        }, 500);
      }
    };

    chequearVersion();
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            RUTA PUBLICA PUBLICIDAD
        ========================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/planes" element={<PlanesPage />} />
        {/* ==========================================
            RUTAS PÚBLICAS CON FILTRO DE LOGUEO
        ========================================== */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
        </Route>

        {/* ==========================================
            RUTAS PROTEGIDAS PARA EL LOCAL (Dueños y Empleados)
        ========================================== */}
        <Route element={<ProtectedRoute rolesPermitidos={["ADMIN", "EMPLEADO"]} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/productos" element={<ProductosPage />} />
          <Route path="/admin/seleccionar-local" element={<SeleccionarLocalPage />} />
          <Route path="/admin/gastos" element={<GastosPage />} />
          <Route path="/admin/suscripcion-vencida" element={<SuscripcionVencidaPage />} /> {/* <-- RUTA AGREGADA */}
        </Route>

        {/* ==========================================
            RUTAS SÚPER PROTEGIDAS (Solo Dueños)
        ========================================== */}
        <Route element={<ProtectedRoute rolesPermitidos={["ADMIN"]} />}>
          <Route path="/admin/categorias" element={<CategoriasPage />} />
          <Route path="/admin/ajustes" element={<AjustesPage />} />
          <Route path="/admin/finanzas" element={<FinanzasPage />} />
          <Route path="/admin/cupones" element={<CuponesAdminPage />} /> 
        </Route>

        {/* ==========================================
            RUTAS DE PLATAFORMA
        ========================================== */}
        <Route element={<ProtectedRoute rolesPermitidos={["SUPER_ADMIN"]} />}>
          <Route path="/plataforma/dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="/plataforma/locales" element={<SuperAdminLocalesPage />} />
          <Route path="/plataforma/usuarios" element={<SuperAdminUsuariosPage />} />
        </Route>

        {/* ==========================================
            RUTA PÚBLICA (MENÚ DEL CLIENTE)
        ========================================== */}
        <Route path="/:slug" element={<MenuPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;