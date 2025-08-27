const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('Testing Supabase authentication...')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')

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

async function testAuth() {
  try {
    console.log('\n🧪 Testing basic connectivity...')
    
    // Test if we can access any existing table or create a simple one
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Teams table error:', error.message)
      
      if (error.code === 'PGRST116') {
        console.log('✅ Database connection working - table just doesn\'t exist yet')
        console.log('🔧 Now attempting to create tables using INSERT approach...')
        
        // Try to create teams table by inserting data
        const { data: insertData, error: insertError } = await supabase
          .from('teams')
          .insert([
            { name: 'Red Bull Racing', color: '#1E41FF', logo: 'redbull-logo.png' }
          ])
          .select()
        
        if (insertError) {
          console.log('❌ Insert failed:', insertError.message)
          if (insertError.message.includes('relation "public.teams" does not exist')) {
            console.log('✅ Confirmed: Need to create schema manually')
            return 'need_manual_schema'
          }
        } else {
          console.log('✅ Teams table created successfully via insert!')
          return 'success'
        }
      }
    } else {
      console.log('✅ Teams table exists and accessible!')
      console.log('Data:', data)
      return 'exists'
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return 'failed'
  }
}

testAuth().then(result => {
  console.log('\n🏁 Result:', result)
})