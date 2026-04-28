import { useState } from "react";
import { ArrowLeft, Store, Mail, User, Phone, Lock, Hash } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegistroPage() {
  // Manejo de pantallas: 1 = Formulario, 2 = Código de Verificación
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
    setError(""); // Limpiamos errores al escribir
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

      // Si todo sale bien, pasamos al paso 2
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

      // Éxito total: los mandamos al login para que entren
      setMensajeExito("¡Cuenta activada! Redirigiendo al panel...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#EFA02B] selection:text-white">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex justify-between items-center relative">
        <a href="/planes" className="text-slate-500 hover:text-slate-800 font-bold transition-colors flex items-center gap-2 text-sm absolute -left-10">
          <ArrowLeft className="w-5 h-5" /> Volver
        </a>
        <div className="flex items-center gap-2 mx-auto">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
            <Store className="text-[#EFA02B] w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-[#1A1A1A]">PediAlgo</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 sm:px-12 shadow-2xl rounded-4xl border border-slate-100 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-[#EFA02B]"></div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          {mensajeExito && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-bold text-center">
              {mensajeExito}
            </div>
          )}

          {paso === 1 && (
            <>
              <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Crear cuenta gratis</h2>
              <p className="text-center text-slate-500 text-sm font-medium mb-8">Comenzá tus 7 días de prueba. Sin tarjeta de crédito.</p>

              <form onSubmit={handleIniciarRegistro} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nombre del Local */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Local</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Store className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="nombreLocal" value={formData.nombreLocal} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: Burger House" />
                    </div>
                  </div>

                  {/* WhatsApp */}
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
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tu Nombre y Apellido</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: Juan Pérez" />
                    </div>
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tu DNI</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                      <input required type="text" name="documento" value={formData.documento} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="Sin puntos" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="tu@correo.com" />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EFA02B] focus:ring-1 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-colors" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={cargando} className="w-full flex justify-center py-4 border border-transparent rounded-2xl shadow-sm text-sm font-black text-[#1A1A1A] bg-[#EFA02B] hover:bg-[#f5aa39] active:scale-95 transition-all focus:outline-none disabled:opacity-50 mt-4 cursor-pointer">
                  {cargando ? "Procesando..." : "Siguiente Paso"}
                </button>
              </form>
            </>
          )}

          {paso === 2 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
                <Mail className="h-8 w-8 text-[#EFA02B]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Revisá tu correo</h2>
              <p className="text-center text-slate-500 text-sm font-medium mb-8">
                Te enviamos un código de 6 dígitos a <br/><strong className="text-slate-800">{formData.email}</strong>
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
                    className="w-full text-center text-3xl tracking-[1em] font-mono py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#EFA02B] focus:ring-2 focus:ring-[#EFA02B] bg-slate-50 focus:bg-white transition-all uppercase" 
                    placeholder="------" 
                  />
                </div>

                <button type="submit" disabled={cargando || codigoVerificacion.length < 6} className="w-full flex justify-center py-4 border border-transparent rounded-2xl shadow-sm text-sm font-black text-white bg-[#1A1A1A] hover:bg-slate-800 active:scale-95 transition-all focus:outline-none disabled:opacity-50 cursor-pointer">
                  {cargando ? "Verificando..." : "Activar mi cuenta"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <button onClick={() => {setPaso(1); setCodigoVerificacion("");}} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
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