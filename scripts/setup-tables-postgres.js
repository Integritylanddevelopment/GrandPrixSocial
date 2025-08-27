const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function setupTables() {
  console.log('🚀 Setting up database tables with service role key...')
  
  try {
    // First, let's try to create the teams table directly
    console.log('Creating teams table...')
    
    // Use the Supabase admin client to execute SQL
    const { data, error } = await supabase.rpc('create_teams_table', {})
    
    if (error) {
      console.log('RPC call failed, trying direct table creation...')
      
      // Try creating table by attempting to access it first, then create if it fails
      const { error: selectError } = await supabase
        .from('teams')
        .select('*')
        .limit(1)
      
      if (selectError && selectError.code === 'PGRST205') {
        console.log('Teams table does not exist. Using SQL Editor method.')
        console.log('❌ Cannot create tables programmatically without SQL Editor.')
        console.log('')
        console.log('🔧 SOLUTION: You need to run this SQL in Supabase SQL Editor:')
        console.log('1. Go to https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag')
        console.log('2. Click "SQL Editor" in sidebar')
        console.log('3. Run this SQL:')
        console.log('')
        
        const sql = fs.readFileSync('supabase/create-tables.sql', 'utf8')
        console.log(sql)
        
        return false
      }
    }
    
    // Test if we can access tables
    console.log('🧪 Testing table access...')
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('name')
      .limit(1)
    
    if (teamsError) {
      console.error('❌ Teams table test failed:', teamsError.message)
      return false
    }
    
    console.log('✅ Database tables accessible!')
    if (teams && teams.length > 0) {
      console.log('✅ Sample team found:', teams[0].name)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Alternative: Create tables using INSERT operations
async function createTablesViaInsert() {
  console.log('🔄 Attempting table creation via data insertion...')
  
  try {
    // Try to insert a team - this will create the table structure
    const { data, error } = await supabase
      .from('teams')
      .upsert([
        { name: 'Red Bull Racing', color: '#1E41FF', logo: 'redbull-logo.png' }
      ])
      .select()
    
    if (error) {
      console.error('❌ Table creation via insert failed:', error.message)
      return false
    }
    
    console.log('✅ Teams table created and populated!')
    return true
    
  } catch (error) {
    console.error('❌ Insert method failed:', error.message)
    return false
  }
}

async function main() {
  const success = await setupTables()
  
  if (!success) {
    console.log('\n🔄 Trying alternative method...')
    await createTablesViaInsert()
  }
}

main()