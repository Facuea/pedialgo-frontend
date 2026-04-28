import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PlanesPage() {
  const REGISTRO_URL = "/registro";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#EFA02B] selection:text-[#1A1A1A] relative flex flex-col justify-center items-center p-6">

      {/* Imagen de fondo (Delivery) AHORA SÍ ES VISIBLE */}
      <div 
        className="absolute inset-y-0 right-0 w-full md:w-3/5 opacity-40 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dca2psqfg/image/upload/v1777357719/ytd_b4is4z.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)"
        }}
      />

      {/* Logo PediAlgo original, grande y clickeable al inicio */}
      <a href="/" className="absolute top-6 left-6 lg:top-8 lg:left-10 z-20 cursor-pointer hover:scale-105 transition-transform">
        <img 
          src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
          alt="Volver al inicio" 
          className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-md"
        />
      </a>

      {/* Contenedor Principal */}
      <div className="max-w-5xl w-full text-center relative z-10 mt-24 lg:mt-0">
        
        <h1 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'FontPediAlgo' }}>
          Un solo plan, todo incluido.
        </h1>
        <p className="text-slate-600 mb-8 text-lg font-medium max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-full py-1 px-4 inline-block">
          Sin comisiones por venta, sin costos ocultos. Pagás solo una suscripción mensual fija.
        </p>

        {/* TARJETA HORIZONTAL (Más compacta, evita tener que hacer scroll) */}
        <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row text-left w-full">
          
          {/* Columna Izquierda: Precio (Roja) */}
          <div className="bg-[#E43D4E] p-8 md:p-10 md:w-1/3 flex flex-col justify-center items-center text-center relative">
            <div className="absolute top-0 right-0 md:left-0 md:right-auto bg-[#EFA02B] text-[10px] font-black px-4 py-1.5 rounded-bl-xl md:rounded-bl-none md:rounded-br-xl uppercase tracking-widest text-[#1A1A1A]">
              Única Opción
            </div>
            <h2 className="text-white text-3xl font-black mb-2 mt-4 md:mt-0" style={{ fontFamily: 'FontPediAlgo' }}>Plan Pro</h2>
            <div className="flex items-end justify-center gap-1 text-white mt-2">
              <span className="text-5xl lg:text-6xl font-black">$15.000</span>
            </div>
            <span className="text-white/80 font-bold text-lg mb-6">por mes</span>
            
            <p className="bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-sm w-full border border-white/10">
              Incluye prueba gratis de 7 días.
            </p>
          </div>

          {/* Columna Derecha: Beneficios y Botón */}
          <div className="p-6 md:p-10 md:w-2/3 bg-white flex flex-col justify-between">
            <div>
              <p className="font-black text-[#1A1A1A] mb-4 text-sm uppercase tracking-widest border-b border-slate-100 pb-2">
                Todo esto está incluido:
              </p>
              
              {/* Beneficios en 2 columnas para ahorrar espacio vertical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-8">
                {[
                  "Menú Digital 100% personalizable",
                  "Pedidos directos a WhatsApp",
                  "Monitor inteligente para cocina",
                  "Módulo de Control Financiero",
                  "Impresión de Tickets (80/58mm)",
                  "Código QR propio en alta calidad",
                  "Link para bio de Instagram",
                  "Sistema Multi-sucursal",
                  "Usuarios y permisos ilimitados",
                  "Edición de precios en tiempo real",
                  "Mapa interactivo integrado",
                  "Soporte técnico directo"
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#E43D4E] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700 text-[13px] leading-tight">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN SÓLIDO (Sin IA, limpio y directo) */}
            <div className="mt-auto">
              <a 
                href={REGISTRO_URL}
                className="w-full py-4 bg-[#EFA02B] hover:bg-[#e09425] text-[#1A1A1A] font-black text-lg rounded-xl transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 cursor-pointer text-center border-b-4 border-[#d18820]"
              >
                Crear mi cuenta gratis <ArrowRight className="w-5 h-5" />
              </a>
              <p className="text-center text-xs text-slate-500 font-bold mt-3">
                Podés iniciar ahora mismo. No te quitaremos nada de dinero para probar el servicio.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}