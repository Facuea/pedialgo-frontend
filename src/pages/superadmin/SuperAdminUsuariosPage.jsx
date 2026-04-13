import { useState, useEffect } from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { fetchPrivado } from "../../services/apiConfig";

function SuperAdminUsuariosPage() {
  const COLOR_PRIMARIO = "#F1A139";
  
  const [usuarios, setUsuarios] = useState([]);
  const [locales, setLocales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [verSoloSuspendidos, setVerSoloSuspendidos] = useState(false);

  // SISTEMA DE NOTIFICACIONES
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

  const [modalVincular, setModalVincular] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [localSeleccionadoId, setLocalSeleccionadoId] = useState("");

  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ 
    nombreCompleto: "", 
    documento: "", 
    email: "", 
    password: "", 
    rol: "ADMIN", 
    localId: "" 
  });

  const [modalPassword, setModalPassword] = useState(false);
  const [nuevaClave, setNuevaClave] = useState("");

  // ESTADOS DE MODALES DE CONFIRMACIÓN
  const [modalConfirmacion, setModalConfirmacion] = useState({ 
    abierto: false, 
    usuarioId: null, 
    email: "", 
    rolAnterior: "", 
    nuevoRol: "" 
  });

  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    usuarioId: null,
    email: ""
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resUsuarios, resLocales] = await Promise.all([
        fetchPrivado(`/plataforma/usuarios`),
        fetchPrivado(`/plataforma/locales`)
      ]);
      if (resUsuarios.ok && resLocales.ok) {
        setUsuarios(await resUsuarios.json());
        setLocales(await resLocales.json());
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalVincular = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setLocalSeleccionadoId("");
    setModalVincular(true);
  };

  const handleVincular = async (e) => {
    e.preventDefault();
    if (!localSeleccionadoId) return mostrarNotificacion("Seleccioná un local", "error");

    try {
      const res = await fetchPrivado(`/plataforma/locales/${localSeleccionadoId}/vincular?email=${usuarioSeleccionado.email}`, { 
        method: "POST" 
      });
      if (res.ok) {
        mostrarNotificacion("Local vinculado exitosamente.");
        setModalVincular(false);
        cargarDatos();
      } else {
        mostrarNotificacion("Error: Es posible que ya tenga este local asignado.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión.", "error");
    }
  };

  const abrirModalCrear = () => {
    setNuevoUsuario({ nombreCompleto: "", documento: "", email: "", password: "", rol: "ADMIN", localId: "" });
    setModalCrear(true);
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.localId) return mostrarNotificacion("Debes asignarle un local inicial.", "error");

    try {
      const res = await fetchPrivado(`/plataforma/usuarios`, {
        method: "POST",
        body: JSON.stringify(nuevoUsuario)
      });
      if (res.ok) {
        mostrarNotificacion("Cuenta creada exitosamente.");
        setModalCrear(false);
        cargarDatos(); 
      } else {
        mostrarNotificacion("Error al crear. El correo ya existe.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión.", "error");
    }
  };

  //LÓGICA DE CAMBIO DE ROL
  const confirmarCambioRol = (usuario, nuevoRol) => {
    if (usuario.rol === nuevoRol) return;
    setModalConfirmacion({ 
      abierto: true, 
      usuarioId: usuario.id, 
      email: usuario.email, 
      rolAnterior: usuario.rol, 
      nuevoRol 
    });
  };

  const ejecutarCambioRol = async () => {
    const { usuarioId, nuevoRol, rolAnterior } = modalConfirmacion;
    setModalConfirmacion({ abierto: false, usuarioId: null, email: "", rolAnterior: "", nuevoRol: "" });
    setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: nuevoRol } : u));
    
    try {
      const res = await fetchPrivado(`/plataforma/usuarios/${usuarioId}/rol`, {
        method: "PATCH",
        body: JSON.stringify({ rol: nuevoRol })
      });
      if (res.ok) {
         mostrarNotificacion("Rol actualizado correctamente.");
      } else {
         throw new Error("Error en el servidor");
      }
    } catch (error) {
      mostrarNotificacion("No se pudo cambiar el rol.", "error");
      setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: rolAnterior } : u));
    }
  };

  // LÓGICA DE ELIMINAR USUARIO 
  const confirmarEliminar = (usuario) => {
    setModalEliminar({
      abierto: true,
      usuarioId: usuario.id,
      email: usuario.email
    });
  };

  const ejecutarEliminar = async () => {
    const { usuarioId } = modalEliminar;
    setModalEliminar({ abierto: false, usuarioId: null, email: "" });

    try {
      const res = await fetchPrivado(`/plataforma/usuarios/${usuarioId}`, {
        method: "DELETE"
      });
      
      if (res.ok || res.status === 204) {
        setUsuarios(usuarios.filter(u => u.id !== usuarioId));
        mostrarNotificacion("Usuario eliminado de la plataforma.");
      } else {
        throw new Error("Error en el servidor");
      }
    } catch (error) {
      mostrarNotificacion("No se pudo eliminar la cuenta.", "error");
      cargarDatos();
    }
  };

  const abrirModalPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevaClave("");
    setModalPassword(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchPrivado(`/plataforma/usuarios/${usuarioSeleccionado.id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ nuevaPassword: nuevaClave })
      });
      if (res.ok) {
        mostrarNotificacion("Contraseña actualizada exitosamente.");
        setModalPassword(false);
      } else {
        mostrarNotificacion("Error al cambiar la contraseña.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión.", "error");
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = u.email.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideEstado = verSoloSuspendidos ? u.activo === false : true;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto animate-fade-in relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* NOTIFICACIÓN FLOTANTE */}
        {notificacion.visible && (
          <div className="fixed bottom-6 right-6 z-100 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm animate-fade-in flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between transition-all transform hover:translate-y-0.5">
            <div className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 text-[10px] font-black ${notificacion.tipo === 'exito' ? 'text-emerald-400 border-emerald-400' : 'text-red-400 border-red-400'}`}>
                {notificacion.tipo === 'exito' ? '✓' : '!'}
              </span>
              {notificacion.mensaje}
            </div>
            <button onClick={cerrarNotificacion} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl p-1 leading-none font-bold">×</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Cuentas Registradas</h1>
            <p className="text-gray-500 font-medium mt-1">Administrá los dueños y empleados de la plataforma.</p>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
            
            <button 
              onClick={() => setVerSoloSuspendidos(!verSoloSuspendidos)}
              className={`order-1 flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${verSoloSuspendidos ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-500'}`}
            >
              {verSoloSuspendidos ? 'Viendo: Suspendidos' : 'Filtrar Suspendidos'}
            </button>

            <div className="order-3 md:order-2 relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">⌕</span>
            </div>
            
            <button 
              onClick={abrirModalCrear}
              className="order-2 md:order-3 flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer hover:brightness-105"
              style={{ backgroundColor: COLOR_PRIMARIO }}
            >
              + Nueva Cuenta
            </button>
            
          </div>
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 py-10 font-bold">Cargando cuentas...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px]">Usuario</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px]">Email</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px]">Rol</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-[11px] text-right">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.activo ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800">{user.nombreCompleto || "Sin Nombre"}</p>
                          {user.activo === false && (
                            <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-red-200">
                              Suspendido
                            </span>
                          )}
                        </div>
                        
                        <div className="text-[10px] text-orange-500 font-bold uppercase flex flex-wrap gap-1 mt-1 mb-1">
                          {user.locales && user.locales.length > 0 ? (
                            user.locales.map(l => <span key={l.id}>• {l.nombre} </span>)
                          ) : (
                            <span className="text-red-400 italic">Sin locales asignados</span>
                          )}
                        </div>

                        <p className="font-mono text-[10px] text-gray-400 mt-0.5">ID: #{user.id}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">{user.email}</td>
                      <td className="py-4 px-6">
                        {user.rol === 'SUPER_ADMIN' ? (
                          <span className="bg-gray-800 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">SUPER ADMIN</span>
                        ) : (
                          <select 
                            value={user.rol}
                            onChange={(e) => confirmarCambioRol(user, e.target.value)}
                            className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest outline-none cursor-pointer border border-transparent hover:border-gray-300 ${user.rol === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="EMPLEADO">EMPLEADO</option>
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right flex justify-end gap-2">
                        {user.rol !== 'SUPER_ADMIN' && (
                          <>
                            <button 
                              onClick={() => confirmarEliminar(user)}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                            >
                              Eliminar
                            </button>
                            <button 
                              onClick={() => abrirModalPassword(user)}
                              className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                            >
                              Clave
                            </button>
                            <button 
                              onClick={() => abrirModalVincular(user)}
                              className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-orange-100"
                            >
                              + Local
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-500">No se encontraron cuentas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALES DE FORMULARIOS */}
        
        {modalPassword && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h2 className="text-lg font-black text-gray-900 mb-1">Nueva Contraseña</h2>
              <p className="text-xs text-gray-500 mb-4">Para: <b className="text-gray-800">{usuarioSeleccionado?.email}</b></p>
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <input type="text" required value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400" placeholder="Escribí la nueva clave..." />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModalPassword(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer hover:brightness-105" style={{ backgroundColor: COLOR_PRIMARIO }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalVincular && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h2 className="text-lg font-black text-gray-900 mb-1">Asignar Local</h2>
              <p className="text-xs text-gray-500 mb-4">Cuenta: <b className="text-gray-800">{usuarioSeleccionado?.email}</b></p>
              
              <form onSubmit={handleVincular} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Seleccionar Local</label>
                  <select 
                    required 
                    value={localSeleccionadoId} 
                    onChange={(e) => setLocalSeleccionadoId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="">-- Elegí un local --</option>
                    {locales.map(l => (
                      <option key={l.id} value={l.id}>{l.nombre} (/{l.slug})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setModalVincular(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-transform active:scale-95 hover:brightness-105" style={{ backgroundColor: COLOR_PRIMARIO }}>Vincular</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalCrear && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-100 pb-3">Registrar Nueva Cuenta</h2>
              
              <form onSubmit={handleCrearUsuario} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre Completo *</label>
                    <input 
                      type="text" 
                      required 
                      value={nuevoUsuario.nombreCompleto} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombreCompleto: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Documento / CUIT</label>
                    <input 
                      type="text" 
                      value={nuevoUsuario.documento} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, documento: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="Ej: 20334445551"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Correo Electrónico *</label>
                    <input 
                      type="email" 
                      required 
                      value={nuevoUsuario.email} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contraseña Inicial *</label>
                    <input 
                      type="text" 
                      required 
                      value={nuevoUsuario.password} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="Clave..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rol *</label>
                    <select 
                      required 
                      value={nuevoUsuario.rol} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none font-bold text-gray-700 focus:border-orange-400"
                    >
                      <option value="ADMIN">Dueño (Admin)</option>
                      <option value="EMPLEADO">Empleado</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Local Inicial *</label>
                    <select 
                      required 
                      value={nuevoUsuario.localId} 
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, localId: e.target.value})}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-orange-400"
                    >
                      <option value="">-- Elegir --</option>
                      {locales.map(l => (
                        <option key={l.id} value={l.id}>{l.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModalCrear(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-transform active:scale-95 hover:brightness-105" style={{ backgroundColor: COLOR_PRIMARIO }}>Crear Cuenta</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRMACIÓN CAMBIO ROL */}
        {modalConfirmacion.abierto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
              
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-inner border border-orange-100">
                !
              </div>
              
              <h2 className="text-lg font-black text-gray-900 mb-2">Cambiar Rol</h2>
              <p className="text-sm text-gray-500 mb-6">
                ¿Confirmás cambiar el rol de <br/>
                <b className="text-gray-800 font-bold">{modalConfirmacion.email}</b> a <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mt-1 ${modalConfirmacion.nuevoRol === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{modalConfirmacion.nuevoRol}</span>?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setModalConfirmacion({ abierto: false, usuarioId: null, email: "", rolAnterior: "", nuevoRol: "" })}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={ejecutarCambioRol}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-transform active:scale-95 hover:brightness-105"
                  style={{ backgroundColor: COLOR_PRIMARIO }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRMAR ELIMINAR */}
        {modalEliminar.abierto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
              
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-inner border border-red-100">
                !
              </div>
              
              <h2 className="text-lg font-black text-gray-900 mb-2">Eliminar Cuenta</h2>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro que querés eliminar definitivamente a <br/>
                <b className="text-gray-800 font-bold">{modalEliminar.email}</b>? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setModalEliminar({ abierto: false, usuarioId: null, email: "" })}
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

      </div>
    </SuperAdminLayout>
  );
}

export default SuperAdminUsuariosPage;