// In-memory stores for refresh tokens and blacklisted tokens (in production, use database or Redis)
const refreshTokenStore = new Map();
const blacklistedTokens = new Set();

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

// Blacklist a token (for access tokens or refresh tokens)
const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

// Check if a token is blacklisted
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Remove expired tokens from blacklist (tokens that have exceeded their max lifetime in the blacklist)
const cleanupBlacklist = () => {
  // This function could be called periodically to remove old blacklisted tokens
  // For now, it's a placeholder for future implementation
};

module.exports = {
  storeRefreshToken,
  isValidRefreshToken,
  removeRefreshToken,
  removeUserRefreshTokens,
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
  refreshTokenStore, // Export for debugging/timing out old tokens if needed
  blacklistedTokens  // Export for debugging
};