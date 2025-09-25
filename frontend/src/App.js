import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';
import HomePage from './pages/HomePage';

// Set base URL for API
axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/auth/me')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cream-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} />
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/gallery" 
            element={<GalleryPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;