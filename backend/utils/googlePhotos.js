const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

class GooglePhotosAPI {
  constructor() {
    this.oauth2Client = null;
    this.photos = null;
  }

  async initialize() {
    try {
      // Load the credentials
      const credentialsPath = process.env.GOOGLE_PHOTOS_CREDENTIALS_PATH || './google-photos-credentials.json';
      let credentials;
      
      try {
        // Try to load credentials from file
        const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
        credentials = JSON.parse(credentialsContent);
      } catch (error) {
        console.log('Google Photos credentials file not found. Using environment variables.');
        
        // If file doesn\'t exist, check environment variables
        const clientEmail = process.env.GOOGLE_PHOTOS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PHOTOS_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const projectId = process.env.GOOGLE_PHOTOS_PROJECT_ID;
        
        if (clientEmail && privateKey && projectId) {
          credentials = {
            client_email: clientEmail,
            private_key: privateKey,
            project_id: projectId
          };
        } else {
          console.error('Google Photos credentials not found. Please provide either a credentials file or environment variables.');
          return false;
        }
      }

      // Create OAuth2 client
      this.oauth2Client = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/photoslibrary.readonly'],
        null
      );

      // Initialize Photos API
      this.photos = google.photoslibrary({
        version: 'v1',
        auth: this.oauth2Client
      });

      console.log('Google Photos API initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Google Photos API:', error.message);
      return false;
    }
  }

  async listPhotos(pageSize = 50, pageToken = null) {
    try {
      const response = await this.photos.mediaItems.search({
        auth: this.oauth2Client,
        requestBody: {
          pageSize: pageSize,
          pageToken: pageToken,
          filters: {
            mediaTypeFilter: {
              mediaTypes: ['PHOTO']
            }
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching photos from Google Photos:', error.message);
      throw error;
    }
  }

  async getAlbums() {
    try {
      const response = await this.photos.albums.list({
        auth: this.oauth2Client,
        pageSize: 50
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching albums from Google Photos:', error.message);
      throw error;
    }
  }

  async listPhotosFromAlbum(albumId, pageSize = 50, pageToken = null) {
    try {
      const response = await this.photos.mediaItems.search({
        auth: this.oauth2Client,
        requestBody: {
          albumId: albumId,
          pageSize: pageSize,
          pageToken: pageToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching photos from album:', error.message);
      throw error;
    }
  }
}

module.exports = GooglePhotosAPI;