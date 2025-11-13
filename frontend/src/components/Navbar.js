import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiImage, FiGrid, FiUpload, FiUser, FiLogIn } from 'react-icons/fi';

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

  // Handle scroll effect for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar on top of page or when scrolling up
      if (currentScrollY < 50) {
        setScrolled(currentScrollY > 10);
        setNavbarVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setScrolled(true);
        setNavbarVisible(false);
      } else {
        // Scrolling up
        setScrolled(true);
        setNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarVisible ? 'translate-y-0' : '-translate-y-full'} ${scrolled ? 'py-2 shadow-md' : 'py-5'}`}>
      <div className="container mx-auto px-4 flex items-center">
        <div className="flex-grow"></div>

        {/* Desktop Navigation */}
        <ul className="nav-items hidden md:flex justify-center">
          <li>
            <Link
              to="/"
              className={`nav-link flex items-center gap-1 ${isActive('/') ? 'active' : ''}`}
            >
              <FiHome className="text-sm" /> Home
            </Link>
          </li>
          <li>
            <Link
              to="/gallery"
              className={`nav-link flex items-center gap-1 ${isActive('/gallery') ? 'active' : ''}`}
            >
              <FiGrid className="text-sm" /> Gallery
            </Link>
          </li>

          {/* Show Admin Gallery only when authenticated */}
          {isAuthenticated && (
            <li>
              <Link
                to="/admin/gallery"
                className={`nav-link flex items-center gap-1 ${isActive('/admin/gallery') ? 'active' : ''}`}
              >
                <FiImage className="text-sm" /> Admin Gallery
              </Link>
            </li>
          )}

          {/* Show login only when not authenticated */}
          {!isAuthenticated && (
            <li>
              <Link
                to="/login"
                className={`nav-link flex items-center gap-1 ${isActive('/login') ? 'active' : ''}`}
              >
                <FiLogIn className="text-sm" /> Login
              </Link>
            </li>
          )}
        </ul>
        <div className="flex-grow"></div>

        {/* Mobile menu button */}
        <div className="md:hidden self-start mt-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#001F3F] p-2 rounded-lg hover:bg-[#A8E6CF]/20 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm py-4 px-4 border-t border-[#708090]/20 animate-slideDown">
          <ul className="flex flex-col gap-3 items-center">
            <li>
              <Link
                to="/"
                className={`nav-link flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-[#A8E6CF]/20 hover:to-[#6B8C6B]/20 ${isActive('/') ? 'active bg-gradient-to-r from-[#A8E6CF]/20 to-[#6B8C6B]/20' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/gallery"
                className={`nav-link flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-[#A8E6CF]/20 hover:to-[#6B8C6B]/20 ${isActive('/gallery') ? 'active bg-gradient-to-r from-[#A8E6CF]/20 to-[#6B8C6B]/20' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiGrid /> Gallery
              </Link>
            </li>

            {/* Show Admin Gallery only when authenticated */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/admin/gallery"
                  className={`nav-link flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-[#A8E6CF]/20 hover:to-[#6B8C6B]/20 ${isActive('/admin/gallery') ? 'active bg-gradient-to-r from-[#A8E6CF]/20 to-[#6B8C6B]/20' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiImage /> Admin Gallery
                </Link>
              </li>
            )}

            {/* Only show login when not authenticated */}
            {!isAuthenticated && (
              <li>
                <Link
                  to="/login"
                  className={`nav-link flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-[#A8E6CF]/20 hover:to-[#6B8C6B]/20 ${isActive('/login') ? 'active bg-gradient-to-r from-[#A8E6CF]/20 to-[#6B8C6B]/20' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn /> Login
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