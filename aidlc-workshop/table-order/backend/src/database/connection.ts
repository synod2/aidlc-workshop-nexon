import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.resolve(DATA_DIR, 'table-order.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
