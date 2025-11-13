const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../utils/jwt');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = await verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

module.exports = authenticateToken;