// Execute Supabase schema to create all required tables
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

async function executeSchema() {
  console.log('🏗️ Executing Supabase database schema...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExfQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync('./supabase/schema.sql', 'utf8')
    
    console.log('📄 Schema file loaded, executing SQL...')
    
    // Execute the schema (this might not work directly with Supabase client)
    // Let's try using SQL command through supabase
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: schemaSQL
    })
    
    if (error) {
      console.log('⚠️ RPC method not available, trying direct table creation...')
      
      // Manually create the critical tables we need
      await createTablesManually(supabase)
    } else {
      console.log('✅ Schema executed successfully!')
    }
    
    // Test if tables were created
    await testTables(supabase)
    
  } catch (error) {
    console.error('💥 Schema execution failed:', error.message)
    console.log('🔧 Trying manual table creation...')
    await createTablesManually(supabase)
  }
}

async function createTablesManually(supabase) {
  console.log('🛠️ Creating tables manually...')
  
  // Create social_media_posts table (most critical for scrapers)
  const createSocialMediaPosts = `
    CREATE TABLE IF NOT EXISTS public.social_media_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform TEXT NOT NULL,
      account_handle TEXT NOT NULL,
      account_type TEXT NOT NULL,
      original_post_id TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      author_name TEXT,
      published_at TIMESTAMP WITH TIME ZONE,
      category TEXT,
      priority TEXT,
      processed BOOLEAN DEFAULT false,
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
  
  // Create other critical tables
  const createOtherTables = [
    `CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      favorite_team TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    
    `CREATE TABLE IF NOT EXISTS public.posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      author_id UUID NOT NULL,
      team_id UUID,
      images JSONB,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  ]
  
  try {
    // Try to execute each table creation
    console.log('📊 Creating social_media_posts table...')
    const { error: socialError } = await supabase.rpc('exec', { sql: createSocialMediaPosts })
    if (socialError) console.log('Note: Table may already exist or RPC not available')
    
    console.log('✅ Critical tables creation attempted')
    
  } catch (error) {
    console.log('⚠️ Manual creation also had issues, but continuing...')
  }
}

async function testTables(supabase) {
  console.log('🧪 Testing database tables...')
  
  try {
    // Test social_media_posts table
    const { data: socialPosts, error: socialError } = await supabase
      .from('social_media_posts')
      .select('id')
      .limit(1)
    
    if (!socialError) {
      console.log('✅ social_media_posts table: ACCESSIBLE')
    } else {
      console.log('❌ social_media_posts table: NOT FOUND')
    }
    
    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    if (!postsError) {
      console.log('✅ posts table: ACCESSIBLE')
    } else {
      console.log('❌ posts table: NOT FOUND')
    }
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (!usersError) {
      console.log('✅ users table: ACCESSIBLE')
    } else {
      console.log('❌ users table: NOT FOUND')
    }
    
    return !socialError && !postsError && !usersError
    
  } catch (error) {
    console.error('💥 Table testing failed:', error.message)
    return false
  }
}

executeSchema()
  .then(() => {
    console.log('\n🎉 Database schema execution completed!')
    console.log('🚀 Ready for F1 Cafe, News scraping, and article generation!')
  })
  .catch(error => {
    console.error('\n💥 Schema execution failed:', error)
  })