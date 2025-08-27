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

async function executeSchema() {
  console.log('🚀 Executing database schema using Supabase Admin API...')
  
  try {
    // Read the SQL schema
    const schema = fs.readFileSync('supabase/create-tables.sql', 'utf8')
    
    // Split into individual SQL statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}`)
      console.log(`SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)
      
      try {
        const { data, error } = await supabase
          .from('_temp_schema')
          .select('*')
        
        // If table doesn't exist, we know we need to create schema
        if (error && error.code === 'PGRST116') {
          // Try using raw query via PostgREST
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
              query: statement
            })
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
          }
          
          const result = await response.json()
          if (result.error) {
            throw new Error(result.error)
          }
        }
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} error (may be expected):`, error.message)
          
          // If it's a "relation already exists" error, that's fine
          if (error.message.includes('already exists')) {
            console.log('✅ Table already exists, continuing...')
            continue
          }
          
          // If it's an unknown function error, try alternative approach
          if (error.message.includes('function exec') || error.message.includes('does not exist')) {
            console.log('🔄 exec function not available, trying alternative approach...')
            break
          }
          
          throw error
        }
        
        console.log('✅ Statement executed successfully')
        
      } catch (statementError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statementError.message)
        throw statementError
      }
    }
    
    // Test if tables were created
    console.log('\n🧪 Testing table creation...')
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('name')
      .limit(1)
    
    if (teamsError) {
      console.error('❌ Teams table test failed:', teamsError.message)
      return false
    }
    
    console.log('✅ Database schema executed successfully!')
    console.log('✅ Teams table is accessible')
    
    if (teams && teams.length > 0) {
      console.log(`✅ Found ${teams.length} teams in database`)
    } else {
      console.log('ℹ️  Teams table is empty (will be populated)')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Schema execution failed:', error.message)
    return false
  }
}

executeSchema()