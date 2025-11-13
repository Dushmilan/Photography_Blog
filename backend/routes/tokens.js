const express = require('express');
const { generateAccessToken, verifyRefreshToken } = require('../utils/jwt');
const { isValidRefreshToken, storeRefreshToken, removeRefreshToken, blacklistToken } = require('../utils/tokenStore');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Verify the refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Check if the refresh token is valid for this user
    if (!isValidRefreshToken(decoded.userId, refreshToken)) {
      return res.status(403).json({ message: 'Invalid or revoked refresh token' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      username: decoded.username
    });

    res.json({
      accessToken: newAccessToken,
      // Do not send a new refresh token here - only when logging in
    });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
});

// Logout (revoke refresh token and blacklist access token)
router.post('/logout', authenticate, (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  
  // Blacklist the current access token
  if (accessToken) {
    blacklistToken(accessToken);
  }
  
  // If a refresh token was passed, remove it from store
  const { refreshToken } = req.body;
  if (refreshToken) {
    removeRefreshToken(refreshToken);
  }
  
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;