/**
 * @deprecated
 * Esta base de datos Dexie (IndexedDB) ha sido reemplazada por SQLite (Backend).
 * Usa el cliente en `src/api/client.js` para comunicarte con el servidor.
 */
export const db = null;
export async function seedAdminIfMissing() { return Promise.resolve(); }
