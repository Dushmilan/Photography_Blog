import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiImage, FiGrid, FiUpload, FiUser, FiLogIn, FiMail, FiInstagram } from 'react-icons/fi';
import img from '../Images/Logo.jpg';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 shadow-none sm:shadow-md' : 'py-5'} bg-black border-b-0 sm:border-b`}>
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* Left section with Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-32 h-10 rounded-lg bg-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden md:w-48 md:h-12">
            <img
              src={img}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center">
          <ul className="nav-items flex items-center">
            <li>
              <Link
                to="/gallery"
                className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://www.instagram.com/cooked_by_lens"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-white hover:text-[#A8E6CF]"
              >
                <FiInstagram size={20} />
              </a>
            </li>

            {/* Show Admin link only when already logged in */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/admin/gallery"
                  className={`nav-link ${isActive('/admin/gallery') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              </li>
            )}

            {/* LOGIN BUTTON REMOVED FROM HERE */}
          </ul>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border border-white/10 absolute top-[75px] right-4 w-[85%] sm:w-[50%] md:w-[35%] lg:w-[30%] min-w-[280px] rounded-2xl shadow-2xl animate-slideDown overflow-hidden z-[51]">
          <ul className="flex flex-col p-2 bg-black/95 backdrop-blur-xl">
            <li>
            </li>
            <li>
              <Link
                to="/gallery"
                className={`flex items-center gap-3 py-4 px-4 rounded-xl ${isActive('/gallery') ? 'bg-white/10 text-[#FF6F61]' : 'text-white/70'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiGrid className="text-lg" />
                <span className="font-medium">Gallery</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`flex items-center gap-3 py-4 px-4 rounded-xl ${isActive('/about') ? 'bg-white/10 text-[#FF6F61]' : 'text-white/70'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="text-lg" />
                <span className="font-medium">About</span>
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`flex items-center gap-3 py-4 px-4 rounded-xl ${isActive('/contact') ? 'bg-white/10 text-[#FF6F61]' : 'text-white/70'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiMail className="text-lg" />
                <span className="font-medium">Contact</span>
              </Link>
            </li>

            <div className="h-[1px] bg-white/5 my-2 mx-4" />

            {/* Show Admin Dashboard only when authenticated */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/admin/gallery"
                  className={`flex items-center gap-3 py-4 px-4 rounded-xl ${isActive('/admin/gallery') ? 'bg-white/10 text-[#FF6F61]' : 'text-white/70'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUpload className="text-lg" />
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              </li>
            )}

            {/* LOGIN BUTTON REMOVED FROM HERE */}

            <li>
              <a
                href="https://www.instagram.com/cooked_by_lens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-4 px-4 text-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiInstagram className="text-lg" />
                <span className="font-medium">Instagram</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;