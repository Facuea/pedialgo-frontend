import { Lock, Phone, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SuscripcionVencidaPage({ localActivo }) {
  const navigate = useNavigate();

  // WhatsApp de soporte/ventas de PediAlgo (Cambialo por el tuyo)
  const NUMERO_WHATSAPP = "5493585148782"; 
  const mensajeBase = `Hola PediAlgo! Mi local *${localActivo?.nombre || "Mi Local"}* superó los 7 días de prueba y quiero abonar la suscripción para reactivarlo.`;
  const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensajeBase)}`;

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("localActivo");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#EFA02B] selection:text-white relative overflow-hidden">
      
      {/* Fondo sutil */}
      <div 
        className="absolute inset-y-0 w-full opacity-20 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dca2psqfg/image/upload/v1777357719/ytd_b4is4z.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
          maskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)"
        }}
      />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white p-8 sm:p-10 shadow-2xl rounded-[2.5rem] border border-slate-200 text-center relative overflow-hidden">
          
          {/* Barra roja arriba */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#E43D4E]"></div>

          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 border border-red-100">
            <Lock className="h-10 w-10 text-[#E43D4E]" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'FontPediAlgo' }}>
            Acceso Suspendido
          </h2>
          
          <p className="text-slate-500 font-medium text-sm mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            El período de prueba de <strong className="text-slate-800">{localActivo?.nombre}</strong> ha finalizado. Para seguir recibiendo pedidos sin límites, debes activar el <strong>Plan Pro</strong>.
          </p>

          <div className="space-y-4">
            <a 
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-2 py-4 border-b-4 border-[#d18820] rounded-xl shadow-md text-base font-black text-white bg-[#EFA02B] hover:bg-[#e09425] active:translate-y-1 active:border-b-0 transition-all focus:outline-none cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              Contactar para abonar
            </a>

            <button 
              onClick={handleLogout}
              className="w-full flex justify-center items-center gap-2 py-4 border-b-4 border-slate-200 rounded-xl shadow-sm text-base font-black text-slate-600 bg-white hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all focus:outline-none cursor-pointer border "
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}