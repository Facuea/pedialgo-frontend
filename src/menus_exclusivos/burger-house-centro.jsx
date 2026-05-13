import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

// REFERENCIAS A LAS IMÁGENES EN TU CARPETA PUBLIC
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

  useEffect(() => {
    if (categorias && categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0].id);
    }
  }, [categorias, categoriaActiva]);

  const productosAMostrar = (categorias.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  return (
    <div 
      className="min-h-screen text-white font-sans selection:bg-[#fdeaaa] selection:text-[#2e2725] relative overflow-x-hidden"
      style={{ backgroundColor: '#2e2725' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Ma+Shan+Zheng&display=swap');
        
        * { font-family: 'Montserrat', sans-serif; }
        .font-oriental { font-family: 'Ma Shan Zheng', cursive; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .vip-shadow { box-shadow: 0 0 20px rgba(253, 234, 170, 0.15); }
      `}</style>

      {/* --- ELEMENTOS DE FONDO --- */}
      <img 
        src={IMAGEN_TEXTO_LATERAL} 
        alt="Sushi Menu" 
        className="absolute left-2 top-[30%] h-80 w-auto object-contain pointer-events-none z-0 opacity-40"
      />
      <img src={IMAGEN_ESQUINA_SUP_IZQ} alt="" className="absolute top-0 left-0 w-48 md:w-64 z-0 pointer-events-none" />
      <img src={IMAGEN_ESQUINA_INF_DER} alt="" className="absolute bottom-0 right-0 w-48 md:w-64 z-0 pointer-events-none" />
      <img 
        src={IMAGEN_MANO_SUP_DER} 
        alt="" 
        className="absolute top-[250px] right-0 w-56 md:w-80 object-contain z-0 pointer-events-none opacity-80" 
      />

      {/* --- CONTENIDO --- */}
      <div className="relative z-10 pt-20">
        
        {/* TITULO Y DESCRIPCIÓN (SIN LOGO) */}
        <div className="text-center px-4 mb-10">
          <h1 className="text-5xl md:text-6xl font-oriental text-white mb-2 drop-shadow-lg">
            Sushi House
          </h1>
          <p className="text-xl md:text-2xl font-oriental text-neutral-300 opacity-80">
            {menu.descripcion || "Tradición y frescura en cada pieza"}
          </p>
        </div>

        {/* CATEGORÍAS TRANSPARENTES */}
        <div className="sticky top-0 z-30 bg-transparent backdrop-blur-sm py-6">
          <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar max-w-4xl mx-auto justify-center">
            {categorias.map((cat) => {
              const isActivo = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all duration-300 ${
                    isActivo 
                      ? "bg-[#fdeaaa] text-[#2e2725] scale-105 shadow-lg" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRODUCTOS EN ZIG-ZAG */}
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-32 flex flex-col gap-8">
          {productosAMostrar.map((prod, i) => {
            const itemEnCarrito = carrito.find(p => p.id === prod.id);
            const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            const precioVenta = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
            const esPar = i % 2 === 0;

            return (
              <div 
                key={prod.id} 
                className={`flex items-center gap-4 bg-[#231e1c]/60 backdrop-blur-md rounded-3xl p-4 border border-white/5 transition-all duration-500 hover:bg-[#231e1c]/80 ${esPar ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Imagen del Producto */}
                <div className="w-1/3 aspect-square rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img 
                    src={prod.imagenUrl || IMAGEN_PLACEHOLDER} 
                    alt={prod.nombre} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Detalles */}
                <div className={`flex-1 flex flex-col ${esPar ? 'text-left' : 'text-right'}`}>
                  <h3 className="text-lg font-bold text-white mb-1">{prod.nombre}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{prod.descripcion}</p>
                  
                  <div className={`flex flex-col gap-2 ${esPar ? 'items-start' : 'items-end'}`}>
                    <span className="text-2xl font-black text-[#fdeaaa]">${precioVenta}</span>
                    
                    {prod.activo !== false ? (
                      <div className="flex items-center bg-black/30 rounded-full p-1 border border-white/10">
                        {cantidad > 0 && (
                          <button onClick={() => quitarDelCarrito(prod)} className="w-7 h-7 rounded-full bg-white/10 text-white font-bold cursor-pointer">-</button>
                        )}
                        {cantidad > 0 && <span className="px-3 font-bold text-sm">{cantidad}</span>}
                        <button 
                          onClick={() => agregarAlCarrito(prod)} 
                          className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#fdeaaa] text-[#2e2725] hover:brightness-110 cursor-pointer"
                        >
                          {cantidad > 0 ? "+" : "Agregar"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-red-400">Agotado</span>
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
          className="fixed bottom-6 right-6 flex items-center gap-4 px-6 py-3 rounded-2xl cursor-pointer bg-[#fdeaaa] text-[#2e2725] vip-shadow z-50 transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Pedido</span>
            <span className="font-black text-xl">${totalDinero}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2e2725] text-[#fdeaaa] flex items-center justify-center font-bold">
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
        tema={{...menu.tema, colorPrimario: '#fdeaaa'}} 
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