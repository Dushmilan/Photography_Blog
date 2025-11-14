// Quick database connectivity and table existence check
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key not configured in environment variables');
    return false;
  }

  try {
    // Test basic connectivity by trying to query a non-existent table
    // This helps verify the connection works
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') {
      console.log('✅ Connection successful, but tables are missing');
      return { connected: true, tablesMissing: true };
    } else if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Connection successful and tables exist');
      return { connected: true, tablesMissing: false };
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function main() {
  console.log('Supabase project URL:', supabaseUrl ? supabaseUrl.replace(/supabase\.co.*/, 'supabase.co') : 'Not set');
  console.log('');
  
  const result = await checkConnection();
  
  if (result && result.connected) {
    if (result.tablesMissing) {
      console.log('\n💡 Next steps:');
      console.log('   The database connection works, but required tables are missing.');
      console.log('   Please follow the instructions in DATABASE_SETUP.md to create the tables.');
    } else {
      console.log('\n✅ Database is ready to use!');
    }
  }
}

main();