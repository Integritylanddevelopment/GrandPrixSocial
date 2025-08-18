import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "@/lib/schema"

neonConfig.webSocketConstructor = ws

let pool: Pool | null = null
let database: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?")
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }

  if (!database) {
    database = drizzle({ client: pool, schema })
  }

  return database
}

// Export for backward compatibility
export { pool }
