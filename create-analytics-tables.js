const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function createAnalyticsTables() {
  console.log('🗄️ Creating analytics database tables...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExfQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const sqlQueries = [
    // User Interactions Table
    `CREATE TABLE IF NOT EXISTS public.user_interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      session_id TEXT NOT NULL,
      interaction_type TEXT NOT NULL,
      content_id TEXT,
      content_type TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      engagement_score INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    // Indexes for user_interactions
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_content_id ON public.user_interactions(content_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON public.user_interactions(session_id);`,

    // Content Performance Table
    `CREATE TABLE IF NOT EXISTS public.content_performance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id TEXT UNIQUE NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'article',
      views INTEGER DEFAULT 0,
      unique_views INTEGER DEFAULT 0,
      avg_time_on_page INTEGER DEFAULT 0,
      bounce_rate DECIMAL(5,2) DEFAULT 0.00,
      scroll_depth INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      click_through_rate DECIMAL(5,2) DEFAULT 0.00,
      performance_score DECIMAL(5,2) DEFAULT 0.00,
      user_feedback JSONB DEFAULT '{"positive": 0, "negative": 0, "neutral": 0}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    // Indexes for content_performance
    `CREATE INDEX IF NOT EXISTS idx_content_performance_content_id ON public.content_performance(content_id);`,
    `CREATE INDEX IF NOT EXISTS idx_content_performance_score ON public.content_performance(performance_score DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_content_performance_updated ON public.content_performance(updated_at DESC);`,

    // User Preferences Table
    `CREATE TABLE IF NOT EXISTS public.user_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      preferences JSONB DEFAULT '{
        "favoriteTopics": [],
        "preferredContentLength": "medium",
        "engagementPatterns": {
          "bestTimeToRead": [],
          "preferredCategories": [],
          "interactionStyle": "reader"
        },
        "f1Interests": {
          "favoriteDrivers": [],
          "favoriteTeams": [],
          "techInterest": 5,
          "gossipInterest": 5,
          "newsInterest": 5
        }
      }'::jsonb,
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);`,

    // Training Dataset Table
    `CREATE TABLE IF NOT EXISTS public.qwen_training_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      original_content TEXT NOT NULL,
      user_feedback_summary JSONB NOT NULL,
      performance_metrics JSONB NOT NULL,
      training_prompt TEXT NOT NULL,
      expected_output TEXT NOT NULL,
      training_score DECIMAL(5,2) NOT NULL,
      content_category TEXT,
      f1_entities JSONB DEFAULT '[]'::jsonb,
      user_engagement_patterns JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      processed_for_training BOOLEAN DEFAULT false,
      training_batch_id TEXT
    );`,

    // Indexes for training data
    `CREATE INDEX IF NOT EXISTS idx_qwen_training_content_id ON public.qwen_training_data(content_id);`,
    `CREATE INDEX IF NOT EXISTS idx_qwen_training_score ON public.qwen_training_data(training_score DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_qwen_training_processed ON public.qwen_training_data(processed_for_training);`,
    `CREATE INDEX IF NOT EXISTS idx_qwen_training_batch ON public.qwen_training_data(training_batch_id);`
  ]

  let successCount = 0
  let errorCount = 0

  console.log(`📝 Executing ${sqlQueries.length} SQL statements...`)

  for (let i = 0; i < sqlQueries.length; i++) {
    const query = sqlQueries[i]
    try {
      console.log(`${i + 1}/${sqlQueries.length}: ${query.substring(0, 50).replace(/\n/g, ' ')}...`)
      
      const { error } = await supabase.rpc('query', { query_text: query })
      
      if (error) {
        console.log(`  ⚠️ Using fallback method...`)
        // Try alternative approach for table creation
        if (query.includes('CREATE TABLE')) {
          const tableName = query.match(/CREATE TABLE[^(]*public\.([a-z_]+)/)?.[1]
          if (tableName) {
            const { error: testError } = await supabase.from(tableName).select('id').limit(1)
            if (testError?.message?.includes('does not exist')) {
              console.log(`  ❌ Table ${tableName} needs manual creation`)
              errorCount++
            } else {
              console.log(`  ✅ Table ${tableName} exists`)
              successCount++
            }
          }
        } else {
          console.log(`  ❌ Index/constraint failed: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`  ✅ Success`)
        successCount++
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n📊 RESULTS:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)

  if (errorCount > 0) {
    console.log(`\n🔧 MANUAL TABLES NEEDED:`)
    console.log(`Copy and paste the SQL below into Supabase SQL Editor:`)
    console.log(`\n--- COPY FROM HERE ---`)
    console.log(fs.readFileSync('create-analytics-tables.sql', 'utf8'))
    console.log(`--- COPY TO HERE ---`)
  } else {
    console.log(`\n🎉 All analytics tables created successfully!`)
    console.log(`Your Qwen3 training system is ready to collect user feedback.`)
  }
}

createAnalyticsTables()