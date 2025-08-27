const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Grand Prix Social database...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📋 Executing database schema...')
    
    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Database schema execution failed:', error)
      
      // Try alternative method - execute statements one by one
      console.log('🔄 Trying alternative execution method...')
      
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'))
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement) {
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}`)
            await supabase.rpc('exec_sql', { sql: statement + ';' })
          } catch (stmtError) {
            console.error(`Statement ${i + 1} failed:`, stmtError.message)
            // Continue with next statement
          }
        }
      }
    } else {
      console.log('✅ Database schema executed successfully!')
    }
    
    // Test the setup by checking if tables exist
    console.log('🔍 Verifying table creation...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('❌ Failed to verify tables:', tablesError)
    } else {
      console.log('✅ Tables verified:')
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`)
      })
    }
    
    // Test basic operations
    console.log('🧪 Testing basic operations...')
    
    // Test teams table
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('name')
      .limit(3)
    
    if (teamsError) {
      console.error('❌ Teams table test failed:', teamsError)
    } else {
      console.log('✅ Teams table working:', teams.map(t => t.name).join(', '))
    }
    
    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()