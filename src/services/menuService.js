const API_URL = import.meta.env.VITE_API_URL;

export const obtenerMenu = async (slug) => {
    const response = await fetch(`${API_URL}/public/menu/${slug}`);
    
    if (!response.ok) {
        throw new Error("LOCAL_INACTIVO_O_NO_ENCONTRADO");
    }
    
    return await response.json();
}