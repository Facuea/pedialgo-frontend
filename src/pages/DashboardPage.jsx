import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import TicketImpresion from "../components/TicketImpresion"; 
import { Client } from '@stomp/stompjs';
import { fetchPrivado } from "../services/apiConfig";

const API_URL = import.meta.env.VITE_API_URL;

function DashboardPage() {
  const COLOR_PRIMARIO = "#F1A139"; 
  
  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  const [local, setLocal] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("RECIBIDO");
  const [pedidoAImprimir, setPedidoAImprimir] = useState(null);
  const [notificacion, setNotificacion] = useState(false); 
  const [pedidoACancelar, setPedidoACancelar] = useState(null); // Nuevo estado para seguridad

  const nombreLocal = local?.nombre || "Cargando..."; 
  const urlMenu = local ? `${window.location.origin}/${local.slug}` : "Cargando..."; 
  
  useEffect(() => {
    if (localId) {
      fetchPrivado(`/admin/locales/${localId}`)
        .then(res => {
          if (!res.ok) throw new Error("Error en el servidor");
          return res.json();
        })
        .then(data => setLocal(data))
        .catch(err => console.error("Error al cargar local:", err));

      cargarPedidosDeHoy();
    }
  }, [localId]);

  // FIX WEBSOCKETS: Genera la ruta ws:// o wss:// directo de tu API_URL. Adiós al F5.
  useEffect(() => {
    if (!localId || !API_URL) return;

    const wsUrl = API_URL.replace(/^http/, 'ws') + '/websocket';

    const stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/locales/${localId}/pedidos`, (mensaje) => {
          const pedidoNuevo = JSON.parse(mensaje.body);
          setPedidos(prev => [pedidoNuevo, ...prev]);
          setNotificacion(true);
          setTimeout(() => setNotificacion(false), 4000);
          try {
            const audio = new Audio('/notificacion-pedialgo.mp3');
            audio.play().catch(e => console.log("Bloqueo de audio", e));
          } catch (e) {}
        });
      }
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [localId]);

  const cargarPedidosDeHoy = async () => {
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/pedidos/hoy`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data); 
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await fetchPrivado(`/admin/locales/${localId}/pedidos/${pedidoId}/estado`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }) 
      });
      if (response.ok) {
        setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(urlMenu);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleImprimir = (pedido) => {
    setPedidoAImprimir(pedido);
    setTimeout(() => window.print(), 100);
  };

  const coloresEstado = {
    RECIBIDO: "bg-amber-50 text-amber-700 border-amber-200",
    EN_PREPARACION: "bg-blue-50 text-blue-700 border-blue-200",
    LISTO: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ENTREGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELADO: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const nombresEstado = {
    RECIBIDO: "Pendiente",
    EN_PREPARACION: "En Cocina",
    LISTO: "Listo",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado"
  };

  const pedidosAMostrar = filtroActivo === "TODOS" 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroActivo);

  const btnTabClass = "px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5";

  return (
    <>
      <div className="print:hidden">
        <AdminLayout>
          <div className="max-w-7xl mx-auto font-sans pb-12 relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {notificacion && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded shadow-sm text-sm font-semibold tracking-wide uppercase animate-fade-in border border-gray-700">
                Nuevo pedido recibido
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Monitor de Pedidos</h1>
                <p className="text-gray-500 font-medium text-sm">Resumen de la actividad de hoy en {nombreLocal}</p>
              </div>

              <div className="w-full lg:w-auto bg-white border border-gray-200 rounded-xl p-2 flex items-center gap-3 shadow-sm">
                <div 
                  className="w-10 h-10 rounded-lg font-black flex items-center justify-center shrink-0 text-lg border border-white/20 text-white shadow-sm"
                  style={{ backgroundColor: COLOR_PRIMARIO }}
                >
                  {nombreLocal[0]} 
                </div>
                <div className="flex-1 overflow-hidden min-w-50 pl-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Tu Menú Digital</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{urlMenu}</p>
                </div>
                <button 
                  onClick={handleCopiarLink}
                  title="Copiar enlace"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${copiado ? 'bg-emerald-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {copiado ? <span className="text-emerald-600 font-bold text-lg">✓</span> : <img src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774895535/wondicon-ui-free-file_111223_rdfg2v.png" alt="Copiar" className="w-5 h-5 opacity-70" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => setFiltroActivo("RECIBIDO")} className={`${btnTabClass} ${filtroActivo === "RECIBIDO" ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Nuevos <span className="ml-1 opacity-70 font-semibold">({pedidos.filter(p => p.estado === "RECIBIDO").length})</span>
              </button>
              <button onClick={() => setFiltroActivo("EN_PREPARACION")} className={`${btnTabClass} ${filtroActivo === "EN_PREPARACION" ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                En Cocina <span className="ml-1 opacity-70 font-semibold">({pedidos.filter(p => p.estado === "EN_PREPARACION").length})</span>
              </button>
              <button onClick={() => setFiltroActivo("LISTO")} className={`${btnTabClass} ${filtroActivo === "LISTO" ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Listos <span className="ml-1 opacity-70 font-semibold">({pedidos.filter(p => p.estado === "LISTO").length})</span>
              </button>
              <button onClick={() => setFiltroActivo("ENTREGADO")} className={`${btnTabClass} ${filtroActivo === "ENTREGADO" ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Entregados <span className="ml-1 opacity-70 font-semibold">({pedidos.filter(p => p.estado === "ENTREGADO").length})</span>
              </button>
              <button onClick={() => setFiltroActivo("CANCELADO")} className={`${btnTabClass} ${filtroActivo === "CANCELADO" ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Cancelados <span className="ml-1 opacity-70 font-semibold">({pedidos.filter(p => p.estado === "CANCELADO").length})</span>
              </button>
              <button onClick={() => setFiltroActivo("TODOS")} className={`ml-auto ${btnTabClass} ${filtroActivo === "TODOS" ? 'bg-gray-100 text-gray-800 border border-gray-300' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Historial de Hoy <span className="ml-1 px-2 py-0.5 rounded-md bg-gray-200/50 text-xs font-semibold">{pedidos.length}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pedidosAMostrar.map((pedido) => (
                <div key={pedido.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                  
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-700">#{pedido.id}</span>
                      <span className="text-[11px] font-medium text-gray-400 mt-0.5">{pedido.fecha ? `${pedido.fecha.split("T")[1].substring(0,5)} hs` : ""}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${coloresEstado[pedido.estado]}`}>
                      {nombresEstado[pedido.estado]}
                    </span>
                  </div>

                  <div className="p-4 flex-1">
                    <div className="mb-4">
                      <p className="font-semibold text-gray-800 text-base">{pedido.nombreCliente}</p>
                      
                      {/* FIX: Link de Contactar en azul */}
                      <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center">
                        Cel: {pedido.telefono}
                        {pedido.telefono && (
                          <a 
                            href={`https://wa.me/${pedido.telefono.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-500 hover:text-blue-700 underline ml-2 font-bold tracking-wide cursor-pointer text-[11px]"
                          >
                            Contactar
                          </a>
                        )}
                      </p>
                      
                      <p className="text-xs font-medium text-gray-600 mt-2 bg-gray-50 border border-gray-100 inline-block px-2.5 py-1 rounded-md">{pedido.direccion ? `Dir: ${pedido.direccion}` : "Retiro en local"}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Comanda</p>
                      <ul className="space-y-1.5">
                        {pedido.items && pedido.items.map((item) => (
                          <li key={item.id} className="flex items-start text-sm">
                            <span className="font-semibold text-gray-700 w-6">{item.cantidad}x</span> 
                            <span className="text-gray-600 font-medium leading-snug">{item.productoNombre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Total</p>
                        <p className="text-lg font-bold text-gray-800">${pedido.total}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleImprimir(pedido)} 
                        className="px-4 py-2 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer hover:brightness-110"
                        style={{ backgroundColor: COLOR_PRIMARIO }}
                      >
                        Imprimir
                      </button>
                    </div>

                    <div className="flex gap-2 w-full mt-1">
                      
                      {pedido.estado === "RECIBIDO" && (
                        <button onClick={() => handleCambiarEstado(pedido.id, "EN_PREPARACION")} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer">
                          Aceptar y Cocinar
                        </button>
                      )}
                      
                      {pedido.estado === "EN_PREPARACION" && (
                        <button onClick={() => handleCambiarEstado(pedido.id, "LISTO")} className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer">
                          Marcar Listo
                        </button>
                      )}
                      
                      {pedido.estado === "LISTO" && (
                        <button onClick={() => handleCambiarEstado(pedido.id, "ENTREGADO")} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer">
                          Entregar Pedido
                        </button>
                      )}

                      {/* FIX: Confirmación de Cancelación de Seguridad */}
                      {pedido.estado !== "ENTREGADO" && pedido.estado !== "CANCELADO" && (
                        pedidoACancelar === pedido.id ? (
                          <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-lg flex-1">
                            <span className="text-[10px] font-bold text-rose-700 flex-1 text-center">¿Seguro?</span>
                            <button onClick={() => { handleCambiarEstado(pedido.id, "CANCELADO"); setPedidoACancelar(null); }} className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[11px] font-bold cursor-pointer shadow-sm">Sí</button>
                            <button onClick={() => setPedidoACancelar(null)} className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-[11px] font-bold cursor-pointer">No</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setPedidoACancelar(pedido.id)} 
                            className="px-3 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 border border-rose-100"
                            title="Cancelar Pedido"
                          >
                            ✕
                          </button>
                        )
                      )}

                      {pedido.estado === "CANCELADO" && (
                        <button 
                          onClick={() => handleCambiarEstado(pedido.id, "RECIBIDO")} 
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                          Deshacer Cancelación
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {pedidosAMostrar.length === 0 && (
                <div className="col-span-full py-12 text-center border border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center">
                  <p className="text-base font-medium text-gray-500">No hay pedidos en este estado.</p>
                </div>
              )}
            </div>
          </div>
        </AdminLayout>
      </div>
      <TicketImpresion pedido={pedidoAImprimir} nombreLocal={nombreLocal} />
    </>
  );
}

export default DashboardPage;