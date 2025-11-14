import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './utils/api';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import AdminGalleryPage from './pages/AdminGalleryPage';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      // Verify token with backend
      api.get('/auth/me')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          // Clear tokens if verification fails
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
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
    <ErrorProvider>
      <ErrorBoundary>
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
              <Route
                path="/about"
                element={<AboutPage />}
              />
              <Route
                path="/contact"
                element={<ContactPage />}
              />
              <Route
                path="/admin/gallery"
                element={isAuthenticated ? <AdminGalleryPage /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;