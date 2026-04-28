import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function PlanesPage() {
  const WHATSAPP_NUMBER = "5493585148782";

  const handleWhatsApp = (mensaje) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#EFA02B] selection:text-[#1A1A1A]">
      {/* Botón Volver */}
      <div className="p-6">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver al inicio
        </a>
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 pt-12 pb-24">
        <h1 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight">Un solo plan, todo incluido.</h1>
        <p className="text-slate-600 mb-12 text-lg font-medium">Sin comisiones por venta, sin costos ocultos. Pagás solo una suscripción mensual fija.</p>

        {/* TARJETA DE PRECIO */}
        <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left transform transition-all hover:-translate-y-2">
          
          {/* Cabecera */}
          <div className="bg-[#1A1A1A] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#EFA02B] text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest text-[#1A1A1A]">
              Única Opción
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Plan Pro</h2>
            <div className="flex items-end justify-center gap-1 text-white">
              <span className="text-5xl font-black">$15.000</span>
              <span className="text-slate-400 font-medium pb-1">/mes</span>
            </div>
            <p className="text-slate-400 text-sm mt-3 font-medium">Incluye prueba gratis de 7 días.</p>
          </div>

          {/* Cuerpo */}
          <div className="p-8">
            <p className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Todo esto incluye:</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Menú Digital 100% personalizable</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Pedidos directos a WhatsApp (Sin comisión)</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Monitor inteligente para la cocina</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Control Financiero y métricas</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Impresión de Tickets (80mm y 58mm)</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Código QR propio y Link</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Usuarios ilimitados para empleados</span></div>
              <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" /><span className="font-semibold text-slate-700 text-sm leading-relaxed">Soporte técnico directo</span></div>
            </div>

            <button 
              onClick={() => handleWhatsApp("¡Hola! Quiero aprovechar la prueba gratis de 7 días del Plan Pro para mi local.")}
              className="w-full py-4 bg-[#EFA02B] hover:bg-[#f5aa39] text-[#1A1A1A] font-black text-lg rounded-2xl transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 cursor-pointer"
            >
              Crear cuenta y Empezar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}