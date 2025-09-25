const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.error('Supabase URL and Key not found in environment variables');
  process.exit(1);
}

// Make supabase available globally via app
app.locals.supabase = supabase;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/images', require('./routes/images'));
app.use('/api/contact', require('./routes/contact'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});