const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

class GooglePhotosAPI {
  constructor() {
    this.oauth2Client = null;
    this.photos = null;
    this.isOAuth2 = false; // Track authentication type
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

      // Check if credentials are for OAuth2 (web application) or service account
      if (credentials.web) {
        // OAuth2 credentials
        const { client_id, client_secret, redirect_uris } = credentials.web;
        
        // Use the standard Google Photos redirect URI for the OAuth2 client
        // This matches what's in the client secret file
        this.oauth2Client = new google.auth.OAuth2(
          client_id,
          client_secret,
          '/api/google-photos/callback'  // Using our internal callback route
        );
        this.isOAuth2 = true;
        
        // Check if we have a stored refresh token
        const refreshToken = process.env.GOOGLE_PHOTOS_REFRESH_TOKEN;
        if (refreshToken) {
          this.oauth2Client.setCredentials({
            refresh_token: refreshToken
          });
        }
      } else {
        // Service account credentials (JWT)
        this.oauth2Client = new google.auth.JWT(
          credentials.client_email,
          null,
          credentials.private_key,
          ['https://www.googleapis.com/auth/photoslibrary.readonly'],
          null
        );
      }

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

  // OAuth2 specific methods
  async getAuthUrl() {
    if (!this.isOAuth2) {
      throw new Error('OAuth2 not configured. Use service account instead.');
    }
    
    // Use the correct redirect URI that matches your Google Cloud Console configuration
    const credentialsPath = process.env.GOOGLE_PHOTOS_CREDENTIALS_PATH || './google-photos-credentials.json');
    const fs = require('fs').promises;
    
    // For now, hardcode the redirect URI to match your client secret
    // We'll temporarily create a new OAuth2 client for generating the URL
    const { google } = require('googleapis');
    const path = require('path');
    
    // This is a workaround to use the actual redirect URI from credentials for auth URL generation
    // The main client uses our internal callback path
    let credentials;
    try {
      const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
      credentials = JSON.parse(credentialsContent);
    } catch (e) {
      // If file reading fails, use fallback
      credentials = { web: { redirect_uris: ['http://localhost:5000/api/auth/callback'] } };
    }
    
    const tempOAuth2Client = new google.auth.OAuth2(
      credentials.web.client_id,
      credentials.web.client_secret,
      credentials.web.redirect_uris[0] // Use the external redirect URI
    );
    
    return tempOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
      prompt: 'consent' // This ensures we get a refresh token
    });
  }

  async getTokenFromCode(code) {
    if (!this.isOAuth2) {
      throw new Error('OAuth2 not configured. Use service account instead.');
    }
    
    // Create a temporary client with the external redirect URI to exchange the code
    const { google } = require('googleapis');
    const fs = require('fs').promises;
    
    const credentialsPath = process.env.GOOGLE_PHOTOS_CREDENTIALS_PATH || './google-photos-credentials.json';
    let credentials;
    try {
      const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
      credentials = JSON.parse(credentialsContent);
    } catch (e) {
      // If file reading fails, use fallback
      credentials = { web: { redirect_uris: ['http://localhost:5000/api/auth/callback'] } };
    }
    
    const tempOAuth2Client = new google.auth.OAuth2(
      credentials.web.client_id,
      credentials.web.client_secret,
      credentials.web.redirect_uris[0] // Use the external redirect URI
    );
    
    const { tokens } = await tempOAuth2Client.getToken(code);
    // Set the tokens on our main client which uses the internal callback path
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }
}

module.exports = GooglePhotosAPI;