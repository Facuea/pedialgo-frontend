import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchPrivado } from "../services/apiConfig";

function GastosPage() {
  const COLOR_PRIMARIO = "#F1A139";
  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Estado del formulario
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Insumos/Mercadería");

  const categorias = [
    "Insumos/Mercadería",
    "Sueldos/Delivery",
    "Servicios/Impuestos",
    "Mantenimiento",
    "Varios"
  ];

  useEffect(() => {
    if (localId) {
      cargarGastos();
    }
  }, [localId]);

  const cargarGastos = async () => {
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/gastos`);
      if (response.ok) {
        const data = await response.json();
        setGastos(data);
      }
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monto || !descripcion) return;
    setCargando(true);

    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/gastos`, {
        method: "POST",
        body: JSON.stringify({
          monto: parseFloat(monto),
          descripcion,
          categoria
        })
      });

      if (response.ok) {
        const nuevoGasto = await response.json();
        setGastos([nuevoGasto, ...gastos]); // Agrega el nuevo arriba de todo
        setMonto("");
        setDescripcion("");
        setCategoria("Insumos/Mercadería");
      }
    } catch (error) {
      console.error("Error al guardar gasto:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para formatear fecha (ej: "16/04 21:05 hs")
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "";
    const [fechaPart, horaPart] = fechaString.split("T");
    const [year, month, day] = fechaPart.split("-");
    return `${day}/${month} ${horaPart.substring(0, 5)} hs`;
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-12 font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Control de Gastos</h1>
          <p className="text-gray-500 font-medium text-sm">Registrá los egresos diarios de tu local para conocer tu ganancia real.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Nuevo Gasto</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monto ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none"
                    placeholder="Ej. 15000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
                  <input 
                    type="text" 
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none"
                    placeholder="Ej. Compra de pan y verduras"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={cargando}
                  className="w-full text-white font-bold rounded-lg text-sm px-5 py-3 text-center transition-all hover:brightness-110 active:scale-95 disabled:opacity-70 mt-2 cursor-pointer"
                  style={{ backgroundColor: COLOR_PRIMARIO }}
                >
                  {cargando ? "Guardando..." : "Registrar Gasto"}
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: LISTADO DE GASTOS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800">Historial de Salidas</h2>
                <span className="text-xs font-bold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  Total regs: {gastos.length}
                </span>
              </div>

              <div className="p-0">
                {gastos.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No hay gastos registrados aún.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {gastos.map((gasto) => (
                      <li key={gasto.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                              {gasto.categoria}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                              {formatearFecha(gasto.fecha)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{gasto.descripcion}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-lg font-black text-rose-600">-${gasto.monto}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default GastosPage;