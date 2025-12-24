# Photography Portfolio Website

A full-stack photography portfolio website with gallery, featured, and slideshow functionality, built with React, Node.js, Express, and Supabase PostgreSQL. The system now focuses on image management and display without direct upload/delete/rename functionality.

## Features

- **Photo Gallery**: Responsive masonry grid layout with lightbox view
- **Admin Gallery**: Centralized view of all images with status management
- **Featured Images**: Special gallery section for highlighted photos
- **Slideshow**: Automated slideshow on homepage with featured photos
- **Authentication**: Simple login system for photographers
- **Image Optimization**: Automatic resizing and compression for faster loading
- **Responsive Design**: Works on all device sizes
- **Dark Theme**: Clean, minimalist design focused on photography

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **Image Processing**: ImageKit.io

## Prerequisites

- Node.js (v14 or higher)
- Supabase account (for PostgreSQL database)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Photography_Blog/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

To get your Supabase credentials:
- Create a Supabase account at https://supabase.com/
- Create a new project
- Get your URL from the Project Settings → API Settings
- Get your anon key from the Project Settings → API Settings
- Set up your database tables following the schema in the project documentation

4. Start the backend server:
```bash
npm run dev  # For development with auto-restart
# or
npm start    # For production
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Photography_Blog/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

## Usage

1. Open your browser and go to `http://localhost:3000` to view the public gallery
2. To access the admin panel, go to `http://localhost:3000/login`
3. Register a new account or use an existing one
4. Use the admin panel to manage your photos (set public, featured, slideshow status)
5. View your public gallery and featured photos at the root URL
6. All images are managed from the Admin Gallery page

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info (requires authentication)

### Token Management
- `POST /api/tokens/refresh` - Refresh access token (requires refresh token)

### Images
- `GET /api/images/admin-gallery` - Get all images for admin gallery (requires authentication)
- `GET /api/images/my-images` - Get authenticated user's images (requires authentication)
- `GET /api/images/public` - Get public images (no authentication required)
- `GET /api/images/gallery` - Get images for gallery component (no authentication required)
- `GET /api/images/features` - Get featured images (no authentication required)
- `GET /api/images/slideshow` - Get slideshow images (no authentication required)
- `GET /api/images/:id` - Get a specific image (requires authentication)
- `POST /api/images` - Create a new image record (requires authentication)
- `PUT /api/images/:id/public` - Update image public status (requires authentication)

### ImageKit Integration
- `GET /api/imagekit/images` - Get images from ImageKit (requires authentication)
- `GET /api/imagekit/auth-parameters` - Get ImageKit authentication parameters (requires authentication)
- `PUT /api/imagekit/image/:id` - Update image in ImageKit (requires authentication)
- `GET /api/imagekit/image/:id` - Get specific image from ImageKit (requires authentication)
- `GET /api/imagekit/image/:id/transform` - Transform image in ImageKit (requires authentication)

### Contact
- `POST /api/contact` - Send contact form message

## Project Structure

```
Photography_Blog/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Utility functions
│   ├── docs/             # Documentation files
│   └── server.js         # Main server file
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── components/   # React components
    │   ├── config/       # Configuration files
    │   ├── pages/        # Page components
    │   ├── utils/        # Utility functions (API, error handling)
    │   ├── assets/       # Images and other assets
    │   ├── App.js        # Main app component
    │   └── index.js      # App entry point
    └── package.json      # Frontend dependencies
```

## Environment Variables

Create `.env` files in both backend and frontend directories as needed.

Backend (.env):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

## Image Handling

The application integrates with ImageKit.io for image processing and optimization:
- Original image is stored in ImageKit
- Multiple optimized sizes (thumbnail, small, medium) are automatically created
- Images are optimized for fast loading
- Responsive image serving based on device size
- All images are fetched to Admin Gallery for centralized management
- Gallery, Features, and Slideshow components display images based on their status

## Security

- JWT-based authentication with access/refresh token system
- Rate limiting to prevent abuse
- Compression enabled for API responses
- Protected routes with middleware

## Key Changes

Compared to the previous version:
- Removed image upload endpoint (`POST /api/imagekit/upload`)
- Removed image deletion functionality (`DELETE /api/images/:id` and `DELETE /api/imagekit/image/:id`)
- Removed image renaming functionality
- Added dedicated endpoints for Admin Gallery, Gallery, Features, and Slideshow components
- Admin Gallery now fetches all images for centralized management
- Enhanced image status management (public, featured, slideshow)

## Deployment

### Traditional Deployment

1. Build the frontend for production:
```bash
cd frontend && npm run build
```

2. Serve the build folder or deploy to a hosting platform
3. Ensure environment variables are set in production
4. Start the backend server

### Cloudflare Deployment (Recommended)

To deploy this application to Cloudflare Pages (frontend) and Cloudflare Workers (backend):

1. Follow the detailed instructions in [cloudflare-setup.md](./cloudflare-setup.md)
2. You'll need to:
   - Deploy the backend as a Cloudflare Worker
   - Deploy the frontend to Cloudflare Pages
   - Configure environment variables in both dashboards

The application is designed to work seamlessly with Cloudflare's infrastructure, taking advantage of global edge deployment for optimal performance.