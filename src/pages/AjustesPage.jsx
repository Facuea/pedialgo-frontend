import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchPrivado } from "../services/apiConfig";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";
const CARRITO_BLANCO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753121/carrito-blanco_lydvlw.png";
const CARRITO_NEGRO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753114/carrito-negro_kkrw7t.png";

function AjustesPage() {
  const COLOR_PRIMARIO = "#F1A139";
  
  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;
  const slug = localActivo.slug;

  const [tabActiva, setTabActiva] = useState("APARIENCIA");
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // --- SECCIÓN: CONFIGURACIÓN LOCAL (IMPRESORA) ---
  const [anchoTicket, setAnchoTicket] = useState(localStorage.getItem("anchoTicketImpresion") || "80mm");

  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "exito" });
  const [timeoutId, setTimeoutId] = useState(null);

  // ESTADOS DE CARGA
  const [guardandoImagenes, setGuardandoImagenes] = useState(false);
  const [guardandoTema, setGuardandoTema] = useState(false);
  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false); 
  const [procesandoPago, setProcesandoPago] = useState(false);

  // ESTADO DE ERRORES PARA CONTACTO E INFO
  const [erroresInfo, setErroresInfo] = useState({});

  // ESTADOS DE IMÁGENES
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState("");
  const [archivoPortada, setArchivoPortada] = useState(null);
  const [previewPortada, setPreviewPortada] = useState("");

  // ESTADOS DE INFORMACIÓN
  const [infoLocal, setInfoLocal] = useState({ 
    nombre: "", 
    descripcion: "", 
    fechaVencimiento: "", 
    estadoSuscripcion: "" 
  });
  
  const [tema, setTema] = useState({
    colorPrimario: "#E63946", colorSecundario: "#F1A139", colorFondo: "#FFFFFF",
    colorTexto: "#1A1A1A", fuente: "Poppins", logoUrl: "", imagenPortada: "",
    colorCarrito: "BLANCO" 
  });

  const [redes, setRedes] = useState({ facebookUrl: "", instagramUrl: "", direccionMapaEmbed: "", whatsapp: "+54 9 " });

  // ESTADOS PARA DETECTAR CAMBIOS
  const [temaOriginal, setTemaOriginal] = useState({});
  const [infoLocalOriginal, setInfoLocalOriginal] = useState({});
  const [redesOriginal, setRedesOriginal] = useState({});

  const [usuarios, setUsuarios] = useState([]);
  const [menuUsuarioAbiertoId, setMenuUsuarioAbiertoId] = useState(null);
  
  const [modalInfoUsuario, setModalInfoUsuario] = useState({ abierto: false, usuario: null });
  const [modalPassword, setModalPassword] = useState({ abierto: false, usuarioId: null, email: "", passwordActual: "", passwordNueva: "", error: "" }); 
  const [modalConfirmacionRol, setModalConfirmacionRol] = useState({
    abierto: false, usuarioId: null, email: "", nuevoRol: "", rolAnterior: ""
  });

  useEffect(() => {
    if (slug && localId) {
      cargarDatosGenerales();
      cargarEquipo();
    }
  }, [slug, localId]);

  const cargarDatosGenerales = async () => {
    setCargando(true);
    try {
      const resTema = await fetchPrivado(`/admin/locales/${slug}/tema`);
      if (resTema.ok) {
        const dataTema = await resTema.json();
        const fullTema = { ...dataTema, colorCarrito: dataTema.colorCarrito || "BLANCO" };
        setTema(fullTema);
        setTemaOriginal(fullTema);
      }
      
      const resLocal = await fetchPrivado(`/admin/locales/${localId}`);
      if (resLocal.ok) {
        const dataLocal = await resLocal.json();
        const infoData = { 
          nombre: dataLocal.nombre || "", 
          descripcion: dataLocal.descripcion || "",
          fechaVencimiento: dataLocal.fechaVencimiento,
          estadoSuscripcion: dataLocal.estadoSuscripcion
        };
        const redesData = {
          facebookUrl: dataLocal.facebookUrl || "",
          instagramUrl: dataLocal.instagramUrl || "",
          direccionMapaEmbed: dataLocal.direccionMapaEmbed || "",
          whatsapp: dataLocal.whatsapp ? dataLocal.whatsapp : "+54 9 " 
        };
        setInfoLocal(infoData);
        setInfoLocalOriginal({ nombre: dataLocal.nombre || "", descripcion: dataLocal.descripcion || "" });
        setRedes(redesData);
        setRedesOriginal(redesData);
      }
    } catch (error) {
      console.error("Error al cargar ajustes:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarEquipo = async () => {
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios`);
      if (res.ok) setUsuarios(await res.json());
    } catch (error) {
      console.error("Error al cargar equipo:", error);
    }
  };

  // --- LÓGICA DE SUSCRIPCIÓN ---
  const handlePagoOnline = async () => {
    setProcesandoPago(true);
    try {
      const res = await fetchPrivado(`/admin/suscripcion/${localId}/pago-online`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          mostrarNotificacion("No se pudo generar el link de pago.", "error");
        }
      } else {
        mostrarNotificacion("Error al conectar con Mercado Pago.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión con el servidor.", "error");
    } finally {
      setProcesandoPago(false);
    }
  };

  const handlePagoManual = async () => {
    try {
      const res = await fetchPrivado(`/admin/suscripcion/${localId}/pago-manual`);
      if (res.ok) {
        const data = await res.json();
        alert("IMPORTANTE: Para activar tu cuenta, transferí a:\n\nALIAS: pedialgo.oficial.mp\nCBU: 00000031000...");
        const urlWa = `https://wa.me/5493585148782?text=${encodeURIComponent(data.mensaje)}`;
        window.open(urlWa, '_blank');
      }
    } catch (error) {
      mostrarNotificacion("Error al procesar el pago manual.", "error");
    }
  };

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

  const handleSeleccionarLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSeleccionarPortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoPortada(file);
      setPreviewPortada(URL.createObjectURL(file));
    }
  };

  const handleCambioTicket = (e) => {
    const nuevoAncho = e.target.value;
    setAnchoTicket(nuevoAncho);
    localStorage.setItem("anchoTicketImpresion", nuevoAncho);
    mostrarNotificacion(`Ancho de ticket actualizado a ${nuevoAncho}.`);
  };

  const handleGuardarImagenes = async () => {
    if (!archivoLogo && !archivoPortada) {
      mostrarNotificacion("No seleccionaste ninguna imagen nueva.", "error");
      return;
    }
    setGuardandoImagenes(true);
    try {
      if (archivoLogo) {
        const formData = new FormData();
        formData.append("file", archivoLogo);
        const res = await fetchPrivado(`/admin/imagenes/local/${slug}/logo`, { 
          method: "PATCH", body: formData
        });
        if (res.ok) {
          const url = await res.text();
          setTema(prev => ({ ...prev, logoUrl: url }));
          setTemaOriginal(prev => ({ ...prev, logoUrl: url }));
          setArchivoLogo(null);
        }
      }
      if (archivoPortada) {
        const formData = new FormData();
        formData.append("file", archivoPortada);
        const res = await fetchPrivado(`/admin/imagenes/local/${slug}/portada`, { 
          method: "PATCH", body: formData
        });
        if (res.ok) {
          const url = await res.text();
          setTema(prev => ({ ...prev, imagenPortada: url }));
          setTemaOriginal(prev => ({ ...prev, imagenPortada: url }));
          setArchivoPortada(null);
        }
      }
      mostrarNotificacion("Imágenes actualizadas con éxito.");
    } catch (error) {
      mostrarNotificacion("Error al subir las imágenes.", "error");
    } finally {
      setGuardandoImagenes(false);
    }
  };

  const handleGuardarTema = async () => {
    setGuardandoTema(true);
    try {
      const res = await fetchPrivado(`/admin/locales/${slug}/tema`, {
        method: "PATCH", body: JSON.stringify(tema)
      });
      if (res.ok) {
        setTemaOriginal(tema);
        mostrarNotificacion("Apariencia guardada correctamente.");
      } else {
        mostrarNotificacion("Error al guardar el tema.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión.", "error");
    } finally {
      setGuardandoTema(false);
    }
  };

  const handleRestaurarTema = () => {
    setTema({
      ...tema,
      colorPrimario: "#E63946", colorSecundario: "#F1A139", colorFondo: "#FFFFFF",
      colorTexto: "#1A1A1A", fuente: "Poppins", colorCarrito: "BLANCO"
    });
  };

  const handleGuardarRedesEInfo = async () => {
    setGuardandoInfo(true);
    try {
      await fetchPrivado(`/admin/locales/${slug}/redes`, {
        method: "PATCH", body: JSON.stringify({ facebookUrl: redes.facebookUrl, instagramUrl: redes.instagramUrl })
      });
      if (redes.direccionMapaEmbed !== undefined) {
        await fetchPrivado(`/admin/locales/${slug}/mapa`, {
          method: "PATCH", body: JSON.stringify({ direccionMapaEmbed: redes.direccionMapaEmbed })
        });
      }
      await fetchPrivado(`/admin/locales/${localId}/descripcion`, {
          method: "PATCH", body: JSON.stringify({ descripcion: infoLocal.descripcion })
      });
      await fetchPrivado(`/admin/locales/${localId}/nombre`, {
          method: "PATCH", body: JSON.stringify({ nombre: infoLocal.nombre })
      });
      await fetchPrivado(`/admin/locales/${localId}/whatsapp`, {
          method: "PATCH", body: JSON.stringify({ whatsapp: redes.whatsapp })
      });
      setInfoLocalOriginal(infoLocal);
      setRedesOriginal(redes);
      mostrarNotificacion("Datos actualizados correctamente.");
    } catch (error) {
      mostrarNotificacion("Error al guardar la información.", "error");
    } finally {
      setGuardandoInfo(false);
    }
  };

  const handleCambiarEstadoUsuario = async (userId, estadoActual) => {
    setMenuUsuarioAbiertoId(null);
    const nuevoEstado = !estadoActual;
    setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: nuevoEstado } : u));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${userId}/estado?activo=${nuevoEstado}`, { method: "PATCH" });
      if(!res.ok) {
        setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: estadoActual } : u));
        mostrarNotificacion("Error al cambiar el estado.", "error");
      }
    } catch (error) {
      setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: estadoActual } : u));
    }
  };

  const ejecutarCambioRol = async () => {
    const { usuarioId, nuevoRol, rolAnterior } = modalConfirmacionRol;
    setModalConfirmacionRol({ ...modalConfirmacionRol, abierto: false });
    setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: nuevoRol } : u));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${usuarioId}/rol`, {
        method: "PATCH", body: JSON.stringify({ rol: nuevoRol })
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: rolAnterior } : u));
      mostrarNotificacion("Error al cambiar el rol.", "error");
    }
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    setGuardandoPassword(true);
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${modalPassword.usuarioId}/password`, {
        method: "PATCH",
        body: JSON.stringify({ passwordActual: modalPassword.passwordActual, passwordNueva: modalPassword.passwordNueva })
      });
      if (res.ok) {
        mostrarNotificacion("Contraseña actualizada.");
        setModalPassword({ ...modalPassword, abierto: false });
      } else {
        setModalPassword(prev => ({ ...prev, error: "Contraseña actual incorrecta." }));
      }
    } catch (error) { 
      mostrarNotificacion("Error de conexión.", "error"); 
    } finally {
      setGuardandoPassword(false);
    }
  };

  const hayCambiosImagenes = !!archivoLogo || !!archivoPortada;
  const hayCambiosTema = JSON.stringify(tema) !== JSON.stringify(temaOriginal);
  const hayCambiosInfo = JSON.stringify(infoLocal.nombre) !== JSON.stringify(infoLocalOriginal.nombre) || JSON.stringify(redes) !== JSON.stringify(redesOriginal);

  const usuariosFiltrados = usuarios.filter(u => 
    u.email.toLowerCase().includes(busqueda.toLowerCase()) || 
    (u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <AdminLayout>
      {menuUsuarioAbiertoId && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMenuUsuarioAbiertoId(null)}></div>
      )}

      <div className="max-w-5xl mx-auto font-sans pb-12 animate-fade-in relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {notificacion.visible && (
          <div className="fixed bottom-6 right-6 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm z-9999 flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between">
            <span>{notificacion.mensaje}</span>
            <button onClick={cerrarNotificacion} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl font-bold">x</button>
          </div>
        )}

        <div className="mb-8 text-left">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ajustes del Local</h1>
          <p className="text-gray-500 text-sm mt-1">Configurá tu marca, equipo y suscripción.</p>
        </div>

        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          {["APARIENCIA", "CONTACTO", "EMPLEADOS", "IMPRESORA", "SUSCRIPCION"].map((t) => (
            <button key={t} onClick={() => setTabActiva(t)} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === "SUSCRIPCION" ? "Suscripción" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* --- PESTAÑA SUSCRIPCIÓN --- */}
        {tabActiva === "SUSCRIPCION" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Estado de tu Cuenta</h2>
                  <p className="text-sm text-gray-500">Servicio actual: <span className="font-bold text-orange-600 uppercase">{infoLocal.estadoSuscripcion || "PRUEBA"}</span></p>
                </div>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vence el día</p>
                  <p className="text-lg font-bold text-gray-800">
                    {infoLocal.fechaVencimiento ? new Date(infoLocal.fechaVencimiento).toLocaleDateString('es-AR') : "Pendiente"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 mb-1">Pago Online Instantáneo</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">Pagá con Tarjeta de Crédito, Débito o dinero en Mercado Pago. Activación al instante.</p>
                  <button 
                    onClick={handlePagoOnline}
                    disabled={procesandoPago}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {procesandoPago ? "Procesando..." : "Pagar con Mercado Pago"}
                  </button>
                </div>

                <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 mb-1">Transferencia o Efectivo</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">Transferí a nuestro CBU/Alias y envianos el comprobante por WhatsApp para activación manual.</p>
                  <button 
                    onClick={handlePagoManual}
                    className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Notificar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "APARIENCIA" && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Imágenes del Menú</h2>
                  <p className="text-xs text-gray-500 mt-1">Máximo 5MB por imagen.</p>
                </div>
                <button onClick={handleGuardarImagenes} disabled={guardandoImagenes || !hayCambiosImagenes} className={`px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all ${(!hayCambiosImagenes) ? 'opacity-50' : 'hover:bg-orange-600'}`}>
                  {guardandoImagenes ? "Guardando..." : "Guardar Imágenes"}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Logo del Local</p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border border-gray-200 rounded-xl overflow-hidden p-1">
                      <img src={previewLogo || tema.logoUrl || IMAGEN_PLACEHOLDER} className="w-full h-full object-contain" />
                    </div>
                    <input type="file" id="logoUpload" hidden accept="image/*" onChange={handleSeleccionarLogo} />
                    <label htmlFor="logoUpload" className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer border border-gray-300">Seleccionar</label>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Portada (Banner)</p>
                  <div className="w-full h-24 border border-gray-200 rounded-xl overflow-hidden mb-2">
                    <img src={previewPortada || tema.imagenPortada || IMAGEN_PLACEHOLDER} className="w-full h-full object-cover" />
                  </div>
                  <input type="file" id="portadaUpload" hidden accept="image/*" onChange={handleSeleccionarPortada} />
                  <label htmlFor="portadaUpload" className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer border border-gray-300">Cambiar Portada</label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-gray-800">Colores y Tipografía</h2>
                <div className="flex gap-3">
                  <button onClick={handleRestaurarTema} className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 text-xs font-bold rounded-lg cursor-pointer">Restaurar</button>
                  <button onClick={handleGuardarTema} disabled={guardandoTema || !hayCambiosTema} className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50">Guardar</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Primario</label>
                  <input type="text" value={tema.colorPrimario} onChange={(e) => setTema({...tema, colorPrimario: e.target.value.toUpperCase()})} className="w-full p-2 border border-gray-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Secundario</label>
                  <input type="text" value={tema.colorSecundario} onChange={(e) => setTema({...tema, colorSecundario: e.target.value.toUpperCase()})} className="w-full p-2 border border-gray-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Fondo</label>
                  <input type="text" value={tema.colorFondo} onChange={(e) => setTema({...tema, colorFondo: e.target.value.toUpperCase()})} className="w-full p-2 border border-gray-200 rounded text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Texto</label>
                  <input type="text" value={tema.colorTexto} onChange={(e) => setTema({...tema, colorTexto: e.target.value.toUpperCase()})} className="w-full p-2 border border-gray-200 rounded text-xs font-mono" />
                </div>
              </div>
              <div className="mt-8 flex flex-col md:flex-row gap-8">
                 <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Fuente del Menú</label>
                    <input type="text" value={tema.fuente} onChange={(e) => setTema({...tema, fuente: e.target.value})} className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" />
                 </div>
                 <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-3">Icono Carrito</label>
                    <div className="flex gap-4">
                       <button onClick={() => setTema({...tema, colorCarrito: "BLANCO"})} className={`flex-1 py-2 border-2 rounded-xl transition-all ${tema.colorCarrito === "BLANCO" ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>Blanco</button>
                       <button onClick={() => setTema({...tema, colorCarrito: "NEGRO"})} className={`flex-1 py-2 border-2 rounded-xl transition-all ${tema.colorCarrito === "NEGRO" ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>Negro</button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "CONTACTO" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in text-left">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Información de Contacto</h2>
              <button onClick={handleGuardarRedesEInfo} disabled={guardandoInfo || !hayCambiosInfo} className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50">Guardar Cambios</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Nombre del Local</label>
                <input type="text" value={infoLocal.nombre} onChange={(e) => setInfoLocal({...infoLocal, nombre: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">WhatsApp de Pedidos</label>
                <input type="text" value={redes.whatsapp} onChange={(e) => setRedes({...redes, whatsapp: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:border-orange-400" />
              </div>
            </div>
            <div className="mb-6">
               <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Descripción del Local</label>
               <textarea rows="3" value={infoLocal.descripcion} onChange={(e) => setInfoLocal({...infoLocal, descripcion: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 text-sm resize-none"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Instagram URL</label>
                  <input type="text" value={redes.instagramUrl} onChange={(e) => setRedes({...redes, instagramUrl: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 text-sm" />
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Facebook URL</label>
                  <input type="text" value={redes.facebookUrl} onChange={(e) => setRedes({...redes, facebookUrl: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 text-sm" />
               </div>
            </div>
          </div>
        )}

        {tabActiva === "EMPLEADOS" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in text-left">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Gestión de Equipo</h2>
              <input type="text" placeholder="Buscar empleado..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full md:w-64 p-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-[10px] font-bold">
                    <th className="px-6 py-4">Empleado</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{u.nombreCompleto}<br/><span className="text-xs text-gray-400 font-normal">{u.email}</span></td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${u.rol === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{u.rol}</span></td>
                      <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${u.activo ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setMenuUsuarioAbiertoId(menuUsuarioAbiertoId === u.id ? null : u.id)} className="w-8 h-8 text-gray-400 font-bold hover:bg-gray-100 rounded-lg">⋮</button>
                        {menuUsuarioAbiertoId === u.id && (
                          <div className="absolute right-12 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                             <button onClick={() => { setMenuUsuarioAbiertoId(null); setModalInfoUsuario({ abierto: true, usuario: u }); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold">Ver Información</button>
                             <button onClick={() => setModalConfirmacionRol({ abierto: true, usuarioId: u.id, email: u.email, nuevoRol: u.rol === 'ADMIN' ? 'EMPLEADO' : 'ADMIN', rolAnterior: u.rol })} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs">Cambiar Rol</button>
                             <button onClick={() => setModalPassword({ abierto: true, usuarioId: u.id, email: u.email, passwordActual: "", passwordNueva: "", error: "" })} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 text-xs">Cambiar Clave</button>
                             <button onClick={() => handleCambiarEstadoUsuario(u.id, u.activo)} className={`w-full text-left px-4 py-2 text-xs ${u.activo ? 'text-red-600' : 'text-green-600'}`}>{u.activo ? 'Suspender' : 'Reactivar'}</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabActiva === "IMPRESORA" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in text-left">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Configuración de Impresión</h2>
            <div className="max-w-xs">
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Ancho del Ticket</label>
              <select value={anchoTicket} onChange={handleCambioTicket} className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white outline-none focus:border-orange-400">
                <option value="80mm">Normal (80mm)</option>
                <option value="58mm">Chico (58mm)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      {modalInfoUsuario.abierto && modalInfoUsuario.usuario && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm z-9999">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-left">
            <h2 className="text-lg font-black text-gray-900 mb-4">Información del Empleado</h2>
            <div className="space-y-4">
               <div><p className="text-[10px] font-bold text-gray-400 uppercase">Nombre</p><p className="font-bold">{modalInfoUsuario.usuario.nombreCompleto}</p></div>
               <div><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="font-medium text-sm">{modalInfoUsuario.usuario.email}</p></div>
            </div>
            <button onClick={() => setModalInfoUsuario({ abierto: false, usuario: null })} className="w-full mt-6 py-2 bg-gray-100 font-bold rounded-lg">Cerrar</button>
          </div>
        </div>
      )}

      {modalPassword.abierto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm z-9999">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-left">
            <h2 className="text-lg font-black text-gray-900 mb-4">Cambiar Contraseña</h2>
            <form onSubmit={handleGuardarPassword}>
               <input type="password" required value={modalPassword.passwordActual} onChange={(e) => setModalPassword({...modalPassword, passwordActual: e.target.value, error: ""})} className="w-full p-2.5 border rounded-lg text-sm mb-4" placeholder="Contraseña Actual" />
               {modalPassword.error && <p className="text-red-500 text-[10px] font-bold mb-2">{modalPassword.error}</p>}
               <input type="password" required value={modalPassword.passwordNueva} onChange={(e) => setModalPassword({...modalPassword, passwordNueva: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm mb-4" placeholder="Nueva Contraseña" />
               <div className="flex gap-2">
                  <button type="button" onClick={() => setModalPassword({ ...modalPassword, abierto: false })} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg">Cancelar</button>
                  <button type="submit" disabled={guardandoPassword} className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-lg">{guardandoPassword ? "Guardando..." : "Guardar"}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {modalConfirmacionRol.abierto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm z-9999">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-black text-gray-900 mb-2">Confirmar Cambio</h2>
            <p className="text-sm text-gray-500 mb-6">¿Cambiar el rol de {modalConfirmacionRol.email} a {modalConfirmacionRol.nuevoRol}?</p>
            <div className="flex gap-3">
               <button onClick={() => setModalConfirmacionRol({ ...modalConfirmacionRol, abierto: false })} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg">No</button>
               <button onClick={ejecutarCambioRol} className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-lg">Si, Confirmar</button>
            </div>
          </div>
        </div>
      )}
      
    </AdminLayout>
  );
}

export default AjustesPage;