const { Client } = require('pg')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Use the connection format that matches your .env.local
const client = new Client({
  host: 'db.eeyboymoyvrgsbmnezag.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'fye-NVZ0whd9vue7wha',
  ssl: {
    rejectUnauthorized: false
  }
})

async function createDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!')
    
    // Read and execute the schema
    const schema = fs.readFileSync('supabase/create-tables.sql', 'utf8')
    console.log('📋 Executing schema...')
    
    await client.query(schema)
    
    console.log('✅ Database tables created successfully!')
    
    // Verify tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('📊 Created tables:', result.rows.map(r => r.table_name).join(', '))
    
    // Check teams data
    const teams = await client.query('SELECT name FROM public.teams LIMIT 3')
    console.log('🏎️  Sample teams:', teams.rows.map(t => t.name).join(', '))
    
    await client.end()
    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('already exists')) {
      console.log('✅ Tables may already exist - checking...')
      
      try {
        const tables = await client.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public'
        `)
        console.log('Existing tables:', tables.rows.map(r => r.table_name))
        await client.end()
        
      } catch (checkError) {
        console.error('Check failed:', checkError.message)
        await client.end()
      }
    } else {
      await client.end()
    }
  }
}

createDatabase()