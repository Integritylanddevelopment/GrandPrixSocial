const { Client } = require('pg')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Extract connection details from Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const projectRef = supabaseUrl.split('//')[1].split('.')[0] // Extract eeyboymoyvrgsbmnezag

// Try the exact connection string from .env.local format
const connectionString = `postgresql://postgres.${projectRef}:fye-NVZ0whd9vue7wha@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

console.log('Connection string:', connectionString)
console.log('Project ref:', projectRef)

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function createTablesDirectly() {
  try {
    console.log('🔌 Connecting to PostgreSQL database directly...')
    await client.connect()
    console.log('✅ Connected to database!')
    
    console.log('📋 Creating tables...')
    
    // Read the SQL schema
    const schema = fs.readFileSync('supabase/create-tables.sql', 'utf8')
    
    // Execute the schema
    await client.query(schema)
    
    console.log('✅ All tables created successfully!')
    
    // Test the tables
    const result = await client.query('SELECT COUNT(*) FROM public.teams')
    console.log(`✅ Teams table has ${result.rows[0].count} teams`)
    
    await client.end()
    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('')
      console.log('🔑 Need database password. Please check Supabase Settings > Database for:')
      console.log('- Host: aws-0-us-west-1.pooler.supabase.com')  
      console.log('- Database: postgres')
      console.log('- User: postgres.eeyboymoyvrgsbmnezag')
      console.log('- Password: [Database password from Supabase settings]')
    }
    
    await client.end()
  }
}

createTablesDirectly()