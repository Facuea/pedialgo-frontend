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
  const [anchoTicket, setAnchoTicket] = useState(localStorage.getItem("anchoTicketImpresion") || "80mm");
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "exito" });
  const [timeoutId, setTimeoutId] = useState(null);

  // Estados de Carga
  const [guardandoImagenes, setGuardandoImagenes] = useState(false);
  const [guardandoTema, setGuardandoTema] = useState(false);
  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [erroresInfo, setErroresInfo] = useState({});
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState("");
  const [archivoPortada, setArchivoPortada] = useState(null);
  const [previewPortada, setPreviewPortada] = useState("");

  const [tema, setTema] = useState({
    colorPrimario: "#E63946", colorSecundario: "#F1A139", colorFondo: "#FFFFFF",
    colorTexto: "#1A1A1A", fuente: "Poppins", logoUrl: "", imagenPortada: "",
    colorCarrito: "BLANCO" 
  });
  const [temaOriginal, setTemaOriginal] = useState({});
  const [infoLocal, setInfoLocal] = useState({ nombre: "", descripcion: "", fechaVencimiento: "", estadoSuscripcion: "" });
  const [infoLocalOriginal, setInfoLocalOriginal] = useState({});
  const [redes, setRedes] = useState({ facebookUrl: "", instagramUrl: "", direccionMapaEmbed: "", whatsapp: "+54 9 " });
  const [redesOriginal, setRedesOriginal] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [menuUsuarioAbiertoId, setMenuUsuarioAbiertoId] = useState(null);
  const [modalInfoUsuario, setModalInfoUsuario] = useState({ abierto: false, usuario: null });
  const [modalPassword, setModalPassword] = useState({ abierto: false, usuarioId: null, email: "", passwordActual: "", passwordNueva: "", error: "" }); 
  const [modalConfirmacionRol, setModalConfirmacionRol] = useState({ abierto: false, usuarioId: null, email: "", nuevoRol: "", rolAnterior: "" });

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
        setInfoLocal({ 
          nombre: dataLocal.nombre || "", 
          descripcion: dataLocal.descripcion || "",
          fechaVencimiento: dataLocal.fechaVencimiento,
          estadoSuscripcion: dataLocal.estadoSuscripcion
        });
        setInfoLocalOriginal({ nombre: dataLocal.nombre || "", descripcion: dataLocal.descripcion || "" });
        const redesData = {
          facebookUrl: dataLocal.facebookUrl || "",
          instagramUrl: dataLocal.instagramUrl || "",
          direccionMapaEmbed: dataLocal.direccionMapaEmbed || "",
          whatsapp: dataLocal.whatsapp ? dataLocal.whatsapp : "+54 9 " 
        };
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

  // --- LOGICA DE PAGOS ---
  const handlePagoOnline = async () => {
    setProcesandoPago(true);
    try {
      const res = await fetchPrivado(`/admin/suscripcion/${localId}/pago-online`, { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      mostrarNotificacion("Error al conectar con Mercado Pago.", "error");
    } finally {
      setProcesandoPago(false);
    }
  };

  const handlePagoManual = async () => {
    const res = await fetchPrivado(`/admin/suscripcion/${localId}/pago-manual`);
    const data = await res.json();
    
    // Mostramos tus datos de CBU/Alias
    alert("IMPORTANTE: Para activar tu cuenta, transferí $15.000 a:\n\nALIAS: pedialgo.oficial.mp\nCBU: 00000031000...");
    
    // Abrimos WhatsApp con tu número (Reemplazá 549358XXXXXXX por tu número real)
    const urlWa = `https://wa.me/549358XXXXXXX?text=${encodeURIComponent(data.mensaje)}`;
    window.open(urlWa, '_blank');
  };

  const mostrarNotificacion = (mensaje, tipo = "exito") => {
    if (timeoutId) clearTimeout(timeoutId);
    setNotificacion({ visible: true, mensaje, tipo });
    const id = setTimeout(() => setNotificacion({ visible: false, mensaje: "", tipo: "exito" }), 5000);
    setTimeoutId(id);
  };

  const cerrarNotificacion = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setNotificacion({ visible: false, mensaje: "", tipo: "exito" });
  };

  // Handlers Apariencia
  const handleSeleccionarLogo = (e) => { const file = e.target.files[0]; if (file) { setArchivoLogo(file); setPreviewLogo(URL.createObjectURL(file)); } };
  const handleSeleccionarPortada = (e) => { const file = e.target.files[0]; if (file) { setArchivoPortada(file); setPreviewPortada(URL.createObjectURL(file)); } };
  
  const handleGuardarImagenes = async () => {
    setGuardandoImagenes(true);
    try {
      if (archivoLogo) {
        const formData = new FormData(); formData.append("file", archivoLogo);
        const res = await fetchPrivado(`/admin/imagenes/local/${slug}/logo`, { method: "PATCH", body: formData });
        if (res.ok) setArchivoLogo(null);
      }
      if (archivoPortada) {
        const formData = new FormData(); formData.append("file", archivoPortada);
        const res = await fetchPrivado(`/admin/imagenes/local/${slug}/portada`, { method: "PATCH", body: formData });
        if (res.ok) setArchivoPortada(null);
      }
      mostrarNotificacion("Imágenes actualizadas.");
      cargarDatosGenerales();
    } catch (e) { mostrarNotificacion("Error al subir imágenes.", "error"); }
    finally { setGuardandoImagenes(false); }
  };

  const handleGuardarTema = async () => {
    setGuardandoTema(true);
    try {
      const res = await fetchPrivado(`/admin/locales/${slug}/tema`, { method: "PATCH", body: JSON.stringify(tema) });
      if (res.ok) { setTemaOriginal(tema); mostrarNotificacion("Colores guardados."); }
    } catch (e) { mostrarNotificacion("Error al guardar tema.", "error"); }
    finally { setGuardandoTema(false); }
  };

  const handleCambioTicket = (e) => {
    const nuevoAncho = e.target.value;
    setAnchoTicket(nuevoAncho);
    localStorage.setItem("anchoTicketImpresion", nuevoAncho);
    mostrarNotificacion(`Ticket configurado a ${nuevoAncho}.`);
  };

  const hayCambiosImagenes = !!archivoLogo || !!archivoPortada;
  const hayCambiosTema = JSON.stringify(tema) !== JSON.stringify(temaOriginal);
  const hayCambiosInfo = JSON.stringify(infoLocal.nombre) !== JSON.stringify(infoLocalOriginal.nombre) || JSON.stringify(redes) !== JSON.stringify(redesOriginal);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto font-sans pb-12 animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {notificacion.visible && (
          <div className="fixed bottom-6 right-6 pl-6 pr-4 py-4 rounded-xl shadow-2xl font-medium text-sm z-9999 flex items-center gap-4 bg-neutral-900 text-white border border-neutral-700 min-w-75 justify-between">
            <span>{notificacion.mensaje}</span>
            <button onClick={cerrarNotificacion} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl font-bold">x</button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ajustes del Local</h1>
          <p className="text-gray-500 text-sm mt-1">Configurá tu marca, equipo y suscripción.</p>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          {["APARIENCIA", "CONTACTO", "EMPLEADOS", "IMPRESORA", "SUSCRIPCION"].map((t) => (
            <button key={t} onClick={() => setTabActiva(t)} className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer ${tabActiva === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === "SUSCRIPCION" ? "Suscripción" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* --- PESTAÑA SUSCRIPCIÓN (NUEVA) --- */}
        {tabActiva === "SUSCRIPCION" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Estado de tu Cuenta</h2>
                  <p className="text-sm text-gray-500">Mantené tu servicio activo para no perder ventas.</p>
                </div>
                <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Vencimiento</p>
                  <p className="text-lg font-bold text-gray-800">
                    {infoLocal.fechaVencimiento ? new Date(infoLocal.fechaVencimiento).toLocaleDateString('es-AR') : "Pendiente"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAMINO 1: ONLINE */}
                <div className="p-6 border border-gray-200 rounded-2xl hover:border-orange-200 transition-colors bg-gray-50/50">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Pago Online Instantáneo</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">Pagá con Tarjeta de Crédito, Débito o dinero en Mercado Pago. Se acredita al instante.</p>
                  <button 
                    onClick={handlePagoOnline}
                    disabled={procesandoPago}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                  >
                    {procesandoPago ? "Procesando..." : "Pagar con Mercado Pago"}
                  </button>
                </div>

                {/* CAMINO 2: MANUAL */}
                <div className="p-6 border border-gray-200 rounded-2xl hover:border-orange-200 transition-colors bg-gray-50/50">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Transferencia o Efectivo</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">Transferí a nuestro CBU/Alias y envianos el comprobante por WhatsApp para la activación manual.</p>
                  <button 
                    onClick={handlePagoManual}
                    className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Notificar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- APARIENCIA --- */}
        {tabActiva === "APARIENCIA" && (
          <div className="space-y-8 animate-fade-in">
             {/* Tu código original de Apariencia va aquí */}
             <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Imágenes del Menú</h2>
                  </div>
                  <button onClick={handleGuardarImagenes} disabled={guardandoImagenes || !hayCambiosImagenes} className={`px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg transition-all ${(guardandoImagenes || !hayCambiosImagenes) ? 'opacity-50' : 'cursor-pointer hover:bg-orange-600'}`}>
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
                      <input type="file" id="logoUpload" hidden onChange={handleSeleccionarLogo} />
                      <label htmlFor="logoUpload" className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer border border-gray-300">Seleccionar</label>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* ... Resto de tus pestañas (CONTACTO, EMPLEADOS, IMPRESORA) se mantienen igual ... */}

      </div>
    </AdminLayout>
  );
}

export default AjustesPage;