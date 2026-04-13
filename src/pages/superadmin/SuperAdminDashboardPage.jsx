import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { fetchPrivado } from "../../services/apiConfig";

function SuperAdminDashboardPage() {
  
  const [metricas, setMetricas] = useState({
    totalLocales: 0,
    localesActivos: 0,
    localesSuspendidos: 0,
    totalUsuarios: 0,
    ultimosLocales: [],
    localesEnRiesgo: [] 
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resLocales, resUsuarios] = await Promise.all([
        fetchPrivado(`/plataforma/locales`),
        fetchPrivado(`/plataforma/usuarios`)
      ]);

      if (resLocales.ok && resUsuarios.ok) {
        const locales = await resLocales.json();
        const usuarios = await resUsuarios.json();

        const hoy = new Date();
        const limiteAlerta = new Date();
        limiteAlerta.setDate(hoy.getDate() + 7); 

        const enRiesgo = locales.filter(l => {
          if (!l.fechaVencimiento) return false;
          const fechaVenc = new Date(l.fechaVencimiento);
          return fechaVenc <= limiteAlerta; 
        }).sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

        setMetricas({
          totalLocales: locales.length,
          localesActivos: locales.filter(l => l.activo).length,
          localesSuspendidos: locales.filter(l => !l.activo).length,
          totalUsuarios: usuarios.length,
          ultimosLocales: [...locales].slice(-5).reverse(), 
          localesEnRiesgo: enRiesgo
        });
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleRenovarPago = async (local) => {
    if (!window.confirm(`¿Confirmás que ${local.nombre} realizó el pago? Se le sumarán 30 días.`)) return;

    try {
      const res = await fetchPrivado(`/plataforma/locales/${local.id}/renovar?meses=1`, {
        method: "PATCH"
      });

      if (res.ok) {
        alert("¡Pago registrado! El vencimiento se actualizó correctamente.");
        cargarDatos(); 
      } else {
        alert("Hubo un error al registrar el pago.");
      }
    } catch (error) {
      console.error("Error al renovar:", error);
    }
  };

  const calcularEstadoVencimiento = (fechaStr) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const venc = new Date(fechaStr);
    venc.setHours(0, 0, 0, 0);
    
    const diffTime = venc - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) return { texto: `Vencido hace ${Math.abs(diffDays)} días`, color: "text-red-700 bg-red-100", urgente: true };
    if (diffDays === 0) return { texto: "Vence HOY", color: "text-red-700 bg-red-100", urgente: true };
    if (diffDays === 1) return { texto: "Vence mañana", color: "text-orange-700 bg-orange-100", urgente: false };
    return { texto: `Vence en ${diffDays} días`, color: "text-orange-700 bg-orange-100", urgente: false };
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Resumen General</h1>
          <p className="text-gray-500 font-medium mt-1">Monitoreá el estado de tu plataforma SaaS.</p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20 text-gray-500 font-bold">Cargando métricas...</div>
        ) : (
          <>
            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <p className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-1">Locales Registrados</p>
                <p className="text-4xl font-black text-gray-800">{metricas.totalLocales}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10"></div>
                <p className="text-[11px] uppercase tracking-widest font-black text-emerald-500 mb-1">Servicios Online</p>
                <p className="text-4xl font-black text-emerald-600">{metricas.localesActivos}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10"></div>
                <p className="text-[11px] uppercase tracking-widest font-black text-red-400 mb-1">Suspendidos</p>
                <p className="text-4xl font-black text-red-500">{metricas.localesSuspendidos}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <p className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-1">Cuentas de Usuarios</p>
                <p className="text-4xl font-black text-gray-800">{metricas.totalUsuarios}</p>
              </div>
            </div>

            {/* SECCIÓN INFERIOR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ÚLTIMOS LOCALES */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900">Últimos Clientes</h2>
                  <Link to="/plataforma/locales" className="text-xs font-bold text-orange-500 hover:text-orange-600">Ver todos &rarr;</Link>
                </div>
                <div className="divide-y divide-gray-100 flex-1">
                  {metricas.ultimosLocales.length > 0 ? (
                    metricas.ultimosLocales.map(local => (
                      <div key={local.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{local.nombre}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/{local.slug}</p>
                        </div>
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${local.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {local.activo ? 'Online' : 'Inactivo'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">No hay locales registrados aún.</div>
                  )}
                </div>
              </div>

              {/* MÓDULO DE VENCIMIENTOS */}
              <div className="bg-orange-50/50 rounded-2xl border border-orange-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-orange-100 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 text-xl"></span>
                      <h2 className="text-base font-black text-gray-900">Cobranzas</h2>
                    </div>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {metricas.localesEnRiesgo.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Vencen en los próximos 7 días o ya están vencidos.</p>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto max-h-100">
                  {metricas.localesEnRiesgo.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {metricas.localesEnRiesgo.map(local => {
                        const estado = calcularEstadoVencimiento(local.fechaVencimiento);
                        return (
                          <div key={local.id} className="bg-white border border-orange-100 p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{local.nombre}</h3>
                              <span className={`shrink-0 text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded-md ${estado.color}`}>
                                {estado.texto}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleRenovarPago(local)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Registrar Pago
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-60">
                      <p className="text-sm font-bold text-gray-700">Todos al día</p>
                      <p className="text-xs text-gray-500 text-center mt-1">No hay clientes por vencer<br/>en los próximos 7 días.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}

export default SuperAdminDashboardPage;