import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { fetchPrivado } from "../services/apiConfig";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";
const CARRITO_BLANCO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753121/carrito-blanco_lydvlw.png";
const CARRITO_NEGRO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753114/carrito-negro_kkrw7t.png";
const API_URL = import.meta.env.VITE_API_URL;

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

  // --- ESTADOS PARA DETECTAR CAMBIOS ---
  const [temaOriginal, setTemaOriginal] = useState({});
  const [infoLocalOriginal, setInfoLocalOriginal] = useState({});
  const [redesOriginal, setRedesOriginal] = useState({});

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

  const [infoLocal, setInfoLocal] = useState({ nombre: "", descripcion: "", fechaVencimiento: "", estadoSuscripcion: "" });
  
  const [tema, setTema] = useState({
    colorPrimario: "#E63946", colorSecundario: "#F1A139", colorFondo: "#FFFFFF",
    colorTexto: "#1A1A1A", fuente: "Poppins", logoUrl: "", imagenPortada: "",
    colorCarrito: "BLANCO" 
  });

  const [redes, setRedes] = useState({ facebookUrl: "", instagramUrl: "", direccionMapaEmbed: "", whatsapp: "+54 9 " });

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

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

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
          mostrarNotificacion("Error: No se recibió la URL de pago", "error");
        }
      } else {
        mostrarNotificacion("Error al conectar con Mercado Pago.", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión.", "error");
    } finally {
      setProcesandoPago(false);
    }
  };

  const handlePagoManual = () => {
    const mensaje = `Hola! Quiero pagar el mes de suscripción para mi local: ${infoLocal.nombre || "mi local"}.`;
    
    const urlWa = `https://wa.me/5493585148782?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWa, '_blank');
  };

  // --- SECCIÓN: HANDLER PARA CAMBIAR TAMAÑO DE TICKET ---
  const handleCambioTicket = (e) => {
    const nuevoAncho = e.target.value;
    setAnchoTicket(nuevoAncho);
    localStorage.setItem("anchoTicketImpresion", nuevoAncho);
    mostrarNotificacion(`Ancho de ticket actualizado a ${nuevoAncho} en este dispositivo.`);
  };

  const handleGuardarImagenes = async () => {
    if (!archivoLogo && !archivoPortada) {
      mostrarNotificacion("No seleccionaste ninguna imagen nueva.", "error");
      return;
    }

    setGuardandoImagenes(true);
    try {
      await delay(2000);

      if (archivoLogo) {
        const formData = new FormData();
        formData.append("file", archivoLogo);
        const res = await fetchPrivado(`/admin/imagenes/local/${slug}/logo`, { 
          method: "PATCH", body: formData, headers: { "Content-Type": undefined }
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
          method: "PATCH", body: formData, headers: { "Content-Type": undefined }
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
    if (!tema.colorPrimario || !tema.colorSecundario || !tema.colorFondo || !tema.colorTexto || !tema.fuente) {
      mostrarNotificacion("Completá todos los colores y la fuente.", "error");
      return;
    }
    setGuardandoTema(true);
    try {
      await delay(2000); 
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
      colorPrimario: "#E63946", 
      colorSecundario: "#F1A139", 
      colorFondo: "#FFFFFF",
      colorTexto: "#1A1A1A", 
      fuente: "Poppins", 
      colorCarrito: "BLANCO"
    });
  };

  const handleGuardarRedesEInfo = async () => {
    const nuevosErrores = {};

    if (!infoLocal.nombre.trim()) nuevosErrores.nombre = "El nombre del local es obligatorio.";
    
    if (redes.whatsapp === "+54 9 " || redes.whatsapp.length < 13) {
      nuevosErrores.whatsapp = "Ingresá un WhatsApp válido.";
    }

    if (redes.instagramUrl && !redes.instagramUrl.startsWith("http")) {
      nuevosErrores.instagramUrl = "La URL de Instagram debe empezar con http:// o https://";
    }

    if (redes.facebookUrl && !redes.facebookUrl.startsWith("http")) {
      nuevosErrores.facebookUrl = "La URL de Facebook debe empezar con http:// o https://";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresInfo(nuevosErrores);
      mostrarNotificacion("Hay errores en el formulario.", "error");
      return;
    }

    setGuardandoInfo(true);
    try {
      await delay(2000); 
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
      
      const localActivoActualizado = { ...localActivo, nombre: infoLocal.nombre };
      localStorage.setItem("localActivo", JSON.stringify(localActivoActualizado));

      mostrarNotificacion("Datos actualizados correctamente.");
    } catch (error) {
      mostrarNotificacion("Error al guardar la información.", "error");
    } finally {
      setGuardandoInfo(false);
    }
  };

  const hayCambiosImagenes = !!archivoLogo || !!archivoPortada;
  const hayCambiosTema = JSON.stringify(tema) !== JSON.stringify(temaOriginal);
  const hayCambiosInfo = JSON.stringify(infoLocal.nombre) !== JSON.stringify(infoLocalOriginal.nombre) || JSON.stringify(infoLocal.descripcion) !== JSON.stringify(infoLocalOriginal.descripcion) || JSON.stringify(redes) !== JSON.stringify(redesOriginal);

  const handleCambiarEstadoUsuario = async (userId, estadoActual) => {
    setMenuUsuarioAbiertoId(null);
    const nuevoEstado = !estadoActual;
    setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: nuevoEstado } : u));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${userId}/estado?activo=${nuevoEstado}`, { method: "PATCH" });
      if(res.ok) {
        mostrarNotificacion(nuevoEstado ? "Usuario reactivado." : "Acceso suspendido correctamente.");
      } else {
        setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: estadoActual } : u));
        mostrarNotificacion("Error al cambiar el estado en el servidor.", "error");
      }
    } catch (error) {
      setUsuarios(usuarios.map(u => u.id === userId ? { ...u, activo: estadoActual } : u));
      mostrarNotificacion("Error de conexión.", "error");
    }
  };

  const confirmarCambioRol = (usuario) => {
    setMenuUsuarioAbiertoId(null);
    const nuevoRol = usuario.rol === "ADMIN" ? "EMPLEADO" : "ADMIN";
    setModalConfirmacionRol({
      abierto: true, usuarioId: usuario.id, email: usuario.email, nuevoRol: nuevoRol, rolAnterior: usuario.rol
    });
  };

  const ejecutarCambioRol = async () => {
    const { usuarioId, nuevoRol, rolAnterior } = modalConfirmacionRol;
    setModalConfirmacionRol({ abierto: false, usuarioId: null, email: "", nuevoRol: "", rolAnterior: "" });
    setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: nuevoRol } : u));
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${usuarioId}/rol`, {
        method: "PATCH", body: JSON.stringify({ rol: nuevoRol })
      });
      if (res.ok) mostrarNotificacion("Rol de usuario actualizado.");
      else throw new Error();
    } catch (error) {
      setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, rol: rolAnterior } : u));
      mostrarNotificacion("Error al cambiar el rol.", "error");
    }
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    setModalPassword(prev => ({ ...prev, error: "" })); 
    setGuardandoPassword(true);
    try {
      await delay(2000); 
      const res = await fetchPrivado(`/admin/locales/${localId}/usuarios/${modalPassword.usuarioId}/password`, {
        method: "PATCH",
        body: JSON.stringify({ passwordActual: modalPassword.passwordActual, passwordNueva: modalPassword.passwordNueva })
      });
      if (res.ok) {
        const usuarioLogueadoId = JSON.parse(localStorage.getItem("usuario"))?.id;

        if (modalPassword.usuarioId === usuarioLogueadoId) {
            mostrarNotificacion("Contraseña actualizada. Cerrando sesión por seguridad...");
            setTimeout(() => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("localActivo");
                window.location.href = "/login";
            }, 2500);
        } else {
            mostrarNotificacion("Contraseña del empleado actualizada correctamente.");
            setModalPassword({ abierto: false, usuarioId: null, email: "", passwordActual: "", passwordNueva: "", error: "" });
        }
      } else {
        setModalPassword(prev => ({ ...prev, error: "La contraseña actual es incorrecta." })); 
      }
    } catch (error) { 
        mostrarNotificacion("Error de conexión al cambiar la contraseña.", "error"); 
    } finally {
        setGuardandoPassword(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.email.toLowerCase().includes(busqueda.toLowerCase()) || 
    (u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.documento && u.documento.includes(busqueda))
  );

  return (
    <AdminLayout>
      {menuUsuarioAbiertoId && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMenuUsuarioAbiertoId(null)}></div>
      )}

      <div className="max-w-5xl mx-auto font-sans pb-12 animate-fade-in relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {notificacion.visible && (
          <div className="fixed bottom-6 right-6 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm animate-fade-in flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between transition-all transform hover:translate-y-0.5" style={{ zIndex: 9999 }}>
            <span>{notificacion.mensaje}</span>
            <button onClick={cerrarNotificacion} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl p-1 leading-none font-bold">x</button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ajustes del Local</h1>
          <p className="text-gray-500 text-sm mt-1">Personalizá tu menú digital y administrá los accesos de tu equipo.</p>
        </div>

        {/* --- SECCIÓN: PESTAÑAS DE NAVEGACIÓN --- */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          <button onClick={() => setTabActiva("APARIENCIA")} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === "APARIENCIA" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Apariencia y Colores
          </button>
          <button onClick={() => setTabActiva("CONTACTO")} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === "CONTACTO" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Contacto e Información
          </button>
          <button onClick={() => setTabActiva("EMPLEADOS")} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === "EMPLEADOS" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Empleados
          </button>
          <button onClick={() => setTabActiva("IMPRESORA")} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === "IMPRESORA" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Impresora
          </button>
          <button onClick={() => setTabActiva("SUSCRIPCION")} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === "SUSCRIPCION" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Suscripción
          </button>
        </div>

        {tabActiva === "SUSCRIPCION" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 text-left">
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
              <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 text-left">
                <h3 className="font-bold text-gray-800 mb-1">Pago Online Instantáneo</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">Pagá con Tarjeta de Crédito, Débito o dinero en Mercado Pago. Activación al instante.</p>
                <button 
                  onClick={handlePagoOnline} 
                  disabled={procesandoPago} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                >
                  {procesandoPago ? "Procesando..." : "Pagar con Mercado Pago"}
                </button>
              </div>

              <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 text-left">
                <h3 className="font-bold text-gray-800 mb-1">Transferencia o Efectivo</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">Transferí a nuestro CBU/Alias y envianos el comprobante por WhatsApp para activación manual.</p>
                <button 
                  onClick={handlePagoManual} 
                  className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm cursor-pointer transition-all"
                >
                  Notificar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "APARIENCIA" && (
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Imágenes del Menú</h2>
                  <p className="text-xs text-gray-500 mt-1">Máximo 5MB por imagen.</p>
                </div>
                <button 
                   onClick={handleGuardarImagenes} 
                   disabled={guardandoImagenes || !hayCambiosImagenes} 
                   className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all ${(guardandoImagenes || !hayCambiosImagenes) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {guardandoImagenes ? "Guardando..." : "Guardar Imágenes"}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Logo del Local</p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0 p-1">
                      {previewLogo ? <img src={previewLogo} alt="Preview Logo" className="w-full h-full object-contain" /> : tema.logoUrl ? <img src={tema.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <img src={IMAGEN_PLACEHOLDER} alt="Sin logo" className="w-full h-full object-contain opacity-50 p-2" />}
                    </div>
                    <div>
                      <input type="file" id="logoUpload" hidden accept="image/*" onChange={handleSeleccionarLogo} />
                      <label htmlFor="logoUpload" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-gray-300 inline-block mb-1">Seleccionar Archivo</label>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Portada (Banner)</p>
                  <div className="flex flex-col items-start gap-3">
                    <div className="w-full h-24 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {previewPortada ? <img src={previewPortada} alt="Preview Portada" className="w-full h-full object-cover" /> : tema.imagenPortada ? <img src={tema.imagenPortada} alt="Portada" className="w-full h-full object-cover" /> : <img src={IMAGEN_PLACEHOLDER} alt="Sin portada" className="w-full h-full object-contain opacity-30 p-2" />}
                    </div>
                    <div>
                      <input type="file" id="portadaUpload" hidden accept="image/*" onChange={handleSeleccionarPortada} />
                      <label htmlFor="portadaUpload" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-gray-300 inline-block">Cambiar Portada</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-gray-800">Colores Hexadecimales, Iconos y Tipografía</h2>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={handleRestaurarTema}
                    className="flex-1 md:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Restaurar por Defecto
                  </button>
                  <button 
                    onClick={handleGuardarTema} 
                    disabled={guardandoTema || !hayCambiosTema} 
                    className={`flex-1 md:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all ${(guardandoTema || !hayCambiosTema) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {guardandoTema ? "Guardando..." : "Guardar Apariencia"}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Primario</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1.5 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
                    <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: tema.colorPrimario || "#E63946" }}></div>
                    <input type="text" maxLength={7} value={tema.colorPrimario} onChange={(e) => setTema({...tema, colorPrimario: e.target.value.toUpperCase()})} className="w-full text-xs font-mono text-gray-700 outline-none bg-transparent" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Botones principales y precio.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Secundario</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1.5 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
                    <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: tema.colorSecundario || "#F1A139" }}></div>
                    <input type="text" maxLength={7} value={tema.colorSecundario} onChange={(e) => setTema({...tema, colorSecundario: e.target.value.toUpperCase()})} className="w-full text-xs font-mono text-gray-700 outline-none bg-transparent" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Etiquetas de descuentos.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Fondo App</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1.5 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
                    <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: tema.colorFondo || "#FFFFFF" }}></div>
                    <input type="text" maxLength={7} value={tema.colorFondo} onChange={(e) => setTema({...tema, colorFondo: e.target.value.toUpperCase()})} className="w-full text-xs font-mono text-gray-700 outline-none bg-transparent" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Color base de toda la pantalla.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Color Texto</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1.5 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
                    <div className="w-6 h-6 rounded shrink-0" style={{ backgroundColor: tema.colorTexto || "#1A1A1A" }}></div>
                    <input type="text" maxLength={7} value={tema.colorTexto} onChange={(e) => setTema({...tema, colorTexto: e.target.value.toUpperCase()})} className="w-full text-xs font-mono text-gray-700 outline-none bg-transparent" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Títulos y descripciones.</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tipografía del Menú (Google Fonts)</label>
                  <p className="text-[10px] text-gray-400 mb-2">Busca tu fuente favorita por <a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline font-bold">aquí</a>.</p>
                  <input type="text" value={tema.fuente || ""} onChange={(e) => setTema({...tema, fuente: e.target.value})} placeholder="Ej: Montserrat, Oswald, Roboto..." className="w-full p-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-gray-50" />
                </div>

                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-8 pt-6 md:pt-0">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Color del Icono del Carrito</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setTema({...tema, colorCarrito: "BLANCO"})}
                      className={`flex flex-1 items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${tema.colorCarrito === "BLANCO" ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                        <img src={CARRITO_BLANCO_URL} alt="Blanco" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Blanco</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setTema({...tema, colorCarrito: "NEGRO"})}
                      className={`flex flex-1 items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${tema.colorCarrito === "NEGRO" ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center p-1.5 shrink-0 border border-gray-200 shadow-inner">
                        <img src={CARRITO_NEGRO_URL} alt="Negro" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-sm font-bold text-gray-800">Negro</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "CONTACTO" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-800">Información del Local</h2>
              <button 
                 onClick={handleGuardarRedesEInfo} 
                 disabled={guardandoInfo || !hayCambiosInfo} 
                 className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all ${(guardandoInfo || !hayCambiosInfo) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {guardandoInfo ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre del Local</label>
                 <input type="text" value={infoLocal.nombre} onChange={(e) => { setInfoLocal({...infoLocal, nombre: e.target.value}); setErroresInfo({...erroresInfo, nombre: null}); }} placeholder="Ej: Burger House" className={`w-full p-3 rounded-xl border text-sm font-medium text-gray-700 outline-none focus:ring-1 ${erroresInfo.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400'}`} />
                 {erroresInfo.nombre && <p className="text-red-500 text-[11px] mt-1.5 font-semibold px-1">{erroresInfo.nombre}</p>}
               </div>
               <div>
                 <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Descripción del Local (Slogan)</label>
                 <textarea rows="3" value={infoLocal.descripcion} onChange={(e) => { setInfoLocal({...infoLocal, descripcion: e.target.value}); setErroresInfo({...erroresInfo, descripcion: null}); }} placeholder="Ej: Las mejores hamburguesas de la ciudad." className={`w-full p-3 rounded-xl border text-sm font-medium text-gray-700 resize-none outline-none focus:ring-1 border-gray-300 focus:border-orange-400 focus:ring-orange-400`}></textarea>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Número de WhatsApp</label>
                  <input type="tel" value={redes.whatsapp} onChange={(e) => { let val = e.target.value; if (val.length < 6) val = "+54 9 "; else if (val && !val.startsWith("+54 9 ")) val = "+54 9 " + (val.replace(/\D/g, "") || ""); setRedes({...redes, whatsapp: val}); setErroresInfo({...erroresInfo, whatsapp: null}); }} placeholder="Ej: 3511234567" className={`w-full p-2.5 rounded-lg border text-sm font-medium outline-none focus:ring-1 bg-gray-50 ${erroresInfo.whatsapp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400'}`} />
                  {erroresInfo.whatsapp && <p className="text-red-500 text-[11px] mt-1 font-semibold px-1">{erroresInfo.whatsapp}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Instagram URL</label>
                  <input type="url" value={redes.instagramUrl} onChange={(e) => { setRedes({...redes, instagramUrl: e.target.value}); setErroresInfo({...erroresInfo, instagramUrl: null}); }} placeholder="Ej: https://instagram.com/tu_local" className={`w-full p-2.5 rounded-lg border text-sm font-medium outline-none focus:ring-1 ${erroresInfo.instagramUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400'}`} />
                  {erroresInfo.instagramUrl && <p className="text-red-500 text-[11px] mt-1 font-semibold px-1">{erroresInfo.instagramUrl}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Facebook URL</label>
                  <input type="url" value={redes.facebookUrl} onChange={(e) => { setRedes({...redes, facebookUrl: e.target.value}); setErroresInfo({...erroresInfo, facebookUrl: null}); }} placeholder="Ej: https://facebook.com/tu_local" className={`w-full p-2.5 rounded-lg border text-sm font-medium outline-none focus:ring-1 ${erroresInfo.facebookUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-400 focus:ring-orange-400'}`} />
                  {erroresInfo.facebookUrl && <p className="text-red-500 text-[11px] mt-1 font-semibold px-1">{erroresInfo.facebookUrl}</p>}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Google Maps Embed (Iframe)</label>
                <textarea rows="4" value={redes.direccionMapaEmbed} onChange={(e) => setRedes({...redes, direccionMapaEmbed: e.target.value})} placeholder='Ej: <iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>' className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono text-gray-600 resize-none outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"></textarea>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "EMPLEADOS" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Empleados</h2>
                <p className="text-gray-500 text-sm mt-1">Acá podés gestionar los permisos de las cuentas que te asignaron.</p>
              </div>
              <div className="relative w-full md:w-64">
                <input type="text" placeholder="Buscar por nombre, DNI o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <span className="absolute left-3 top-2.5 text-gray-400 text-lg">⌕</span>
              </div>
            </div>

            {usuariosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium border-t border-gray-100">
                {busqueda ? "No se encontraron empleados con esa búsqueda." : "No hay empleados cargados."}
              </div>
            ) : (
              <div className="overflow-x-auto border-t border-gray-100 min-h-100 pb-48">
                <table className="w-full text-left text-sm relative">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
                      <th className="font-bold py-4 px-6 text-[11px] uppercase tracking-widest">Empleado</th>
                      <th className="font-bold py-4 px-6 text-[11px] uppercase tracking-widest">Rol</th>
                      <th className="font-bold py-4 px-6 text-[11px] uppercase tracking-widest text-center">Estado</th>
                      <th className="font-bold py-4 px-6 text-[11px] uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuariosFiltrados.map((u) => {
                      const menuAbierto = menuUsuarioAbiertoId === u.id;
                      return (
                      <tr key={u.id} className={`transition-colors hover:bg-gray-50/50 relative ${menuAbierto ? 'z-50' : 'z-0'} ${!u.activo ? 'bg-red-50/30' : ''}`}>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-gray-800 text-sm mb-0.5">{u.nombreCompleto || "Sin Nombre Registrado"}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-1">
                              <span>DNI: {u.documento || "N/A"}</span><span>•</span><span>ID: #{u.id}</span>
                            </div>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${u.rol === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{u.rol}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{u.activo ? 'Activo' : 'Suspendido'}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button onClick={() => setMenuUsuarioAbiertoId(menuAbierto ? null : u.id)} className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold text-lg transition-colors cursor-pointer ${menuAbierto ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}>⋮</button>
                          {menuAbierto && (
                            <div className="absolute right-12 top-10 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-100 overflow-hidden text-sm py-1 animate-fade-in text-left">
                              <button onClick={() => { setMenuUsuarioAbiertoId(null); setModalInfoUsuario({ abierto: true, usuario: u }); }} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-bold transition-colors border-b border-gray-50 cursor-pointer">Ver Información</button>
                              <button onClick={() => confirmarCambioRol(u)} className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors border-b border-gray-50 cursor-pointer">{u.rol === "ADMIN" ? "Quitar Admin" : "Dar Permisos"}</button>
                              <button onClick={() => { setMenuUsuarioAbiertoId(null); setModalPassword({ abierto: true, usuarioId: u.id, email: u.email, passwordActual: "", passwordNueva: "" }); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 text-blue-600 font-medium transition-colors border-b border-gray-50 cursor-pointer">Cambiar Contraseña</button>
                              <button onClick={() => handleCambiarEstadoUsuario(u.id, u.activo)} className={`w-full text-left px-5 py-3 font-bold transition-colors cursor-pointer ${u.activo ? 'hover:bg-red-50 text-red-600' : 'hover:bg-emerald-50 text-emerald-600'}`}>{u.activo ? 'Suspender Acceso' : 'Reactivar Acceso'}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CONTENIDO PESTAÑA IMPRESORA --- */}
        {tabActiva === "IMPRESORA" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Configuración de este Dispositivo</h2>
            <p className="text-sm text-gray-500 mb-6">
              Estos ajustes se guardan localmente en el navegador de esta computadora o celular. Si usás PediAlgo desde otra PC (por ejemplo, la de la cocina), vas a tener que configurarlo ahí también.
            </p>
            
            <div className="max-w-md">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Ancho del Ticket de Impresión
              </label>
              <select 
                value={anchoTicket}
                onChange={handleCambioTicket}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm font-medium rounded-xl focus:border-orange-400 focus:ring-1 focus:ring-orange-400 block p-3 outline-none transition-colors"
              >
                <option value="80mm">Normal - 80mm (Tickeadora estándar de caja)</option>
                <option value="58mm">Chico - 58mm (Posnet o Tickeadora portátil)</option>
              </select>
            </div>
          </div>
        )}

      </div>

      {/* MODALES */}
      {modalInfoUsuario.abierto && modalInfoUsuario.usuario && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Ficha del Empleado</h2>
              <button onClick={() => setModalInfoUsuario({ abierto: false, usuario: null })} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">x</button>
            </div>
            <div className="p-6 space-y-4">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</p><p className="font-bold text-gray-800 text-base">{modalInfoUsuario.usuario.nombreCompleto || "No registrado"}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Documento</p><p className="font-medium text-gray-700 text-sm">{modalInfoUsuario.usuario.documento || "N/A"}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Sistema</p><p className="font-mono text-gray-500 text-sm">#{modalInfoUsuario.usuario.id}</p></div>
              </div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Correo Electrónico</p><p className="font-medium text-gray-700 text-sm">{modalInfoUsuario.usuario.email}</p></div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rol Asignado</p><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${modalInfoUsuario.usuario.rol === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{modalInfoUsuario.usuario.rol}</span></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p><span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${modalInfoUsuario.usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{modalInfoUsuario.usuario.activo ? 'Activo' : 'Suspendido'}</span></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100"><button onClick={() => setModalInfoUsuario({ abierto: false, usuario: null })} className="w-full py-2.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">Cerrar Panel</button></div>
          </div>
        </div>
      )}

      {modalPassword.abierto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-black text-gray-900">Actualizar Contraseña</h2><button onClick={() => setModalPassword({ abierto: false, usuarioId: null, email: "", passwordActual: "", passwordNueva: "", error: "" })} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">x</button></div>
            <form onSubmit={handleGuardarPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contraseña Actual</label>
                <input type="text" required value={modalPassword.passwordActual} onChange={(e) => setModalPassword({...modalPassword, passwordActual: e.target.value, error: ""})} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" placeholder="La clave vieja..." />
                {modalPassword.error && <p className="text-[10px] text-red-500 font-bold mt-1.5">{modalPassword.error}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nueva Contraseña</label>
                <input type="text" required value={modalPassword.passwordNueva} onChange={(e) => setModalPassword({...modalPassword, passwordNueva: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" placeholder="La clave nueva..." />
              </div>
              <div className="flex gap-2 mt-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalPassword({ abierto: false, usuarioId: null, email: "", passwordActual: "", passwordNueva: "", error: "" })} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">Cancelar</button>
                <button type="submit" disabled={guardandoPassword} className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-all ${guardandoPassword ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'}`} style={{ backgroundColor: COLOR_PRIMARIO }}>{guardandoPassword ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalConfirmacionRol.abierto && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">Cambiar Nivel de Acceso</h2>
            <p className="text-sm text-gray-500 mb-6">¿Confirmás cambiar el rol de <b className="text-gray-800 font-bold">{modalConfirmacionRol.email}</b> a <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mt-1 border`}>{modalConfirmacionRol.nuevoRol}</span>?</p>
            <div className="flex gap-3"><button onClick={() => setModalConfirmacionRol({ abierto: false, usuarioId: null, email: "", nuevoRol: "", rolAnterior: "" })} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">Cancelar</button><button onClick={ejecutarCambioRol} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-transform active:scale-95 hover:brightness-105" style={{ backgroundColor: COLOR_PRIMARIO }}>Confirmar</button></div>
          </div>
        </div>
      )}
      
    </AdminLayout>
  );
}

export default AjustesPage;