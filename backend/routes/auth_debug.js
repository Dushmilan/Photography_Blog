const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Register (only for first time setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get Supabase client from app locals
    const supabase = req.app.locals.supabase;
    const userClass = new User(supabase);

    // Check if user already exists
    const existingUser = await userClass.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login with debugging
router.post('/login', async (req, res) => {
  console.log('--- LOGIN DEBUG ---');
  console.log('Login request received');
  console.log('Request body:', req.body);
  
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing username or password in request');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Attempting to authenticate user:', username);

    // Get Supabase client from app locals
    const supabase = req.app.locals.supabase;
    const userClass = new User(supabase);

    // Find user
    console.log('Looking for user in database:', username);
    const user = await userClass.findByUsername(username);
    if (!user) {
      console.log('User not found in database:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found in database:', {
      id: user.id,
      username: user.username,
      passwordHash: user.password.substring(0, 20) + '...' // Only showing first 20 chars for security
    });

    // Check password
    console.log('Comparing provided password with stored hash');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match stored hash');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched successfully');

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'photography-portfolio-secret',
      { expiresIn: '7d' }
    );

    console.log('Token generated successfully for user:', user.username);
    console.log('--- END LOGIN DEBUG ---');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.log('--- END LOGIN DEBUG (with error) ---');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if authenticated
router.get('/me', authenticate, async (req, res) => {
  try {
    // Get Supabase client from app locals
    const supabase = req.app.locals.supabase;
    const userClass = new User(supabase);

    const user = await userClass.findById(req.user.userId);
    // Remove password from the response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;