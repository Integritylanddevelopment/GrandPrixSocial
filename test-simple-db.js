// Simple database connection test
const { createClient } = require('@supabase/supabase-js')

async function testSimpleConnection() {
  console.log('🔌 Testing simple database connection...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExfQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Just try to select from social_media_posts table
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('id, content, category, processed')
      .limit(3)
    
    if (error) {
      console.error('❌ Query failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection working!')
    console.log(`📊 Retrieved ${data.length} records`)
    
    if (data.length > 0) {
      console.log('📄 Sample data:')
      data.forEach((record, i) => {
        console.log(`${i+1}. [${record.category}] Processed: ${record.processed}`)
        console.log(`   Content: ${record.content?.substring(0, 80)}...`)
      })
    } else {
      console.log('📭 No data found in social_media_posts table')
    }
    
    return true
    
  } catch (error) {
    console.error('💥 Connection test failed:', error.message)
    return false
  }
}

testSimpleConnection()
  .then(success => {
    console.log(success ? '\n✅ DATABASE: ACCESSIBLE' : '\n❌ DATABASE: FAILED')
  })