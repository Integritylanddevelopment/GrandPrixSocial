#!/usr/bin/env tsx
import { Pool } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

interface Migration {
  id: string
  filename: string
  sql: string
}

class DatabaseMigrator {
  private pool: Pool

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }

  async ensureMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `
    
    await this.pool.query(sql)
    console.log("✅ Migrations table ensured")
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query("SELECT filename FROM migrations ORDER BY id")
    return result.rows.map(row => row.filename)
  }

  async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, "migrations")
    
    if (!fs.existsSync(migrationsDir)) {
      console.log("No migrations directory found")
      return []
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort()

    return files.map(filename => {
      const filepath = path.join(migrationsDir, filename)
      const sql = fs.readFileSync(filepath, "utf-8")
      const id = filename.replace(".sql", "")
      
      return { id, filename, sql }
    })
  }

  async executeMigration(migration: Migration): Promise<void> {
    console.log(`⏳ Executing migration: ${migration.filename}`)
    
    try {
      // Execute the migration SQL
      await this.pool.query(migration.sql)
      
      // Record the migration as executed
      await this.pool.query(
        "INSERT INTO migrations (filename) VALUES ($1)",
        [migration.filename]
      )
      
      console.log(`✅ Migration completed: ${migration.filename}`)
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.filename}`)
      console.error(error)
      throw error
    }
  }

  async runMigrations(): Promise<void> {
    console.log("🚀 Starting database migrations...")
    
    try {
      await this.ensureMigrationsTable()
      
      const [allMigrations, executedMigrations] = await Promise.all([
        this.loadMigrations(),
        this.getExecutedMigrations()
      ])

      const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.filename)
      )

      if (pendingMigrations.length === 0) {
        console.log("✨ No pending migrations")
        return
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations`)

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration)
      }

      console.log("🎉 All migrations completed successfully!")
      
    } catch (error) {
      console.error("💥 Migration process failed:")
      console.error(error)
      process.exit(1)
    } finally {
      await this.pool.end()
    }
  }

  async resetDatabase(): Promise<void> {
    console.log("⚠️  RESETTING DATABASE - This will delete all data!")
    
    try {
      // Drop all tables (be careful!)
      const dropTables = `
        DROP TABLE IF EXISTS migrations CASCADE;
        DROP TABLE IF EXISTS post_comments CASCADE;
        DROP TABLE IF EXISTS post_likes CASCADE;
        DROP TABLE IF EXISTS team_members CASCADE;
        DROP TABLE IF EXISTS posts CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS teams CASCADE;
        DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
      `
      
      await this.pool.query(dropTables)
      console.log("🗑️  All tables dropped")
      
      // Run migrations fresh
      await this.runMigrations()
      
    } catch (error) {
      console.error("💥 Database reset failed:")
      console.error(error)
      process.exit(1)
    }
  }
}

// CLI interface
async function main() {
  const migrator = new DatabaseMigrator()
  const command = process.argv[2] || "migrate"

  switch (command) {
    case "migrate":
      await migrator.runMigrations()
      break
      
    case "reset":
      console.log("⚠️  Are you sure you want to reset the database?")
      console.log("This will delete ALL data. Type 'yes' to confirm:")
      
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.on('data', async (key) => {
        const input = key.toString().trim().toLowerCase()
        if (input === 'yes') {
          await migrator.resetDatabase()
        } else {
          console.log("❌ Database reset cancelled")
        }
        process.exit(0)
      })
      break
      
    default:
      console.log("Usage: tsx lib/migrate.ts [migrate|reset]")
      process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { DatabaseMigrator }