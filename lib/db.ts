// lib/db.ts
import Database from "better-sqlite3";

const db = new Database("uploads.db", { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    size INTEGER NOT NULL,
    processed_data TEXT NOT NULL
  )
`);

export default db;
