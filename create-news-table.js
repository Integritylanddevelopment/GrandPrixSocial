const { createClient } = require('@supabase/supabase-js')

async function createNewsTable() {
  console.log('🗃️ Creating news_articles table...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExZQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Create the news_articles table with direct SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.news_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        author TEXT,
        source_url TEXT UNIQUE,
        source_name TEXT,
        category TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        priority TEXT DEFAULT 'medium',
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
      CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
      
      -- Enable RLS
      ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
      
      -- Create policy
      CREATE POLICY "News articles are viewable by everyone" ON public.news_articles FOR SELECT USING (true);
    `
    
    // Execute via PostgreSQL function call
    const { data, error } = await supabase.rpc('exec', { 
      sql: createTableSQL 
    })
    
    if (error) {
      console.log('⚠️ RPC exec not available, trying alternative...')
      
      // Try using the REST API to create table
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      })
      
      if (!response.ok) {
        throw new Error('Direct SQL execution failed')
      }
    }
    
    console.log('✅ news_articles table creation attempted')
    
    // Test if the table was created
    const { data: testData, error: testError } = await supabase
      .from('news_articles')
      .select('id')
      .limit(1)
    
    if (!testError) {
      console.log('✅ news_articles table: ACCESSIBLE')
      return true
    } else {
      console.log('❌ news_articles table: NOT FOUND')
      console.log('Error:', testError.message)
      return false
    }
    
  } catch (error) {
    console.error('💥 Table creation failed:', error.message)
    return false
  }
}

createNewsTable()
  .then(success => {
    if (success) {
      console.log('\n🎉 Ready to populate with F1 news!')
    } else {
      console.log('\n❌ Table creation failed - manual intervention needed')
    }
  })