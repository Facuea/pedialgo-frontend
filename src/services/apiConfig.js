const API_URL = import.meta.env.VITE_API_URL;

export const fetchPrivado = async (endpoint, opciones = {}) => {
  const usuarioInfo = localStorage.getItem("usuario");
  let token = "";

  if (usuarioInfo) {
    const usuario = JSON.parse(usuarioInfo);
    token = usuario.token; 
  }

  const headers = { ...opciones.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (opciones.body instanceof FormData) {
    delete headers["Content-Type"]; 
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"; 
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("localActivo");
    window.location.href = "/login"; 
    throw new Error("Sesión expirada o cuenta suspendida. Por favor, iniciá sesión nuevamente.");
  }

  return response;
};