// lib/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  size: integer("size").notNull(),
  processedData: text("processed_data").notNull(),
});

const sqlite = new Database("uploads.db");
export const db = drizzle(sqlite);

// Initialize schema
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    size INTEGER NOT NULL,
    processed_data TEXT NOT NULL
  )
`);
