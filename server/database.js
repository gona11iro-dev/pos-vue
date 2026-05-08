import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configuredDbPath = process.env.SQLITE_DB_PATH || process.env.DATABASE_PATH || path.join(__dirname, 'pos.sqlite');
const dbPath = path.isAbsolute(configuredDbPath)
  ? configuredDbPath
  : path.resolve(process.cwd(), configuredDbPath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

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
    unit TEXT DEFAULT 'pza',
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
    unit TEXT DEFAULT 'pza',
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

  CREATE TABLE IF NOT EXISTS pollos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ventas_pollo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total REAL NOT NULL,
    client TEXT,
    method TEXT DEFAULT 'Efectivo',
    paidAmount REAL,
    change REAL
  );

  CREATE TABLE IF NOT EXISTS venta_pollo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    pollo_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    qty REAL NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas_pollo(id)
  );

  CREATE TABLE IF NOT EXISTS cortes_caja_pollo (
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

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some(column => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

ensureColumn('productos', 'unit', "TEXT DEFAULT 'pza'");
ensureColumn('venta_items', 'unit', "TEXT DEFAULT 'pza'");

db.prepare(`UPDATE productos SET unit = 'pza' WHERE unit IS NULL OR TRIM(unit) = ''`).run();
db.prepare(`UPDATE venta_items SET unit = 'pza' WHERE unit IS NULL OR TRIM(unit) = ''`).run();

// Seed: Usuario admin por defecto si no existe
const seedAdmin = db.prepare('SELECT * FROM usuarios WHERE username = ?').get('admin');
if (!seedAdmin) {
  db.prepare('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)')
    .run('admin', '1234', 'admin');
  console.log('[DB] Admin user created (admin / 1234)');
}

// Seed: Pollos por defecto
const pollosCount = db.prepare('SELECT COUNT(*) as count FROM pollos').get();
if (pollosCount.count === 0) {
  const insertPollo = db.prepare('INSERT INTO pollos (nombre, precio) VALUES (?, ?)');
  insertPollo.run('Pollo Entero', 120.0);
  insertPollo.run('Pechuga', 45.0);
  insertPollo.run('Pierna y Muslo', 35.0);
  insertPollo.run('Medio Pollo', 60.0);
  insertPollo.run('Alitas', 20.0);
  console.log('[DB] Seeded initial pollos data');
}

export default db;
export { dbPath as databaseFilePath };
