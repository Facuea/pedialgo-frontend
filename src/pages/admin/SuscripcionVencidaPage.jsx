import { Lock, Phone, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPrivado } from "../../services/apiConfig";

export default function SuscripcionVencidaPage({ localActivo }) {
  const navigate = useNavigate();
  const [cargandoMp, setCargandoMp] = useState(false);

  // Logo oficial proporcionado
  const LOGO_MP = "https://res.cloudinary.com/dca2psqfg/image/upload/v1778007929/Logotipo_de_Mercado_Pago_blanco_vertical_jge6wj.webp";

  // WhatsApp de soporte
  const NUMERO_WHATSAPP = "5493585148782"; 
  const mensajeBase = `Hola PediAlgo! Mi local *${localActivo?.nombre || "Mi Local"}* superó los 7 días de prueba y quiero abonar la suscripción para reactivarlo.`;
  const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensajeBase)}`;

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("localActivo");
    navigate("/login");
  };

  const handlePagarConMercadoPago = async () => {
    setCargandoMp(true);
    try {
      // Generación de preferencia de pago
      const response = await fetchPrivado(`/admin/pagos/suscripcion/crear-preferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localId: localActivo.id })
      });
      
      const data = await response.json();

      if (data.initPoint) {
        window.location.href = data.initPoint; 
      } else {
        alert("Error al generar el link de pago.");
      }
    } catch (error) {
      console.error("Error Mercado Pago:", error);
      alert("Hubo un problema al conectar con Mercado Pago.");
    } finally {
      setCargandoMp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#009EE3] selection:text-white relative overflow-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        .font-mp { font-family: 'Montserrat', sans-serif; }
      `}</style>

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
        <div className="bg-white p-8 sm:p-10 shadow-2xl rounded-[2.5rem] border border-slate-200 text-center relative overflow-hidden mb-6">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-[#E43D4E]"></div>

          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 border border-red-100">
            <Lock className="h-10 w-10 text-[#E43D4E]" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Acceso Suspendido
          </h2>
          
          <p className="text-slate-500 font-medium text-sm mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            El período de prueba de <strong className="text-slate-800">{localActivo?.nombre}</strong> ha finalizado. Para seguir recibiendo pedidos sin límites, debés abonar la suscripción.
          </p>

          <div className="space-y-4">
            
            {/* BOTÓN CON LOGO OFICIAL */}
            <button 
              onClick={handlePagarConMercadoPago}
              disabled={cargandoMp}
              className="w-full flex justify-center items-center gap-3 py-4 border-b-4 border-[#007ebe] rounded-2xl shadow-lg text-base font-bold text-white bg-[#009EE3] hover:bg-[#008bd6] active:translate-y-1 active:border-b-0 transition-all focus:outline-none cursor-pointer disabled:opacity-70 font-mp"
            >
              {cargandoMp ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <img src={LOGO_MP} alt="Mercado Pago" className="h-8 w-auto" />
              )}
              Pagar con Mercado Pago
            </button>

            {/* OPCIÓN TRANSFERENCIA */}
            <a 
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-2 py-4 border-b-4 border-[#d18820] rounded-2xl shadow-md text-base font-bold text-white bg-[#EFA02B] hover:bg-[#e09425] active:translate-y-1 active:border-b-0 transition-all focus:outline-none cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              Transferencia / Efectivo
            </a>

            <button 
              onClick={handleLogout}
              className="w-full flex justify-center items-center gap-2 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mt-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* PIE DE SEGURIDAD PROFESIONAL */}
        <div className="flex flex-col items-center gap-3 px-6 animate-fade-in">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Pago 100% Protegido</span>
          </div>
          <p className="text-[12px] text-slate-400 leading-relaxed text-center font-medium">
            Tu suscripción está procesada de forma directa por la tecnología de **Mercado Pago**. No almacenamos tus datos bancarios ni de tarjetas. Tu transacción es segura, rápida y transparente.
          </p>
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
            alt="Logo PediAlgo sutil" 
            className="h-8 opacity-20 grayscale mt-2"
          />
        </div>

      </div>
    </div>
  );
}