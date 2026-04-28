import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function PlanesPage() {
  const REGISTRO_URL = "/registro";

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#EFA02B] selection:text-[#1A1A1A]">
      {/* Botón Volver */}
      <div className="p-6 max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" /> Volver al inicio
        </a>
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 pt-4 pb-24">
        <h1 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'FontPediAlgo' }}>
          Un solo plan, todo incluido.
        </h1>
        <p className="text-slate-600 mb-12 text-lg font-medium">
          Sin comisiones por venta, sin costos ocultos. Pagás solo una suscripción mensual fija.
        </p>

        {/* TARJETA DE PRECIO */}
        <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden text-left transform transition-all hover:-translate-y-2">
          
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
            <p className="bg-white/20 text-white font-bold text-sm mt-6 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
              Incluye prueba gratis de 7 días.
            </p>
          </div>

          {/* Cuerpo con todos los beneficios */}
          <div className="p-8 md:p-10">
            <p className="font-black text-[#1A1A1A] mb-6 text-sm uppercase tracking-widest border-b border-slate-100 pb-3">
              Todo esto está incluido:
            </p>
            
            <div className="space-y-4 mb-10">
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

            <a 
              href={REGISTRO_URL}
              className="w-full py-4 bg-[#1A1A1A] hover:bg-slate-800 text-[#EFA02B] font-black text-lg rounded-2xl transition-all active:scale-95 shadow-xl  justify-center items-center gap-2 cursor-pointer block text-center"
            >
              Crear mi cuenta gratis <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-center text-xs text-slate-400 font-medium mt-4">
              Cero riesgo. No te pedimos tarjeta de crédito para la prueba.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}