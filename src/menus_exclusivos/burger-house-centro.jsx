import { useState, useEffect } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";

// REFERENCIAS A LAS IMÁGENES EN TU CARPETA PUBLIC
const IMAGEN_ESQUINA_SUP_IZQ = "/disenos_sushi_house/9cbac6c8-d335-4ce7-9b0e-41f0c3f4615f.png";
const IMAGEN_ESQUINA_INF_DER = "/disenos_sushi_house/f8a13bb8-5059-4841-a70c-f14c2eee70e9.png";
const IMAGEN_TEXTO_LATERAL = "/disenos_sushi_house/e4a83fe3-b3f9-4d24-bbd1-af3582de7f34.png";
// NUEVA IMAGEN QUE REEMPLAZA A LA MANO
const IMAGEN_NUEVA_DECORACION = "/disenos_sushi_house/143eaea3-44c3-49d1-93ec-f1667326ca6e.png";

function BurgerHouseCentro({ 
  menu, categorias, carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, 
  totalItems, totalDinero, subtotal, cuponAplicado, aplicarCupon, removerCupon, slug,
  redes = {} 
}) {
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Variables del Backend 
  const { colorPrimario, colorTexto, fuente } = menu.tema || { colorPrimario: "#fdeaaa", colorTexto: "#ffffff", fuente: "Montserrat" };
  const fontName = fuente || 'Montserrat';
  const fontUrlSafe = fontName.replace(/ /g, '+');

  useEffect(() => {
    if (categorias && categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0].id);
    }
  }, [categorias, categoriaActiva]);

  const productosAMostrar = (categorias.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  const tieneRedes = redes.instagramUrl || redes.facebookUrl;

  return (
    // CONTENEDOR MAESTRO
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2e2725', color: colorTexto }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontUrlSafe}:wght@400;600;700;900&family=Ma+Shan+Zheng&display=swap');
        * { font-family: '${fontName}', sans-serif; }
        .font-oriental { font-family: 'Ma Shan Zheng', cursive; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* ==================================================== */}
      {/* SECCIÓN 1: DISEÑO PRINCIPAL (HEADER + PRODUCTOS)     */}
      {/* ==================================================== */}
      <div className="relative overflow-hidden pb-16 flex-1">
        
        {/* --- ELEMENTOS DE FONDO CORREGIDOS --- */}
        <img src={IMAGEN_TEXTO_LATERAL} alt="" className="absolute left-2 md:left-6 top-[30%] h-64 md:h-96 w-auto object-contain z-0 opacity-30 pointer-events-none" />
        <img src={IMAGEN_ESQUINA_SUP_IZQ} alt="" className="absolute top-0 left-0 w-40 md:w-64 z-0 pointer-events-none" />
        <img src={IMAGEN_ESQUINA_INF_DER} alt="" className="absolute bottom-0 right-0 w-40 md:w-64 z-0 pointer-events-none" />
        
        {/* 1. NUEVA IMAGEN: ARRIBA A LA DERECHA (No en la esquina, con separación) */}
        <img 
          src={IMAGEN_NUEVA_DECORACION} 
          alt="" 
          className="absolute top-[150px] right-[50px] w-48 md:w-72 object-contain z-0 pointer-events-none opacity-80" 
        />
        
        {/* 2. NUEVA IMAGEN: ABAJO A LA IZQUIERDA (Pegada en la esquina) */}
        <img 
          src={IMAGEN_NUEVA_DECORACION} 
          alt="" 
          className="absolute bottom-0 left-0 w-40 md:w-64 object-contain z-0 pointer-events-none opacity-80" 
        />

        <div className="relative z-10 pt-20">
          
          {/* CABECERA (Sushi House + Descripción) */}
          <div className="text-center px-4 mb-8">
            <h1 className="text-5xl md:text-6xl font-oriental text-white mb-2">
              Sushi House
            </h1>
            <p className="text-lg md:text-xl font-oriental text-neutral-400">
              {menu.descripcion}
            </p>
          </div>

          {/* CATEGORÍAS */}
          <div className="sticky top-0 z-30 bg-transparent py-4 border-b border-white/5 backdrop-blur-sm">
            <div className="flex overflow-x-auto gap-3 px-6 no-scrollbar max-w-4xl mx-auto justify-center">
              {categorias.map((cat) => {
                const isActivo = categoriaActiva === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`px-5 py-2.5 rounded-full font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${
                      isActivo ? "shadow-lg scale-105" : "text-neutral-500 hover:text-white"
                    }`}
                    style={{ 
                      backgroundColor: isActivo ? colorPrimario : 'transparent',
                      color: isActivo ? '#2e2725' : undefined,
                      border: isActivo ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 flex flex-col gap-6 relative z-10">
            {productosAMostrar.map((prod, i) => {
              const itemEnCarrito = carrito.find(p => p.id === prod.id);
              const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
              const precioVenta = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
              const esPar = i % 2 === 0;

              return (
                <div 
                  key={prod.id} 
                  className={`flex items-center gap-4 bg-[#231e1c]/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 shadow-xl ${esPar ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={prod.imagenUrl || IMAGEN_PLACEHOLDER} 
                      alt={prod.nombre} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className={`flex-1 flex flex-col ${esPar ? 'text-left' : 'text-right'}`}>
                    <h3 className="text-sm md:text-base font-bold mb-1 leading-tight" style={{ color: colorTexto }}>{prod.nombre}</h3>
                    <p className="text-[10px] md:text-[11px] text-neutral-400 line-clamp-2 mb-2 leading-snug">{prod.descripcion}</p>
                    
                    <div className={`flex flex-col gap-1.5 ${esPar ? 'items-start' : 'items-end'}`}>
                      <span className="text-lg md:text-xl font-black" style={{ color: colorPrimario }}>${precioVenta}</span>
                      
                      {prod.activo !== false ? (
                        <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/5">
                          {cantidad > 0 && (
                            <button onClick={() => quitarDelCarrito(prod)} className="w-6 h-6 md:w-7 md:h-7 rounded-full text-white font-bold cursor-pointer hover:bg-white/10 transition-colors">-</button>
                          )}
                          {cantidad > 0 && <span className="px-2 md:px-3 text-xs md:text-sm font-bold">{cantidad}</span>}
                          <button 
                            onClick={() => agregarAlCarrito(prod)} 
                            className="px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider hover:brightness-110 cursor-pointer transition-all"
                            style={{ backgroundColor: colorPrimario, color: '#2e2725' }}
                          >
                            {cantidad > 0 ? "+" : "Agregar"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-red-400 mt-1">Agotado</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECCIÓN 2: FOOTER INDEPENDIENTE                      */}
      {/* ==================================================== */}
      <div className="w-full bg-[#1a1614] border-t border-white/5 pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          
          {tieneRedes && (
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-oriental mb-2 text-white">Sushi House</h2>
              <p className="text-[11px] text-neutral-500 mb-5 max-w-xs leading-relaxed mx-auto md:mx-0 opacity-80">
                Encontranos en nuestras redes sociales y enterate de todas las promociones y novedades exclusivas.
              </p>
              <div className="flex justify-center md:justify-start gap-2.5">
                {redes.instagramUrl && (
                  <a href={redes.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2e2725] border border-white/10 hover:scale-110 transition-transform shadow-md" style={{ color: colorPrimario }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                  </a>
                )}
                {redes.facebookUrl && (
                  <a href={redes.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2e2725] border border-white/10 hover:scale-110 transition-transform shadow-md" style={{ color: colorPrimario }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {redes.direccionMapaEmbed && (
            <div className={`w-full ${tieneRedes ? 'md:w-1/2' : 'max-w-xl mx-auto'} rounded-2xl overflow-hidden border border-white/10 shadow-2xl`}>
              <div 
                className="w-full h-48 md:h-52 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                dangerouslySetInnerHTML={{ __html: redes.direccionMapaEmbed }}
              />
            </div>
          )}
        </div>
        
        {/* DESARROLLADO POR PediAlgo */}
        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-2 text-center text-neutral-600 opacity-60">
          <p className="text-[10px] font-medium tracking-wide">
             &copy; {new Date().getFullYear()} {menu.nombre}. Todos los derechos reservados.
          </p>
          <a 
            href="https://pedialgoar.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[8px] font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Desarrollado por pedialgoar.com
          </a>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ELEMENTOS FLOTANTES (CARRITO Y MODAL)                */}
      {/* ==================================================== */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer z-50 transition-all hover:scale-105 shadow-2xl"
          style={{ backgroundColor: colorPrimario, color: '#2e2725' }}
        >
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase opacity-70">Total</span>
            <span className="font-black text-lg">${totalDinero}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#2e2725] text-white flex items-center justify-center font-bold text-sm shadow-inner">
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