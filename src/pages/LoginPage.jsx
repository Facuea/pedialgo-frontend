import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/authService";

function LoginPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const COLOR_PRIMARIO = "#F1A139"; 
  const COLOR_ERROR = "#E63946"; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const user = await loginUsuario(email, password);
      localStorage.setItem("usuario", JSON.stringify(user));

      if (user.rol === "SUPER_ADMIN") {
        navigate("/plataforma/dashboard");
        return; 
      } 
      
      if (user.locales && user.locales.length > 1) {
        navigate("/admin/seleccionar-local");
      } else if (user.locales && user.locales.length === 1) {
        const local = user.locales[0];
        localStorage.setItem("localActivo", JSON.stringify(local));

        // Magia acá: Hacemos un chequeo rápido para ver si está suspendido
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await fetch(`${API_URL}/admin/locales/${local.id}`, {
            headers: { "Authorization": `Bearer ${user.token}` }
          });
          const localData = await res.json();
          
          if (localData.activo === false) {
            navigate("/admin/suscripcion-vencida");
          } else {
            navigate("/admin/dashboard");
          }
        } catch (fetchError) {
          // Si por alguna razón falla el fetch, los mandamos al dashboard por las dudas
          navigate("/admin/dashboard");
        }

      } else {
        setError("Tu cuenta no tiene locales asignados. Contactá a soporte.");
      }

    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex bg-white font-sans"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease both; }
      `}</style>
      
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://res.cloudinary.com/dca2psqfg/image/upload/v1774582026/loginportada_avdrak.png')` 
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 pt-16 pl-16 flex flex-col items-start">
          <img 
            src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
            alt="PediAlgo Logo" 
            className="h-56 w-auto object-contain brightness-0 invert drop-shadow-xl" 
          />
          <p className="text-white text-lg font-medium mt-6 max-w-sm tracking-tight drop-shadow-md leading-relaxed">
            Tu próximo pedido empieza acá. <br/> Tu menú digital profesional.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative bg-white border-l border-gray-100/50">
        
        <div className="w-full max-w-100 animate-fade-in flex flex-col">
          
          <div className="flex justify-center mb-8 lg:hidden">
            <img 
              src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774581960/Logo_PediAlgopng_cmns3q.png" 
              alt="PediAlgo Logo mobile" 
              className="h-20 object-contain"
            />
          </div>

          <div className="text-center mb-10 w-full">
            <h1 className="text-3xl lg:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">Acceso al Sistema</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Gestioná tu cuenta de forma profesional</p>
          </div>

          {error && (
            <div 
              className="text-white text-sm p-3.5 rounded-xl mb-6 text-center font-bold shadow-lg w-full"
              style={{ backgroundColor: COLOR_ERROR }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 w-full">
            <div>
              <label className="text-xs uppercase font-black text-gray-400 ml-1 tracking-widest block mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': COLOR_PRIMARIO }}
                placeholder="ejemplo@pedialgo.com"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-black text-gray-400 ml-1 tracking-widest block mb-2">Contraseña</label>
              <div className="relative">
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': `${COLOR_PRIMARIO}30` }}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={cargando}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all ${cargando ? 'opacity-50' : 'hover:brightness-105 active:scale-[0.98]'}`}
              style={{ backgroundColor: COLOR_PRIMARIO }}
            >
              {cargando ? "AUTENTICANDO..." : "INICIAR SESIÓN"}
            </button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <a 
                href="https://wa.me/5493585148782?text=Hola!%20Olvidé%20la%20contraseña%20de%20mi%20cuenta%20en%20PediAlgo%20y%20necesito%20ayuda%20para%20recuperarla." 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: COLOR_PRIMARIO, textDecoration: 'none', fontSize: '14px' }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>

          <p className="text-center mt-12 text-[10px] text-gray-300 font-light uppercase tracking-widest w-full">
            PediAlgo &copy; 2026 - Control Panel
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;