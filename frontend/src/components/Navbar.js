import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiImage, FiGrid, FiUpload, FiUser, FiLogIn, FiMail, FiInstagram } from 'react-icons/fi';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarVisible, setNavbarVisible] = useState(true);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle scroll effect for navbar appearance (navbar stays at top but changes on scroll)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Change navbar style when scrolling
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-5'} bg-black border-b-0`}>
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* Left section with Home */}
        <div className="flex items-center">
          <ul className="nav-items hidden md:flex">
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active text-white' : 'text-white'} font-medium`}
              >
                Home
              </Link>
            </li>
          </ul>
        </div>

        {/* Right section with other navigation items */}
        <div className="flex items-center">
          <ul className="nav-items hidden md:flex">
            <li>
              <Link
                to="/gallery"
                className={`nav-link ${isActive('/gallery') ? 'active text-white' : 'text-white'} font-medium`}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`nav-link ${isActive('/about') ? 'active text-white' : 'text-white'} font-medium`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`nav-link ${isActive('/contact') ? 'active text-white' : 'text-white'} font-medium`}
              >
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-white font-medium"
              >
                <FiInstagram size={20} className="inline mr-1 relative top-[4px]" />
              </a>
            </li>

            {/* Show Admin Gallery only when authenticated */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/admin/gallery"
                  className={`nav-link ${isActive('/admin/gallery') ? 'active text-white' : 'text-white'} font-medium`}
                >
                  Admin Gallery
                </Link>
              </li>
            )}

            {/* Show login only when not authenticated */}
            {!isAuthenticated && (
              <li>
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active text-white' : 'text-white'} font-medium`}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Mobile menu button - now with white color */}
        <div className="md:hidden self-start mt-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX size={24} color="white" /> : <FiMenu size={24} color="white" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation - now with black background */}
      {isMenuOpen && (
        <div className="md:hidden bg-black py-4 px-4 border-t border-gray-700 animate-slideDown">
          <ul className="flex flex-col gap-3 items-center">
            <li>
              <Link
                to="/"
                className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/gallery"
                className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/gallery') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/about') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/contact') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link py-2 px-4 rounded-lg hover:bg-gray-800 text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiInstagram size={20} className="inline mr-1 relative top-[2px]" /> Instagram
              </a>
            </li>

            {/* Show Admin Gallery only when authenticated */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/admin/gallery"
                  className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/admin/gallery') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Gallery
                </Link>
              </li>
            )}

            {/* Only show login when not authenticated */}
            {!isAuthenticated && (
              <li>
                <Link
                  to="/login"
                  className={`nav-link py-2 px-4 rounded-lg hover:bg-gray-800 ${isActive('/login') ? 'active bg-gray-800 text-white' : 'text-white'} font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;