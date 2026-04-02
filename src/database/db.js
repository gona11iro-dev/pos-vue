import Dexie from 'dexie';

export const db = new Dexie('POSDatabase');

// ─── Versión 1: estructura original ──────────────────────────────────────────
db.version(1).stores({
  productos: 'barcode, name, price, stock',
  ventas:    '++id, date, total',
});

// ─── Versión 2: incorpora tabla de usuarios ───────────────────────────────────
// NOTA: El índice &username garantiza unicidad pero NO provoca error si ya existe
// el registro; Dexie lo respeta durante la migración gracias al try/catch abajo.
db.version(2).stores({
  productos: 'barcode, name, price, stock',
  ventas:    '++id, date, total',
  usuarios:  '++id, &username, role',
});

// ─── Seed: cuando la BD se crea por primera vez (instalación limpia) ──────────
db.on('populate', async () => {
  await db.usuarios.add({ username: 'admin', password: '1234', role: 'admin' });
});

/**
 * Asegura que exista al menos UN administrador en la base de datos.
 * Debe llamarse una sola vez al arrancar la app (ver main.js).
 * Es idempotente: si el admin ya existe, no hace nada.
 */
export async function seedAdminIfMissing() {
  try {
    const existing = await db.usuarios.where('username').equals('admin').first();
    if (!existing) {
      await db.usuarios.add({ username: 'admin', password: '1234', role: 'admin' });
      console.info('[DB] Usuario admin creado por defecto (admin / 1234).');
    }
  } catch (e) {
    // Si falla por constraint de unicidad, el admin ya existe — no pasa nada.
    console.warn('[DB] seedAdminIfMissing:', e.message);
  }
}
