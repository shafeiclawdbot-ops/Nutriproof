// SQLite database service for local caching
import * as SQLite from 'expo-sqlite';
import { Product } from '../types/product';

const DB_NAME = 'nutriproof.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DB_NAME);
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      scanned_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_scanned_at ON products(scanned_at DESC);
  `);
}

export async function getCachedProduct(barcode: string): Promise<Product | null> {
  if (!db) await initDatabase();
  
  const result = await db!.getFirstAsync<{ data: string }>(
    'SELECT data FROM products WHERE barcode = ?',
    [barcode]
  );
  
  if (result) {
    return JSON.parse(result.data);
  }
  return null;
}

export async function cacheProduct(product: Product): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    `INSERT OR REPLACE INTO products (barcode, data, scanned_at) VALUES (?, ?, ?)`,
    [product.barcode, JSON.stringify(product), product.scanned_at]
  );
}

export async function getRecentScans(limit: number = 20): Promise<Product[]> {
  if (!db) await initDatabase();
  
  const results = await db!.getAllAsync<{ data: string }>(
    'SELECT data FROM products ORDER BY scanned_at DESC LIMIT ?',
    [limit]
  );
  
  return results.map(r => JSON.parse(r.data));
}

export async function deleteProduct(barcode: string): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync('DELETE FROM products WHERE barcode = ?', [barcode]);
}

export async function clearAllProducts(): Promise<void> {
  if (!db) await initDatabase();
  
  await db!.runAsync('DELETE FROM products');
}
