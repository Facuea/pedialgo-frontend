import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchPrivado } from "../services/apiConfig";

const API_URL = import.meta.env.VITE_API_URL;

function CategoriasPage() {
  const COLOR_PRIMARIO = "#F1A139";

  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreInput, setNombreInput] = useState("");

  const [modalEliminar, setModalEliminar] = useState({ abierto: false, categoriaId: null });

  // SISTEMA DE NOTIFICACIONES
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "exito" });

  useEffect(() => {
    if (notificacion.visible) {
      const timer = setTimeout(() => {
        setNotificacion({ ...notificacion, visible: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificacion.visible]);

  useEffect(() => {
    cargarCategorias();
  }, [localId]);

  const cargarCategorias = async () => {
    setCargando(true);
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/categorias`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nombreInput.trim()) return;

    const payload = { nombre: nombreInput };

    try {
      const method = categoriaEditando ? "PATCH" : "POST";
      const url = categoriaEditando 
        ? `/admin/locales/${localId}/categorias/${categoriaEditando.id}`
        : `/admin/locales/${localId}/categorias`;

      const response = await fetchPrivado(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (categoriaEditando) {
          setCategorias(categorias.map(c => c.id === categoriaEditando.id ? { ...c, nombre: nombreInput } : c));
        } else {
          const nuevaCategoria = await response.json();
          setCategorias([...categorias, nuevaCategoria]);
        }
        setNotificacion({ visible: true, mensaje: "Categoría guardada con éxito", tipo: "exito" });
        cerrarModal();
      }
    } catch (error) {
      setNotificacion({ visible: true, mensaje: "Error al intentar guardar", tipo: "error" });
    }
  };

  const confirmarEliminar = (id) => {
    setModalEliminar({ abierto: true, categoriaId: id });
  };

  const ejecutarEliminar = async () => {
    const { categoriaId } = modalEliminar;
    setModalEliminar({ abierto: false, categoriaId: null });

    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/categorias/${categoriaId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setCategorias(categorias.filter(c => c.id !== categoriaId));
        setNotificacion({ visible: true, mensaje: "Categoría eliminada correctamente.", tipo: "exito" });
        return;
      }

      setNotificacion({ 
        visible: true, 
        mensaje: "No se puede eliminar: esta categoría tiene productos cargados.", 
        tipo: "error" 
      });

    } catch (error) {
      console.error("Error capturado:", error);
      setNotificacion({ 
        visible: true, 
        mensaje: "No se pudo realizar la acción. Verificá si la categoría está vacía.", 
        tipo: "error" 
      });
    }
  };

  const abrirModalCrear = () => {
    setCategoriaEditando(null);
    setNombreInput("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (categoria) => {
    setCategoriaEditando(categoria);
    setNombreInput(categoria.nombre);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombreInput("");
    setCategoriaEditando(null);
  };

  return (
    <AdminLayout>
      
      {/* NOTIFICACIÓN ESTILO PRODUCTOS */}
      {notificacion.visible && (
        <div className="fixed bottom-6 right-6 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm animate-fade-in flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between transition-all transform hover:translate-y-0.5" style={{ zIndex: 9999 }}>
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 text-[10px] font-black ${notificacion.tipo === 'exito' ? 'text-emerald-400 border-emerald-400' : 'text-red-400 border-red-400'}`}>
              {notificacion.tipo === 'exito' ? '✓' : '!'}
            </span>
            {notificacion.mensaje}
          </div>
          <button onClick={() => setNotificacion({...notificacion, visible: false})} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl p-1 leading-none font-bold">×</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto font-sans pb-12 animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categorías</h1>
            <p className="text-gray-500 text-sm mt-1">Organizá tu menú para que los clientes encuentren todo fácil.</p>
          </div>
          
          <button 
            onClick={abrirModalCrear}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer hover:brightness-105"
            style={{ backgroundColor: COLOR_PRIMARIO }}
          >
            + Nueva Categoría
          </button>
        </div>

        {/* LISTADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-10 text-center text-gray-500 font-medium">Conectando con la base de datos...</div>
          ) : categorias.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <p className="text-lg font-bold text-gray-700">Aún no hay categorías</p>
              <p className="text-sm text-gray-500 mt-1">Creá tu primera categoría para empezar a cargar productos.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {categorias.map((categoria) => (
                <li key={categoria.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-[15px] text-gray-800">
                    {categoria.nombre}
                  </span>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => abrirModalEditar(categoria)}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => confirmarEliminar(categoria.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* MODAL CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleGuardar} className="p-6">
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre de la Categoría</label>
                <input 
                  type="text" autoFocus required value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  placeholder="Ej: Hamburguesas, Bebidas..."
                  className="w-full p-3 rounded-lg border border-gray-200 text-gray-800 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={cerrarModal} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer" style={{ backgroundColor: COLOR_PRIMARIO }}>
                  {categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">Eliminar Categoría</h2>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que querés eliminar esta categoría? 
              Asegurate de que no tenga productos asociados.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModalEliminar({ abierto: false, categoriaId: null })}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarEliminar}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 cursor-pointer transition-transform active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default CategoriasPage;