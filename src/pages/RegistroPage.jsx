import { useState } from "react";
import { ArrowLeft, Store, Mail, User, Phone, Lock, Hash, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegistroPage() {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    documento: "",
    email: "",
    password: "",
    nombreLocal: "",
    whatsappLocal: ""
  });

  const [codigoVerificacion, setCodigoVerificacion] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleIniciarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/public/registro/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar el registro.");
      }

      setPaso(2);
      setMensajeExito("Te enviamos un código de 6 dígitos a tu correo.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_URL}/public/registro/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          codigo: codigoVerificacion
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código incorrecto.");
      }

      // ÉXITO: Mensaje personalizado y redirección en 3 segundos
      setMensajeExito("¡Cuenta creada exitosamente! Debes iniciar sesión para comenzar.");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#EFA02B] selection:text-white relative overflow-hidden">
      
      {/* Fondo Delivery (Igual que en Planes) */}
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center relative z-10">
        <a href="/planes" className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#E43D4E] font-bold transition-colors flex items-center gap-2 text-sm z-10 cursor-pointer">
          <ArrowLeft className="w-5 h-5" /> Volver
        </a>
        
        {/* LOGO GIGANTE Y CLICKEABLE */}
        <a href="/" className="cursor-pointer hover:scale-105 transition-transform">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
            alt="PediAlgo" 
            className="h-24 md:h-28 w-auto object-contain drop-shadow-md"
          />
        </a>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white py-10 px-6 sm:px-12 shadow-2xl rounded-[2.5rem] border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#E43D4E]"></div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          {mensajeExito && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-bold text-center animate-pulse">
              {mensajeExito}
            </div>
          )}

          {paso === 1 && (
            <>
              <h2 className="text-3xl font-black text-slate-900 text-center mb-2" style={{ fontFamily: 'FontPediAlgo' }}>
                Crear cuenta gratis
              </h2>
              <p className="text-center text-slate-500 text-sm font-medium mb-8">
                Comenzá tus 7 días de prueba. <br className="md:hidden" />No te quitaremos nada de dinero.
              </p>

              <form onSubmit={handleIniciarRegistro} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Local</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Store className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="nombreLocal" value={formData.nombreLocal} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: Burger House" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp de Pedidos</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-400" /></div>
                      <input required type="tel" name="whatsappLocal" value={formData.whatsappLocal} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: +549351234567" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-2"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre y Apellido</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: Juan Pérez" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">DNI</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="documento" value={formData.documento} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Sin puntos" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="tu@correo.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={cargando} className="w-full flex justify-center items-center gap-2 py-4 border-b-4 border-[#d18820] rounded-xl shadow-md text-lg font-black text-white bg-[#EFA02B] hover:bg-[#e09425] active:translate-y-1 active:border-b-0 transition-all focus:outline-none disabled:opacity-50 mt-6 cursor-pointer">
                  {cargando ? <><Loader2 className="animate-spin h-5 w-5" /> Procesando...</> : "Siguiente Paso"}
                </button>
              </form>
            </>
          )}

          {paso === 2 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 border border-red-100">
                <Mail className="h-10 w-10 text-[#E43D4E]" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 text-center mb-2" style={{ fontFamily: 'FontPediAlgo' }}>
                Revisá tu correo
              </h2>
              <p className="text-center text-slate-500 text-sm font-medium mb-8">
                Te enviamos un código de 6 dígitos a <br/><strong className="text-slate-800 text-base">{formData.email}</strong>
              </p>

              <form onSubmit={handleVerificarCodigo} className="space-y-6">
                <div>
                  <label className="block text-center text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Ingresá el código acá</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={6}
                    value={codigoVerificacion} 
                    onChange={(e) => {
                      setCodigoVerificacion(e.target.value);
                      setError("");
                    }} 
                    className="w-full text-center text-4xl tracking-[0.5em] font-mono py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#E43D4E] focus:ring-2 focus:ring-[#E43D4E] bg-slate-50 focus:bg-white transition-all uppercase" 
                    placeholder="------" 
                  />
                </div>

                <button type="submit" disabled={cargando || codigoVerificacion.length < 6} className="w-full flex justify-center items-center gap-2 py-4 border-b-4 border-[#c93442] rounded-xl shadow-md text-lg font-black text-white bg-[#E43D4E] hover:bg-[#d63544] active:translate-y-1 active:border-b-0 transition-all focus:outline-none disabled:opacity-50 cursor-pointer">
                  {cargando ? <><Loader2 className="animate-spin h-5 w-5" /> Verificando...</> : "Activar mi cuenta"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <button onClick={() => {setPaso(1); setCodigoVerificacion("");}} className="text-sm font-bold text-slate-500 hover:text-[#E43D4E] transition-colors cursor-pointer">
                  ¿Escribiste mal el correo? Volver atrás
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}