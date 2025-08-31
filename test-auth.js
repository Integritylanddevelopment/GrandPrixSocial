const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAuth() {
  console.log('🧪 Testing Grand Prix Social Authentication...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('✅ Supabase client created');

    // Test connection by getting the current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return;
    }

    console.log('✅ Session check successful');
    console.log('Current user:', session?.session?.user?.email || 'Not logged in');

    // Test database connection by querying users table
    console.log('🔍 Testing database connection...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, username')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table query failed:', usersError);
      console.log('This might mean the tables haven\'t been created yet.');
      console.log('Please run the SQL from create-tables.sql in your Supabase dashboard.');
    } else {
      console.log('✅ Users table accessible');
      console.log(`👥 Found ${users.length} users in the database`);
      if (users.length > 0) {
        console.log('Sample user:', users[0]);
      }
    }

    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, author_id')
      .limit(3);

    if (postsError) {
      console.error('❌ Posts table query failed:', postsError);
    } else {
      console.log('✅ Posts table accessible');
      console.log(`📝 Found ${posts.length} posts in the database`);
    }

    // Test teams table  
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, captain_id')
      .limit(3);

    if (teamsError) {
      console.error('❌ Teams table query failed:', teamsError);
    } else {
      console.log('✅ Teams table accessible');
      console.log(`🏎️  Found ${teams.length} teams in the database`);
    }

    console.log('🎉 Authentication system test completed!');

    // Provide setup instructions
    console.log('\n📋 Next Steps:');
    console.log('1. If tables are missing, run the SQL from create-tables.sql in Supabase dashboard');
    console.log('2. Test sign-up flow in your application');
    console.log('3. Verify user profiles are created automatically');
    console.log('4. Check Row Level Security policies are working');

  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

testAuth();