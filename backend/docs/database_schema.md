# Database Schema Documentation

This document outlines the database schema for the Photography Blog project using Supabase/PostgreSQL.

## Users Table

The `users` table stores user authentication information.

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
```

### Fields Description:
- `id`: Primary key, auto-generated UUID
- `username`: Unique username for authentication (255 chars max)
- `password`: Hashed password (255 chars max)
- `created_at`: Timestamp when the user was created
- `updated_at`: Timestamp when the user was last updated

## Images Table

The `images` table stores image metadata and settings.

```sql
CREATE TABLE images (
  id VARCHAR(255) PRIMARY KEY, -- ImageKit File ID
  filename VARCHAR(500),
  original_name VARCHAR(500),
  path TEXT,
  thumbnail_path TEXT,
  small_path TEXT,
  medium_path TEXT,
  size BIGINT DEFAULT 0,
  mimetype VARCHAR(100),
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  photographer_id UUID REFERENCES users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  is_slideshow BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_images_photographer_id ON images(photographer_id);
CREATE INDEX idx_images_is_featured ON images(is_featured);
CREATE INDEX idx_images_is_slideshow ON images(is_slideshow);
CREATE INDEX idx_images_is_public ON images(is_public);
CREATE INDEX idx_images_created_at ON images(created_at);
```

### Fields Description:
- `id`: Primary key, ImageKit File ID (unique identifier from ImageKit service)
- `filename`: Original filename
- `original_name`: Display name for the image
- `path`: URL/path to the original image (full ImageKit URL)
- `thumbnail_path`: URL/path to the thumbnail version (ImageKit transformed URL)
- `small_path`: URL/path to the small version (ImageKit transformed URL)
- `medium_path`: URL/path to the medium version (ImageKit transformed URL)
- `size`: File size in bytes
- `mimetype`: MIME type of the image
- `width`: Image width in pixels
- `height`: Image height in pixels
- `photographer_id`: Foreign key to the user who owns this image
- `is_featured`: Whether the image is marked as featured
- `is_slideshow`: Whether the image is in the homepage slideshow
- `is_public`: Whether the image is visible in the public gallery
- `created_at`: Timestamp when the image record was created
- `updated_at`: Timestamp when the image record was last updated

## Additional Optimizations

### Row Level Security (RLS) for Images Table

To ensure users can only access their own images:

```sql
-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own images" ON images
  FOR SELECT TO authenticated
  USING (auth.uid() = photographer_id);

CREATE POLICY "Users can insert their own images" ON images
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Users can update their own images" ON images
  FOR UPDATE TO authenticated
  USING (auth.uid() = photographer_id);

CREATE POLICY "Users can delete their own images" ON images
  FOR DELETE TO authenticated
  USING (auth.uid() = photographer_id);
```

### Database Functions

To help with common operations, we can create helper functions:

```sql
-- Function to get featured images for a photographer
CREATE OR REPLACE FUNCTION get_featured_images(photographer_uuid UUID)
RETURNS SETOF images AS $$
  SELECT * FROM images 
  WHERE photographer_id = photographer_uuid 
  AND is_featured = TRUE
  ORDER BY created_at DESC
  LIMIT 6;
$$ LANGUAGE sql STABLE;

-- Function to get slideshow images for a photographer
CREATE OR REPLACE FUNCTION get_slideshow_images(photographer_uuid UUID)
RETURNS SETOF images AS $$
  SELECT * FROM images 
  WHERE photographer_id = photographer_uuid 
  AND is_slideshow = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;
```

## Backup and Maintenance

### Regular Maintenance Tasks

1. **Index Optimization**: Regularly analyze and vacuum tables to keep indexes optimized
2. **Statistics Updates**: Update table statistics for query planner optimization
3. **Connection Pooling**: Implement connection pooling for better performance under load

### Performance Considerations

1. **Image Caching**: Consider implementing a caching layer for frequently accessed images
2. **CDN Integration**: ImageKit provides built-in CDN for global performance
3. **Pagination**: Always implement pagination for image galleries to avoid loading large datasets
4. **Async Operations**: Heavy operations like image processing should be done via background jobs

This schema is designed to work with the ImageKit integration, where the `id` field matches ImageKit file IDs, allowing for efficient storage and retrieval of image assets with CDN delivery and transformation capabilities.