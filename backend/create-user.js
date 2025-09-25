// Script to create a new user in the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(username, password) {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: username,
        password: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    console.log('✅ User created successfully!');
    console.log('Username:', data.username);
    console.log('User ID:', data.id);
    console.log('You can now log in with these credentials');
    
    return data;
  } catch (err) {
    console.error('Error in createUser:', err);
    return null;
  }
}

// Get username and password from command line arguments
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('Usage: node create-user.js <username> <password>');
  console.log('Example: node create-user.js john john123');
  process.exit(1);
}

console.log(`Creating user: ${username}`);
createUser(username, password);