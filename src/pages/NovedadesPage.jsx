import AdminLayout from "../components/AdminLayout";

function NovedadesPage() {
  const COLOR_PRIMARIO = "#F1A139"; 

  const actualizaciones = [
    {
      fecha: "Abril 2026",
      version: "v1.2.0",
      titulo: "Gestión de Pagos y Códigos QR",
      descripcion: "Esta actualización trae herramientas clave para agilizar tu operatoria diaria y facilitar la forma en que compartís tu menú.",
      novedades: [
        {
          tipo: "NUEVO",
          texto: "Métodos de Pago: Ahora tus clientes pueden elegir pagar en Efectivo o Transferencia al finalizar el pedido. Si eligen Efectivo, pueden indicar con cuánto abonan."
        },
        {
          tipo: "MEJORA",
          texto: "Ticket de Impresión Inteligente: El ticket ahora muestra el método de pago elegido y calcula automáticamente el vuelto, agilizando el trabajo de tu cajero."
        },
        {
          tipo: "NUEVO",
          texto: "Sección Link / QR: Agregamos un acceso directo en tu menú lateral. Ahora podés descargar tu código QR para imprimir o copiar tu link en un solo clic."
        },
        {
          tipo: "MEJORA",
          texto: "Firma Digital: Agregamos 'Desarrollado por PediAlgo' al final de tu carta para darle más respaldo y profesionalismo a tu menú."
        }
      ]
    },
    {
      fecha: "Marzo 2026",
      version: "v1.0.0",
      titulo: "Lanzamiento Oficial de PediAlgo",
      descripcion: "¡Bienvenido a PediAlgo! La plataforma diseñada para que los locales gastronómicos vendan más sin pagar comisiones.",
      novedades: [
        {
          tipo: "LANZAMIENTO",
          texto: "Creación de Menú Digital interactivo y personalizable."
        },
        {
          tipo: "LANZAMIENTO",
          texto: "Recepción de pedidos organizados directamente a WhatsApp."
        },
        {
          tipo: "LANZAMIENTO",
          texto: "Monitor de Cocina (Dashboard) en tiempo real para gestionar estados de pedidos."
        }
      ]
    }
  ];

  const getColorPorTipo = (tipo) => {
    switch (tipo) {
      case "NUEVO": return "bg-orange-100 text-orange-700 border-orange-200";
      case "MEJORA": return "bg-amber-100 text-amber-700 border-amber-200";
      case "LANZAMIENTO": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* Cabecera */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2 flex items-center justify-center gap-3">
            <span style={{ color: COLOR_PRIMARIO }}>🚀</span> Novedades PediAlgo
          </h1>
          <p className="text-gray-500 font-medium">Descubrí las últimas herramientas y mejoras que sumamos para tu local.</p>
        </div>

        {/* Lista de Actualizaciones (Timeline) */}
        <div className="space-y-12">
          {actualizaciones.map((act, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{act.titulo}</h2>
                  <p className="text-sm text-gray-500 mt-1">{act.descripcion}</p>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{act.fecha}</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-gray-200 text-gray-600">{act.version}</span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {act.novedades.map((nov, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-start">
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border shrink-0 sm:w-28 text-center mt-0.5 ${getColorPorTipo(nov.tipo)}`}>
                        {nov.tipo}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {nov.texto}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}

export default NovedadesPage;