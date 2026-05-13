import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

// REFERENCIAS A LAS IMÁGENES EN TU CARPETA PUBLIC
const IMAGEN_ESQUINA_SUP_IZQ = "/disenos_sushi_house/9cbac6c8-d335-4ce7-9b0e-41f0c3f4615f.png";
const IMAGEN_ESQUINA_INF_DER = "/disenos_sushi_house/f8a13bb8-5059-4841-a70c-f14c2eee70e9.png";
const IMAGEN_MANO_SUP_DER = "/disenos_sushi_house/66f8a436-507c-4c4a-821f-4db7589b7377.png";
// NUEVA IMAGEN VERTICAL DEL MENÚ IZQUIERDO
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
    // CONTENEDOR PRINCIPAL CON EL FONDO COLOR #2e2725
    <div 
      className="min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden"
      style={{ backgroundColor: '#2e2725' }}
    >
      <style>{`
        /* SOLO IMPORTAMOS MONTSERRAT, YA NO HACE FALTA LA FUENTE CHINA */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        
        * { font-family: 'Montserrat', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .neon-shadow { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
      `}</style>

      {/* --- ELEMENTOS DE DISEÑO DE FONDO (z-0) --- */}

      {/* 1. IMAGEN VERTICAL "SUSHI MENÚ" EN EL LATERAL IZQUIERDO */}
      <img 
        src={IMAGEN_TEXTO_LATERAL} 
        alt="Sushi Menu" 
        className="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 h-64 md:h-96 w-auto object-contain pointer-events-none z-0 opacity-60"
      />

      {/* 2. IMAGEN ARRIBA A LA IZQUIERDA (Pegada al borde) */}
      <img 
        src={IMAGEN_ESQUINA_SUP_IZQ} 
        alt="adorno" 
        className="absolute top-0 left-0 w-48 md:w-64 object-contain pointer-events-none z-0"
      />

      {/* 3. IMAGEN ABAJO A LA DERECHA (Pegada al borde) */}
      <img 
        src={IMAGEN_ESQUINA_INF_DER} 
        alt="adorno" 
        className="absolute bottom-0 right-0 w-48 md:w-64 object-contain pointer-events-none z-0"
      />

      {/* 4. IMAGEN DE LA MANO ARRIBA A LA DERECHA (Un poco más abajo, no en la esquina) */}
      <img 
        src={IMAGEN_MANO_SUP_DER} 
        alt="adorno" 
        className="absolute top-[100px] right-0 w-64 md:w-96 object-contain pointer-events-none z-0"
      />

      {/* --- CONTENIDO PRINCIPAL (z-10) --- */}
      <div className="relative z-10 pt-16">
        
        {/* INFO DEL LOCAL */}
        <div className="text-center px-4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full p-1 bg-[#2e2725] neon-shadow mb-4 overflow-hidden border-2 border-orange-500/20">
            <img 
              src={menu.tema?.logoUrl || IMAGEN_PLACEHOLDER} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
            Sushi House
          </h1>
          <p className="text-neutral-300 font-medium mt-1 max-w-md mx-auto text-sm">
            {menu.descripcion || "Experiencia de sushi premium."}
          </p>
        </div>

        {/* CATEGORÍAS */}
        <div className="sticky top-0 z-30 bg-[#2e2725]/90 backdrop-blur-md border-b border-orange-500/10 mt-12 py-4">
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
                  className={`bg-[#231e1c]/90 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                    !estaActivo ? "opacity-50 grayscale" : cantidad > 0 ? "border-orange-500/50 neon-shadow" : "border-orange-500/10 hover:border-orange-500/30"
                  }`}
                >
                  <div className="relative h-44 w-full bg-neutral-900">
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
                        <p className="text-2xl font-black text-orange-400" style={{fontFamily: 'Montserrat'}}>${precioVenta}</p>
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