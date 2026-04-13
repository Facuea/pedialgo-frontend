import { useNavigate } from "react-router-dom";

function SeleccionarLocalPage() {
  const navigate = useNavigate();
  
  // SECCIÓN: Obtener datos del usuario
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const locales = usuario?.locales || [];

  // SECCIÓN: Función de selección
  const handleSeleccionar = (local) => {
    localStorage.setItem("localActivo", JSON.stringify(local));
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* SECCIÓN: Header de la página */}
      <div className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900">¡Hola de nuevo!</h1>
        <p className="text-gray-500 mt-2">Seleccioná el local que querés gestionar hoy</p>
      </div>

      {/* SECCIÓN: Grid de locales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {locales.map((local) => (
          <button
            key={local.id}
            onClick={() => handleSeleccionar(local)}
            className="p-6 bg-white rounded-2xl border-2 border-transparent shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                Local ID #{local.id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
              {local.nombre}
            </h3>
            <p className="text-sm text-gray-400 mt-1">pedialgo.com/{local.slug}</p>
          </button>
        ))}
      </div>

      {/* SECCIÓN: Botón cerrar sesión */}
      <button 
        onClick={() => { localStorage.clear(); navigate("/login"); }}
        className="mt-12 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        ← Cerrar sesión
      </button>
    </div>
  );
}

export default SeleccionarLocalPage;