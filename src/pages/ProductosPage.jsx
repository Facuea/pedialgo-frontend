import { fetchPrivado } from "../services/apiConfig";
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

// IMAGEN PLACEHOLDER
const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";
const API_URL = import.meta.env.VITE_API_URL;

function ProductosPage() {
  const COLOR_PRIMARIO = "#F1A139";

  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  // ESTADOS PRINCIPALES
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // ESTADO PARA EL MENÚ DE LOS 3 PUNTITOS
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // ESTADOS DEL MODAL ABM
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // CAMPOS DEL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  
  // NUEVOS ESTADOS PARA IMÁGENES
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [guardando, setGuardando] = useState(false);

  // --- SISTEMA DE NOTIFICACIONES ---
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "exito" });
  const [timeoutId, setTimeoutId] = useState(null);

  const cerrarNotificacion = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setNotificacion({ visible: false, mensaje: "", tipo: "exito" });
  };

  const mostrarNotificacion = (mensaje, tipo = "exito") => {
    cerrarNotificacion();
    setNotificacion({ visible: true, mensaje, tipo });
    const id = setTimeout(() => {
      setNotificacion({ visible: false, mensaje: "", tipo: "exito" });
    }, 5000);
    setTimeoutId(id);
  };

  // --- ESTADOS DE MODALES DE CONFIRMACIÓN ---
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, producto: null });
  const [modalDescuento, setModalDescuento] = useState({ abierto: false, producto: null, valor: "" });

  // CARGA DE DATOS
  useEffect(() => {
    cargarDatos();
  }, [localId]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resCat = await fetchPrivado(`/admin/locales/${localId}/categorias`);
      if (resCat.ok) {
        const catData = await resCat.json();
        setCategorias(catData);
      }

      const resProd = await fetchPrivado(`/admin/locales/${localId}/productos`);
      if (resProd.ok) {
        const prodData = await resProd.json();
        setProductos(prodData);
      } else {
        setProductos([]);
      }

    } catch (error) {
      mostrarNotificacion("Error al conectar con la base de datos.", "error");
    } finally {
      setCargando(false);
    }
  };

  // FUNCIONES CRUD Y ACCIONES

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !categoriaId) return;

    setGuardando(true);

    // ACÁ ESTÁ LA CORRECCIÓN: Se envía categoriaId al backend
    const payload = { 
      nombre, 
      descripcion, 
      precio: parseFloat(precio), 
      imagenUrl: archivoImagen ? "" : previewUrl,
      categoriaId: parseInt(categoriaId) 
    };

    try {
      let productoGuardado = null;

      // --- PASO 1: GUARDAR EL TEXTO ---
      if (productoEditando) {
        const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${categoriaId}/productos/${productoEditando.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Fallo al guardar texto");
        productoGuardado = await res.json();
      } else {
        const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${categoriaId}/productos`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Fallo al crear producto");
        productoGuardado = await res.json();
      }

      // --- PASO 2: SUBIR LA FOTO ---
      if (productoGuardado && archivoImagen) {
        const formData = new FormData();
        formData.append("file", archivoImagen);
        const token = JSON.parse(localStorage.getItem("usuario"))?.token;

        const resImg = await fetch(`${API_URL}/admin/imagenes/producto/${productoGuardado.id}`, {
          method: "PATCH",
          body: formData,
          headers: {
             "Authorization": `Bearer ${token}` 
          }
        });
        if (resImg.ok) {
          const nuevaUrl = await resImg.text();
          productoGuardado.imagenUrl = nuevaUrl;
        } else {
          mostrarNotificacion("Texto guardado, pero hubo un error con la imagen.", "error");
        }
      }

      if (productoGuardado) {
        if (productoEditando) {
          setProductos(prev => prev.map(p => p.id === productoGuardado.id ? productoGuardado : p));
        } else {
          setProductos(prev => [...prev, productoGuardado]);
        }
        
        mostrarNotificacion("Guardado exitosamente.", "exito");
        cerrarModal();
      }

    } catch (error) {
      console.error(error);
      mostrarNotificacion("Error al conectar con el servidor.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (prod) => {
    setMenuAbiertoId(null);
    setModalEliminar({ abierto: true, producto: prod });
  };

  const ejecutarEliminar = async () => {
    if (!modalEliminar.producto) return;
    const prod = modalEliminar.producto;
    setModalEliminar({ abierto: false, producto: null });
    setProductos(prev => prev.filter(p => p.id !== prod.id));
    try {
      const catId = prod.categoriaId || (categorias.length > 0 ? categorias[0].id : 0);
      const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${catId}/productos/${prod.id}`, {
        method: "DELETE"
      });
      if (res.ok || res.status === 204) {
        mostrarNotificacion("Producto eliminado correctamente.");
      } else {
        cargarDatos();
        mostrarNotificacion("Error al eliminar en el servidor. El producto volvió a aparecer.", "error");
      }
    } catch (error) {
      cargarDatos();
      mostrarNotificacion("Error de conexión al intentar eliminar.", "error");
    }
  };

  const handleToggleDestacado = async (prod) => {
    setMenuAbiertoId(null);
    const endpointAccion = prod.destacado ? "quitar-destacado" : "destacar";
    setProductos(productos.map(p => p.id === prod.id ? { ...p, destacado: !prod.destacado } : p));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${prod.categoriaId}/productos/${prod.id}/${endpointAccion}`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error();
      mostrarNotificacion(prod.destacado ? "Producto ya no es destacado." : "Producto marcado como destacado.");
    } catch (error) {
      setProductos(productos.map(p => p.id === prod.id ? { ...p, destacado: prod.destacado } : p));
      mostrarNotificacion("Error al cambiar estado de destacado.", "error");
    }
  };

  const handleToggleDisponibilidad = async (prod) => {
    setMenuAbiertoId(null);
    const estaActivo = prod.activo !== false;
    const endpointAccion = estaActivo ? "desactivar" : "activar";
    
    setProductos(productos.map(p => p.id === prod.id ? { ...p, activo: !estaActivo } : p));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${prod.categoriaId}/productos/${prod.id}/${endpointAccion}`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error();
      mostrarNotificacion(estaActivo ? "Producto pausado." : "Producto reactivado para la venta.");
    } catch (error) {
      setProductos(productos.map(p => p.id === prod.id ? { ...p, activo: estaActivo } : p));
      mostrarNotificacion("Error al cambiar disponibilidad.", "error");
    }
  };

  const abrirModalDescuento = (prod) => {
    setMenuAbiertoId(null);
    setModalDescuento({ 
      abierto: true, 
      producto: prod, 
      valor: prod.descuento ? prod.descuento.toString() : "" 
    });
  };

  const ejecutarDescuento = async (e) => {
    e.preventDefault();
    const { producto, valor } = modalDescuento;
    const numDesc = parseInt(valor) || 0;
    
    if (numDesc < 0 || numDesc > 100) {
      mostrarNotificacion("El descuento debe estar entre 0 y 100.", "error");
      return;
    }

    setModalDescuento({ abierto: false, producto: null, valor: "" });
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/categorias/${producto.categoriaId}/productos/${producto.id}/descuento?descuento=${numDesc}`, {
        method: "PATCH"
      });
      if (res.ok) {
        setProductos(productos.map(p => p.id === producto.id ? { ...p, descuento: numDesc } : p));
        mostrarNotificacion(numDesc === 0 ? "Descuento eliminado." : `Descuento del ${numDesc}% aplicado.`);
      } else {
        mostrarNotificacion("Error al aplicar descuento.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión al aplicar descuento.", "error");
    }
  };

  // MANEJO DE INTERFAZ Y ARCHIVOS
  const abrirModalEditar = (prod) => {
    setMenuAbiertoId(null);
    setProductoEditando(prod); 
    setNombre(prod.nombre); 
    setDescripcion(prod.descripcion || "");
    setPrecio(prod.precio); 
    setCategoriaId(prod.categoriaId);
    
    setArchivoImagen(null);
    setPreviewUrl(prod.imagenUrl || "");
    setModalAbierto(true);
  };

  const abrirModalCrear = () => {
    setProductoEditando(null); 
    setNombre(""); 
    setDescripcion(""); 
    setPrecio(""); 
    setCategoriaId(categorias.length > 0 ? categorias[0].id : "");
    setArchivoImagen(null);
    setPreviewUrl("");
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); };

  const handleCambioArchivo = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoImagen(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const productosFiltrados = productos.filter(p => {
    const noEstaEliminado = p.nombre && !p.nombre.toUpperCase().includes("(ELIMINADO)");
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.id.toString().includes(busqueda);
    return noEstaEliminado && coincideBusqueda;
  });

  return (
    <AdminLayout>
      {menuAbiertoId && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMenuAbiertoId(null)}></div>
      )}

      <div className="max-w-7xl mx-auto font-sans pb-12 animate-fade-in print:hidden relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Productos</h1>
            <p className="text-gray-500 text-sm mt-1">Gestioná los precios, fotos y disponibilidad de tu menú.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0 relative z-20">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Buscar producto o ID..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-white" />
              <span className="absolute left-3 top-2.5 text-gray-400 text-lg">⌕</span>
            </div>
            <button onClick={abrirModalCrear} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:brightness-105"
              style={{ backgroundColor: COLOR_PRIMARIO }}> + Nuevo Producto </button>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-20 text-gray-500 font-medium">Conectando con la base de datos...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-48 h-48 mb-6 opacity-30">
               <img src={IMAGEN_PLACEHOLDER} alt="Sin productos" className="w-full h-full object-contain grayscale" />
            </div>
            <p className="text-lg font-bold text-gray-700">Aún no hay productos</p>
            <p className="text-sm text-gray-500 mt-1">Hacé clic en "Nuevo Producto" para empezar a armar tu carta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
            {productosFiltrados.map((prod) => {
              const categoriaNombre = categorias.find(c => c.id === prod.categoriaId)?.nombre || "Sin Categoría";
              const precioFinal = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
              const estaActivo = prod.activo !== false;

              return (
                <div key={prod.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col group hover:shadow-md transition-all relative ${menuAbiertoId === prod.id ? 'z-50' : 'z-10'}`}>
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
                    {!estaActivo && (
                       <span className="bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">Pausado</span>
                    )}
                    {prod.destacado && estaActivo && (
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">★ Destacado</span>
                    )}
                    {prod.descuento > 0 && estaActivo && (
                      <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">-{prod.descuento}% OFF</span>
                    )}
                  </div>

                 <div className={`h-40 rounded-t-2xl bg-gray-50 border-b border-gray-100 overflow-hidden relative transition-all ${!estaActivo ? 'opacity-60 grayscale' : ''}`}>
                    <img 
                      src={prod.imagenUrl || IMAGEN_PLACEHOLDER} 
                      alt={prod.nombre} 
                      className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${prod.imagenUrl ? 'object-cover' : 'object-contain p-8 opacity-30'}`} 
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col relative">
                    <div className={`transition-all ${!estaActivo ? 'opacity-60' : ''}`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{categoriaNombre} • #{prod.id}</p>
                        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-3 line-clamp-2">{prod.nombre}</h3>
                    </div>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-dashed border-gray-200">
                      <div className={`flex items-end gap-2 transition-all ${!estaActivo ? 'opacity-60' : ''}`}>
                        <p className="text-lg font-black text-gray-900">${precioFinal}</p>
                        {prod.descuento > 0 && <p className="text-xs font-bold text-gray-400 line-through mb-1">${prod.precio}</p>}
                      </div>

                      <div className="relative">
                        <button onClick={() => setMenuAbiertoId(menuAbiertoId === prod.id ? null : prod.id)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold text-xl cursor-pointer ${menuAbiertoId === prod.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}>
                          ⋮
                        </button>

                        {menuAbiertoId === prod.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden text-sm py-1 animate-fade-in">
                            
                            <button onClick={() => handleToggleDisponibilidad(prod)} className={`w-full text-left px-5 py-3 font-bold transition-colors cursor-pointer border-b border-gray-50 ${estaActivo ? 'hover:bg-amber-50 text-amber-700' : 'hover:bg-emerald-50 text-emerald-700'}`}>
                              {estaActivo ? 'Pausar Venta' : 'Reactivar Venta'}
                            </button>
                            <button onClick={() => handleToggleDestacado(prod)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer border-b border-gray-50">
                              {prod.destacado ? 'Quitar Destacado' : '★ Destacar Producto'}
                            </button>
                            <button onClick={() => abrirModalDescuento(prod)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer border-b border-gray-50">
                              {prod.descuento > 0 ? `Ajustar Descuento (${prod.descuento}%)` : '% Aplicar Descuento'}
                            </button>
                            <button onClick={() => abrirModalEditar(prod)} className="w-full text-left px-5 py-3 hover:bg-blue-50 text-blue-600 font-medium transition-colors cursor-pointer border-b border-gray-50">
                               Editar Información
                            </button>
                            <button onClick={() => confirmarEliminar(prod)} className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 font-medium transition-colors cursor-pointer">
                              Eliminar Producto
                            </button>
                          </div>
                        )}
                       </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalAbierto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif", zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{productoEditando ? "Editar Producto" : "Nuevo Producto"}</h2>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 text-3xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleGuardar} className="p-6 flex flex-col gap-5 overflow-y-auto no-scrollbar">
              
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-16 h-16 rounded-full border border-gray-200 overflow-hidden bg-white shrink-0">
                  <img src={previewUrl || IMAGEN_PLACEHOLDER} alt="Preview" className={`w-full h-full object-cover ${!previewUrl ? 'opacity-30 p-2' : ''}`} />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Foto del Producto</label>
                  <input type="file" id="fotoProducto" hidden accept="image/*" onChange={handleCambioArchivo} />
                  <label htmlFor="fotoProducto" className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-gray-300 inline-block">Seleccionar Archivo</label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Categoría *</label>
                  <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-medium outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-white cursor-pointer">
                    <option value="" disabled>Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="w-full sm:w-1/3">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Precio *</label>
                  <div className="relative"><span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span><input type="number" required min="1" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm font-bold outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" /></div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre del Producto *</label>
                <input type="text" maxLength={100} required placeholder="Ej: Hamburguesa Simple" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-medium outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                <p className={`text-[10px] mt-1 text-right font-bold ${nombre.length >= 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {nombre.length} / 100
                </p>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción (Opcional)</label>
                <textarea rows="2" maxLength={500} placeholder="Detalles de los ingredientes..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm resize-none outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"></textarea>
                <p className={`text-[10px] mt-1 text-right font-bold ${descripcion.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {descripcion.length} / 500
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2 shrink-0">
                <button type="button" onClick={cerrarModal} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={guardando}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer ${guardando ? 'opacity-70 cursor-not-allowed' : ''}`} 
                  style={{ backgroundColor: COLOR_PRIMARIO }}
                > 
                  {guardando ? "Guardando..." : (productoEditando ? "Guardar Cambios" : "Crear Producto")} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINAR */}
      {modalEliminar.abierto && modalEliminar.producto && (
         <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">Eliminar Producto</h2>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro que querés eliminar <br/>
              <b className="text-gray-800 font-bold">"{modalEliminar.producto.nombre}"</b>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalEliminar({ abierto: false, producto: null })} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">
                Cancelar
              </button>
              <button onClick={ejecutarEliminar} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 cursor-pointer transition-transform active:scale-95">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APLICAR DESCUENTO */}
      {modalDescuento.abierto && modalDescuento.producto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-900">Aplicar Descuento</h2>
              <button onClick={() => setModalDescuento({ abierto: false, producto: null, valor: "" })} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">×</button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">Para: <b className="text-gray-800">{modalDescuento.producto.nombre}</b></p>
            
            <form onSubmit={ejecutarDescuento} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Porcentaje (%) *</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required 
                  value={modalDescuento.valor} 
                  onChange={(e) => setModalDescuento({...modalDescuento, valor: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  placeholder="Ej: 15"
                />
                <p className="text-[10px] text-gray-400 mt-1">Escribí 0 para quitar el descuento.</p>
              </div>
              <div className="flex gap-2 mt-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalDescuento({ abierto: false, producto: null, valor: "" })} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer hover:brightness-105" style={{ backgroundColor: COLOR_PRIMARIO }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notificacion.visible && (
        <div className="fixed bottom-6 right-6 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm animate-fade-in flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between transition-all transform hover:translate-y-0.5" style={{ zIndex: 999999 }}>
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 text-[10px] font-black ${notificacion.tipo === 'exito' ? 'text-emerald-400 border-emerald-400' : 'text-red-400 border-red-400'}`}>
              {notificacion.tipo === 'exito' ? '✓' : '!'}
            </span>
            {notificacion.mensaje}
          </div>
          <button onClick={cerrarNotificacion} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl p-1 leading-none font-bold">×</button>
        </div>
      )}

    </AdminLayout>
  );
}

export default ProductosPage;