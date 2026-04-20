import { useState, useEffect, useCallback } from "react";

export const useCart = (slug) => {
  // SECCIÓN: Estado inicial del carrito
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem(`carrito_${slug}`);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

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

  const vaciarCarrito = () => setCarrito([]);

  const limpiarProductosInactivos = useCallback((idsValidos) => {
    setCarrito((prev) => {
      const filtrado = prev.filter((item) => idsValidos.includes(item.id));
      if (filtrado.length !== prev.length) {
        return filtrado;
      }
      return prev;
    });
  }, []);

  // SECCIÓN: Cálculos de totales
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  
  const totalDinero = carrito.reduce((acc, item) => {
    const hayDescuento = item.descuento > 0;
    const precioVenta = hayDescuento ? item.precio - (item.precio * item.descuento / 100) : item.precio;
    return acc + (precioVenta * item.cantidad);
  }, 0);

  // SECCIÓN: Return del hook
  return { carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, totalItems, totalDinero, limpiarProductosInactivos };
};