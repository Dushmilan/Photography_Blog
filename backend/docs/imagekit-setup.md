# Setting up Imagekit.io for Photography Blog

## Getting Your Imagekit.io Credentials

To use Imagekit.io with your photography blog, you'll need to get your credentials from Imagekit.io:

1. **Sign up for Imagekit.io**
   - Go to [https://imagekit.io](https://imagekit.io)
   - Create an account or sign in

2. **Get your API credentials**
   - Log into your Imagekit dashboard
   - Navigate to "Developer" > "API Keys" 
   - Copy your:
     - **Public Key** - for client-side operations
     - **Private Key** - for server-side operations
     - **URL Endpoint** - usually in format: `https://ik.imagekit.io/YOUR_ID/`

3. **Update your .env file**
   Add these values to your `.env` file in the backend directory:
   ```
   IMAGEKIT_PUBLIC_KEY=your_public_key_here
   IMAGEKIT_PRIVATE_KEY=your_private_key_here
   IMAGEKIT_URL_ENDPOINT=https://your_id.imagekit.io/
   ```

## Testing the API Connection

Run the test script to verify your API connection:

```bash
cd backend
node test-imagekit.js
```

If successful, you should see:
- ✅ API Connection Successful!
- ✅ ImageKit APIs are working properly

## Next Steps

Once your API is working, you can:
1. Migrate your images from Google Photos to Imagekit
2. Update your server API endpoints to use Imagekit instead of Google Photos
3. Implement image upload functionality using Imagekit
4. Use Imagekit's transformation features for optimized image delivery

## Useful Imagekit.io Features for Photography Blog

- **Real-time image transformations**: Resize, crop, and optimize images via URL parameters
- **CDN delivery**: Fast global content delivery for your photos
- **Format conversion**: Automatic WebP/AVIF conversion for better performance
- **Storage management**: Organize and manage your photo library in the cloud