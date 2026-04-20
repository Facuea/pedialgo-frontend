import { useState, useEffect, useCallback } from "react";

export const useCart = (slug) => {
  // SECCIÓN: Estado inicial del carrito
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem(`carrito_${slug}`);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  // NUEVO: Estado para el cupón
  const [cuponAplicado, setCuponAplicado] = useState(null);

  // SECCIÓN: Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem(`carrito_${slug}`, JSON.stringify(carrito));
  }, [carrito, slug]);

  // SECCIÓN: Funciones del carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      
      if (existe) {
        return prev.map((p) => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const quitarDelCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (!existe) return prev;
      if (existe.cantidad === 1) return prev.filter(p => p.id !== producto.id);
      return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad - 1 } : p);
    });
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setCuponAplicado(null); // Al vaciar el carrito, se borra el cupón
  };

  const limpiarProductosInactivos = useCallback((idsValidos) => {
    setCarrito((prev) => {
      const filtrado = prev.filter((item) => idsValidos.includes(item.id));
      if (filtrado.length !== prev.length) {
        return filtrado;
      }
      return prev;
    });
  }, []);

  
  const aplicarCupon = (cupon) => {
    setCuponAplicado(cupon);
  };

  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  
 
  const subtotal = carrito.reduce((acc, item) => {
    const hayDescuento = item.descuento > 0;
    const precioVenta = hayDescuento ? item.precio - (item.precio * item.descuento / 100) : item.precio;
    return acc + (precioVenta * item.cantidad);
  }, 0);


  let totalDinero = subtotal;
  if (cuponAplicado) {
    const descuentoMonto = (subtotal * cuponAplicado.descuentoPorcentaje) / 100;
    totalDinero = subtotal - descuentoMonto;
  }

  return { 
    carrito, 
    agregarAlCarrito, 
    quitarDelCarrito, 
    vaciarCarrito, 
    totalItems, 
    totalDinero, 
    subtotal, 
    limpiarProductosInactivos,
    cuponAplicado,
    aplicarCupon
  };
};