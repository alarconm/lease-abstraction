import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import * as schema from "./schema";

// Database connection - supports both Neon (serverless) and standard Postgres (Replit)
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (process.env.DATABASE_URL) {
  // Check if it's a Neon database (contains neon.tech)
  if (process.env.DATABASE_URL.includes("neon.tech")) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzleNeon(sql, { schema });
    console.log("[DB] Connected to Neon PostgreSQL");
  } else {
    // Standard PostgreSQL (Replit or local)
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    db = drizzlePg(pool, { schema });
    console.log("[DB] Connected to PostgreSQL");
  }
} else {
  console.warn("[DB] DATABASE_URL not set - database features will not work");
  // Create a dummy db that will throw errors on use
  db = null as any;
}

export { db };

// Re-export schema
export * from "./schema";

// Re-export operators
export { eq, and, or, like, desc, asc };
