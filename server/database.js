import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'pos.sqlite');

const db = new Database(dbPath);

/**
 * Inicialización de la base de datos SQL (Esquema)
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cajero'
  );

  CREATE TABLE IF NOT EXISTS productos (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock REAL NOT NULL DEFAULT 0,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total REAL NOT NULL,
    client TEXT,
    method TEXT DEFAULT 'Efectivo',
    paidAmount REAL,
    change REAL
  );

  CREATE TABLE IF NOT EXISTS venta_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    barcode TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    qty REAL NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
  );

  CREATE TABLE IF NOT EXISTS cortes_caja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    corte_date TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0,
    efectivo REAL NOT NULL DEFAULT 0,
    tarjeta REAL NOT NULL DEFAULT 0,
    transacciones INTEGER NOT NULL DEFAULT 0,
    productos_json TEXT NOT NULL DEFAULT '[]'
  );
`);

// Seed: Usuario admin por defecto si no existe
const seedAdmin = db.prepare('SELECT * FROM usuarios WHERE username = ?').get('admin');
if (!seedAdmin) {
  db.prepare('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)')
    .run('admin', '1234', 'admin');
  console.log('[DB] Admin user created (admin / 1234)');
}

export default db;
