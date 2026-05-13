import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

// LINK DIRECTO A TU FONDO DE CLOUDINARY
const FONDO_VIP_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/v1778701593/Sushi_House_hr5mzi.jpg";

function BurgerHouseCentro({ 
  menu, categorias, carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, 
  totalItems, totalDinero, subtotal, cuponAplicado, aplicarCupon, removerCupon, slug 
}) {
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Inicializar la primera categoría al cargar
  useEffect(() => {
    if (categorias && categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0].id);
    }
  }, [categorias, categoriaActiva]);

  const productosAMostrar = (categorias.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  return (
    // CONTENEDOR CON TU IMAGEN DE CANVA DE FONDO FIJO
    <div 
      className="min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${FONDO_VIP_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Efecto Parallax
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        * { font-family: 'Montserrat', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .neon-shadow { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
      `}</style>

      {/* 1. CAPA OSCURA PARA ASEGURAR LEGIBILIDAD (Z-INDEX 0) */}
      <div className="fixed inset-0 bg-neutral-950/70 z-0"></div>

      {/* 2. HERO SECTION CON DEGRADADO (Z-INDEX 10) */}
      <div className="relative h-64 md:h-80 w-full z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent"></div>
      </div>

      {/* 3. INFO DEL LOCAL SUPERPUESTA (Z-INDEX 10) */}
      <div className="relative -mt-20 text-center px-4 z-10 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full p-1 bg-neutral-950 neon-shadow mb-4 overflow-hidden border-2 border-orange-500/20">
          <img 
            src={menu.tema?.logoUrl || IMAGEN_PLACEHOLDER} 
            alt="Logo" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        {/* TITULO ACTUALIZADO A SUSHI HOUSE */}
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          Sushi House
        </h1>
        <p className="text-neutral-300 font-medium mt-2 max-w-md mx-auto text-sm">
          {menu.descripcion || "Experiencia de sushi premium."}
        </p>
      </div>

      {/* 4. CATEGORÍAS (STICKY, Z-INDEX 30) */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-orange-500/10 mt-8 py-4">
        <div className="flex overflow-x-auto gap-3 px-6 no-scrollbar max-w-5xl mx-auto">
          {categorias.map((cat) => {
            const isActivo = categoriaActiva === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                  isActivo 
                    ? "bg-orange-500 text-white neon-shadow scale-105" 
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {cat.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. PRODUCTOS (DISEÑO GRID, Z-INDEX 10) */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-32 relative z-10">
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
                className={`bg-neutral-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  !estaActivo ? "opacity-50 grayscale" : cantidad > 0 ? "border-orange-500/50 neon-shadow" : "border-orange-500/10 hover:border-orange-500/30"
                }`}
              >
                {/* Imagen arriba (Grande) */}
                <div className="relative h-48 w-full bg-neutral-800/50">
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
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/10 to-transparent"></div>
                </div>

                {/* Info abajo */}
                <div className="p-5 flex flex-col flex-grow relative">
                  <h3 className="text-xl font-bold text-white leading-tight mb-2 drop-shadow-sm">{prod.nombre}</h3>
                  <p className="text-neutral-400 text-xs line-clamp-2 mb-4 flex-grow">{prod.descripcion}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-orange-500/10">
                    <div>
                      <p className="text-2xl font-black text-orange-400" style={{fontFamily: 'Montserrat', textShadow: '0 0 10px rgba(251,146,60,0.5)'}}>${precioVenta}</p>
                      {hayDescuento && <p className="text-xs text-neutral-500 line-through">${prod.precio}</p>}
                    </div>

                    {estaActivo && (
                      <div className="flex items-center bg-neutral-800 rounded-full p-1 border border-neutral-700">
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

      {/* 6. CARRITO FLOTANTE (ESTILO NEÓN, Z-INDEX 40) */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-neutral-900 border border-orange-500 neon-shadow z-40 transition-transform active:scale-95"
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

      {/* 7. MODAL DE PAGO (Reutilizado, z-index managed by component) */}
      <CarritoModal
        mostrar={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        carrito={carrito}
        agregarAlCarrito={agregarAlCarrito}
        quitarDelCarrito={quitarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        totalDinero={totalDinero}
        tema={menu.tema} // Le pasamos el tema normal para que el modal use los colores corporativos
        nombreLocal="Sushi House" // Hardcodeado visualmente
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