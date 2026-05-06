import { getDatabase } from './connection';
import fs from 'fs';
import path from 'path';

export function initializeDatabase(): void {
  const db = getDatabase();

  // Ensure data directory exists
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storeId TEXT NOT NULL,
      username TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (storeId) REFERENCES stores(id),
      UNIQUE(storeId, username)
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storeId TEXT NOT NULL,
      tableNumber INTEGER NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (storeId) REFERENCES stores(id),
      UNIQUE(storeId, tableNumber)
    );

    CREATE TABLE IF NOT EXISTS table_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      tableId INTEGER NOT NULL,
      storeId TEXT NOT NULL,
      startedAt TEXT NOT NULL DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (tableId) REFERENCES tables(id),
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storeId TEXT NOT NULL,
      name TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      storeId TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK(price >= 0),
      description TEXT,
      imageUrl TEXT,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      isAvailable INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      tableId INTEGER NOT NULL,
      storeId TEXT NOT NULL,
      totalAmount INTEGER NOT NULL CHECK(totalAmount >= 0),
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (sessionId) REFERENCES table_sessions(id),
      FOREIGN KEY (tableId) REFERENCES tables(id),
      FOREIGN KEY (storeId) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      menuItemId INTEGER NOT NULL,
      menuName TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity >= 1),
      unitPrice INTEGER NOT NULL CHECK(unitPrice >= 0),
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(sessionId);
    CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(storeId);
    CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(tableId);
    CREATE INDEX IF NOT EXISTS idx_table_sessions_table ON table_sessions(tableId);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(categoryId);
    CREATE INDEX IF NOT EXISTS idx_menu_items_store ON menu_items(storeId);
  `);
}
