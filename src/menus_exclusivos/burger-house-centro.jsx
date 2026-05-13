import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

// ACÁ VAMOS A PONER EL LINK DE TU IMAGEN CUANDO ME LO PASES
const IMAGEN_ESQUINA_IZQ = "https://via.placeholder.com/300x300/444444/FFFFFF?text=Tu+Imagen+Aca"; 

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
    // 1. EL FONDO LISO COLOR #2e2725
    <div 
      className="min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden"
      style={{ backgroundColor: '#2e2725' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        * { font-family: 'Montserrat', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .neon-shadow { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
      `}</style>

      {/* 2. LA IMAGEN ARRIBA A LA IZQUIERDA (Bien pegada a la esquina) */}
      <img 
        src={IMAGEN_ESQUINA_IZQ} 
        alt="adorno esquina" 
        className="absolute top-0 left-0 w-32 md:w-48 object-contain pointer-events-none z-0"
      />

      {/* Contenido principal (con z-index para que quede por encima de los adornos de fondo) */}
      <div className="relative z-10 pt-10">
        
        {/* INFO DEL LOCAL */}
        <div className="text-center px-4 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full p-1 bg-[#2e2725] neon-shadow mb-4 overflow-hidden border-2 border-orange-500/20">
            <img 
              src={menu.tema?.logoUrl || IMAGEN_PLACEHOLDER} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">
            {menu.nombre}
          </h1>
          <p className="text-neutral-300 font-medium mt-1 max-w-md mx-auto text-sm">
            {menu.descripcion}
          </p>
        </div>

        {/* CATEGORÍAS */}
        <div className="sticky top-0 z-30 bg-[#2e2725]/90 backdrop-blur-md border-b border-orange-500/10 mt-8 py-4">
          <div className="flex overflow-x-auto gap-3 px-6 no-scrollbar max-w-5xl mx-auto">
            {categorias.map((cat) => {
              const isActivo = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all duration-300 border ${
                    isActivo 
                      ? "bg-orange-500 text-white border-orange-500 neon-shadow scale-105" 
                      : "bg-transparent text-neutral-400 border-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosAMostrar.map((prod) => {
              const itemEnCarrito = carrito.find(p => p.id === prod.id);
              const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
              const hayDescuento = prod.descuento > 0;
              const precioVenta = hayDescuento ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
              const estaActivo = prod.activo !== false;

              return (
                <div 
                  key={prod.id} 
                  className={`bg-[#231e1c] rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                    !estaActivo ? "opacity-50 grayscale" : cantidad > 0 ? "border-orange-500/50 neon-shadow" : "border-orange-500/10 hover:border-orange-500/30"
                  }`}
                >
                  <div className="relative h-40 w-full bg-neutral-900">
                    {!estaActivo && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md z-10">
                        Agotado
                      </div>
                    )}
                    {hayDescuento && estaActivo && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md z-10">
                        {prod.descuento}% OFF
                      </div>
                    )}
                    <img 
                      src={prod.imagenUrl || IMAGEN_PLACEHOLDER} 
                      alt={prod.nombre} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#231e1c] via-transparent to-transparent"></div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow relative">
                    <h3 className="text-xl font-bold text-white leading-tight mb-2 drop-shadow-sm">{prod.nombre}</h3>
                    <p className="text-neutral-400 text-xs line-clamp-2 mb-4 flex-grow">{prod.descripcion}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-orange-500/10">
                      <div>
                        <p className="text-xl font-black text-orange-400" style={{fontFamily: 'Montserrat'}}>${precioVenta}</p>
                        {hayDescuento && <p className="text-xs text-neutral-500 line-through">${prod.precio}</p>}
                      </div>

                      {estaActivo && (
                        <div className="flex items-center bg-[#1a1614] rounded-full p-1 border border-neutral-700">
                          {cantidad > 0 ? (
                            <>
                              <button onClick={() => quitarDelCarrito(prod)} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-neutral-700 hover:bg-red-500 transition-colors cursor-pointer">-</button>
                              <span className="font-bold w-8 text-center text-white">{cantidad}</span>
                              <button onClick={() => agregarAlCarrito(prod)} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-orange-500 hover:bg-orange-400 transition-colors cursor-pointer">+</button>
                            </>
                          ) : (
                            <button onClick={() => agregarAlCarrito(prod)} className="px-4 py-2 rounded-full font-bold text-sm bg-orange-500 text-white hover:bg-orange-400 transition-colors uppercase tracking-wider cursor-pointer">
                              Agregar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARRITO FLOTANTE */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-[#1a1614] border border-orange-500 neon-shadow z-40 transition-transform active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner">
              {totalItems}
            </div>
            <span className="font-bold text-white tracking-wide uppercase text-sm">Ver Pedido</span>
          </div>
          <span className="font-black text-xl text-orange-400" style={{fontFamily: 'Montserrat'}}>${totalDinero}</span>
        </div>
      )}

      {/* MODAL DE PAGO */}
      <CarritoModal
        mostrar={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        carrito={carrito}
        agregarAlCarrito={agregarAlCarrito}
        quitarDelCarrito={quitarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        totalDinero={totalDinero}
        tema={menu.tema}
        nombreLocal={menu.nombre}
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