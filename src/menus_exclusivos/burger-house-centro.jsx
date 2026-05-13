import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

const IMAGEN_ESQUINA_SUP_IZQ = "/disenos_sushi_house/9cbac6c8-d335-4ce7-9b0e-41f0c3f4615f.png";
const IMAGEN_ESQUINA_INF_DER = "/disenos_sushi_house/f8a13bb8-5059-4841-a70c-f14c2eee70e9.png";
const IMAGEN_MANO_SUP_DER = "/disenos_sushi_house/66f8a436-507c-4c4a-821f-4db7589b7377.png";
const IMAGEN_TEXTO_LATERAL = "/disenos_sushi_house/e4a83fe3-b3f9-4d24-bbd1-af3582de7f34.png";

function BurgerHouseCentro({ 
  menu, categorias, carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, 
  totalItems, totalDinero, subtotal, cuponAplicado, aplicarCupon, removerCupon, slug 
}) {
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const { colorPrimario, colorTexto, fuente } = menu.tema;

  useEffect(() => {
    if (categorias && categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0].id);
    }
  }, [categorias, categoriaActiva]);

  const productosAMostrar = (categorias.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#2e2725', color: colorTexto }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Ma+Shan+Zheng&display=swap');
        
        * { font-family: 'Montserrat', sans-serif; }
        .font-oriental { font-family: 'Ma Shan Zheng', cursive; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* ELEMENTOS DE FONDO */}
      <img src={IMAGEN_TEXTO_LATERAL} alt="" className="absolute left-2 top-[30%] h-64 w-auto object-contain z-0 opacity-30 pointer-events-none" />
      <img src={IMAGEN_ESQUINA_SUP_IZQ} alt="" className="absolute top-0 left-0 w-40 z-0 pointer-events-none" />
      <img src={IMAGEN_ESQUINA_INF_DER} alt="" className="absolute bottom-0 right-0 w-40 z-0 pointer-events-none" />
      <img src={IMAGEN_MANO_SUP_DER} alt="" className="absolute top-[280px] right-0 w-48 object-contain z-0 pointer-events-none opacity-70" />

      <div className="relative z-10 pt-16">
        
        {/* CABECERA */}
        <div className="text-center px-4 mb-6">
          <h1 className="text-5xl font-oriental text-white mb-2">
            Sushi House
          </h1>
          <p className="text-lg font-oriental text-neutral-400">
            {menu.descripcion}
          </p>
        </div>

        {/* CATEGORÍAS 100% TRANSPARENTES */}
        <div className="sticky top-0 z-30 bg-transparent py-4">
          <div className="flex overflow-x-auto gap-3 px-6 no-scrollbar max-w-4xl mx-auto justify-center">
            {categorias.map((cat) => {
              const isActivo = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-5 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${
                    isActivo 
                      ? "shadow-lg scale-105" 
                      : "text-neutral-500 hover:text-white"
                  }`}
                  style={{ 
                    backgroundColor: isActivo ? colorPrimario : 'transparent',
                    color: isActivo ? '#2e2725' : undefined
                  }}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS MÁS PEQUEÑOS */}
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 flex flex-col gap-5">
          {productosAMostrar.map((prod, i) => {
            const itemEnCarrito = carrito.find(p => p.id === prod.id);
            const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            const precioVenta = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
            const esPar = i % 2 === 0;

            return (
              <div 
                key={prod.id} 
                className={`flex items-center gap-4 bg-[#231e1c]/70 backdrop-blur-md rounded-2xl p-3 border border-white/5 ${esPar ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Imagen más compacta */}
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img 
                    src={prod.imagenUrl || IMAGEN_PLACEHOLDER} 
                    alt={prod.nombre} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info y Controles */}
                <div className={`flex-1 flex flex-col ${esPar ? 'text-left' : 'text-right'}`}>
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: colorTexto }}>{prod.nombre}</h3>
                  <p className="text-[10px] text-neutral-400 line-clamp-2 mb-2 leading-snug">{prod.descripcion}</p>
                  
                  <div className={`flex flex-col gap-1.5 ${esPar ? 'items-start' : 'items-end'}`}>
                    <span className="text-lg font-black" style={{ color: colorPrimario }}>${precioVenta}</span>
                    
                    {prod.activo !== false ? (
                      <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/5">
                        {cantidad > 0 && (
                          <button onClick={() => quitarDelCarrito(prod)} className="w-6 h-6 rounded-full text-white font-bold cursor-pointer">-</button>
                        )}
                        {cantidad > 0 && <span className="px-2 text-xs font-bold">{cantidad}</span>}
                        <button 
                          onClick={() => agregarAlCarrito(prod)} 
                          className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider hover:brightness-110 cursor-pointer"
                          style={{ backgroundColor: colorPrimario, color: '#2e2725' }}
                        >
                          {cantidad > 0 ? "+" : "Agregar"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-red-400">Agotado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARRITO FLOTANTE */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer z-50 transition-all hover:scale-105"
          style={{ backgroundColor: colorPrimario, color: '#2e2725' }}
        >
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase opacity-70">Total</span>
            <span className="font-black text-lg">${totalDinero}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#2e2725] text-white flex items-center justify-center font-bold text-sm">
            {totalItems}
          </div>
        </div>
      )}

      <CarritoModal
        mostrar={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        carrito={carrito}
        agregarAlCarrito={agregarAlCarrito}
        quitarDelCarrito={quitarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        totalDinero={totalDinero}
        tema={menu.tema}
        nombreLocal="Sushi House"
        numeroWhatsApp={menu.whatsapp}
        slug={slug}
        subtotal={subtotal}
        cuponAplicado={cuponAplicado}
        aplicarCupon={aplicarCupon}
        removerCupon={removerCupon}
        localId={menu.id}
        cobroAutomatico={menu.cobroAutomatico}
      />
    </div>
  );
}

export default BurgerHouseCentro;