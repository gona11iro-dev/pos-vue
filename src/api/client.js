import { Capacitor } from '@capacitor/core';
import * as native from './sqliteDriver';

const API_URL = 'http://localhost:3000/api';
const isAndroid = Capacitor.getPlatform() === 'android';

/**
 * Cliente de API simplificado para comunicarse con el servidor SQLite.
 */
export async function apiFetch(endpoint, options = {}) {
  // Si estamos en Android, las llamadas a la API ya no se hacen por red, sino al DB nativo
  // Excepto si quisiéramos conexión remota, pero el usuario pidió "Standalone".
  const { body, method = 'GET' } = options;
  
  if (isAndroid) {
    return handleNativeRoute(endpoint, method, body);
  }

  // Comportamiento normal en Web/Escritorio
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
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

/**
 * Ruteador interno para emular la API usando SQLite nativo en el dispositivo móvil.
 */
async function handleNativeRoute(endpoint, method, body) {
  console.log(`[Native Bridge] ${method} ${endpoint}`);

  // Auth: Login simple
  if (endpoint === '/auth/login' && method === 'POST') {
    try {
      const q = 'SELECT * FROM usuarios WHERE LOWER(username) = ? AND password = ?';
      const rows = await native.nativeQuery(q, [body.username.toLowerCase(), body.password]);
      
      if (rows && rows.length > 0) {
        console.log('[Native Bridge] Login exitoso para:', rows[0].username);
        return rows[0]; // Retornar el objeto usuario directamente
      }
      console.warn('[Native Bridge] Login fallido: Credenciales incorrectas');
      throw new Error('Usuario o contraseña incorrectos');
    } catch (err) {
      console.error('[Native Bridge] Error en login:', err.message);
      throw err;
    }
  }

  // Productos
  if (endpoint === '/productos' && method === 'GET') {
    const rows = await native.nativeQuery('SELECT * FROM productos');
    // Asegurar que el barcode sea String al salir de la DB
    return (rows || []).map(r => ({ ...r, barcode: String(r.barcode) }));
  }
  if (endpoint === '/productos' && method === 'POST') {
    const sql = `INSERT OR REPLACE INTO productos (barcode, name, price, stock, unit) VALUES (?, ?, ?, ?, ?)`;
    const b = body;
    await native.nativeRun(sql, [String(b.barcode).trim(), b.name, b.price, b.stock, b.unit]);
    return { success: true };
  }
  if (endpoint.startsWith('/productos/') && method === 'DELETE') {
    const barcode = endpoint.split('/').pop();
    await native.nativeRun('DELETE FROM productos WHERE barcode = ?', [barcode]);
    return { success: true };
  }

  // Ventas (Historial)
  if (endpoint === '/ventas' && method === 'GET') {
    const ventas = await native.nativeQuery('SELECT * FROM ventas ORDER BY id DESC');
    // Cargar items para cada venta (esto es simplificado)
    for (let v of ventas) {
      v.items = await native.nativeQuery('SELECT * FROM venta_items WHERE venta_id = ?', [v.id]);
    }
    return ventas;
  }
  // Ventas (Registro)
  if (endpoint === '/ventas' && method === 'POST') {
    // Transacción manual
    const resVenta = await native.nativeRun(
      'INSERT INTO ventas (date, client, method, paidAmount, "change", total) VALUES (?, ?, ?, ?, ?, ?)',
      [body.date, body.client, body.method, body.paidAmount, body.change, body.total]
    );
    const ventaId = resVenta.changes.lastId;

    for (let item of body.items) {
      const bcode = String(item.barcode).trim();
      await native.nativeRun(
        'INSERT INTO venta_items (venta_id, barcode, name, price, qty) VALUES (?, ?, ?, ?, ?)',
        [ventaId, bcode, item.name, item.price, item.qty]
      );
      // Actualizar stock si es por pieza
      if (item.unit === 'pza' || !item.unit) {
        await native.nativeRun('UPDATE productos SET stock = stock - ? WHERE barcode = ?', [item.qty, bcode]);
      }
    }
    return { success: true, id: ventaId };
  }
  
  if (endpoint.startsWith('/ventas/') && method === 'DELETE') {
    const id = endpoint.split('/').pop();
    // 1. Obtener items
    const items = await native.nativeQuery('SELECT * FROM venta_items WHERE venta_id = ?', [id]);
    // 2. Devolver stock
    for (const item of items) {
      await native.nativeRun('UPDATE productos SET stock = stock + ? WHERE barcode = ?', [item.qty, item.barcode]);
    }
    // 3. Borrar
    await native.nativeRun('DELETE FROM venta_items WHERE venta_id = ?', [id]);
    await native.nativeRun('DELETE FROM ventas WHERE id = ?', [id]);
    return { success: true };
  }

  // Usuarios
  if (endpoint === '/usuarios' && method === 'GET') {
    return await native.nativeQuery('SELECT * FROM usuarios');
  }
  if (endpoint === '/usuarios' && method === 'POST') {
    const sql = `INSERT OR REPLACE INTO usuarios (username, password, role) VALUES (?, ?, ?)`;
    await native.nativeRun(sql, [body.username.toLowerCase(), body.password, body.role]);
    return { success: true };
  }
  if (endpoint.startsWith('/usuarios/') && method === 'DELETE') {
    const id = endpoint.split('/').pop();
    await native.nativeRun('DELETE FROM usuarios WHERE id = ? AND username != "admin"', [id]);
    return { success: true };
  }

  if (endpoint === '/auth/change-password' && method === 'POST') {
    const q = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
    const rows = await native.nativeQuery(q, [body.username, body.currentPassword]);
    
    if (rows && rows.length > 0) {
      await native.nativeRun('UPDATE usuarios SET password = ? WHERE id = ?', [body.newPassword, rows[0].id]);
      return { success: true };
    }
    throw new Error('La contraseña actual es incorrecta');
  }

  throw new Error(`Endpoint nativo no implementado: ${endpoint}`);
}

export const api = {
  // Auth
  login: (username, password) => apiFetch('/auth/login', { method: 'POST', body: { username, password } }),
  changePassword: (username, currentPassword, newPassword) => apiFetch('/auth/change-password', { method: 'POST', body: { username, currentPassword, newPassword } }),

  // Productos
  getProductos: () => apiFetch('/productos'),
  saveProducto: (producto) => apiFetch('/productos', { method: 'POST', body: producto }),
  deleteProducto: (barcode) => apiFetch(`/productos/${barcode}`, { method: 'DELETE' }),

  // Ventas
  getVentas: () => apiFetch('/ventas'),
  registerVenta: (ventaData) => apiFetch('/ventas', { method: 'POST', body: ventaData }),
  deleteVenta: (id) => apiFetch(`/ventas/${id}`, { method: 'DELETE' }),
  
  // Usuarios
  getUsuarios: () => apiFetch('/usuarios'),
  saveUsuario: (user) => apiFetch('/usuarios', { method: 'POST', body: user }),
  deleteUsuario: (id) => apiFetch(`/usuarios/${id}`, { method: 'DELETE' }),
};

