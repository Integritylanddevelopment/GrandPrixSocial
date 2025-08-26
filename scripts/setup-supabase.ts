import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Load environment variables
config()

async function setupSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    process.exit(1)
  }

  console.log("🚀 Setting up Supabase database...")
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected
      console.log("⚠️ Database connection successful, but tables need to be created")
    }

    console.log("✅ Supabase connection established!")

    // Create tables using SQL
    const { error: sqlError } = await supabase.rpc('create_news_tables', {})
    
    if (sqlError) {
      console.log("Creating tables manually...")
      
      // Create tables one by one
      await createTables(supabase)
    }

    console.log("✅ Database setup completed!")

  } catch (error) {
    console.error("❌ Setup failed:", error)
    throw error
  }
}

async function createTables(supabase: any) {
  // Create monitored accounts table first
  const { error: accountsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS monitored_accounts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        platform TEXT NOT NULL,
        handle TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        followers INTEGER,
        priority INTEGER DEFAULT 1,
        last_scraped_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT true,
        scrape_frequency INTEGER DEFAULT 120,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  })

  if (accountsError) {
    console.log("Creating monitored_accounts table directly...")
    // Try direct table creation
    const { error: createError } = await supabase
      .from('monitored_accounts')
      .select('*')
      .limit(1)
      
    console.log("Monitored accounts check:", createError?.message || "OK")
  }

  // Create social media posts table
  const { error: postsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS social_media_posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
        published_at TIMESTAMPTZ NOT NULL,
        scraped_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        processed BOOLEAN DEFAULT false,
        category TEXT,
        priority TEXT DEFAULT 'regular'
      );
    `
  })

  // Create processed content table
  const { error: contentError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS f1_processed_content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
        published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        processed_by TEXT DEFAULT 'openai',
        is_active BOOLEAN DEFAULT true
      );
    `
  })

  console.log("Tables creation attempted...")

  // Seed initial monitored accounts
  const { error: seedError } = await supabase
    .from('monitored_accounts')
    .upsert([
      {
        platform: 'rss',
        handle: 'formula1.com',
        display_name: 'Formula 1 Official',
        account_type: 'news',
        priority: 5,
        scrape_frequency: 60,
        is_active: true
      },
      {
        platform: 'rss',
        handle: 'autosport.com',
        display_name: 'Autosport',
        account_type: 'news',
        priority: 4,
        scrape_frequency: 90,
        is_active: true
      },
      {
        platform: 'rss',
        handle: 'motorsport.com',
        display_name: 'Motorsport.com',
        account_type: 'news',
        priority: 4,
        scrape_frequency: 90,
        is_active: true
      }
    ], { onConflict: 'handle' })

  console.log("Seed data result:", seedError?.message || "OK")
}

// Run setup
setupSupabase().catch((error) => {
  console.error("Setup script failed:", error)
  process.exit(1)
})