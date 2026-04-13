import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LOGO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774900350/logo-largo-pedialgo_u7snto.png";

function SuperAdminLayout({ children }) {
  // SECCIÓN: Estados y constantes
  const COLOR_PRIMARIO = "#F1A139";
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || { email: "Admin" };

  // SECCIÓN: Configuración de navegación
  const enlaces = [
    { 
      nombre: "Dashboard", 
      ruta: "/plataforma/dashboard", 
      icono: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
    },
    { 
      nombre: "Locales", 
      ruta: "/plataforma/locales", 
      icono: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    },
    {
      nombre: "Cuentas",
      ruta: "/plataforma/usuarios",
      icono: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    }
  ];

  // SECCIÓN: Funciones auxiliares
  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* SECCIÓN: Header móvil */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shrink-0 z-20">
        <img src={LOGO_URL} alt="PediAlgo" className="h-7 object-contain" />
        <button onClick={() => setMenuAbierto(true)} className="text-gray-600 focus:outline-none p-1 cursor-pointer">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {/* SECCIÓN: Overlay del menú móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setMenuAbierto(false)}></div>
      )}

      {/* SECCIÓN: Sidebar principal */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* SECCIÓN: Logo en sidebar */}
        <div className="p-6 border-b border-gray-100">
          <img src={LOGO_URL} alt="PediAlgo" className="h-8 object-contain object-left" />
        </div>

        {/* SECCIÓN: Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {enlaces.map((enlace) => {
            const activo = location.pathname.includes(enlace.ruta);
            return (
              <Link 
                key={enlace.nombre} 
                to={enlace.ruta}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activo ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                style={activo ? { backgroundColor: COLOR_PRIMARIO } : {}}
              >
                {enlace.icono}
                {enlace.nombre}
              </Link>
            );
          })}
        </nav>

        {/* SECCIÓN: Footer de sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Super Administrador</p>
            <p className="text-sm font-bold text-gray-800 truncate mb-3">{usuarioInfo.email}</p>
            <button onClick={handleCerrarSesion} className="flex items-center gap-2 w-full text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* SECCIÓN: Contenido principal */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default SuperAdminLayout;