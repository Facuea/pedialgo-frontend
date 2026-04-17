import { useState, useEffect } from "react";
import { 
  Smartphone, 
  ChefHat, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Store,
  LineChart, // Icono para Finanzas
  QrCode     // Icono para QR
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sugerencia, setSugerencia] = useState("");

  const WHATSAPP_NUMBER = "5493585148782";
  const WHATSAPP_MSG = encodeURIComponent("¡Hola! Me interesa probar el servicio gratuito de PediAlgo por 7 días.");
  const DEMO_URL = "https://www.pedialgoar.com/burger-house";
  const LOGIN_URL = "https://www.pedialgoar.com/login";
  const EMAIL_CONTACTO = "pedialgo@gmail.com";

  const handleWhatsApp = (mensaje) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleViewDemo = () => {
    window.open(DEMO_URL, '_blank');
  };

  const handleLogin = () => {
    setTimeout(() => {
      window.location.href = LOGIN_URL;
    }, 150);
  };

  const handleEnviarSugerencia = (e) => {
    e.preventDefault();
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_CONTACTO}&su=Sugerencia%20PediAlgo&body=${encodeURIComponent(sugerencia)}`;
    window.open(gmailLink, '_blank');
    setSugerencia("");
  };

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#FAFAFA] text-slate-800 selection:bg-[#EFA02B]/30 selection:text-[#1A1A1A]">
      
      <div className="bg-[#EFBF04]/60 pt-4 pb-16 px-6 lg:px-8 rounded-b-[2.5rem] shadow-md relative">
        <nav className="max-w-6xl mx-auto flex items-center justify-between mb-12 relative z-20">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1776215308/LOGO12_smw0lx.png" 
            alt="PediAlgo" 
            className="h-8 md:h-9 cursor-pointer"
          />
          
          <div className="hidden md:flex gap-8 items-center text-sm font-bold text-[#1A1A1A]">
            <button onClick={() => scrollToSection('menu-digital')} className="hover:text-white transition-colors">Menú Digital</button>
            <button onClick={() => scrollToSection('whatsapp')} className="hover:text-white transition-colors">WhatsApp</button>
            <button onClick={() => scrollToSection('monitor')} className="hover:text-white transition-colors">Monitor</button>
            <button onClick={() => scrollToSection('contacto')} className="hover:text-white transition-colors">Contacto</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={handleLogin} 
              className="text-sm font-bold text-[#1A1A1A] bg-white px-5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => handleWhatsApp("¡Hola! Me interesa probar el servicio gratuito de PediAlgo por 7 días.")}
              className="px-5 py-2 bg-[#E43D4E] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#c93442] hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Prueba Gratis
            </button>
          </div>

          <button className="md:hidden text-[#1A1A1A] p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-6 right-6 bg-white rounded-2xl shadow-2xl z-50 p-6 flex flex-col gap-4 border border-slate-100 animate-in slide-in-from-top-4">
            <button onClick={() => scrollToSection('menu-digital')} className="text-left font-bold text-slate-700 pb-3 border-b border-slate-100">Menú Digital</button>
            <button onClick={() => scrollToSection('whatsapp')} className="text-left font-bold text-slate-700 pb-3 border-b border-slate-100">WhatsApp</button>
            <button onClick={() => scrollToSection('monitor')} className="text-left font-bold text-slate-700 pb-3 border-b border-slate-100">Monitor en Vivo</button>
            <button onClick={() => scrollToSection('contacto')} className="text-left font-bold text-slate-700 pb-3 border-b border-slate-100">Contacto</button>
            <button onClick={handleLogin} className="text-left font-bold text-[#1A1A1A] pt-2 border-t border-slate-100">Iniciar Sesión</button>
            <button onClick={() => handleWhatsApp("¡Hola! Me interesa probar el servicio gratuito de PediAlgo por 7 días.")} className="w-full py-3 mt-2 bg-[#E43D4E] text-white font-bold rounded-xl text-center">
              Prueba 7 días Gratis
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative z-10">
          <div className="text-left">
            <h1 
              className="font-pedialgo text-4xl lg:text-6xl text-white leading-tight mb-5 tracking-tight"
              style={{ fontFamily: 'FontPediAlgo' }}
            >
              Vendé más.<br />
              <span className="text-[#E43D4E]">Sin Comisiones.</span>
            </h1>
            <p className="text-[#1A1A1A] text-base lg:text-lg font-medium leading-relaxed mb-8 max-w-md opacity-90">
              Digitalizá tu carta en minutos, recibí pedidos directo a tu WhatsApp y gestioná tu cocina sin enredos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-start">
              <button 
                onClick={() => handleWhatsApp("¡Hola! Vengo de la web y quiero crear mi cuenta gratis por 7 días.")}
                className="px-6 py-3.5 bg-[#E43D4E] text-white font-bold text-sm rounded-xl hover:bg-[#d63544] active:scale-95 transition-all flex items-center justify-center gap-2 group w-fit"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleViewDemo}
                className="px-6 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm rounded-xl hover:bg-[#1A1A1A] hover:text-[#EFA02B] active:scale-95 transition-all w-fit text-center"
              >
                Ver Demo
              </button>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0 px-4 lg:px-0">
            <img 
              src="https://res.cloudinary.com/dca2psqfg/image/upload/v1776215049/muestra2_fe20jj.png" 
              alt="Muestra Menú PediAlgo" 
              className="w-full max-w-md mx-auto h-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>
      </div>

      <section id="menu-digital" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-1">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
              <Smartphone className="w-6 h-6 text-[#EFA02B]" />
            </div>
            <h2 className="font-pedialgo text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'FontPediAlgo' }}>Tu carta, Tu estilo.</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Personalizá colores, logos y fotos para que el menú sea único. Actualizá productos al instante sin gastar un peso más en imprenta.
            </p>
            
            <div className="space-y-4 mb-8">
              <BenefitItem text="Edición en tiempo real." />
              <BenefitItem text="Se adapta a cualquier dispositivo." />
              <BenefitItem text="Links limpios con tu propio nombre." />
              <BenefitItem text="Incorpora Redes y Mapa interactivo." />
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  Diseño a medida
                </h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                  Si buscás que tu menú tenga una identidad visual completamente exclusiva, ofrecemos un servicio de desarrollo premium personalizado.
                </p>
                <button 
                  onClick={() => handleWhatsApp("Hola, me gustaría consultar por el servicio de diseño de menú personalizado.")}
                  className="text-sm font-bold text-[#EFA02B] hover:text-[#d48c22] flex items-center gap-1 transition-colors"
                >
                  Consultar precios <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#EFA02B]" /> ¿Tenés varias sucursales?
                </h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                  El sistema te permite gestionar diferentes ubicaciones. Tus clientes pueden saltar de un local a otro rápidamente.
                </p>
                <div className="flex flex-col gap-3">
                  <a href="https://www.pedialgoar.com/burger-house" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#E43D4E] hover:text-[#c93442] transition-colors">
                    <ArrowRight className="w-4 h-4" /> pedialgoar.com/burger-house
                  </a>
                  <a href="https://www.pedialgoar.com/burger-house-sur" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#E43D4E] hover:text-[#c93442] transition-colors">
                    <ArrowRight className="w-4 h-4" /> pedialgoar.com/burger-house-sur
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-2 flex justify-center lg:justify-end">
            <BlurredImageSlider image1="/persCart1.PNG" image2="/persCart2.PNG" />
          </div>
        </div>
      </section>

      <section id="whatsapp" className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-1 lg:order-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="font-pedialgo text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'FontPediAlgo' }}>Directo al WhatsApp.</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Tus clientes eligen, el sistema calcula el total y te envía un mensaje ordenado a tu WhatsApp. Sin aplicaciones puente ni comisiones por venta.
            </p>
            <div className="space-y-4 mb-8">
              <BenefitItem text="El 100% de la ganancia es tuya." />
              <BenefitItem text="Detalle claro de extras y formas de pago." />
              <BenefitItem text="Comunicación entre cliente y local." />
              <BenefitItem text="Eficiencia y fluidez." />
            </div>
            <button 
              onClick={() => handleWhatsApp("Hola, quiero saber cómo funciona la integración de pedidos por WhatsApp.")}
              className="px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-500 active:scale-95 transition-all w-fit"
            >
              Pedir más información
            </button>
          </div>

          <div className="order-2 lg:order-1 flex justify-center lg:justify-start mt-10 lg:mt-0">
            <div className="relative w-full max-w-65 lg:max-w-75 aspect-1169/2421 rounded-4xl overflow-hidden shadow-xl border-[6px] border-slate-900 bg-white">
              <img src="/msgWsp.png" alt="WhatsApp" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="monitor" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-1">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-5">
              <ChefHat className="w-6 h-6 text-[#E43D4E]" />
            </div>
            <h2 className="font-pedialgo text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'FontPediAlgo' }}>Orden en la cocina.</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Un panel de control ágil. Cambiá los estados de los pedidos con un clic, revisá tus métricas y mantené a todos organizados.
            </p>
            <div className="space-y-4 mb-8">
              <BenefitItem text="Actualización de pedidos en tiempo real." />
              <BenefitItem text="Notificaciones audibles (suena la campana)." />
              <BenefitItem text="Mail automático al cliente por cada cambio de estado." />
            </div>
            <button 
              onClick={() => handleWhatsApp("Hola, me interesa saber más sobre el monitor de control para la cocina.")}
              className="px-6 py-3 border-2 border-slate-800 text-slate-800 font-bold text-sm rounded-xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all w-fit"
            >
              Consultar sobre esta función
            </button>
          </div>

          <div className="order-2 relative w-full flex items-center justify-center mt-6 lg:mt-0 px-4 sm:px-8">
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border-[6px] border-slate-800 bg-slate-800 flex flex-col">
               <div className="w-full h-6 bg-slate-900 flex items-center px-3 gap-1.5 shrink-0">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
               </div>
               <img src="/foto-monitor.png" alt="Monitor" className="w-full h-auto block" />
            </div>
            <div className="absolute -bottom-6 -right-2 lg:-right-6 w-[35%] min-w-32.5 max-w-45 aspect-720/1342 rounded-3xl overflow-hidden shadow-[0_20px_25px_rgba(0,0,0,0.5)] border-[5px] border-slate-900 bg-slate-900 z-20 flex">
              <video src="/video-cocina.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* --- NUEVA SECCIÓN: CONTROL FINANCIERO --- */}
      <section className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-1 lg:order-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
              <LineChart className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="font-pedialgo text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'FontPediAlgo' }}>Números claros.</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Sabé exactamente cuánta plata entró y cuánta salió. Llevá un registro diario de tus compras e insumos para conocer la ganancia neta real de tu local al instante.
            </p>
            <div className="space-y-4 mb-8">
              <BenefitItem text="Registro rápido de salidas de dinero." />
              <BenefitItem text="Cálculo automático de ganancia neta." />
              <BenefitItem text="Ticket promedio y ranking de productos más vendidos." />
            </div>
            <button 
              onClick={() => handleWhatsApp("Hola, me interesa probar las herramientas financieras de PediAlgo.")}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              Probar funciones gratis <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="order-2 lg:order-1 flex justify-center lg:justify-start mt-10 lg:mt-0">
            {/* Espacio reservado para que luego pongas una captura de la pantalla de Finanzas */}
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50 flex items-center justify-center aspect-video">
              <p className="text-slate-400 font-medium">Aquí irá la imagen de Finanzas/Gastos</p>
              {/* <img src="/tu-imagen-finanzas.png" alt="Control Financiero" className="w-full h-full object-cover" /> */}
            </div>
          </div>
        </div>
      </section>
      {/* -------------------------------------- */}

      {/* --- NUEVA SECCIÓN: QR Y LINKS --- */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="font-pedialgo text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'FontPediAlgo' }}>Compartí tu carta en un clic.</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Descargá tu código QR listo para imprimir y pegarlo en tus mesas, o copiá tu link directo para sumarlo a tu biografía de Instagram y enviar por WhatsApp.
            </p>
            <div className="space-y-4 mb-8">
              <BenefitItem text="Código QR descargable en alta calidad." />
              <BenefitItem text="Enlace corto y profesional." />
              <BenefitItem text="Accesible en el panel lateral 24/7." />
            </div>
            <button 
              onClick={() => handleWhatsApp("¡Hola! Quiero armar mi QR y mi link con PediAlgo.")}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Crear mi menú digital <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="order-2 flex justify-center lg:justify-end mt-10 lg:mt-0">
             {/* Espacio reservado para que luego pongas la captura del QR */}
             <div className="relative w-full max-w-xs rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-white flex items-center justify-center aspect-3/4">
              <p className="text-slate-400 font-medium px-6 text-center">Aquí irá la imagen del panel QR</p>
              {/* <img src="/tu-imagen-qr.png" alt="Código QR" className="w-full h-full object-cover" /> */}
            </div>
          </div>
        </div>
      </section>
      {/* -------------------------------------- */}

      <section id="contacto" className="py-24 px-6 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-pedialgo text-4xl lg:text-5xl mb-6" style={{ fontFamily: 'FontPediAlgo' }}>Contacto</h2>
          <p className="text-slate-400 mb-10 text-lg font-medium">Explorá nuestras redes.</p>
          
          <div className="flex justify-center gap-8 mb-20">
            {/* ICONOS DE REDES SOCIALES LIMPIOS Y GRISES */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quiero sumar mi local a PediAlgo.')}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#25D366] transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            
            <a href="https://www.instagram.com/pedialgoar/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            
            <a href="https://www.facebook.com/profile.php?id=61573635060258" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_CONTACTO}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-all hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>

          <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold mb-4">¿Tenés alguna sugerencia?</h3>
            <p className="text-slate-400 text-sm mb-6">Tu opinión nos ayuda a seguir mejorando el servicio.</p>
            <form onSubmit={handleEnviarSugerencia} className="flex flex-col gap-4">
              <textarea 
                value={sugerencia}
                onChange={(e) => setSugerencia(e.target.value)}
                placeholder="Escribí tu mensaje acá..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#EFA02B] min-h-30 transition-colors"
                required
              />
              <button 
                type="submit"
                className="w-full py-4 bg-[#EFA02B] text-[#1A1A1A] font-black rounded-2xl hover:bg-[#f5aa39] transition-all active:scale-95"
              >
                ENVIAR SUGERENCIA
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] pt-20 pb-10 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
            alt="PediAlgo" 
            className="h-24 w-auto grayscale opacity-40 hover:grayscale-0 transition-all duration-700"
          />
          <div className="pt-10 border-t border-white/5 w-full text-center">
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} PediAlgo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex gap-3 items-start">
      <CheckCircle2 className="w-5 h-5 text-[#EFA02B] shrink-0 mt-0.5" />
      <span className="font-semibold text-slate-700 text-sm leading-relaxed">{text}</span>
    </div>
  );
}

function BlurredImageSlider({ image1, image2 }) {
  const [showFirst, setShowFirst] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => { setShowFirst((prev) => !prev); }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full max-w-70 lg:max-w-[320px] mx-auto aspect-1170/2327 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-900 bg-slate-100">
      <img src={image1} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${showFirst ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`} />
      <img src={image2} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${!showFirst ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`} />
    </div>
  );
}