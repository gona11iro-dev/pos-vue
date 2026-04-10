import express from 'express';
import cors from 'cors';
import db, { databaseFilePath } from './database.js';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const shouldServeWebApp = process.env.SERVE_WEB_APP === 'true';
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Origen no permitido por CORS'));
      }
    }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  if (shouldServeWebApp) {
    res.sendFile(path.join(distDir, 'index.html'));
    return;
  }

  res.json({
    service: 'pos-vue-api',
    status: 'ok',
    time: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

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
  const { barcode, name, price, stock, unit } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO productos (barcode, name, price, stock, unit)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(barcode) DO UPDATE SET
        name = excluded.name,
        price = excluded.price,
        stock = excluded.stock,
        unit = excluded.unit
    `);
    stmt.run(barcode, name, price, stock, unit || 'pza');
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
      INSERT INTO venta_items (venta_id, barcode, name, price, qty, unit)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare('UPDATE productos SET stock = stock - ? WHERE barcode = ?');

    for (const item of items) {
      const itemUnit = item.unit || 'pza';
      insertItem.run(ventaId, item.barcode, item.name, item.price, item.qty, itemUnit);
      if (itemUnit === 'pza') {
        updateStock.run(item.qty, item.barcode);
      }
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
      if (!item.unit || item.unit === 'pza') {
        updateStock.run(item.qty, item.barcode);
      }
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

// ── Cortes de caja ────────────────────────────────────────────────
app.get('/api/cortes', (req, res) => {
  const { date } = req.query;
  try {
    if (date) {
      const corte = db.prepare('SELECT * FROM cortes_caja WHERE corte_date = ?').get(date);
      return res.json(corte || null);
    }
    const cortes = db.prepare('SELECT * FROM cortes_caja ORDER BY corte_date DESC').all();
    return res.json(cortes);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/cortes', (req, res) => {
  const { corteDate, total, efectivo, tarjeta, transacciones, productos } = req.body;

  if (!corteDate) {
    return res.status(400).json({ error: 'corteDate es requerido' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO cortes_caja (corte_date, created_at, total, efectivo, tarjeta, transacciones, productos_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(corte_date) DO UPDATE SET
        created_at = excluded.created_at,
        total = excluded.total,
        efectivo = excluded.efectivo,
        tarjeta = excluded.tarjeta,
        transacciones = excluded.transacciones,
        productos_json = excluded.productos_json
    `);

    const nowIso = new Date().toISOString();
    stmt.run(
      corteDate,
      nowIso,
      Number(total || 0),
      Number(efectivo || 0),
      Number(tarjeta || 0),
      Number(transacciones || 0),
      JSON.stringify(productos || [])
    );

    const corte = db.prepare('SELECT * FROM cortes_caja WHERE corte_date = ?').get(corteDate);
    return res.json({ success: true, corte });
  } catch (e) {
    return res.status(500).json({ error: e.message });
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

if (shouldServeWebApp) {
  app.use(express.static(distDir));

  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

export function startServer(port = PORT) {
  const server = app.listen(port, () => {
    console.log(`[PosServer] SQLite server running on port ${port}`);
    console.log(`[PosServer] DB path: ${databaseFilePath}`);
    if (allowedOrigins.length) {
      console.log(`[PosServer] CORS origins: ${allowedOrigins.join(', ')}`);
    }
  });

  return server;
}

const entryFile = process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;

if (entryFile) {
  startServer();
}
