const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { storeRefreshToken } = require('../utils/tokenStore');
const { catchAsync, AppError } = require('../utils/errorHandler');

const router = express.Router();

// Register (only for first time setup)
router.post('/register', catchAsync(async (req, res) => {
  const { username, password } = req.body;

  // Validate input data
  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new AppError('Username and password must be strings', 400);
  }

  if (username.length < 3) {
    throw new AppError('Username must be at least 3 characters long', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  // Get Supabase client from app locals
  const supabase = req.app.locals.supabase;
  const userClass = new User(supabase);

  // Check if user already exists
  const existingUser = await userClass.findByUsername(username);
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const userData = {
    username,
    password: hashedPassword
  };

  const user = await userClass.create(userData);

  res.status(201).json({ message: 'User created successfully' });
}));

// Login
router.post('/login', catchAsync(async (req, res) => {
  const { username, password } = req.body;

  // Validate input data
  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new AppError('Username and password must be strings', 400);
  }

  // Get Supabase client from app locals
  const supabase = req.app.locals.supabase;
  const userClass = new User(supabase);

  // Find user
  const user = await userClass.findByUsername(username);
  if (!user) {
    throw new AppError('Invalid credentials', 400);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 400);
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    username: user.username
  });

  // Store refresh token
  storeRefreshToken(user.id, refreshToken);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username
    }
  });
}));

// Check if authenticated
router.get('/me', authenticate, catchAsync(async (req, res) => {
  // Get Supabase client from app locals
  const supabase = req.app.locals.supabase;
  const userClass = new User(supabase);

  const user = await userClass.findById(req.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove password from the response
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
}));

module.exports = router;