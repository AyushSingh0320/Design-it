import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/40';
  
  // Handle if imagePath is an object with url property
  if (typeof imagePath === 'object' && imagePath.url) {
    imagePath = imagePath.url;
  }
  
  // Ensure imagePath is a string
  if (typeof imagePath !== 'string') {
    console.log('Invalid image path type:', typeof imagePath, imagePath);
    return 'https://via.placeholder.com/40';
  }
  
  if (imagePath.startsWith('http')) return imagePath;
  // Normalize backslashes and ensure leading slash
  const normalized = `/${imagePath}`.replace(/\\\\/g, '/').replace(/\/+/, '/');
  return `http://localhost:5000${normalized}`;
};

const LikedPortfolios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedPortfolios, setLikedPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPortfolios = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/users/alllikedportfolio');
        console.log('Liked portfolios response:', response.data);
        
        // Extract liked portfolios from the response structure
        // response.data is an array of objects with likedportfolio property
        if (response.data && Array.isArray(response.data)) {
          const portfolios = response.data
            .map(item => item.likedportfolio)
            .filter(portfolio => portfolio !== null && portfolio !== undefined);
          console.log('Extracted portfolios:', portfolios);
          console.log('First portfolio images:', portfolios[0]?.images);
          setLikedPortfolios(portfolios);
        } else {
          setLikedPortfolios([]);
        }
      } catch (error) {
        console.error('Error fetching liked portfolios:', error);
        toast.error('Failed to fetch liked portfolios');
        setLikedPortfolios([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLikedPortfolios();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-rose-100"> Portfolios that you have Liked </h1>
      
      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedPortfolios.map((item, index) => {
          const portfolioId = item._id || item.id;
          
          return (
            <div 
              key={portfolioId || index} 
              className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:bg-black/40 transition-all duration-200 border border-white/10"
            >
              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/portfolio/${portfolioId}`)}
              >
                <img
                  src={item.images && item.images.length > 0 
                    ? getImageUrl(item.images[0])
                    : 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 text-white">{item.title}</h2>
                  <p className="text-gray-200 mb-4">{item.description}</p>
                  
                  {/* Owner Information */}
                  {item.owner && (
                    <div className="flex items-center mb-4">
                      <img 
                        src={getImageUrl(item.owner.profileImage)} 
                        alt={item.owner.name}
                         onClick={() => navigate(`/profile/${item.owner?._id || item.owner?.id}`)} 
                        className="w-8 h-8 rounded-full mr-2 object-cover cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm cursor-pointer" 
                       onClick={() => navigate(`/profile/${item.owner?._id || item.owner?.id}`)}
                      >by {item.owner.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex} 
                          className="bg-blue-600/50 text-blue-200 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {likedPortfolios.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-200 text-lg mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>You haven't liked any portfolios yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Browse the <button 
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={() => navigate('/gallery')}
              >
                gallery
              </button> to discover amazing portfolios!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikedPortfolios;
