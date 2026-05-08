import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db = null;
let isInitializing = false;

/**
 * Inicializa la base de datos local en el dispositivo (Móvil).
 * Crea las tablas necesarias si es la primera vez que se abre.
 */
export async function initNativeDB() {
  if (Capacitor.getPlatform() === 'web') return null;
  if (db) return db;
  if (isInitializing) return null;
  isInitializing = true;

  console.log('[NativeDB] Iniciando proceso de conexión...');

  try {
    // 1. Verificar consistencia de conexiones (Recomendado por el plugin)
    await sqlite.checkConnectionsConsistency();

    // 2. Crear/Cargar conexión
    const dbName = 'pos_tiolale_db';
    const isConn = await sqlite.isConnection(dbName, false);
    
    if (isConn.result) {
      db = await sqlite.retrieveConnection(dbName, false);
      console.log('[NativeDB] Conexión recuperada.');
    } else {
      db = await sqlite.createConnection(
        dbName,
        false, // no encriptado
        'no-encryption',
        1,     // versión
        false  // no solo lectura
      );
      console.log('[NativeDB] Nueva conexión creada.');
    }

    // 3. Abrir base de datos
    await db.open();
    console.log('[NativeDB] Base de datos abierta.');

    // 4. Crear tablas (Esquema idéntico al servidor)
    const schema = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS productos (
        barcode TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock TEXT NOT NULL,
        unit TEXT DEFAULT 'pza'
      );
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        client TEXT,
        method TEXT NOT NULL,
        paidAmount REAL NOT NULL,
        "change" REAL NOT NULL,
        total REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS venta_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        barcode TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        qty REAL NOT NULL,
        unit TEXT DEFAULT 'pza',
        FOREIGN KEY (venta_id) REFERENCES ventas (id)
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
    `;
    await db.execute(schema);
    await ensureNativeColumn('venta_items', 'unit', "TEXT DEFAULT 'pza'");
    
    console.log('[NativeDB] Esquema verificado/creado.');

    // 5. Crear usuario admin por defecto si no hay usuarios
    const resUsers = await db.query('SELECT COUNT(*) as count FROM usuarios');
    if (resUsers && resUsers.values && resUsers.values[0].count === 0) {
      await db.run('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', ['admin', '1234', 'admin']);
      console.log('[NativeDB] Usuario admin (admin/1234) creado por ser la primera vez.');
    }

    console.log('[NativeDB] Inicialización completada con éxito.');
    return db;
  } catch (e) {
    console.error('[NativeDB] ERROR CRÍTICO:', e.message);
    throw e;
  } finally {
    isInitializing = false;
  }
}

async function ensureNativeColumn(tableName, columnName, definition) {
  const res = await db.query(`PRAGMA table_info(${tableName})`);
  const columns = res.values || [];
  const hasColumn = columns.some(column => column.name === columnName);

  if (!hasColumn) {
    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

/**
 * Wrapper para consultas SQL nativas (Select)
 */
export async function nativeQuery(sql, params = []) {
  if (!db) await initNativeDB();
  const res = await db.query(sql, params);
  return res.values || [];
}

/**
 * Wrapper para comandos SQL nativos (Insert/Update/Delete)
 */
export async function nativeRun(sql, params = []) {
  if (!db) await initNativeDB();
  return await db.run(sql, params);
}
