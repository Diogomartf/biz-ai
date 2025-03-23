// lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { Pool } from "pg";

// Connect to NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // NeonDB requires SSL
});

export const db = drizzle(pool);

// Schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  size: integer("size").notNull(),
  processedData: text("processed_data").notNull(),
});
