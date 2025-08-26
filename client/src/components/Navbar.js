import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-white transition-colors duration-200 hover:text-blue-400 focus:outline-none focus:text-blue-300 active:scale-95">
                DesignerHub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-200">{user.name}</span>
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 