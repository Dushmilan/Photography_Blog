const express = require('express');
const { generateAccessToken, verifyRefreshToken } = require('../utils/jwt');
const { isValidRefreshToken, storeRefreshToken, removeRefreshToken, blacklistToken } = require('../utils/tokenStore');
const authenticate = require('../middleware/auth');
const { catchAsync, AppError } = require('../utils/errorHandler');

const router = express.Router();

// Refresh access token using refresh token
router.post('/refresh', catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  if (typeof refreshToken !== 'string') {
    throw new AppError('Refresh token must be a string', 400);
  }

  // Verify the refresh token
  const decoded = await verifyRefreshToken(refreshToken);

  // Check if the refresh token is valid for this user
  if (!isValidRefreshToken(decoded.userId, refreshToken)) {
    throw new AppError('Invalid or revoked refresh token', 403);
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
}));

// Logout (revoke refresh token and blacklist access token)
router.post('/logout', authenticate, catchAsync(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  // Blacklist the current access token
  if (accessToken) {
    blacklistToken(accessToken);
  }

  // If a refresh token was passed, remove it from store
  const { refreshToken } = req.body;
  if (refreshToken && typeof refreshToken === 'string') {
    removeRefreshToken(refreshToken);
  }

  res.json({ message: 'Logged out successfully' });
}));

module.exports = router;