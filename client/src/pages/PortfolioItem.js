import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import getImageUrl from '../utils/Imagepath';

const PortfolioItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Fetch likes data for this portfolio
  const fetchLikesData = useCallback(async () => {
    try {
      const response = await axios.get(`/likes/count/${id}`);
      setLikesCount(response.data.count || 0);
      
      // Check if current user has liked this portfolio
      if (user && response.data.likes) {
        const userLike = response.data.likes.find(like => like._id === user.id);
        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      setLikesCount(0);
      setIsLiked(false);
    }
  }, [id, user]);

  const fetchPortfolioItem = useCallback(async () => {
    try {
      if (id === 'new') {
        navigate('/portfolio/create');
        return;
      }
      const response = await axios.get(`/portfolio/${id}`);
      setItem(response.data);
      
      // Fetch likes data after getting portfolio
     await fetchLikesData();
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      if (error.response?.status === 404) {
        toast.error('Portfolio item not found');
        navigate('/gallery');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch portfolio item');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchLikesData]);

  // Handle like/unlike action
  const handleLikeToggle = async () => {
    if (!user) {
      toast.error('Please login to like portfolios');
      return;
    }

    setLikeLoading(true);
    try {
      await axios.post(`/likes/${id}`);
      
      // Toggle the like state and update count
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast.success('Portfolio unliked');
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Portfolio liked');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItem();
  }, [fetchPortfolioItem]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/portfolio/${id}`);
      toast.success('Portfolio item deleted successfully');
      setShowDeleteModal(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete portfolio item');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
          <p className="mt-2 text-gray-500">The portfolio item you're looking for doesn't exist.</p>
          <Link
            to="/gallery"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Created by{' '}
                <Link
                  to={`/profile/${item.user.id}`}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  {item.user.name}
                </Link>
              </p>
              
              {/* Like button and count */}
              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={handleLikeToggle}
                  disabled={likeLoading || !user}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isLiked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${(!user || likeLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <svg 
                    className={`w-4 h-4 ${isLiked ? 'fill-red-500' : 'fill-none stroke-current'}`} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                  <span>{likeLoading ? '...' : likesCount}</span>
                </button>
                
                {!user && (
                  <span className="text-xs text-gray-500">Login to like</span>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Link
                  to={`/portfolio/${id}/edit`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            {/* Display images */}
            {item.images && item.images.length > 0 && (
              <div className="mb-6">
                {item.images.length === 1 ? (
                  <div className="relative w-full">
                    <img
                      src={getImageUrl(item.images[0].url)}
                      alt={item.title}
                      className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(image.url)}
                          alt={`${item.title} ${index + 1}`}
                          className="w-full h-48 sm:h-56 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Description */}
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-3">Description</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
            
            {/* Category and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Category</h4>
                <p className="mt-1 text-sm text-gray-600">{item.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Created</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Back to Gallery Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/gallery"
                className="inline-flex items-center text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Portfolio Item
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this portfolio item? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioItem;