import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchPrivado } from "../services/apiConfig";

function CuponesAdminPage() {
  const COLOR_PRIMARIO = "#F1A139";
  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  const [cupones, setCupones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: "",
    descuentoFijo: "",
    usoMaximo: "",
    fechaVencimiento: "",
    activo: true
  });

  useEffect(() => {
    if (localId) cargarCupones();
  }, [localId]);

  const cargarCupones = async () => {
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/cupones`);
      if (response.ok) {
        const data = await response.json();
        setCupones(data);
      }
    } catch (error) {
      console.error("Error al cargar cupones:", error);
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setFormData({ codigo: "", descuentoFijo: "", usoMaximo: "", fechaVencimiento: "", activo: true });
    setModalAbierto(true);
  };

  const abrirModalEditar = (cupon) => {
    setEditandoId(cupon.id);
    setFormData({
      codigo: cupon.codigo,
      descuentoFijo: cupon.descuentoFijo,
      usoMaximo: cupon.usoMaximo || "",
      // Formatear fecha para el input datetime-local (sacar segundos si los trae)
      fechaVencimiento: cupon.fechaVencimiento ? cupon.fechaVencimiento.substring(0, 16) : "",
      activo: cupon.activo
    });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparar el payload respetando los tipos del backend
    const payload = {
      ...formData,
      codigo: formData.codigo.toUpperCase().trim(),
      descuentoFijo: parseFloat(formData.descuentoFijo),
      usoMaximo: formData.usoMaximo ? parseInt(formData.usoMaximo) : null,
      fechaVencimiento: formData.fechaVencimiento ? `${formData.fechaVencimiento}:00` : null
    };

    try {
      const url = editandoId 
        ? `/admin/locales/${localId}/cupones/${editandoId}` 
        : `/admin/locales/${localId}/cupones`;
      
      const method = editandoId ? "PUT" : "POST";

      const response = await fetchPrivado(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setModalAbierto(false);
        cargarCupones();
      } else {
        alert("Hubo un error al guardar el cupón. Verifica que el código no esté repetido.");
      }
    } catch (error) {
      console.error("Error guardando cupón:", error);
    }
  };

  const eliminarCupon = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer.")) return;
    
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/cupones/${id}`, { method: "DELETE" });
      if (response.ok) {
        setCupones(cupones.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto font-sans pb-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Gestión de Cupones</h1>
            <p className="text-gray-500 font-medium text-sm">Creá códigos de descuento exclusivos para tu local.</p>
          </div>
          <button 
            onClick={abrirModalCrear}
            className="px-6 py-2.5 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm active:scale-95"
            style={{ backgroundColor: COLOR_PRIMARIO }}
          >
            + Nuevo Cupón
          </button>
        </div>

        {/* Lista de Cupones (Grid de Tarjetas) */}
        {cupones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium text-lg">No tenés ningún cupón creado.</p>
            <p className="text-gray-400 text-sm mt-1">Hacé clic en "+ Nuevo Cupón" para empezar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cupones.map(cupon => (
              <div key={cupon.id} className={`bg-white rounded-xl border ${cupon.activo ? 'border-emerald-200 shadow-sm' : 'border-gray-200 opacity-70'} overflow-hidden relative`}>
                <div className={`p-4 border-b ${cupon.activo ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
                  <span className="text-xl font-black tracking-widest text-gray-800">{cupon.codigo}</span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${cupon.activo ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                    {cupon.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descuento Fijo</span>
                    <span className="text-2xl font-bold text-emerald-600">${cupon.descuentoFijo}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-gray-500">Usos:</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {cupon.usosActuales} / {cupon.usoMaximo ? cupon.usoMaximo : "∞"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">Vence:</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {cupon.fechaVencimiento ? new Date(cupon.fechaVencimiento).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'}) : "Sin límite"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                  <button onClick={() => abrirModalEditar(cupon)} className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition">Editar</button>
                  <button onClick={() => eliminarCupon(cupon.id)} className="flex-1 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Creación / Edición */}
        {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">{editandoId ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
                <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Código (Ej: VERANO26)</label>
                  <input type="text" required value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 uppercase font-bold focus:ring-2 outline-none" placeholder="CODIGO" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descuento en $ (Fijo)</label>
                  <input type="number" required min="1" step="0.01" value={formData.descuentoFijo} onChange={(e) => setFormData({...formData, descuentoFijo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 font-semibold focus:ring-2 outline-none" placeholder="Ej: 1500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Límite de Usos</label>
                    <input type="number" min="1" value={formData.usoMaximo} onChange={(e) => setFormData({...formData, usoMaximo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 outline-none" placeholder="Opcional" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                    <select value={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold focus:ring-2 outline-none bg-white">
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha Límite (Opcional)</label>
                  <input type="datetime-local" value={formData.fechaVencimiento} onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 outline-none" />
                </div>

                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-white transition hover:brightness-110 shadow-sm" style={{ backgroundColor: COLOR_PRIMARIO }}>Guardar Cupón</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default CuponesAdminPage;