# Database Setup Instructions

## The Issue
The application is failing to start properly because the required database tables (`users` and `images`) don't exist in your Supabase database.

## Solution: Create Database Tables in Supabase

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project (the one matching your SUPABASE_URL)

2. **Navigate to SQL Editor**
   - In the left sidebar, click on "SQL" under the "Database" section
   - This opens the SQL Editor where you can run database commands

3. **Run the Database Schema SQL**
   - Copy the entire SQL code below
   - Paste it into the SQL Editor textbox
   - Click "Run" to execute the commands

```sql
-- Database schema for Photography Blog

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simplified images table with only essential columns
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY, -- Using ImageKit File ID as primary key
  path TEXT NOT NULL,
  photographer_id INTEGER REFERENCES users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  is_slideshow BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_photographer_id ON images(photographer_id);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_is_slideshow ON images(is_slideshow);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);

-- Insert a default admin user if one doesn't exist
DO $$
BEGIN
  INSERT INTO users (username, password, created_at, updated_at)
  SELECT 'admin', '$2a$10$TfUy/NzsT8MTH2EVNRhG3eAQnMzXwyUL05KYAhxvH6xp4wpSVDvbi', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, do nothing
    RAISE NOTICE 'Admin user already exists';
END $$;
```

4. **Verify Table Creation**
   - After running the SQL, you should see a success message
   - The tables will now exist in your Supabase database

5. **Restart Your Application**
   - Stop your running server (Ctrl+C)
   - Start it again with: `npm start`
   - The application should now work without database errors

## Additional Notes
- This simplified schema includes only essential columns: image ID, path, photographer ID, and the boolean flags
- The `users` table stores user authentication data
- The `images` table stores image paths and permission flags (featured, slideshow, public)
- The default admin user has been created for you
- If you had existing data with the old schema, you may need to clear the table and start fresh with the simplified schema