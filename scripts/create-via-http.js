const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

async function createTablesViaHTTP() {
  console.log('🚀 Creating tables via Supabase Edge Functions API...')
  
  try {
    // Read the SQL schema
    const schema = fs.readFileSync('supabase/create-tables.sql', 'utf8')
    
    // Try using the Supabase REST API with raw SQL
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: schema
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers))
    
    const responseText = await response.text()
    console.log('Response body:', responseText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }
    
    console.log('✅ Schema executed via HTTP!')
    return true
    
  } catch (error) {
    console.error('❌ HTTP approach failed:', error.message)
    
    // Try alternative: Create tables one by one using individual SQL statements
    console.log('\n🔄 Trying individual table creation...')
    
    const statements = [
      `CREATE TABLE public.users (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username text UNIQUE NOT NULL,
        name text,
        avatar text,
        favorite_team text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );`,
      `CREATE TABLE public.teams (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL UNIQUE,
        color text NOT NULL,
        logo text,
        created_at timestamptz DEFAULT now()
      );`,
      `INSERT INTO public.teams (name, color, logo) VALUES
        ('Red Bull Racing', '#1E41FF', 'redbull-logo.png'),
        ('Mercedes', '#00D2BE', 'mercedes-logo.png'),
        ('Ferrari', '#DC143C', 'ferrari-logo.png');`
    ]
    
    for (const sql of statements) {
      console.log(`\nExecuting: ${sql.substring(0, 50)}...`)
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ sql })
        })
        
        const result = await response.text()
        console.log(`Status: ${response.status}, Result: ${result}`)
        
      } catch (err) {
        console.log(`Error: ${err.message}`)
      }
    }
    
    return false
  }
}

createTablesViaHTTP()