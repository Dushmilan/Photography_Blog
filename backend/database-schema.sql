-- Database schema for Photography Blog

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simplified images table 
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