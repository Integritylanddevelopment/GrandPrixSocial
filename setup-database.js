const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Setting up Grand Prix Social Database...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('📋 Creating database tables via SQL...');
  console.log('');
  console.log('⚠️  IMPORTANT: You need to manually run the following SQL in your Supabase dashboard:');
  console.log('');
  console.log('1. Go to https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/sql/editor');
  console.log('2. Copy and paste the content from create-tables.sql');
  console.log('3. Run the SQL query');
  console.log('');
  console.log('This will create:');
  console.log('  ✓ users table (linked to auth.users)');
  console.log('  ✓ teams table');
  console.log('  ✓ posts table');
  console.log('  ✓ team_members table');
  console.log('  ✓ post_likes table');
  console.log('  ✓ post_comments table');
  console.log('  ✓ Row Level Security policies');
  console.log('  ✓ Auto-user creation trigger');
  console.log('');

  try {
    // Test if we can at least connect
    console.log('🔍 Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful');

    // Try to run a simple query to check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info', {})
      .select();

    // This will likely fail since the function doesn't exist, but that's expected
    
  } catch (error) {
    console.log('ℹ️  This is expected - tables need to be created first');
  }

  console.log('');
  console.log('💡 After running the SQL:');
  console.log('   Run: node test-auth.js');
  console.log('   To verify the setup is working');
  console.log('');
}

setupDatabase();