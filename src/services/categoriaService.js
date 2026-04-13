const API_URL = import.meta.env.VITE_API_URL;

export const obtenerCategorias = async (slug) => {
  const response = await fetch(`${API_URL}/public/locales/${slug}/categorias`);
  
  if (!response.ok) {
      throw new Error("No se pudieron obtener las categorías");
  }
  
  return await response.json();
};