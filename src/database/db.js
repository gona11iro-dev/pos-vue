import Dexie from 'dexie';

export const db = new Dexie('POSDatabase');

db.version(1).stores({
  productos: 'barcode, name, price, stock', // Primary key and indexed props
  ventas: '++id, date, total' // Primary key and indexed props
});
