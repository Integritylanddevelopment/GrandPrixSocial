import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/lib/schema"
import { config } from "dotenv"

// Load environment variables
config()

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  console.log("🚀 Starting database migration...")
  
  // Create postgres connection
  const client = postgres(connectionString)
  const db = drizzle(client, { schema })

  try {
    console.log("📋 Creating database tables...")

    // Create tables in correct order (considering foreign key dependencies)
    
    // Core user and auth tables
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar TEXT,
        points INTEGER NOT NULL DEFAULT 0,
        rank INTEGER NOT NULL DEFAULT 0,
        team_id VARCHAR,
        favorite_driver TEXT,
        favorite_team TEXT,
        ai_consent_given BOOLEAN NOT NULL DEFAULT false,
        ai_consent_date TIMESTAMP,
        ai_consent_version TEXT DEFAULT '1.0',
        data_retention_period TEXT DEFAULT '30days',
        ai_features JSONB DEFAULT '{"contentPersonalization": false, "socialMatching": false, "interfaceCustomization": false, "behaviorTracking": false, "analyticsInsights": false, "marketingCommunications": false}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `

    // Sponsors table
    await client`
      CREATE TABLE IF NOT EXISTS sponsors (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        logo TEXT NOT NULL,
        brand_color TEXT NOT NULL,
        website TEXT,
        description TEXT,
        partnership_level TEXT NOT NULL DEFAULT 'standard',
        merchandise_discount INTEGER DEFAULT 0,
        cafe_perks TEXT[] DEFAULT '{}',
        season_contract BOOLEAN DEFAULT false,
        active_benefits TEXT[] DEFAULT '{}'
      )
    `

    // Teams table
    await client`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT NOT NULL DEFAULT '#DC2626',
        logo TEXT,
        sponsor_id VARCHAR,
        captain_id VARCHAR NOT NULL,
        member_count INTEGER NOT NULL DEFAULT 1,
        total_points INTEGER NOT NULL DEFAULT 0,
        wins INTEGER NOT NULL DEFAULT 0,
        is_recruiting BOOLEAN NOT NULL DEFAULT true,
        team_level TEXT NOT NULL DEFAULT 'member',
        can_host_events BOOLEAN NOT NULL DEFAULT false,
        can_sell_merch BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (sponsor_id) REFERENCES sponsors(id),
        FOREIGN KEY (captain_id) REFERENCES users(id)
      )
    `

    // F1 specific tables
    await client`
      CREATE TABLE IF NOT EXISTS circuits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        circuit_name TEXT NOT NULL,
        location TEXT NOT NULL,
        country TEXT NOT NULL,
        length TEXT,
        turns INTEGER,
        lap_record TEXT,
        lap_record_holder TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS drivers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        driver_number INTEGER NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        nationality TEXT NOT NULL,
        team TEXT NOT NULL,
        team_color TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        podiums INTEGER DEFAULT 0,
        fastest_laps INTEGER DEFAULT 0,
        championship_position INTEGER,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS races (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        season TEXT NOT NULL,
        round INTEGER NOT NULL,
        race_name TEXT NOT NULL,
        circuit_id VARCHAR NOT NULL,
        race_date TIMESTAMP NOT NULL,
        race_time TEXT,
        status TEXT DEFAULT 'scheduled',
        weather JSONB,
        total_laps INTEGER,
        current_lap INTEGER DEFAULT 0,
        is_live BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (circuit_id) REFERENCES circuits(id)
      )
    `

    // News and content tables - THE CORE OF OUR SYSTEM
    await client`
      CREATE TABLE IF NOT EXISTS monitored_accounts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        handle TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        followers INTEGER,
        priority INTEGER DEFAULT 1,
        last_scraped_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        scrape_frequency INTEGER DEFAULT 120,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS social_media_posts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        account_handle TEXT NOT NULL,
        account_type TEXT NOT NULL,
        original_post_id TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        media_urls TEXT[],
        author_name TEXT NOT NULL,
        author_followers INTEGER,
        engagement JSONB,
        hashtags TEXT[],
        mentions TEXT[],
        published_at TIMESTAMP NOT NULL,
        scraped_at TIMESTAMP DEFAULT NOW() NOT NULL,
        processed BOOLEAN DEFAULT false,
        category TEXT,
        priority TEXT DEFAULT 'regular'
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS f1_processed_content (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        news_percentage INTEGER NOT NULL DEFAULT 70,
        gossip_percentage INTEGER NOT NULL DEFAULT 30,
        source_posts TEXT[],
        category TEXT NOT NULL,
        priority TEXT DEFAULT 'regular',
        tags TEXT[],
        read_time INTEGER DEFAULT 2,
        engagement JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0, "comments": 0}',
        media_urls TEXT[],
        published_at TIMESTAMP DEFAULT NOW() NOT NULL,
        processed_by TEXT DEFAULT 'openai',
        is_active BOOLEAN DEFAULT true
      )
    `

    // Content interaction tables
    await client`
      CREATE TABLE IF NOT EXISTS content_comments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id VARCHAR NOT NULL,
        user_id VARCHAR NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id VARCHAR,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (content_id) REFERENCES f1_processed_content(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `

    // Fantasy and gaming tables
    await client`
      CREATE TABLE IF NOT EXISTS fantasy_leagues (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        creator_id VARCHAR NOT NULL,
        max_participants INTEGER DEFAULT 20,
        current_participants INTEGER DEFAULT 0,
        entry_fee INTEGER DEFAULT 0,
        prize_pool INTEGER DEFAULT 0,
        budget INTEGER DEFAULT 100000000,
        is_public BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        season TEXT NOT NULL DEFAULT '2024',
        scoring_system TEXT DEFAULT 'standard',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS fantasy_teams (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        league_id VARCHAR NOT NULL,
        team_name TEXT NOT NULL,
        total_value INTEGER DEFAULT 0,
        remaining_budget INTEGER DEFAULT 100000000,
        total_points INTEGER DEFAULT 0,
        weekly_points INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        is_valid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (league_id) REFERENCES fantasy_leagues(id)
      )
    `

    // Additional utility tables
    await client`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id VARCHAR NOT NULL,
        content TEXT NOT NULL,
        images TEXT[],
        likes INTEGER NOT NULL DEFAULT 0,
        comments INTEGER NOT NULL DEFAULT 0,
        team_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `

    console.log("✅ Database tables created successfully!")

    // Add some initial monitored accounts for RSS scraping
    await client`
      INSERT INTO monitored_accounts (platform, handle, display_name, account_type, priority, scrape_frequency, is_active)
      VALUES 
        ('rss', 'formula1.com', 'Formula 1 Official', 'news', 5, 60, true),
        ('rss', 'autosport.com', 'Autosport', 'news', 4, 90, true),
        ('rss', 'motorsport.com', 'Motorsport.com', 'news', 4, 90, true),
        ('rss', 'planetf1.com', 'Planet F1', 'gossip', 3, 120, true),
        ('rss', 'gpfans.com', 'GPFans', 'news', 3, 120, true)
      ON CONFLICT (handle) DO NOTHING
    `

    console.log("✅ Initial monitored accounts seeded!")

    console.log("🎉 Database migration completed successfully!")
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error("Migration script failed:", error)
  process.exit(1)
})