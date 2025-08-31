const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupAuthTables() {
  console.log('🚀 Setting up Grand Prix Social auth tables via Supabase...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('✅ Supabase client created');

    // First, let's create the users table
    console.log('📋 Creating users table...');
    const { data: usersTable, error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id VARCHAR PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          avatar TEXT,
          points INTEGER NOT NULL DEFAULT 0,
          rank INTEGER NOT NULL DEFAULT 0,
          team_id VARCHAR,
          favorite_driver TEXT,
          favorite_team TEXT,
          ai_consent_given BOOLEAN NOT NULL DEFAULT false,
          ai_consent_date TIMESTAMP,
          ai_consent_version TEXT DEFAULT '1.0',
          data_retention_period TEXT DEFAULT '30days',
          ai_features JSONB DEFAULT '{"contentPersonalization": false, "socialMatching": false, "interfaceCustomization": false, "behaviorTracking": false, "analyticsInsights": false, "marketingCommunications": false}'::jsonb,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
      `
    });

    if (usersError) {
      console.error('❌ Failed to create users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create teams table
    console.log('📋 Creating teams table...');
    const { data: teamsTable, error: teamsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.teams (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT NOT NULL DEFAULT '#DC2626',
          logo TEXT,
          sponsor_id VARCHAR,
          captain_id VARCHAR NOT NULL,
          member_count INTEGER NOT NULL DEFAULT 1,
          total_points INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          is_recruiting BOOLEAN NOT NULL DEFAULT true,
          team_level TEXT NOT NULL DEFAULT 'member',
          can_host_events BOOLEAN NOT NULL DEFAULT false,
          can_sell_merch BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `
    });

    if (teamsError) {
      console.error('❌ Failed to create teams table:', teamsError);
    } else {
      console.log('✅ Teams table created successfully');
    }

    // Create posts table
    console.log('📋 Creating posts table...');
    const { data: postsTable, error: postsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.posts (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          author_id VARCHAR NOT NULL,
          content TEXT NOT NULL,
          images TEXT[],
          likes INTEGER NOT NULL DEFAULT 0,
          comments INTEGER NOT NULL DEFAULT 0,
          team_id VARCHAR,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          FOREIGN KEY (author_id) REFERENCES public.users(id),
          FOREIGN KEY (team_id) REFERENCES public.teams(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
        CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
      `
    });

    if (postsError) {
      console.error('❌ Failed to create posts table:', postsError);
    } else {
      console.log('✅ Posts table created successfully');
    }

    // Enable Row Level Security
    console.log('🔐 Enabling Row Level Security...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

        -- Users can view their own profile
        DROP POLICY IF EXISTS "users_view_own" ON public.users;
        CREATE POLICY "users_view_own" ON public.users
          FOR SELECT USING (auth.uid()::text = id);
          
        -- Users can update their own profile  
        DROP POLICY IF EXISTS "users_update_own" ON public.users;
        CREATE POLICY "users_update_own" ON public.users
          FOR UPDATE USING (auth.uid()::text = id);

        -- Anyone can view posts
        DROP POLICY IF EXISTS "posts_view_all" ON public.posts;
        CREATE POLICY "posts_view_all" ON public.posts
          FOR SELECT USING (true);
          
        -- Users can create posts
        DROP POLICY IF EXISTS "posts_create_own" ON public.posts;
        CREATE POLICY "posts_create_own" ON public.posts
          FOR INSERT WITH CHECK (auth.uid()::text = author_id);
          
        -- Users can update their own posts
        DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
        CREATE POLICY "posts_update_own" ON public.posts
          FOR UPDATE USING (auth.uid()::text = author_id);

        -- Anyone can view teams
        DROP POLICY IF EXISTS "teams_view_all" ON public.teams;
        CREATE POLICY "teams_view_all" ON public.teams
          FOR SELECT USING (true);
      `
    });

    if (rlsError) {
      console.error('❌ Failed to set up RLS:', rlsError);
    } else {
      console.log('✅ Row Level Security configured');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 You can now test the authentication system');

  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

setupAuthTables();