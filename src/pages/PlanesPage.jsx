import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function PlanesPage() {
  const REGISTRO_URL = "/registro";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#EFA02B] selection:text-[#1A1A1A] relative overflow-hidden flex flex-col">

      {/* Imagen de fondo (Delivery) difuminada hacia la izquierda */}
      <div 
        className="absolute inset-y-0 right-0 w-full lg:w-3/5 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dca2psqfg/image/upload/v1777357719/ytd_b4is4z.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)"
        }}
      />

      {/* Logo PediAlgo arriba a la derecha */}
      <img 
        src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
        alt="Logo PediAlgo" 
        className="absolute top-6 right-6 lg:top-10 lg:right-10 h-12 lg:h-16 w-auto opacity-20 object-contain z-0 pointer-events-none grayscale"
      />

      {/* Botón Volver */}
      <div className="p-6 max-w-5xl mx-auto w-full relative z-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#E43D4E] font-bold transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" /> Volver al inicio
        </a>
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 pt-2 pb-24 relative z-10 w-full">
        <h1 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'FontPediAlgo' }}>
          Un solo plan, todo incluido.
        </h1>
        <p className="text-slate-600 mb-10 text-lg font-medium">
          Sin comisiones por venta, sin costos ocultos. Pagás solo una suscripción mensual fija.
        </p>

        {/* TARJETA DE PRECIO (Estática, sin hover-lift) */}
        <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-left relative">
          
          {/* Cabecera Roja de PediAlgo */}
          <div className="bg-[#E43D4E] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#EFA02B] text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest text-[#1A1A1A]">
              Única Opción
            </div>
            <h2 className="text-white text-3xl font-black mb-2" style={{ fontFamily: 'FontPediAlgo' }}>Plan Pro</h2>
            <div className="flex items-end justify-center gap-1 text-white mt-4">
              <span className="text-6xl font-black">$15.000</span>
              <span className="text-white/80 font-bold pb-2 text-lg">/mes</span>
            </div>
            <p className="bg-white/20 text-white font-bold text-sm mt-6 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
              Incluye prueba gratis de 7 días.
            </p>
          </div>

          {/* Cuerpo con todos los beneficios */}
          <div className="p-8 md:p-10 relative bg-white">
            <p className="font-black text-[#1A1A1A] mb-6 text-sm uppercase tracking-widest border-b border-slate-100 pb-3">
              Todo esto está incluido:
            </p>
            
            <div className="space-y-4 mb-10 relative z-10">
              {[
                "Menú Digital 100% personalizable (colores, tipografía y logo).",
                "Pedidos ilimitados directos a WhatsApp (Sin comisiones por venta).",
                "Monitor inteligente para la cocina con alertas sonoras.",
                "Módulo de Control Financiero y cálculo de ganancia neta.",
                "Impresión de Tickets en caja (80mm) y portátiles (58mm).",
                "Código QR propio en alta calidad para mesas.",
                "Link personalizado para biografía de Instagram.",
                "Sistema Multi-sucursal para administrar varios locales.",
                "Creación de múltiples usuarios con permisos de empleado o admin.",
                "Edición de productos y precios en tiempo real 24/7.",
                "Mapa interactivo integrado para envíos y retiros.",
                "Soporte técnico directo y actualizaciones incluidas."
              ].map((benefit, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-700 text-sm leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            {/* BOTÓN DEPOSITANDO COLORES DE MARCA */}
            <a 
              href={REGISTRO_URL}
              className="w-full py-4 bg-linear-to-r from-[#E43D4E] to-[#EFA02B] hover:opacity-90 text-white font-black text-lg rounded-2xl transition-all active:scale-95 shadow-xl  justify-center items-center gap-2 cursor-pointer block text-center relative z-10"
            >
              Crear mi cuenta gratis <ArrowRight className="w-5 h-5" />
            </a>
            
            {/* TEXTO DE CONFIANZA */}
            <p className="text-center text-xs text-slate-500 font-bold mt-4 relative z-10">
              Podés iniciar ahora mismo. No te cobraremos absolutamente nada para probar el servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}