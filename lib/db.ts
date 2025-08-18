import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "@/lib/schema"

neonConfig.webSocketConstructor = ws

let pool: Pool | null = null
let database: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - database operations will be disabled")
    return null as any
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
// Lazy initialization - don't try to connect at build time
export const db = null as any
