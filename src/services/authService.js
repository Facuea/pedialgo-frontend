const API_URL = import.meta.env.VITE_API_URL;

export const loginUsuario = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/public/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let mensajeError = "Credenciales incorrectas";
      
      try {
        const jsonError = JSON.parse(errorText);
        mensajeError = jsonError.mensaje || jsonError.message || errorText;
      } catch (e) {
        mensajeError = errorText || "Error en el servidor";
      }
      
      throw new Error(mensajeError);
    }

    const data = await response.json();
    localStorage.setItem("usuario", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

export const obtenerCategorias = async (slug) => {
  const response = await fetch(`${API_URL}/public/locales/${slug}/categorias`);
  
  if (!response.ok) {
      throw new Error("No se pudieron obtener las categorías");
  }
  
  return await response.json();
};

export const obtenerMenu = async (slug) => {
    const response = await fetch(`${API_URL}/public/menu/${slug}`);
    
    if (!response.ok) {
        throw new Error("LOCAL_INACTIVO_O_NO_ENCONTRADO");
    }
    
    return await response.json();
}