import { useState, useEffect, useRef } from "react";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";
const CARRITO_BLANCO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753121/carrito-blanco_lydvlw.png";

// REFERENCIAS A LAS IMÁGENES EN TU CARPETA PUBLIC
const IMAGEN_ESQUINA_SUP_IZQ = "/disenos_sushi_house/9cbac6c8-d335-4ce7-9b0e-41f0c3f4615f.png";
const IMAGEN_ESQUINA_INF_DER = "/disenos_sushi_house/f8a13bb8-5059-4841-a70c-f14c2eee70e9.png";
const IMAGEN_TEXTO_LATERAL = "/disenos_sushi_house/e4a83fe3-b3f9-4d24-bbd1-af3582de7f34.png";
const IMAGEN_NUEVA_DECORACION = "/disenos_sushi_house/143eaea3-44c3-49d1-93ec-f1667326ca6e.png";

function BurgerHouseCentro({ 
  menu, categorias, carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, 
  totalItems, totalDinero, subtotal, cuponAplicado, aplicarCupon, removerCupon, slug,
  redes = {} 
}) {
  
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const scrollRef = useRef(null);

  // Variables del Backend 
  const { colorPrimario, colorSecundario = "#F1A139", colorTexto, fuente } = menu.tema || { colorPrimario: "#fdeaaa", colorTexto: "#ffffff", fuente: "Montserrat" };
  const fontName = fuente || 'Montserrat';
  const fontUrlSafe = fontName.replace(/ /g, '+');

  const sucursales = menu.localesFranquicia || menu.sucursales || [];

  useEffect(() => {
    if (categorias && categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0].id);
    }
  }, [categorias, categoriaActiva]);

  const productosAMostrar = (categorias.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  const tieneRedes = redes.instagramUrl || redes.facebookUrl;

  return (
    // CONTENEDOR MAESTRO: overflow-x-hidden para matar el bug de scroll lateral
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden" style={{ backgroundColor: '#2e2725', color: colorTexto }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontUrlSafe}:wght@400;600;700;900&family=Ma+Shan+Zheng&display=swap');
        * { font-family: '${fontName}', sans-serif; }
        .font-oriental { font-family: 'Ma Shan Zheng', cursive; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* ==================================================== */}
      {/* FONDO BLINDADO (No genera scroll horizontal jamás)   */}
      {/* ==================================================== */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img src={IMAGEN_TEXTO_LATERAL} alt="" className="absolute left-2 md:left-6 top-[30%] h-64 md:h-96 w-auto object-contain opacity-30" />
        <img src={IMAGEN_ESQUINA_SUP_IZQ} alt="" className="absolute top-0 left-0 w-40 md:w-64" />
        <img src={IMAGEN_ESQUINA_INF_DER} alt="" className="absolute bottom-0 right-0 w-40 md:w-64" />
        
        {/* Nueva decoracion Arriba a la Derecha (Alejada de la esquina) */}
        <img 
          src={IMAGEN_NUEVA_DECORACION} 
          alt="" 
          className="absolute top-[80px] md:top-[120px] right-[10%] w-48 md:w-72 object-contain opacity-80" 
        />
        {/* Nueva decoracion Abajo a la Izquierda */}
        <img 
          src={IMAGEN_NUEVA_DECORACION} 
          alt="" 
          className="absolute bottom-0 left-0 w-32 md:w-56 object-contain opacity-80" 
        />
      </div>

      {/* ==================================================== */}
      {/* SECCIÓN 1: CONTENIDO PRINCIPAL                       */}
      {/* ==================================================== */}
      <div className="relative z-10 pb-16 flex-1 w-full">
        
        <div className="pt-20">
          
          {/* CABECERA */}
          <div className="text-center px-4 mb-8">
            <h1 className="text-5xl md:text-6xl font-oriental text-white mb-2">
              Sushi House
            </h1>
            <p className="text-lg md:text-xl font-oriental text-neutral-400 mb-6">
              {menu.descripcion}
            </p>
            
            {/* SELECTOR DE SUCURSALES */}
            {sucursales.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 px-4 max-w-2xl mx-auto">
                {sucursales.map(sucursal => {
                  const isActivo = sucursal.id === menu.id || sucursal.slug === slug;
                  const nombreAMostrar = sucursal.nombre || sucursal.nombreLocal || "Sucursal";

                  return (
                    <a
                      key={sucursal.id || Math.random()}
                      href={`/${sucursal.slug}`}
                      className="px-4 py-2 rounded-full border text-[11px] md:text-xs font-bold transition-all whitespace-nowrap"
                      style={{ 
                        backgroundColor: isActivo ? colorSecundario : 'transparent',
                        color: isActivo ? '#2e2725' : '#a3a3a3',
                        borderColor: isActivo ? colorSecundario : 'rgba(255,255,255,0.15)'
                      }}
                    >
                      {nombreAMostrar}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* CATEGORÍAS (Copiadas exactas del MenuPage para corregir el scroll) */}
          <div className="sticky top-0 z-30 bg-transparent py-4">
            <div className="flex items-center max-w-4xl mx-auto">
              <div
                ref={scrollRef}
                className="no-scrollbar flex overflow-x-auto gap-2 scroll-smooth grow px-4 justify-center md:justify-start"
              >
                {categorias.map((cat) => {
                  const isActivo = categoriaActiva === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaActiva(cat.id)}
                      className={`px-5 py-2.5 rounded-full whitespace-nowrap font-bold text-[11px] md:text-xs shrink-0 cursor-pointer tracking-wider uppercase transition-all duration-200 ${isActivo ? 'shadow-md scale-100' : 'hover:-translate-y-px opacity-70'}`}
                      style={{
                        backgroundColor: isActivo ? colorPrimario : "transparent",
                        color: isActivo ? "#2e2725" : colorTexto,
                        border: isActivo ? "none" : "1px solid rgba(255,255,255,0.15)"
                      }}
                    >
                      {cat.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 flex flex-col gap-6">
            {productosAMostrar.map((prod, i) => {
              const itemEnCarrito = carrito.find(p => p.id === prod.id);
              const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
              const precioVenta = prod.descuento > 0 ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
              const esPar = i % 2 === 0;

              return (
                <div 
                  key={prod.id} 
                  className={`flex items-center gap-4 bg-[#231e1c]/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 shadow-xl transition-colors duration-200 ${esPar ? 'flex-row' : 'flex-row-reverse'}`}
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
                        <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/5 mt-1">
                          {cantidad > 0 && (
                            <button 
                              onClick={() => quitarDelCarrito(prod)} 
                              className="w-7 h-7 rounded-full text-white font-bold cursor-pointer transition-transform active:scale-90 hover:bg-white/10 flex items-center justify-center"
                            >-</button>
                          )}
                          {cantidad > 0 && <span className="px-3 text-xs md:text-sm font-bold min-w-[20px] text-center">{cantidad}</span>}
                          <button 
                            onClick={() => agregarAlCarrito(prod)} 
                            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm active:scale-90 transition-transform duration-200"
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
      <div className="relative z-20 w-full bg-[#1a1614] border-t border-white/5 pt-10 pb-28 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          
          {tieneRedes && (
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-oriental mb-2 text-white">Sushi House</h2>
              <p className="text-[11px] text-neutral-500 mb-5 max-w-xs leading-relaxed mx-auto md:mx-0 opacity-80">
                Encontranos en nuestras redes sociales y enterate de todas las promociones y novedades exclusivas.
              </p>
              <div className="flex justify-center md:justify-start gap-3">
                {redes.instagramUrl && (
                  <a href={redes.instagramUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2e2725] border border-white/10 transition-transform hover:-translate-y-1 active:scale-95 shadow-md" style={{ color: colorPrimario }}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                  </a>
                )}
                {redes.facebookUrl && (
                  <a href={redes.facebookUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2e2725] border border-white/10 transition-transform hover:-translate-y-1 active:scale-95 shadow-md" style={{ color: colorPrimario }}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
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
        
        <div className="max-w-4xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-2 text-center text-neutral-600 opacity-60">
          <p className="text-[10px] font-medium tracking-wide">
             &copy; {new Date().getFullYear()} {menu.nombre}. Todos los derechos reservados.
          </p>
          <a 
            href="https://pedialgoar.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Desarrollado por pedialgoar.com
          </a>
        </div>
      </div>

      {/* ==================================================== */}
      {/* CARRITO FLOTANTE (ESTILO MENUPAGE, MÁS GRANDE)       */}
      {/* ==================================================== */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 right-5 flex items-center gap-4 pl-4 pr-7 py-3.5 rounded-2xl shadow-xl z-50 cursor-pointer transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95 border border-white/10"
          style={{ backgroundColor: colorPrimario }}
        >
          <div className="relative flex items-center justify-center rounded-xl shrink-0">
            <img
              src={CARRITO_BLANCO_URL}
              alt="carrito"
              className="w-10 h-10 object-contain block drop-shadow-md brightness-0"
            />
            <span 
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black border-2 shadow-sm"
              style={{ color: colorPrimario, borderColor: colorPrimario, backgroundColor: "#2e2725" }}
            >
              {totalItems}
            </span>
          </div>

          <div className="flex flex-col text-[#2e2725]">
            <span className="font-bold text-[1.1rem] leading-tight mb-0.5 tracking-tight">Ver pedido</span>
            <span className="text-[0.95rem] opacity-95 font-black leading-none">${totalDinero}</span>
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