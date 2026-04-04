import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Auth ───────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM usuarios WHERE username = ? AND password = ?')
      .get(username, password);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Productos ──────────────────────────────────────────────────────
app.get('/api/productos', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM productos').all();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/productos', (req, res) => {
  const { barcode, name, price, stock, category } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO productos (barcode, name, price, stock, category)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(barcode) DO UPDATE SET
        name = excluded.name,
        price = excluded.price,
        stock = excluded.stock,
        category = excluded.category
    `);
    stmt.run(barcode, name, price, stock, category);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/productos/:barcode', (req, res) => {
  const { barcode } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM productos WHERE barcode = ?');
    stmt.run(barcode);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Ventas ─────────────────────────────────────────────────────────
app.get('/api/ventas', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM ventas ORDER BY date DESC').all();
    // Obtener los artículos para cada venta
    const ventasConItems = rows.map(v => {
      const items = db.prepare('SELECT * FROM venta_items WHERE venta_id = ?').all(v.id);
      return { ...v, items };
    });
    res.json(ventasConItems);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ventas', (req, res) => {
  const { date, total, client, method, paidAmount, change, items } = req.body;
  
  const transaction = db.transaction(() => {
    // 1. Insertar la venta
    const insertVenta = db.prepare(`
      INSERT INTO ventas (date, total, client, method, paidAmount, change)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = insertVenta.run(date, total, client, method, paidAmount, change);
    const ventaId = info.lastInsertRowid;

    // 2. Insertar artículos y actualizar stock
    const insertItem = db.prepare(`
      INSERT INTO venta_items (venta_id, barcode, name, price, qty)
      VALUES (?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare('UPDATE productos SET stock = stock - ? WHERE barcode = ?');

    for (const item of items) {
      insertItem.run(ventaId, item.barcode, item.name, item.price, item.qty);
      // Solo descontar stock si no es pesaje granel (regla de tu POS: solo 'pza')
      // NOTA: Para simplificar, si no viene unidad o es 'pza', descontamos.
      updateStock.run(item.qty, item.barcode);
    }
    
    return ventaId;
  });

  try {
    const id = transaction();
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/ventas/:id', (req, res) => {
  const { id } = req.params;
  
  const transaction = db.transaction(() => {
    // 1. Obtener items de la venta para devolver stock
    const items = db.prepare('SELECT * FROM venta_items WHERE venta_id = ?').all(id);
    
    // 2. Devolver stock
    const updateStock = db.prepare('UPDATE productos SET stock = stock + ? WHERE barcode = ?');
    for (const item of items) {
      updateStock.run(item.qty, item.barcode);
    }

    // 3. Borrar items y luego la venta
    db.prepare('DELETE FROM venta_items WHERE venta_id = ?').run(id);
    db.prepare('DELETE FROM ventas WHERE id = ?').run(id);
    
    return true;
  });

  try {
    transaction();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Usuarios ──────────────────────────────────────────────────────
app.get('/api/usuarios', (req, res) => {
  try {
    const row = db.prepare('SELECT id, username, role FROM usuarios').all();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/usuarios', (req, res) => {
  const { username, password, role } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)');
    stmt.run(username, password, role || 'cajero');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM usuarios WHERE id = ? AND username != "admin"');
    stmt.run(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  try {
    const user = db.prepare('SELECT * FROM usuarios WHERE username = ? AND password = ?')
      .get(username, currentPassword);
    
    if (!user) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    db.prepare('UPDATE usuarios SET password = ? WHERE id = ?')
      .run(newPassword, user.id);
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[PosServer] SQLite server running on http://localhost:${PORT}`);
});

