const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('./tokenStore');

// Function to generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(
    { ...payload }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      issuer: 'photography-blog-api',
      audience: 'photography-blog-users'
    }
  );
};

// Function to generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET, 
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      issuer: 'photography-blog-api',
      audience: 'photography-blog-users'
    }
  );
};

// Function to verify access token
const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    // First check if the token is blacklisted
    if (isTokenBlacklisted(token)) {
      return reject({ 
        error: true, 
        message: 'Token has been revoked',
        revoked: true
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        let message = 'Invalid token';
        if (err.name === 'TokenExpiredError') {
          message = 'Access token expired';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Invalid token format';
        }
        
        return reject({ 
          error: true, 
          message,
          expired: err.name === 'TokenExpiredError'
        });
      }
      resolve(decoded);
    });
  });
};

// Function to verify refresh token
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    // First check if the token is blacklisted
    if (isTokenBlacklisted(token)) {
      return reject({ 
        error: true, 
        message: 'Refresh token has been revoked',
        revoked: true
      });
    }
    
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        let message = 'Invalid refresh token';
        if (err.name === 'TokenExpiredError') {
          message = 'Refresh token expired';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Invalid refresh token format';
        }
        
        return reject({ 
          error: true, 
          message,
          expired: err.name === 'TokenExpiredError'
        });
      }
      resolve(decoded);
    });
  });
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};