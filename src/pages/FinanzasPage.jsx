import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchPrivado } from "../services/apiConfig";

const API_URL = import.meta.env.VITE_API_URL;

function FinanzasPage() {
  // SECCIÓN: Estados iniciales y Constantes de diseño
  const COLOR_PRIMARIO = "#F1A139";
  const COLOR_SECUNDARIO = "#E63946";
  const COLOR_VERDE = "#10b981"; // Color para ganancias
  const COLOR_ROJO = "#ef4444"; // Color para egresos
  
  const localActivo = JSON.parse(localStorage.getItem("localActivo")) || {};
  const localId = localActivo.id;

  const [finanzas, setFinanzas] = useState(null);
  const [cargando, setCargando] = useState(true);

  // SECCIÓN: Efectos
  useEffect(() => {
    if (localId) {
      cargarFinanzas();
    }
  }, [localId]);

  // SECCIÓN: Funciones de carga de datos
  const cargarFinanzas = async () => {
    try {
      const res = await fetchPrivado(`/admin/locales/${localId}/finanzas`);
      if (res.ok) {
        const data = await res.json();
        setFinanzas(data);
      }
    } catch (error) {
      console.error("Error al cargar finanzas:", error);
    } finally {
      setCargando(false);
    }
  };

  // SECCIÓN: Funciones utilitarias
  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
  };

  // SECCIÓN: Estados de carga
  if (cargando) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64 text-gray-500 font-bold">
          Cargando números...
        </div>
      </AdminLayout>
    );
  }

  // SECCIÓN: Estados de error
  if (!finanzas) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500 mt-10 font-bold">
          Error al cargar el resumen financiero.
        </div>
      </AdminLayout>
    );
  }

  // SECCIÓN: Renderizado principal
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto font-sans pb-12 animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resumen Financiero</h1>
          <p className="text-gray-500 text-sm mt-1">Métricas y rendimiento de tu local.</p>
        </div>

        {/* --- INICIO: TARJETAS DE MÉTRICAS PRINCIPALES --- */}
        {/* Cambiamos a grid-cols-4 para que entren las dos tarjetas nuevas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          {/* 1. Tarjeta Ingresos Brutos */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 z-0" style={{ backgroundColor: COLOR_PRIMARIO }}></div>
            <div className="relative z-10">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ingresos</p>
              <p className="text-2xl md:text-3xl font-black" style={{ color: COLOR_PRIMARIO }}>{formatearDinero(finanzas.ingresosHoy)}</p>
            </div>
          </div>

          {/* 2. Tarjeta Egresos (NUEVO) */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden bg-red-50/30">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 z-0" style={{ backgroundColor: COLOR_ROJO }}></div>
            <div className="relative z-10">
              <p className="text-[10px] md:text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">Gastos (Salidas)</p>
              <p className="text-2xl md:text-3xl font-black text-red-600">-{formatearDinero(finanzas.egresosHoy)}</p>
            </div>
          </div>

          {/* 3. Tarjeta Ganancia Neta (NUEVO) */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden bg-emerald-50/30">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 z-0" style={{ backgroundColor: COLOR_VERDE }}></div>
            <div className="relative z-10">
              <p className="text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Ganancia Neta</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-600">{formatearDinero(finanzas.gananciaNetaHoy)}</p>
            </div>
          </div>

          {/* 4. Tarjeta Pedidos */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 z-0" style={{ backgroundColor: COLOR_SECUNDARIO }}></div>
            <div className="relative z-10">
              <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pedidos Hoy</p>
              <p className="text-2xl md:text-3xl font-black text-gray-800">{finanzas.cantidadPedidosHoy}</p>
            </div>
          </div>
          
        </div>
        {/* --- FIN: TARJETAS DE MÉTRICAS PRINCIPALES --- */}

        {/* --- INICIO: GRÁFICO Y RANKING (2 Columnas) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Ingresos de los últimos 7 días</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finanzas.graficoVentasSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="fecha" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                    formatter={(value) => [formatearDinero(value), "Ingresos"]}
                  />
                  <Bar dataKey="total" fill={COLOR_PRIMARIO} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Top 5*/}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Top 5 Más Vendidos</h2>
            
            {finanzas.topProductos && finanzas.topProductos.length > 0 ? (
              <div className="flex-1 flex flex-col gap-1">
                {finanzas.topProductos.map((prod, index) => (
                  <div key={prod.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="font-black text-gray-400 text-lg w-4">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                      <p className="font-bold text-sm text-gray-800 truncate">{prod.nombre}</p>
                      <p className="font-mono text-xs text-gray-500 shrink-0">{formatearDinero(prod.precio)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-sm text-center">
                Todavía no hay ventas registradas.
              </div>
            )}
          </div>

        </div>
        {/* --- FIN: GRÁFICO Y RANKING --- */}

      </div>
    </AdminLayout>
  );
}

export default FinanzasPage;