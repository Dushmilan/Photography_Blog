# Photography Portfolio Website

A full-stack photography portfolio website with upload and gallery functionality, built with React, Node.js, Express, and MongoDB.

## Features

- **Photo Upload**: Drag-and-drop interface for uploading multiple photos with preview
- **Photo Gallery**: Responsive masonry grid layout with lightbox view
- **Authentication**: Simple login system for photographers
- **Image Optimization**: Automatic resizing and compression for faster loading
- **Responsive Design**: Works on all device sizes
- **Dark Theme**: Clean, minimalist design focused on photography

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Image Processing**: Sharp
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (either local installation or MongoDB Atlas account)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd photography-portfolio/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with your MongoDB connection string:

**Option 1: Using MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.k6mqjpx.mongodb.net/photography-portfolio?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```
**Important**: If using MongoDB Atlas, you need to:
- Create a MongoDB Atlas account at https://www.mongodb.com/atlas
- Create a new cluster
- Set up database access (username and password)
- Add your IP address to the network access list (whitelist)
  - Go to Network Access → Add IP Address → Add Current IP Address or "0.0.0.0/0" for any IP

**Option 2: Using Local MongoDB (Recommended for Development)**
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start the MongoDB service
```env
MONGODB_URI=mongodb://127.0.0.1:27017/photography-portfolio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

4. Start the backend server:
```bash
npm run dev  # For development with auto-restart
# or
npm start    # For production
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd photography-portfolio/frontend
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
4. Use the admin panel to upload and manage your photos
5. View your public gallery at the root URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info (requires authentication)

### Images
- `GET /api/images` - Get all images (public access)
- `GET /api/images/my-images` - Get authenticated user's images (requires authentication)
- `POST /api/images/upload` - Upload images (requires authentication)
- `DELETE /api/images/:id` - Delete an image (requires authentication)

## Project Structure

```
photography-portfolio/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication middleware
│   ├── utils/            # Utility functions
│   ├── uploads/          # Uploaded images (created automatically)
│   │   ├── thumbnails/   # Thumbnail images
│   │   ├── small/        # Small size images
│   │   └── medium/       # Medium size images
│   └── server.js         # Main server file
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── utils/        # Utility functions
    │   ├── assets/       # Images and other assets
    │   ├── App.js        # Main app component
    │   └── index.js      # App entry point
    └── package.json      # Frontend dependencies
```

## Environment Variables

Create `.env` files in both backend and frontend directories as needed.

Backend (.env):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/photography-portfolio
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

## Image Handling

The application automatically creates multiple sizes of each uploaded image:
- Original size (for full-quality viewing)
- Medium size (1200px width, 90% quality) for lightbox
- Small size (600px width, 85% quality) for responsive loading
- Thumbnail (300px width, 80% quality) for gallery grid

## Security

- JWT-based authentication
- Image file validation
- File size limits (10MB per image)
- Protected routes with middleware

## Deployment

1. Build the frontend for production:
```bash
cd frontend && npm run build
```

2. Serve the build folder or deploy to a hosting platform
3. Ensure environment variables are set in production
4. Start the backend server