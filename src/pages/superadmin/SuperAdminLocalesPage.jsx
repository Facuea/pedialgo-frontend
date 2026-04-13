import { useState, useEffect } from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { fetchPrivado } from "../../services/apiConfig";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

function SuperAdminLocalesPage() {
  const COLOR_PRIMARIO = "#F1A139";
  
  const [locales, setLocales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const [modalLocalAbierto, setModalLocalAbierto] = useState(false);
  const [nuevoLocal, setNuevoLocal] = useState({ nombre: "", slug: "", whatsapp: "", direccion: "", descripcion: "", codigoFranquicia: "" });

  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [localSeleccionado, setLocalSeleccionado] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: "", password: "" });

  // =========================================================================
  // GET: OBTENER LOCALES
  // =========================================================================
  useEffect(() => {
    cargarLocales();
  }, []);

  const cargarLocales = async () => {
    setCargando(true);
    try {
      const res = await fetchPrivado(`/plataforma/locales`);
      if (res.ok) {
        const data = await res.json();
        setLocales(data);
      } else {
        console.error("Error al traer locales del servidor");
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setCargando(false);
    }
  };

  // POST: CREAR LOCAL
  const handleCrearLocal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchPrivado(`/plataforma/locales`, {
        method: "POST",
        body: JSON.stringify(nuevoLocal)
      });

      if (res.ok) {
        const localCreado = await res.json();
        setLocales([...locales, localCreado]);
        setModalLocalAbierto(false);
        setNuevoLocal({ nombre: "", slug: "", whatsapp: "", direccion: "", descripcion: "", codigoFranquicia: "" });
        alert("¡Local creado exitosamente en la base de datos!");
      } else {
        alert("Error al crear. Es probable que el Slug ya exista.");
      }
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };


  // PATCH: ACTIVAR/DESACTIVAR
  const handleToggleEstado = async (local) => {
    setMenuAbiertoId(null);
    const endpoint = local.activo ? "desactivar" : "activar";
    
    setLocales(locales.map(l => l.id === local.id ? { ...l, activo: !local.activo } : l));

    try {
      const res = await fetchPrivado(`/plataforma/locales/${local.slug}/${endpoint}`, { 
        method: "PATCH"
      });
      
      if (!res.ok) {
        throw new Error("Fallo en el backend");
      }

      alert(local.activo ? "Servicio Suspendido. Se bloqueó el acceso al menú." : "Servicio Reactivado. El menú vuelve a estar online.");

    } catch (error) {
      console.error(error);
      setLocales(locales.map(l => l.id === local.id ? { ...l, activo: local.activo } : l));
      alert("Error de conexión al cambiar el estado.");
    }
  };


  // PATCH: EDITAR SLUG
  const handleEditarSlug = async (local) => {
    setMenuAbiertoId(null);
    const nuevoSlug = prompt(`Nuevo link para ${local.nombre} (actual: ${local.slug}):`, local.slug);
    if (!nuevoSlug || nuevoSlug === local.slug) return;

    try {
      const res = await fetchPrivado(`/plataforma/locales/${local.id}/slug`, {
        method: "PATCH",
        body: JSON.stringify({ nuevoSlug: nuevoSlug })
      });

      if (res.ok) {
        const localActualizado = await res.json();
        setLocales(locales.map(l => l.id === local.id ? localActualizado : l));
        alert("Slug actualizado correctamente.");
      } else {
        alert("El slug ya está ocupado o hubo un error.");
      }
    } catch (error) {
      console.error("Error al editar slug:", error);
    }
  };

  // POST: CREAR DUEÑO DE LOCAL
  const abrirModalUsuario = (local) => {
    setMenuAbiertoId(null);
    setLocalSeleccionado(local);
    setNuevoUsuario({ email: "", password: "" });
    setModalUsuarioAbierto(true);
  };

  const handleCrearUsuarioDueño = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchPrivado(`/plataforma/locales/${localSeleccionado.id}/usuarios`, {
        method: "POST",
        body: JSON.stringify({ 
          email: nuevoUsuario.email, 
          password: nuevoUsuario.password,
          localId: localSeleccionado.id 
        })
      });

      if (res.ok) {
        alert(`¡Éxito! El local ha sido asignado al correo: ${nuevoUsuario.email}`);
        setModalUsuarioAbierto(false);
      } else {
        alert("Hubo un error al intentar asignar el local. Revisá la consola.");
      }
    } catch (error) {
      console.error("Error al asignar usuario:", error);
    }
  };

  // DELETE: ELIMINAR LOCAL
  const handleEliminarLocal = async (localId) => {
    setMenuAbiertoId(null);
    if (!window.confirm("¿ESTÁS SEGURO? Se borrará el local de la base de datos.")) return;

    try {
      const res = await fetchPrivado(`/plataforma/locales/${localId}`, { 
        method: "DELETE" 
      });
      
      if (res.ok || res.status === 204) {
        setLocales(locales.filter(l => l.id !== localId));
        alert("Local eliminado exitosamente.");
      } else {
        alert("Error del servidor al intentar borrar el local.");
      }
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };


  // RENDER UI
  const localesFiltrados = locales.filter(l => 
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    l.slug.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto animate-fade-in print:hidden relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Mis Clientes</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Administrá los locales registrados en tu plataforma.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-20">
            <div className="relative w-full sm:w-auto sm:flex-1 md:flex-initial md:w-64">
              <input 
                type="text" 
                placeholder="Buscar por nombre o slug..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 shadow-sm bg-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold">⌕</span>
            </div>
            <button 
              onClick={() => setModalLocalAbierto(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-transform active:scale-95 whitespace-nowrap cursor-pointer hover:brightness-105"
              style={{ backgroundColor: COLOR_PRIMARIO }}
            >
              Nuevo Local
            </button>
          </div>
        </div>

        {/* LISTADO DE LOCALES */}
        <div className="relative z-10">
          {cargando ? (
            <div className="p-10 text-center text-gray-500 font-medium">Conectando con la base de datos...</div>
          ) : localesFiltrados.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center bg-white rounded-2xl border border-gray-200 shadow-sm">
              <img src={IMAGEN_PLACEHOLDER} alt="Sin locales" className="w-20 md:w-24 h-20 md:h-24 mb-4 opacity-50 grayscale" />
              <p className="text-base md:text-lg font-bold text-gray-700">No hay locales registrados</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Registrá tu primer cliente para empezar.</p>
            </div>
          ) : (
          <>
            {/* VISTA PC: TABLA */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px] rounded-tl-2xl">ID</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px]">Comercio</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px]">Link (Slug)</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px] text-center">Estado</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px] text-right rounded-tr-2xl">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localesFiltrados.map(local => (
                    <tr key={local.id} className={`hover:bg-gray-50 transition-colors group relative ${menuAbiertoId === local.id ? 'z-50' : 'z-10'}`}>
                      <td className="py-4 px-6 font-mono text-xs text-gray-400">#{local.id}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-800">{local.nombre}</p>
                        {local.whatsapp && <p className="text-xs text-gray-500 mt-0.5">Wa: {local.whatsapp}</p>}
                      </td>
                      <td className="py-4 px-6">
                        <a href={`/${local.slug}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-orange-500 font-medium bg-gray-100 px-2.5 py-1 rounded-md text-xs transition-colors">
                          /{local.slug}
                        </a>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${local.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {local.activo ? 'Online' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbiertoId(menuAbiertoId === local.id ? null : local.id);
                          }}
                          className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold text-lg transition-colors cursor-pointer ${menuAbiertoId === local.id ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          ⋮
                        </button>

                        {menuAbiertoId === local.id && (
                          <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuAbiertoId(null)}></div>
                            <div className="absolute right-8 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden text-sm py-1 animate-fade-in text-left">
                              <button onClick={() => abrirModalUsuario(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 font-bold transition-colors border-b border-gray-50 cursor-pointer relative z-50">
                                Crear Acceso (Dueño)
                              </button>
                              <button onClick={() => handleEditarSlug(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-b border-gray-50 cursor-pointer relative z-50">
                                Modificar Slug
                              </button>
                              <button onClick={() => handleToggleEstado(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-b border-gray-50 cursor-pointer relative z-50">
                                {local.activo ? 'Suspender Servicio' : 'Reactivar Servicio'}
                              </button>
                              <button onClick={() => handleEliminarLocal(local.id)} className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer relative z-50">
                                Eliminar Local
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VISTA MOBILE: TARJETAS */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {localesFiltrados.map(local => (
                <div 
                  key={local.id} 
                  className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative group ${menuAbiertoId === local.id ? 'z-50' : 'z-10'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${local.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {local.activo ? 'Online' : 'Suspendido'}
                    </span>
                    <span className="font-mono text-xs text-gray-400">ID: #{local.id}</span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-lg mb-2">{local.nombre}</h3>

                  <div className="space-y-3 mb-5">
                    {local.whatsapp && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <span className="font-bold">WhatsApp:</span> {local.whatsapp}
                      </div>
                    )}
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Link de Acceso</span>
                      <a href={`/${local.slug}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
                        pedialgo.com/{local.slug} <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbiertoId(menuAbiertoId === local.id ? null : local.id);
                      }}
                      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold text-lg transition-colors cursor-pointer ${menuAbiertoId === local.id ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      ⋮
                    </button>

                    {menuAbiertoId === local.id && (
                      <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuAbiertoId(null)}></div>
                        <div className="absolute right-0 top-10 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden text-sm py-1 animate-fade-in text-left">
                          <button onClick={() => abrirModalUsuario(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 font-bold transition-colors border-b border-gray-50 cursor-pointer relative z-50">Crear Acceso</button>
                          <button onClick={() => handleEditarSlug(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-b border-gray-50 cursor-pointer relative z-50">Modificar Slug</button>
                          <button onClick={() => handleToggleEstado(local)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-b border-gray-50 cursor-pointer relative z-50">{local.activo ? 'Suspender' : 'Reactivar'}</button>
                          <button onClick={() => handleEliminarLocal(local.id)} className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer relative z-50">Eliminar</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
      </div>

      {/* MODAL: NUEVO LOCAL */}
      {modalLocalAbierto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden flex flex-col animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Registrar Nuevo Cliente</h2>
              <button onClick={() => setModalLocalAbierto(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={handleCrearLocal} className="p-6 flex flex-col gap-5">
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre Comercial *</label>
                  <input type="text" required value={nuevoLocal.nombre} onChange={(e) => setNuevoLocal({...nuevoLocal, nombre: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
                
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Teléfono (WhatsApp)</label>
                  <div className="flex items-stretch w-full">
                    <span className="flex items-center justify-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-bold whitespace-nowrap">
                      +54 9
                    </span>
                    <input 
                      type="tel" 
                      value={nuevoLocal.whatsapp ? nuevoLocal.whatsapp.replace("+549", "") : ""} 
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/\D/g, "");
                        setNuevoLocal({...nuevoLocal, whatsapp: `+549${soloNumeros}`}); 
                      }}
                      className="flex-1 w-full p-2.5 rounded-r-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 min-w-0"
                      placeholder="3584123456"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Dirección</label>
                  <input type="text" value={nuevoLocal.direccion} onChange={(e) => setNuevoLocal({...nuevoLocal, direccion: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" placeholder="Ej: Av. San Martín 123" />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5" title="Para conectar locales (sucursales) poner el mismo código.">Cód. Franquicia (Opcional)</label>
                  <input type="text" value={nuevoLocal.codigoFranquicia} onChange={(e) => setNuevoLocal({...nuevoLocal, codigoFranquicia: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" placeholder="ej: burger-smash" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción del Local</label>
                <textarea value={nuevoLocal.descripcion} onChange={(e) => setNuevoLocal({...nuevoLocal, descripcion: e.target.value})} rows="2" className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none resize-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" placeholder="Ej: La mejor hamburguesería de la ciudad..." />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Identificador Web (Slug) *</label>
                <div className="flex items-center">
                  <span className="hidden sm:block bg-gray-100 border border-r-0 border-gray-300 px-3 py-2.5 rounded-l-lg text-sm font-medium text-gray-500">pedialgo.com/</span>
                  <input type="text" required value={nuevoLocal.slug} onChange={(e) => setNuevoLocal({...nuevoLocal, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full p-2.5 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-gray-300 text-sm font-bold outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setModalLocalAbierto(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer" style={{ backgroundColor: COLOR_PRIMARIO }}>Guardar Local</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR USUARIO DUEÑO */}
      {modalUsuarioAbierto && localSeleccionado && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 text-center bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Crear Acceso</h2>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">Para: {localSeleccionado.nombre}</p>
            </div>
            <form onSubmit={handleCrearUsuarioDueño} className="p-6 flex flex-col gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                <p className="text-[10px] text-blue-700 leading-tight font-medium">
                   <b>Regla estricta:</b> Si ingresás un email que ya existe, no se creará una cuenta nueva; simplemente se le asignará este local a ese correo.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email del Dueño *</label>
                <input 
                  type="email" 
                  required 
                  value={nuevoUsuario.email} 
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} 
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" 
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contraseña (Obligatoria si es nuevo) *</label>
                <input 
                  type="text" 
                  required 
                  value={nuevoUsuario.password} 
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} 
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" 
                  placeholder="Escribí una clave..."
                />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button type="submit" className="w-full py-3 rounded-lg text-sm font-bold text-white shadow-sm transition-transform active:scale-95 cursor-pointer" style={{ backgroundColor: COLOR_PRIMARIO }}>Confirmar Acceso</button>
                <button type="button" onClick={() => setModalUsuarioAbierto(false)} className="w-full py-3 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
}

export default SuperAdminLocalesPage;