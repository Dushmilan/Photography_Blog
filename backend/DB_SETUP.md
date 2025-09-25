# Database Setup for Photography Portfolio

After creating your Supabase project, you'll need to set up the database tables. Run the following SQL queries in your Supabase SQL editor:

## Users Table

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create updated_at trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Images Table

```sql
CREATE TABLE images (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  small_path TEXT NOT NULL,
  medium_path TEXT NOT NULL,
  size BIGINT NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  photographer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create updated_at trigger for images table
CREATE TRIGGER update_images_updated_at 
    BEFORE UPDATE ON images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add your Supabase credentials to the `.env` file:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=photography-portfolio-secret-key-change-in-production
PORT=5000
```

You can find these values in your Supabase dashboard under Project Settings > API.