const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../utils/jwt');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Verify the access token
    const decoded = await verifyAccessToken(token);
    
    // Additional security checks
    if (decoded.type && decoded.type === 'refresh') {
      return res.status(403).json({ message: 'Invalid token type for this operation' });
    }
    
    // Ensure the token was issued for the correct audience
    if (decoded.aud !== 'photography-blog-users') {
      return res.status(403).json({ message: 'Invalid token audience' });
    }
    
    // Ensure the token was issued by our application
    if (decoded.iss !== 'photography-blog-api') {
      return res.status(403).json({ message: 'Invalid token issuer' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

module.exports = authenticateToken;