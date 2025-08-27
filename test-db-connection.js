// Test Supabase database connection
const { createClient } = require('@supabase/supabase-js')

async function testDatabaseConnection() {
  console.log('🔌 Testing Supabase database connection...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExfQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    console.log('📊 Testing basic connection...')
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Check for scraped F1 data
    console.log('📰 Checking for scraped F1 data...')
    const { data: posts, error: postsError } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('processed', false)
      .limit(5)
    
    if (postsError) {
      console.error('❌ Failed to query posts:', postsError.message)
      return false
    }
    
    console.log(`📄 Found ${posts.length} unprocessed F1 posts`)
    
    if (posts.length > 0) {
      console.log('📋 Sample unprocessed posts:')
      posts.forEach((post, index) => {
        console.log(`${index + 1}. [${post.category}] ${post.content.substring(0, 100)}...`)
      })
    }
    
    // Test table structure
    console.log('🏗️ Checking database schema...')
    const { data: schema, error: schemaError } = await supabase.rpc('get_schema_info')
    
    if (schemaError && !schemaError.message.includes('function')) {
      console.warn('⚠️ Could not get schema info, but database is accessible')
    }
    
    console.log('🎉 Database access confirmed!')
    return true
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message)
    return false
  }
}

testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ DATABASE STATUS: READY FOR AGENT PROCESSING')
      console.log('🤖 Agents can now access scraped F1 data for article generation')
    } else {
      console.log('\n❌ DATABASE STATUS: CONNECTION FAILED')
      console.log('🔧 Database needs to be fixed before agent processing')
    }
  })
  .catch(error => {
    console.error('\n💥 Test script failed:', error)
  })