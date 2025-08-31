const dotenv = require('dotenv');
const { Pool } = require('@neondatabase/serverless');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please check your .env.local file');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test query
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Users table exists');
      
      // Count users
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users in database: ${userCount.rows[0].count}`);
    } else {
      console.log('⚠️  Users table does not exist - needs migration');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
