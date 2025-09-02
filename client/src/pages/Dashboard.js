import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import getImageUrl from '../utils/Imagepath';

const Dashboard = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  // const {id} = useParams

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/portfolio/my-portfolio');
      setPortfolioItems(response.data);
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
        if (error.response?.status === 401) {
          toast.error('Please log in to view your portfolio');
          navigate('/login');
        } else {
          toast.error('Failed to fetch portfolio items. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, [user, navigate]);



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-rose-100">My Portfolios</h1>
        <Link
          to="/portfolio/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto text-center"
        >
          Add New Item
        </Link>
      </div>

      {portfolioItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-rose-100 mb-2">No portfolio items yet</h3>
            <p className="text-rose-200 mb-6 text-sm sm:text-base">Start building your portfolio by adding your first project.</p>
            <Link
              to="/portfolio/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first item
            </Link>
          </div>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          style={{
            gridAutoRows: 'min-content',
            alignItems: 'start'
          }}
        >
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content'
              }}
              onClick={() => navigate(`/portfolio/${item._id}`)}
            >
              <img
                src={item.images && item.images.length > 0 
                  ? getImageUrl(item.images[0]?.url) 
                  : '/icon.png'}
                alt={item.title}
                className="w-full h-40 sm:h-48 object-cover"
              />
              <div 
                className="p-3 sm:p-4"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 'fit-content'
                }}
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{item.title}</h2>
                <p 
                  className="text-gray-600 mb-4 text-sm sm:text-base" 
                  style={{
                    wordWrap: 'break-word',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.description}
                </p>
                <div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs sm:text-sm">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/portfolio/${item.id}/edit`}
                      className="text-blue-500 hover:text-blue-600 text-sm sm:text-base transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 