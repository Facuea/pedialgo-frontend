import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchPrivado } from "../services/apiConfig";

const API_URL = import.meta.env.VITE_API_URL;

function AdminLayout({ children }) {
  const [mostrarNovedades, setMostrarNovedades] = useState(false);

  const [mostrarQR, setMostrarQR] = useState(false);

  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  
  const urlMenu = `${window.location.origin}/${localActivo.slug}`;
  
  // Función para descargar el QR
  const descargarQR = () => {
    const canvas = document.getElementById("qr-sidebar");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${localActivo.slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const location = useLocation();
  const navigate = useNavigate();

  const COLOR_PRIMARIO = "#F1A139"; 

  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || { email: "usuario@pedialgo.com", rol: "EMPLEADO", locales: [] };
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuLocalesAbierto, setMenuLocalesAbierto] = useState(false);
  const [nombreLocal, setNombreLocal] = useState("Cargando...");

  // Carga inicial del nombre del local
  useEffect(() => {
    if (localActivo.id) {
      fetchPrivado(`/admin/locales/${localActivo.id}`)
        .then(res => res.json())
        .then(data => setNombreLocal(data.nombre))
        .catch(err => {
          console.error("Error al cargar local:", err);
          setNombreLocal("Mi Local");
        });
    }
  }, [localActivo.id]);

  // Polling silencioso para verificar sesión activa
  useEffect(() => {
    if (!localActivo.id) return;

    const intervalId = setInterval(() => {
      fetchPrivado(`/admin/locales/${localActivo.id}`)
        .catch(() => {});
    }, 5000); 
    return () => clearInterval(intervalId);
  }, [localActivo.id]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("localActivo");
    navigate("/login");
  };

  const handleCambiarLocal = (local) => {
    localStorage.setItem("localActivo", JSON.stringify(local));
    setMenuLocalesAbierto(false);
    window.location.reload(); 
  };

  // Lista de items del menú de navegación
  const menuItems = [
    { path: "/admin/dashboard", label: "Monitor de Pedidos", roles: ["ADMIN", "EMPLEADO"] },
    { path: "/admin/finanzas", label: "Resumen Financiero", roles: ["ADMIN"] },
    { path: "/admin/categorias", label: "Categorías", roles: ["ADMIN"] },
    { path: "/admin/productos", label: "Mis Productos", roles: ["ADMIN", "EMPLEADO"] },
    { path: "/admin/ajustes", label: "Ajustes del Local", roles: ["ADMIN"] },
  ];

  const menuFiltrado = menuItems.filter(item => item.roles.includes(usuarioInfo.rol));
  const localesDisponibles = usuarioInfo.locales || [];
  const tieneMultiplesLocales = localesDisponibles.length > 1;

  const abrirSoporte = () => {
    const msg = encodeURIComponent("Hola PediAlgo, necesito ayuda con el sistema de gestión.");
    window.open(`https://wa.me/5493585148782?text=${msg}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-[#f4f7f6] overflow-hidden text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Overlay oscuro para menú móvil */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* --- INICIO DEL MENÚ LATERAL (SIDEBAR) --- */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* LOGO */}
        <div className="h-32 flex items-center justify-center border-b border-gray-50/80 px-4 shrink-0">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774900350/logo-largo-pedialgo_u7snto.png" 
            alt="PediAlgo" 
            className="h-18 w-auto object-contain"
          />
        </div>

        {/* SELECTOR DE LOCAL */}
        <div className="p-5 pb-2 shrink-0 relative">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Local Activo</p>
          <button 
            onClick={() => setMenuLocalesAbierto(!menuLocalesAbierto)}
            disabled={!tieneMultiplesLocales}
            className={`w-full bg-orange-50 border border-orange-100 text-sm font-bold text-orange-700 rounded-lg p-3 flex items-center justify-between transition-colors ${tieneMultiplesLocales ? 'cursor-pointer hover:bg-orange-100' : 'cursor-default opacity-90'}`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
              <span className="truncate">{nombreLocal}</span>
            </div>
            {tieneMultiplesLocales && (
              <span className={`text-orange-400 shrink-0 ml-2 text-xs transition-transform ${menuLocalesAbierto ? 'rotate-180' : ''}`}>▼</span>
            )}
          </button>
          
          {/* Dropdown de sucursales */}
          {menuLocalesAbierto && tieneMultiplesLocales && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuLocalesAbierto(false)}></div>
              <div className="absolute top-full left-5 right-5 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 animate-fade-in">
                <div className="max-h-48 overflow-y-auto">
                  {localesDisponibles.map(l => (
                    <button 
                      key={l.id}
                      onClick={() => handleCambiarLocal(l)}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 truncate cursor-pointer ${l.id === localActivo.id ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
                    >
                      {l.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar relative z-10">
          <p className="px-4 text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">Menú Principal</p>
          
          {/* Mapeo de links (Dashboard, Productos, etc.) */}
          {menuFiltrado.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all hover:bg-gray-50"
                style={{
                  backgroundColor: isActive ? `${COLOR_PRIMARIO}15` : "transparent",
                  color: isActive ? COLOR_PRIMARIO : "#6B7280",
                }}
              >
                <span className="text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-50">
            {/* BOTÓN: NOVEDADES */}
            <button
              onClick={() => setMostrarNovedades(true)}
              className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer group mb-1"
            >
               <span className="text-sm tracking-tight flex items-center gap-2">
                  Novedades
               </span>
            </button>
            {/* --- NUEVO BOTÓN: LINK / QR EN EL MENÚ --- */}
            <button
              onClick={() => setMostrarQR(true)}
              className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer group mb-1"
            >
               <span className="text-sm tracking-tight flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                 Link / QR del Menú
               </span>
            </button>
            {/* -------------------------------------- */}

            {/* BOTÓN DE AYUDA (SOPORTE) */}
            <button
              onClick={abrirSoporte}
              className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer group"
            >
              <span className="text-sm tracking-tight flex items-center gap-2">
                <span className="grayscale group-hover:grayscale-0 transition-all"></span> ¿Necesitás ayuda?
              </span>
            </button>
          </div>
        </nav>

        {/* INFO DEL USUARIO LOGUEADO */}
        <div className="p-4 border-t border-gray-50/80 shrink-0 bg-gray-50/30">
          <div className="px-4 mb-4">
             <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Mi Cuenta</p>
             <p className="font-bold text-sm text-gray-800 truncate">
               {usuarioInfo.nombreCompleto || "Usuario"}
             </p>
             <p className="font-medium text-xs text-gray-500 truncate mb-2">
               {usuarioInfo.email}
             </p>
             <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm ${usuarioInfo.rol === 'ADMIN' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                {usuarioInfo.rol}
             </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3.5 w-full px-4 py-2.5 rounded-lg font-bold text-red-500 hover:bg-red-50 hover:text-red-600 text-xs transition-colors cursor-pointer border border-transparent hover:border-red-100"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      {/* --- FIN DEL MENÚ LATERAL --- */}

      {/* --- INICIO ÁREA PRINCIPAL (MAIN) --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full z-0">
        
        {/* CABECERA MÓVIL */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:hidden shadow-sm z-10 shrink-0">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774900350/logo-largo-pedialgo_u7snto.png" 
            alt="PediAlgo" 
            className="h-10 object-contain"
          />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-2xl text-gray-700 p-2 cursor-pointer">
            ☰
          </button>
        </header>

        {/* CONTENIDO (AQUÍ SE INYECTAN LAS OTRAS PÁGINAS) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative w-full print:p-0">
          {children}
        </div>

        {/* --- MODAL DEL QR (Aparece cuando mostrarQR es true) --- */}
        {mostrarQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <p className="font-bold text-lg text-gray-800">Comparte tu Menú</p>
                <button onClick={() => setMostrarQR(false)} className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer leading-none">&times;</button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center border border-gray-200 mb-6">
                <QRCodeCanvas 
                  id="qr-sidebar" 
                  value={urlMenu} 
                  size={180} 
                  level={"H"} 
                  includeMargin={true} 
                  className="rounded-lg"
                />
                <button 
                  onClick={descargarQR}
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                >
                  Descargar Código QR
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Link directo</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={urlMenu} 
                    className="flex-1 bg-gray-100 p-3 rounded-lg text-xs border border-gray-200 text-gray-600 outline-none" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(urlMenu);
                      alert("¡Link copiado al portapapeles!");
                    }}
                    className="bg-gray-800 text-white px-3 rounded-lg text-sm cursor-pointer hover:bg-black transition-colors"
                    title="Copiar Link"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* --- FIN MODAL QR --- */}
        {/* --- INICIO MODAL DE NOVEDADES --- */}
        {mostrarNovedades && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-indigo-800 font-bold flex items-center gap-2 text-xl">
                   Novedades y Mejoras en PediAlgo
                </h3>
                <button onClick={() => setMostrarNovedades(false)} className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer leading-none">&times;</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">Nuevo</span>
                  <p className="font-bold text-gray-800 text-sm mb-2">Métodos de Pago</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Ahora tus clientes pueden avisarte si pagan en Efectivo o Transferencia, y podés ver con cuánto abonan directo en el pedido.</p>
                </div>
                
                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">Mejora</span>
                  <p className="font-bold text-gray-800 text-sm mb-2">Ticket Inteligente</p>
                  <p className="text-xs text-gray-600 leading-relaxed">El ticket de impresión ahora muestra el método de pago y calcula automáticamente el vuelto para agilizar tu caja.</p>
                </div>
                
                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">Herramienta</span>
                  <p className="font-bold text-gray-800 text-sm mb-2">Link y QR a mano</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Agregamos una sección en tu menú lateral izquierdo para que descargues tu código QR o copies tu link cuando quieras.</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                <button 
                  onClick={() => setMostrarNovedades(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- FIN MODAL DE NOVEDADES --- */}
      </main>
      {/* --- FIN ÁREA PRINCIPAL --- */}
    </div>
  );
}

export default AdminLayout;