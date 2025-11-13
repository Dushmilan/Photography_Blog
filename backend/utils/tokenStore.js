// In-memory store for refresh tokens (in production, use database or Redis)
const refreshTokenStore = new Map();

// Add refresh token to store
const storeRefreshToken = (userId, refreshToken) => {
  // Remove any existing refresh tokens for this user
  const existingTokens = [...refreshTokenStore.entries()]
    .filter(([key, value]) => value.userId === userId)
    .map(([key, value]) => key);
  
  existingTokens.forEach(token => refreshTokenStore.delete(token));

  // Store the new refresh token with user info
  refreshTokenStore.set(refreshToken, {
    userId: userId,
    issuedAt: Date.now()
  });
};

// Check if refresh token is valid
const isValidRefreshToken = (userId, refreshToken) => {
  const tokenData = refreshTokenStore.get(refreshToken);
  return tokenData && tokenData.userId === userId;
};

// Remove refresh token from store
const removeRefreshToken = (refreshToken) => {
  refreshTokenStore.delete(refreshToken);
};

// Remove all refresh tokens for a user
const removeUserRefreshTokens = (userId) => {
  const tokensToRemove = [...refreshTokenStore.entries()]
    .filter(([key, value]) => value.userId === userId)
    .map(([key, value]) => key);
  
  tokensToRemove.forEach(token => refreshTokenStore.delete(token));
};

module.exports = {
  storeRefreshToken,
  isValidRefreshToken,
  removeRefreshToken,
  removeUserRefreshTokens,
  refreshTokenStore // Export for debugging/timing out old tokens if needed
};