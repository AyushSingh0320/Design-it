import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false); // Close mobile menu on logout
      navigate('/login');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold text-white transition-colors duration-200 hover:text-blue-400 focus:outline-none focus:text-blue-300 active:scale-95"
              onClick={closeMenu}
            >
              DesignerHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/gallery"
              className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
            >
              Gallery
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Dashboard
                </Link>
                <Link
                  to="/liked-portfolios"
                  className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Liked
                </Link>
                <Link
                  to="/network"
                  className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Network
                </Link>
                <Link
                  to="/messages"
                  className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Messages
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="border-transparent text-gray-200 hover:border-white/30 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-200 text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95 shadow-md backdrop-blur-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:text-blue-300 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-500/80 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 shadow-md backdrop-blur-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-200 hover:text-white focus:outline-none focus:text-white transition-colors duration-200 p-2"
              aria-label="Toggle menu"
            >
              <svg
                className={`h-6 w-6 transform transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/30 backdrop-blur-sm rounded-b-lg border-t border-white/10">
            <Link
              to="/gallery"
              className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={closeMenu}
            >
              Gallery
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/liked-portfolios"
                  className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Liked Portfolios
                </Link>
                <Link
                  to="/network"
                  className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Network
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Messages
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="text-gray-200 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
            {!user && (
              <div className="px-3 py-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center bg-blue-500/80 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 