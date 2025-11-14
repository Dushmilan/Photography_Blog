// Setup script to check and guide database table creation in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      return false;
    }

    return true;
  } catch (error) {
    // If it's a "does not exist" error, the table doesn't exist
    if (error && error.code === '42P01') {
      return false;
    }
    // For other errors, try to determine if table exists by checking error message
    if (error && error.message && error.message.includes('does not exist')) {
      return false;
    }
    return true; // If we can't determine, assume it exists to avoid false alarms
  }
}

async function main() {
  console.log('🔍 Checking database schema...');
  console.log('Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
  console.log('Supabase Key: ' + (supabaseKey ? '✅ Configured' : '❌ Missing'));

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Supabase configuration is incomplete.');
    console.log('Please ensure SUPABASE_URL and SUPABASE_KEY are set in your .env file.');
    return;
  }

  const usersExist = await checkTableExists('users');
  const imagesExist = await checkTableExists('images');

  console.log('\n📋 Table Status:');
  console.log(`Users table: ${usersExist ? '✅ Exists' : '❌ Missing'}`);
  console.log(`Images table: ${imagesExist ? '✅ Exists' : '❌ Missing'}`);

  if (usersExist && imagesExist) {
    console.log('\n✅ Both users and images tables exist in the database');
    console.log('✅ Database is properly set up');
  } else {
    console.log('\n❌ Database schema is missing required tables');
    console.log('\n💡 To fix this issue:');
    console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor (in the left sidebar)');
    console.log('3. Paste and run the following SQL commands:');
    console.log('\n-------- COPY FROM HERE --------');
    console.log('');

    // Read the SQL schema from the file and output it
    const fs = require('fs');
    if (fs.existsSync('./database-schema.sql')) {
      const schemaSql = fs.readFileSync('./database-schema.sql', 'utf8');
      console.log(schemaSql);
    } else {
      console.log('ERROR: database-schema.sql file not found in the current directory.');
    }

    console.log('');
    console.log('-------- COPY TO HERE --------');
    console.log('\n4. After running the commands, come back and restart your server');
    console.log('5. Run: npm start');
  }
}

main()
  .then(() => console.log('\n📋 Database check complete'))
  .catch(console.error);