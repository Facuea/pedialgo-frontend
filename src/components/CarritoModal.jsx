import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

// SECCIÓN: Estados iniciales
function CarritoModal({ mostrar, onClose, carrito, agregarAlCarrito, quitarDelCarrito, totalDinero, tema, nombreLocal, numeroWhatsApp, slug, vaciarCarrito }) {
  const [metodoEntrega, setMetodoEntrega] = useState("delivery");
  const [metodoPago, setMetodoPago] = useState("efectivo"); // NUEVO ESTADO: Método de pago
  
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    notas: "",
    montoAbona: "" // NUEVO ESTADO: Para el vuelto
  });
  
  const [errores, setErrores] = useState({});

  if (!mostrar) return null;

  // SECCIÓN: Funciones auxiliares
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "nombre") {
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    } else if (name === "telefono" || name === "montoAbona") { // Permitir números en montoAbona
      newValue = value.replace(/[^0-9+\s]/g, "");
    }

    setCliente({ ...cliente, [name]: newValue });

    if (errores[name]) {
      setErrores({ ...errores, [name]: null });
    }
  };

  // SECCIÓN: Procesamiento del pedido
  const procesarPedido = async () => {
    const nuevosErrores = {};

    if (!cliente.nombre.trim()) nuevosErrores.nombre = "Por favor, ingresá tu nombre.";
    if (!cliente.telefono.trim()) nuevosErrores.telefono = "Por favor, ingresá tu teléfono.";
    if (!cliente.email.trim()) {
      nuevosErrores.email = "Por favor, ingresá tu correo.";
    } else if (!cliente.email.includes("@")) {
      nuevosErrores.email = "Ingresá un correo electrónico válido.";
    }
    if (metodoEntrega === "delivery" && !cliente.direccion.trim()) {
      nuevosErrores.direccion = "Para envíos, la dirección es obligatoria.";
    }
    
    // NUEVA VALIDACIÓN: Si paga en efectivo, validar monto
    if (metodoPago === "efectivo") {
      if (!cliente.montoAbona.trim()) {
         nuevosErrores.montoAbona = "Ingresá con cuánto vas a abonar.";
      } else if (parseInt(cliente.montoAbona) < totalDinero) {
         nuevosErrores.montoAbona = "El monto no puede ser menor al total.";
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const payload = {
      nombreCliente: cliente.nombre,
      telefono: cliente.telefono,
      emailCliente: cliente.email, 
      direccion: metodoEntrega === "delivery" ? cliente.direccion : "Retiro en local",
      metodoPago: metodoPago, // NUEVO: Enviar al backend
      montoAbona: metodoPago === "efectivo" ? parseInt(cliente.montoAbona) : null, // NUEVO: Enviar al backend
      items: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const response = await fetch(`${API_URL}/public/locales/${slug}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el pedido en el servidor");
      }

      let mensajeProductos = carrito.map(item => {
        const hayDescuento = item.descuento > 0;
        const precioVenta = hayDescuento ? item.precio - (item.precio * item.descuento / 100) : item.precio;
        return ` ${item.cantidad}x ${item.nombre} ($${precioVenta * item.cantidad})`;
      }).join("\n");

      const metodoTexto = metodoEntrega === "delivery" ? " ENVIO A DOMICILIO" : " RETIRO EN LOCAL";
      
      // NUEVO: Armar texto de pago para WhatsApp
      const pagoTexto = metodoPago === "efectivo" 
        ? ` Efectivo (Abona con $${cliente.montoAbona} - Vuelto: $${parseInt(cliente.montoAbona) - totalDinero})` 
        : ` Transferencia (CBU/Alias)`;

      const mensajeFinal = `
*NUEVO PEDIDO - ${nombreLocal}* -----------------------------------
*Datos del Cliente:*
 Nombre: ${cliente.nombre}
 Telefono: ${cliente.telefono}
 Email: ${cliente.email}
 Metodo: ${metodoTexto}
${metodoEntrega === "delivery" ? ` Direccion: ${cliente.direccion}` : ""}
${cliente.notas ? ` Notas: ${cliente.notas}` : ""}

*Detalle del pedido:*
${mensajeProductos}
-----------------------------------
 *TOTAL A PAGAR: $${totalDinero}*
 *PAGO:* ${pagoTexto}
      `.trim();

      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeFinal)}`;
      window.open(url, "_blank");
      vaciarCarrito();
      onClose();

    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un problema al enviar tu pedido. Por favor, intenta nuevamente.");
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
      `}</style>

      {/* SECCIÓN: Overlay del modal */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 flex justify-center items-end p-0 md:p-4"
      />

      {/* SECCIÓN: Contenedor principal del modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-0">
        <div 
          className="w-full max-w-2xl rounded-t-3xl md:rounded-3xl p-6 shadow-2xl flex flex-col animate-slideUp max-h-[85vh]"
          style={{ 
            backgroundColor: tema.colorFondo, 
            color: tema.colorTexto,
            fontFamily: `'${tema.fuente || "inherit"}', sans-serif`
          }}
        >
          {/* SECCIÓN: Header del modal */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Tu pedido</h2>
            <button onClick={onClose} className="text-2xl font-bold opacity-70 hover:opacity-100 transition-opacity cursor-pointer">x</button>
          </div>

          <div className="overflow-y-auto space-y-5 pr-2 grow mb-4 no-scrollbar">
            
            {/* SECCIÓN: Lista de productos en carrito */}
            <div className="space-y-4">
              {carrito.map((item) => {
                const hayDescuento = item.descuento > 0;
                const precioVenta = hayDescuento ? item.precio - (item.precio * item.descuento / 100) : item.precio;

                return (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4" style={{ borderColor: tema.colorTexto + '30' }}>
                    <div>
                      <p className="font-bold text-lg">{item.nombre}</p>
                      <div className="flex items-center gap-2">
                        {hayDescuento ? (
                          <>
                            <p className="text-sm font-bold" style={{fontFamily: "Poppins", color: tema.colorPrimario}}>
                              ${precioVenta}
                            </p>
                            <p className="text-[0.7rem] opacity-40 line-through" style={{fontFamily: "Poppins"}}>
                              ${item.precio}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm opacity-60" style={{fontFamily: "Poppins"}}>
                            ${item.precio} c/u
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN: Controles de cantidad */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => quitarDelCarrito(item)} 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer active:scale-95"
                        style={{ backgroundColor: tema.colorTexto + '20', color: tema.colorTexto, fontFamily: "sans-serif" }}
                      >-</button>
                      <span className="font-bold text-lg w-5 text-center">{item.cantidad}</span>
                      <button 
                        onClick={() => agregarAlCarrito(item)} 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm active:scale-95"
                        style={{ backgroundColor: tema.colorPrimario, color: tema.colorFondo, fontFamily: "sans-serif" }}
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECCIÓN: Selección de método de entrega */}
            <div className="flex gap-2 my-2">
              <button 
                onClick={() => { setMetodoEntrega("delivery"); setErrores({...errores, direccion: null}); }}
                className="flex-1 py-3 rounded-xl font-bold transition-all border-2 cursor-pointer"
                style={{
                  backgroundColor: metodoEntrega === "delivery" ? tema.colorPrimario : "transparent",
                  color: metodoEntrega === "delivery" ? tema.colorFondo : tema.colorTexto,
                  borderColor: metodoEntrega === "delivery" ? tema.colorPrimario : tema.colorTexto + '30'
                }}
              >Envio</button>
              <button 
                onClick={() => { setMetodoEntrega("retiro"); setErrores({...errores, direccion: null}); }}
                className="flex-1 py-3 rounded-xl font-bold transition-all border-2 cursor-pointer"
                style={{
                  backgroundColor: metodoEntrega === "retiro" ? tema.colorPrimario : "transparent",
                  color: metodoEntrega === "retiro" ? tema.colorFondo : tema.colorTexto,
                  borderColor: metodoEntrega === "retiro" ? tema.colorPrimario : tema.colorTexto + '30'
                }}
              >Retiro</button>
            </div>

            {/* SECCIÓN: Formulario de datos del cliente  */}
            <div className="space-y-3 pt-1">
              
              {/* Nombre */}
              <div>
                <input type="text" name="nombre" placeholder="Nombre completo *" value={cliente.nombre} onChange={handleChange} className="w-full p-3 rounded-xl border outline-none transition-colors" style={{ backgroundColor: tema.colorTexto + '0A', borderColor: errores.nombre ? '#ef4444' : tema.colorTexto + '20' }} />
                {errores.nombre && <p className="text-[#ef4444] text-[11px] mt-1 px-2 font-semibold">{errores.nombre}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <input type="tel" name="telefono" placeholder="Numero de celular *" value={cliente.telefono} onChange={handleChange} className="w-full p-3 rounded-xl border outline-none transition-colors" style={{ backgroundColor: tema.colorTexto + '0A', borderColor: errores.telefono ? '#ef4444' : tema.colorTexto + '20' }} />
                {errores.telefono && <p className="text-[#ef4444] text-[11px] mt-1 px-2 font-semibold">{errores.telefono}</p>}
              </div>
              
              {/* Email */}
              <div>
                <input type="email" name="email" placeholder="Correo electronico *" value={cliente.email} onChange={handleChange} className="w-full p-3 rounded-xl border outline-none transition-colors" style={{ backgroundColor: tema.colorTexto + '0A', borderColor: errores.email ? '#ef4444' : tema.colorTexto + '20' }} />
                {errores.email ? (
                  <p className="text-[#ef4444] text-[11px] mt-1 px-2 font-semibold">{errores.email}</p>
                ) : (
                  <p className="text-[11px] mt-1.5 px-2 opacity-60 italic" style={{ color: tema.colorTexto }}>
                    * Usamos tu correo únicamente para enviarte notificaciones sobre tu pedido.
                  </p>
                )}
              </div>
              
              {/* Dirección */}
              {metodoEntrega === "delivery" && (
                <div>
                  <input type="text" name="direccion" placeholder="Direccion de entrega *" value={cliente.direccion} onChange={handleChange} className="w-full p-3 rounded-xl border outline-none transition-colors" style={{ backgroundColor: tema.colorTexto + '0A', borderColor: errores.direccion ? '#ef4444' : tema.colorTexto + '20' }} />
                  {errores.direccion && <p className="text-[#ef4444] text-[11px] mt-1 px-2 font-semibold">{errores.direccion}</p>}
                </div>
              )}

              {/* NUEVA SECCIÓN: Selección de método de pago */}
              <div className="pt-2 border-t mt-4" style={{ borderColor: tema.colorTexto + '20' }}>
                <p className="font-semibold text-sm mb-3 opacity-80">¿Cómo vas a pagar?</p>
                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => { setMetodoPago("efectivo"); setErrores({...errores, montoAbona: null}); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer"
                    style={{
                      backgroundColor: metodoPago === "efectivo" ? tema.colorPrimario : "transparent",
                      color: metodoPago === "efectivo" ? tema.colorFondo : tema.colorTexto,
                      borderColor: metodoPago === "efectivo" ? tema.colorPrimario : tema.colorTexto + '30'
                    }}
                  >Efectivo</button>
                  <button 
                    onClick={() => { setMetodoPago("transferencia"); setErrores({...errores, montoAbona: null}); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer"
                    style={{
                      backgroundColor: metodoPago === "transferencia" ? tema.colorPrimario : "transparent",
                      color: metodoPago === "transferencia" ? tema.colorFondo : tema.colorTexto,
                      borderColor: metodoPago === "transferencia" ? tema.colorPrimario : tema.colorTexto + '30'
                    }}
                  >Transferencia</button>
                </div>

                {metodoPago === "efectivo" && (
                  <div>
                    <input 
                      type="tel" 
                      name="montoAbona" 
                      placeholder="¿Con cuánto vas a abonar? *" 
                      value={cliente.montoAbona} 
                      onChange={handleChange} 
                      className="w-full p-3 rounded-xl border outline-none transition-colors" 
                      style={{ backgroundColor: tema.colorTexto + '0A', borderColor: errores.montoAbona ? '#ef4444' : tema.colorTexto + '20' }} 
                    />
                    {errores.montoAbona && <p className="text-[#ef4444] text-[11px] mt-1 px-2 font-semibold">{errores.montoAbona}</p>}
                  </div>
                )}
              </div>

              {/* Notas (Sin validación) */}
              <textarea name="notas" placeholder="Aclaraciones..." value={cliente.notas} onChange={handleChange} rows="2" className="w-full mt-2 p-3 rounded-xl border outline-none resize-none" style={{ backgroundColor: tema.colorTexto + '0A', borderColor: tema.colorTexto + '20' }} />
            </div>
          </div>

          {/* SECCIÓN: Total y botón de pedido */}
          <div className="pt-4 border-t-2 flex justify-between items-center font-semibold text-2xl" style={{ borderColor: tema.colorTexto + '20' }}>
            <span>Total</span>
            <span style={{ color: tema.colorPrimario, fontFamily: "Poppins" }}>${totalDinero}</span>
          </div>

          <button onClick={procesarPedido} className="w-full mt-6 py-3.5 rounded-xl font-bold text-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer" style={{ backgroundColor: "#1BA64A", color: "#ffffff" }}>
            Pedir por WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}

export default CarritoModal;