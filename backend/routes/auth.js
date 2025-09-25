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

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get Supabase client from app locals
    const supabase = req.app.locals.supabase;
    const userClass = new User(supabase);

    // Find user
    const user = await userClass.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'photography-portfolio-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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