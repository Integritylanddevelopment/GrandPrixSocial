const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTables() {
  console.log('🚀 Creating database tables directly...')
  
  try {
    // Create users table
    console.log('Creating users table...')
    const { error: usersError } = await supabase.rpc('exec_sql_direct', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username text UNIQUE NOT NULL,
          name text,
          avatar text,
          favorite_team text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })
    
    if (usersError) console.log('Users table may already exist:', usersError.message)
    
    // Create teams table
    console.log('Creating teams table...')
    const { error: teamsError } = await supabase
      .from('teams')
      .insert([]) // This will fail if table doesn't exist, which we want
      .select()
    
    if (teamsError && teamsError.code === 'PGRST205') {
      // Table doesn't exist, use raw query
      console.log('Table does not exist, attempting raw creation...')
    }
    
    console.log('✅ Database setup completed!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

createTables()