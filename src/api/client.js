const API_URL = 'http://localhost:3000/api';

/**
 * Cliente de API simplificado para comunicarse con el servidor SQLite.
 */
export async function apiFetch(endpoint, options = {}) {
  const { body, ...rest } = options;
  const config = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (username, password) => apiFetch('/auth/login', { method: 'POST', body: { username, password } }),

  // Productos
  getProductos: () => apiFetch('/productos'),
  saveProducto: (producto) => apiFetch('/productos', { method: 'POST', body: producto }),
  deleteProducto: (barcode) => apiFetch(`/productos/${barcode}`, { method: 'DELETE' }),

  // Ventas
  getVentas: () => apiFetch('/ventas'),
  registerVenta: (ventaData) => apiFetch('/ventas', { method: 'POST', body: ventaData }),

  // Usuarios
  getUsuarios: () => apiFetch('/usuarios'),
  saveUsuario: (user) => apiFetch('/usuarios', { method: 'POST', body: user }),
  deleteUsuario: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' }),
};
