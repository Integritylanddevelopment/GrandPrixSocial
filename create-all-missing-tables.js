const { createClient } = require('@supabase/supabase-js')

async function createAllMissingTables() {
  console.log('🗄️ Creating ALL missing database tables...')
  
  const supabaseUrl = 'https://eeyboymoyvrgsbmnezag.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWJveW1veXZyZ3NibW5lemFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0OTkxMSwiZXhwIjoyMDcxMTI1OTExfQ.eUTubEQh1c-1uBb4fUiHGGaJi08IMF2doCam1hlhTBA'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const tables = [
    // F1 CAFE TABLES
    {
      name: 'cafe_posts',
      sql: `
        CREATE TABLE IF NOT EXISTS public.cafe_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          images JSONB DEFAULT '[]'::jsonb,
          tags JSONB DEFAULT '[]'::jsonb,
          likes INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          is_pinned BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_cafe_posts_user_id ON public.cafe_posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_cafe_posts_created_at ON public.cafe_posts(created_at DESC);
      `
    },
    {
      name: 'cafe_comments',
      sql: `
        CREATE TABLE IF NOT EXISTS public.cafe_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES public.cafe_posts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_cafe_comments_post_id ON public.cafe_comments(post_id);
        CREATE INDEX IF NOT EXISTS idx_cafe_comments_created_at ON public.cafe_comments(created_at DESC);
      `
    },
    {
      name: 'cafe_likes',
      sql: `
        CREATE TABLE IF NOT EXISTS public.cafe_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          post_id UUID REFERENCES public.cafe_posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES public.cafe_comments(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT cafe_likes_one_target CHECK (
            (post_id IS NOT NULL AND comment_id IS NULL) OR 
            (post_id IS NULL AND comment_id IS NOT NULL)
          )
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_cafe_likes_user_post ON public.cafe_likes(user_id, post_id) WHERE post_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_cafe_likes_user_comment ON public.cafe_likes(user_id, comment_id) WHERE comment_id IS NOT NULL;
      `
    },

    // USER PROFILE TABLES  
    {
      name: 'user_profiles',
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          username TEXT UNIQUE,
          display_name TEXT,
          bio TEXT,
          avatar_url TEXT,
          favorite_team TEXT,
          favorite_driver TEXT,
          location TEXT,
          is_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
      `
    },

    // FANTASY FORMULA TABLES
    {
      name: 'fantasy_leagues',
      sql: `
        CREATE TABLE IF NOT EXISTS public.fantasy_leagues (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          season TEXT NOT NULL,
          max_participants INTEGER DEFAULT 100,
          entry_fee DECIMAL(10,2) DEFAULT 0.00,
          prize_pool DECIMAL(10,2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT true,
          starts_at TIMESTAMP WITH TIME ZONE,
          ends_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    },
    {
      name: 'fantasy_teams',
      sql: `
        CREATE TABLE IF NOT EXISTS public.fantasy_teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          league_id UUID REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE,
          team_name TEXT NOT NULL,
          total_points INTEGER DEFAULT 0,
          budget_remaining DECIMAL(10,2) DEFAULT 100.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_fantasy_teams_user_league ON public.fantasy_teams(user_id, league_id);
      `
    },

    // F1 DATA TABLES
    {
      name: 'f1_drivers',
      sql: `
        CREATE TABLE IF NOT EXISTS public.f1_drivers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          driver_id TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          nationality TEXT,
          team_id TEXT,
          car_number INTEGER,
          points INTEGER DEFAULT 0,
          championships INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_f1_drivers_driver_id ON public.f1_drivers(driver_id);
      `
    },
    {
      name: 'f1_constructors',
      sql: `
        CREATE TABLE IF NOT EXISTS public.f1_constructors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          constructor_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          nationality TEXT,
          points INTEGER DEFAULT 0,
          championships INTEGER DEFAULT 0,
          color TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_f1_constructors_constructor_id ON public.f1_constructors(constructor_id);
      `
    },

    // MERCHANDISE TABLES
    {
      name: 'products',
      sql: `
        CREATE TABLE IF NOT EXISTS public.products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          category TEXT,
          brand TEXT,
          affiliate_url TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
        CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
      `
    },

    // ARTICLE INTERACTIONS
    {
      name: 'article_views',
      sql: `
        CREATE TABLE IF NOT EXISTS public.article_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          ip_address INET,
          user_agent TEXT,
          viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
        CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at DESC);
      `
    },
    {
      name: 'article_comments',
      sql: `
        CREATE TABLE IF NOT EXISTS public.article_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
      `
    }
  ]

  let created = 0
  let failed = 0

  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}...`)
      
      // Try direct insert to test if table exists
      const testTableName = table.name === 'cafe_posts' ? 'cafe_posts' : table.name
      const { error: testError } = await supabase.from(testTableName).select('id').limit(1)
      
      if (testError && testError.message.includes('does not exist')) {
        console.log(`  ⚠️ Table ${table.name} doesn't exist, needs to be created manually`)
        console.log(`  📋 SQL for ${table.name}:`)
        console.log(table.sql)
        console.log('')
        failed++
      } else {
        console.log(`  ✅ Table ${table.name} exists and accessible`)
        created++
      }
      
    } catch (error) {
      console.log(`  ❌ Error checking ${table.name}:`, error.message)
      failed++
    }
  }
  
  console.log(`\n📊 RESULTS:`)
  console.log(`✅ Existing tables: ${created}`)
  console.log(`❌ Missing tables: ${failed}`)
  
  if (failed > 0) {
    console.log(`\n🔧 MANUAL ACTION REQUIRED:`)
    console.log(`Go to Supabase SQL Editor and run the SQL above for each missing table`)
  }
  
  console.log(`\n🎉 Database audit complete!`)
}

createAllMissingTables()