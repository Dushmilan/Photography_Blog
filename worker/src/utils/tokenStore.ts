export const refreshTokenStore = new Map<string, { userId: number; issuedAt: number }>();
export const blacklistedTokens = new Set<string>();

export const storeRefreshToken = (userId: number, refreshToken: string): void => {
  const existingTokens = [...refreshTokenStore.entries()]
    .filter(([key, value]) => value.userId === userId)
    .map(([key, value]) => key);
  existingTokens.forEach(token => refreshTokenStore.delete(token));

  refreshTokenStore.set(refreshToken, {
    userId: userId,
    issuedAt: Date.now()
  });
};

export const isValidRefreshToken = (userId: number, refreshToken: string): boolean => {
  const tokenData = refreshTokenStore.get(refreshToken);
  return !!tokenData && tokenData.userId === userId;
};

export const removeRefreshToken = (refreshToken: string): void => {
  refreshTokenStore.delete(refreshToken);
};

export const removeUserRefreshTokens = (userId: number): void => {
  const tokensToRemove = [...refreshTokenStore.entries()]
    .filter(([key, value]) => value.userId === userId)
    .map(([key, value]) => key);
  tokensToRemove.forEach(token => refreshTokenStore.delete(token));
};

export const blacklistToken = (token: string): void => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

export const cleanupBlacklist = (): void => {
  const now = Date.now();
  for (const [token, data] of refreshTokenStore.entries()) {
    if (now - data.issuedAt > 24 * 60 * 60 * 1000) {
      refreshTokenStore.delete(token);
      blacklistedTokens.delete(token);
    }
  }
};
