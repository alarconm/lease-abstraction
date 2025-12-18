import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import * as schema from "./schema";

// Database connection - uses standard node-postgres
// Works with both Replit PostgreSQL and Neon
let db: ReturnType<typeof drizzle<typeof schema>>;

if (process.env.DATABASE_URL) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  db = drizzle(pool, { schema });
  console.log("[DB] Connected to PostgreSQL");
} else {
  console.warn("[DB] DATABASE_URL not set - database features will not work");
  db = null as any;
}

export { db };

// Re-export schema
export * from "./schema";

// Re-export operators
export { eq, and, or, like, desc, asc };
