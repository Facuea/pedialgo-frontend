function TicketImpresion({ pedido, nombreLocal }) {
  // SECCIÓN: Verificación de datos
  if (!pedido) return null;

  return (
    <div className="hidden print:block font-mono text-black w-75 mx-auto p-4 bg-white text-sm">
      
      {/* SECCIÓN: Cabecera del ticket */}
      <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
        <h2 className="text-2xl font-bold uppercase">{nombreLocal}</h2>
        <p className="mt-1">TICKET DE PEDIDO</p>
        <p className="text-xl font-bold mt-2">N° {pedido.id}</p>
        <p>{pedido.fecha.split("T")[0]} {pedido.fecha.split("T")[1].substring(0,5)} hs</p>
      </div>

      {/* SECCIÓN: Datos del cliente */}
      <div className="border-b-2 border-dashed border-black pb-4 mb-4">
        <p><span className="font-bold">Cliente:</span> {pedido.nombreCliente}</p>
        <p><span className="font-bold">Tel:</span> {pedido.telefono}</p>
        <p><span className="font-bold">Tipo:</span> {pedido.direccion && pedido.direccion !== "Retiro en local" ? "Delivery" : "Retiro en Local"}</p>
        {pedido.direccion && pedido.direccion !== "Retiro en local" && (
          <p><span className="font-bold">Dir:</span> {pedido.direccion}</p>
        )}
      </div>

      {/* SECCIÓN: Detalle de productos */}
      <div className="border-b-2 border-dashed border-black pb-4 mb-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="py-1 w-8">Cant</th>
              <th className="py-1">Producto</th>
              <th className="py-1 text-right">SubT</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map(item => (
              <tr key={item.id}>
                <td className="py-2 align-top">{item.cantidad}</td>
                <td className="py-2 pr-2">{item.productoNombre}</td>
                <td className="py-2 text-right align-top">${item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN: Totales y Pago */}
      <div className="space-y-1">
        <div className="text-right">
          <p className="text-xl font-bold">TOTAL: ${pedido.total}</p>
        </div>

        {pedido.metodoPago && (
          <div className="border-t border-black pt-2 mt-2">
            <p className="font-bold uppercase">Pago: {pedido.metodoPago}</p>
            {pedido.metodoPago.toLowerCase() === 'efectivo' && pedido.montoAbona && (
              <div className="text-right">
                <p>Abona con: ${pedido.montoAbona}</p>
                <p className="font-bold">Vuelto: ${pedido.montoAbona - pedido.total}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* SECCIÓN: Footer del ticket */}
      <div className="text-center mt-8 text-xs">
        <p>¡Gracias por tu compra!</p>
        <p className="mt-1">Generado por PediAlgo</p>
      </div>
    </div>
  );
}

export default TicketImpresion;