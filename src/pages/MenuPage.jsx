import { useEffect, useState, useRef, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { obtenerMenu } from "../services/menuService";
import { useCart } from "../hooks/useCart";
import CarritoModal from "../components/CarritoModal";

const IMAGEN_PLACEHOLDER = "https://res.cloudinary.com/dca2psqfg/image/upload/v1774931102/70144073-b918-4ef0-9b14-346e44f41f69_tla5uf.png";
const CARRITO_BLANCO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753121/carrito-blanco_lydvlw.png";
const CARRITO_NEGRO_URL = "https://res.cloudinary.com/dca2psqfg/image/upload/q_auto/f_auto/v1774753114/carrito-negro_kkrw7t.png";
const API_URL = import.meta.env.VITE_API_URL;

// --- IMPORTADOR DINÁMICO PARA MENÚS VIP (LAZY LOADING) ---
const cargarMenuVip = (nombreDiseno) => lazy(() => 
  import(`../menus_exclusivos/${nombreDiseno}.jsx`)
  .catch(() => ({ 
    default: () => (
      <div className="min-h-screen flex items-center justify-center flex-col gap-2 p-6 text-center bg-white">
        <h2 className="text-xl font-bold text-red-500">Error de Diseño Exclusivo</h2>
        <p className="text-gray-700">El sistema intentó cargar el diseño <b>"{nombreDiseno}"</b> pero no encontró el archivo <b>{nombreDiseno}.jsx</b> en la carpeta <b>src/menus_exclusivos/</b>.</p>
        <p className="text-sm opacity-70 mt-2 text-gray-500">Por favor, revisá que el nombre del archivo coincida exactamente con la base de datos.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold shadow-md cursor-pointer hover:bg-black transition-colors">Reintentar</button>
      </div>
    ) 
  }))
);

function MenuPage() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const scrollRef = useRef(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [errorLocal, setErrorLocal] = useState(false);
  
  // NUEVO: ESTADO PARA GUARDAR EL COMPONENTE VIP EN MEMORIA
  const [MenuVIP, setMenuVIP] = useState(null);

  const { 
    carrito, 
    agregarAlCarrito, 
    quitarDelCarrito, 
    vaciarCarrito, 
    totalItems, 
    totalDinero, 
    limpiarProductosInactivos,
    subtotal,           
    cuponAplicado,      
    aplicarCupon,       
    removerCupon        
  } = useCart(slug);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await obtenerMenu(slug);

        if (!data || data.error) {
          setErrorLocal(true);
          return; 
        }

        setMenu(data);
        
        // --- MAGIA VIP: SI TIENE DISEÑO, PREPARAMOS LA DESCARGA EN SEGUNDO PLANO ---
        if (data.disenoExclusivo) {
          setMenuVIP(() => cargarMenuVip(data.disenoExclusivo));
        }
        
        const todasLasCategorias = data.categoriasMenu || data.categorias || []; 
        const idsValidos = [];
        
        todasLasCategorias.forEach(cat => {
          if (cat.productos) {
            cat.productos.forEach(p => {
              if (p.activo !== false && p.eliminado !== true && !p.nombre.toUpperCase().includes("(ELIMINADO)")) {
                 idsValidos.push(p.id);
              }
            });
          }
        });
        
        limpiarProductosInactivos(idsValidos);

        if (data.tema?.fuente) {
          const fuenteURL = data?.tema?.fuente?.replace(/\s+/g, "+");
          const linkId = "font-dinamica";
   
          let link = document.getElementById(linkId);
          if (!link) {
            link = document.createElement("link");
            link.id = linkId;
            link.rel = "stylesheet";
            document.head.appendChild(link);
          }
          link.href = `https://fonts.googleapis.com/css2?family=${fuenteURL}:wght@400;700;900&display=swap`;
        }
        
        const cats = todasLasCategorias.filter(cat => {
          if (cat.activo === false) return false; 
          const tieneProductos = cat.productos && cat.productos.some(p => p.activo !== false && !p.nombre.toUpperCase().includes("(ELIMINADO)"));
          return tieneProductos; 
        });
        
        setCategorias(cats);
        
        if (cats.length > 0) {
          setCategoriaActiva(cats[0].id);
        }
        
      } catch (error) {
        console.error("Error al cargar el menú:", error);
        setErrorLocal(true);
      }
    };
    cargarDatos();
  }, [slug, limpiarProductosInactivos]);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === "left") current.scrollLeft -= 300;
    else current.scrollLeft += 300;
  };

  if (errorLocal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <h1 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Local no disponible</h1>
      </div>
    );
  }

  if (!menu) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-[1.1rem] opacity-50 tracking-wider">cargando menú...</span>
    </div>
  );

  // ---------------------------------------------------------
  // RUTA VIP: SI EL LOCAL TIENE DISEÑO, SE MUESTRA ESE ARCHIVO
  // ---------------------------------------------------------
  if (menu.disenoExclusivo && MenuVIP) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="text-[1.1rem] opacity-50 tracking-wider font-bold animate-pulse">Cargando experiencia exclusiva...</span>
        </div>
      }>
        {/* Le pasamos TODA la información y poderes de tu sistema a tu diseño a medida */}
        <MenuVIP 
          menu={menu}
          categorias={categorias}
          carrito={carrito}
          agregarAlCarrito={agregarAlCarrito}
          quitarDelCarrito={quitarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          totalItems={totalItems}
          totalDinero={totalDinero}
          subtotal={subtotal}
          cuponAplicado={cuponAplicado}
          aplicarCupon={aplicarCupon}
          removerCupon={removerCupon}
          slug={slug}
        />
      </Suspense>
    );
  }
  // ---------------------------------------------------------

  const { colorFondo, colorTexto, colorPrimario, colorSecundario, fuente, imagenPortada, logoUrl, colorCarrito } = menu.tema;
  const { whatsapp, instagramUrl, direccionMapaEmbed} = menu;
  const productosAMostrar = (menu.categorias?.find(c => c.id === categoriaActiva)?.productos || [])
    .filter(prod => prod.eliminado !== true && !prod.nombre.toUpperCase().includes("(ELIMINADO)"));

  return (
    <div 
      className="min-h-screen pb-40 relative" 
      style={{ 
        backgroundColor: colorFondo, 
        color: colorTexto, 
        fontFamily: `'${fuente}', sans-serif`,
        "--cf": colorFondo
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease both; }
       
        .contenedor-mapa iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
      `}</style>

      {/* PORTADA */}
      <div className="relative">
        <img
          src={imagenPortada}
          alt="portada"
          className="w-full h-55 object-cover block"
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{ background: `linear-gradient(to top, var(--cf) 0%, transparent 100%)` }}
        />
        
        {/* LOGO */}
        <div 
          className="absolute left-1/2 -bottom-9 -translate-x-1/2 rounded-full overflow-hidden w-22 h-22 shadow-lg border-4"
          style={{ borderColor: colorFondo, backgroundColor: colorFondo }}
        >
          <img src={logoUrl} alt="logo" className="w-full h-full object-cover block" />
        </div>
      </div>

     {/* HEADER INFO */}
      <div className="mt-14 text-center px-6">
        <h1 className="text-[clamp(1.8rem,6vw,2.6rem)] font-black tracking-tight leading-tight mb-2">
          {menu.nombre}
        </h1>
        <p className="opacity-70 max-w-95 mx-auto text-[0.95rem] leading-relaxed mb-4">
          {menu.descripcion}
        </p>

        {/* --- SUCURSALES --- */}
        {menu.sucursales && menu.sucursales.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in">
            {menu.sucursales.map((sucursal) => (
              <a 
                key={sucursal.slug}
                href={`/${sucursal.slug}`} 
                className="px-3 py-1.5 rounded-full text-[0.75rem] font-bold border transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                style={{ 
                  borderColor: colorPrimario, 
                  color: colorPrimario, 
                  backgroundColor: `${colorPrimario}10` 
                }}
              >
                - {sucursal.direccion}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* DIVIDER DECORATIVO */}
      <div className="flex items-center gap-3 my-7 mx-auto max-w-85 px-6">
        <div className="flex-1 h-px opacity-20" style={{ backgroundColor: colorTexto }} />
        <div className="flex-1 h-px opacity-20" style={{ backgroundColor: colorTexto }} />
      </div>

      {/* CATEGORÍAS */}
      <div 
        className="sticky top-0 z-20 pt-3 pb-3.5 border-b"
        style={{ backgroundColor: colorFondo, borderColor: `${colorTexto}0e` }}
      >
        <div className="flex items-center max-w-180 mx-auto">
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex w-8 h-8 rounded-full border items-center justify-center cursor-pointer ml-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            style={{ borderColor: `${colorTexto}25`, backgroundColor: colorFondo, color: colorTexto }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex overflow-x-auto gap-2 scroll-smooth grow px-4"
          >
            {categorias.map((cat) => {
              const isActivo = categoriaActiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap font-bold text-[0.88rem] shrink-0 cursor-pointer tracking-wider uppercase transition-all duration-200 ${isActivo ? 'shadow-md scale-100' : 'hover:-translate-y-px'}`}
                  style={{
                    border: isActivo ? "none" : `1.5px solid ${colorTexto}20`,
                    backgroundColor: isActivo ? colorPrimario : "transparent",
                    color: isActivo ? colorFondo : colorTexto,
                    opacity: isActivo ? 1 : 0.7,
                  }}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex w-8 h-8 rounded-full border items-center justify-center cursor-pointer mr-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            style={{ borderColor: `${colorTexto}25`, backgroundColor: colorFondo, color: colorTexto }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

     {/* PRODUCTOS */}
     <div className="pt-6 px-4 max-w-160 mx-auto grid gap-3">
        {productosAMostrar.length > 0 ? (
          productosAMostrar.map((prod, i) => {
            const itemEnCarrito = carrito.find(p => p.id === prod.id);
            const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            
            const hayDescuento = prod.descuento > 0;
            const precioVenta = hayDescuento ? prod.precio - (prod.precio * prod.descuento / 100) : prod.precio;
            
            const estaActivo = prod.activo !== false;

            return (
              <div
                key={prod.id}
                className={`animate-fade-in flex justify-between items-stretch p-4 rounded-xl border transition-colors duration-200 gap-3.5 relative overflow-hidden ${!estaActivo ? 'opacity-60 grayscale' : ''}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  backgroundColor: cantidad > 0 ? colorPrimario + "15" : "transparent",
                  borderColor: cantidad > 0 ? colorPrimario : colorTexto + "30",
                }}
              >
                {/* ETIQUETAS SUPERIORES */}
                {!estaActivo ? (
                   <div 
                    className="absolute top-0 left-0 px-3 py-1.5 font-black text-[11px] shadow-md z-10 rounded-br-xl uppercase tracking-widest bg-gray-800 text-white"
                   >
                     Agotado
                   </div>
                ) : hayDescuento ? (
                  <div 
                    className="absolute top-0 left-0 px-3 py-1.5 font-black text-[11px] shadow-md z-10 rounded-br-xl uppercase tracking-widest"
                    style={{ backgroundColor: colorSecundario, color: colorFondo }}
                  >
                     {prod.descuento}% OFF
                  </div>
                ) : null}

                {/* INFO */}
                <div className={`flex-1 flex flex-col justify-between ${hayDescuento || !estaActivo ? 'pt-5' : ''}`}> 
                  <div>
                    <h3 className="font-bold text-[1.1rem] leading-tight mb-1 tracking-tight" style={{ color: colorTexto }}>
                      {prod.nombre}
                    </h3>
                    <p className="text-[0.83rem] opacity-70 leading-relaxed mb-2.5 line-clamp-2" style={{ color: colorTexto }}>
                      {prod.descripcion}
                    </p>
                  </div>

                  {/* PRECIO + CONTROLES */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xl tracking-tight" style={{ color: colorPrimario, fontFamily: "Poppins"}}>
                        ${precioVenta}
                      </span>
                      {hayDescuento && (
                        <span className="text-[0.85rem] opacity-40 line-through font-bold">
                          ${prod.precio}
                        </span>
                      )}
                    </div>

                    {/* CONTROLES DE + / - (Ocultos si no está activo) */}
                    {estaActivo && (
                      <div className="flex items-center gap-2.5 ml-auto">
                        {cantidad > 0 && (
                          <button
                            onClick={() => quitarDelCarrito(prod)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm cursor-pointer active:scale-90"
                            style={{ borderColor: colorPrimario, color: colorPrimario }}
                          >-</button>
                        )}
                        {cantidad > 0 && (
                          <span className="font-extrabold text-[0.95rem] min-w-5 text-center">{cantidad}</span>
                        )}
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm active:scale-90"
                          style={{ backgroundColor: colorPrimario, color: colorFondo }}
                        >+</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* IMAGEN */}
                {prod.imagenUrl && (
                  <img src={prod.imagenUrl} alt={prod.nombre} className="w-22 h-22 rounded-lg object-cover self-center shrink-0" />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center mt-12 opacity-50"><p>Sin productos.</p></div>
        )}
      </div>

      {/* FOOTER: REDES Y MAPA */}
      <div className="mt-16 px-6 text-center pb-12">
        
        {/* REDES SOCIALES */}
        {(whatsapp || instagramUrl) && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-6 opacity-80" style={{ color: colorTexto }}>Encontranos en</h2>
            <div className="flex justify-center gap-5">
              
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-transform hover:-translate-y-1 active:scale-95 drop-shadow-sm flex items-center justify-center rounded-full w-16 h-16 border-2"
                  style={{ borderColor: colorSecundario }} 
                >
                  <img 
                    src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774564000/whatsapp-logo-whatsapp-icon-whatsapp-transparent-free-png_uaqj6k.png" 
                    alt="WhatsApp" 
                    className="w-12 h-12 object-contain"
                  />
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-transform hover:-translate-y-1 active:scale-95 drop-shadow-sm flex items-center justify-center rounded-full w-16 h-16 border-2"
                  style={{ borderColor: colorSecundario }}
                >
                   <img 
                    src="https://res.cloudinary.com/dca2psqfg/image/upload/v1774564000/instagram-logo-instagram-icon-transparent-free-png_mnlash.png" 
                    alt="Instagram" 
                    className="w-12 h-12 object-contain"
                  />
                </a>
              )}

            </div>
          </div>
        )}

        {/* MAPA INTERACTIVO */}
        {direccionMapaEmbed && (
          <div className="max-w-lg mx-auto mb-10">
            <h2 className="text-lg font-bold mb-4 opacity-80" style={{ color: colorTexto }}>Nuestra ubicación</h2>
            <div
              className="w-full h-64 rounded-2xl overflow-hidden shadow-sm border [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
              style={{ borderColor: colorTexto + '15', backgroundColor: colorTexto + '05' }}
              dangerouslySetInnerHTML={{ __html: direccionMapaEmbed }}
            />
          </div>
        )}
      </div>

      {/* CARRITO FLOTANTE */}
      {totalItems > 0 && !mostrarCarrito && (
        <div
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-6 right-5 flex items-center gap-3 pl-3 pr-6 py-3 rounded-2xl shadow-xl z-40 cursor-pointer transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95 border-2 border-white/20"
          style={{ backgroundColor: colorPrimario }}
        >
          <div className="relative flex items-center justify-center rounded-xl p-1.5 shrink-0">
            <img
              src={colorCarrito === "NEGRO" ? CARRITO_NEGRO_URL : CARRITO_BLANCO_URL}
              alt="carrito"
              className="w-9 h-9 object-contain block drop-shadow-sm"
            />
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black border-2 shadow-sm"
              style={{ color: colorPrimario, borderColor: colorPrimario, backgroundColor: colorFondo }}
            >
              {totalItems}
            </span>
          </div>

          <div className="flex flex-col" style={{ color: colorFondo }}>
            <span className="font-bold text-[1.05rem] leading-tight mb-0.5 tracking-tight">Ver pedido</span>
            <span className="text-[0.85rem] opacity-95 font-bold leading-none" style={{fontFamily: "Poppins"}}>${totalDinero}</span>
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
        nombreLocal={menu.nombre}
        numeroWhatsApp={whatsapp}
        slug={slug}
        subtotal={subtotal}
        cuponAplicado={cuponAplicado}
        aplicarCupon={aplicarCupon}
        removerCupon={removerCupon}
        localId={menu.id}
        cobroAutomatico={menu.cobroAutomatico}
      />
 
      <footer className="py-8 text-center opacity-60">
        <p className="text-xs font-medium">
          Desarrollado por{" "}
          <a 
            href="https://pedialgoar.com" 
            target="_blank" 
            rel="noreferrer"
            className="font-bold hover:text-orange-500 transition-colors"
          >
            pedialgoar.com
          </a>
        </p>
      </footer>
    </div>
  );
}

export default MenuPage;