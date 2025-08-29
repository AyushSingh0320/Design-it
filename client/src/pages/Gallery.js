import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import getImageUrl from '../utils/Imagepath.js';


const categories = [
  { id: 'all', name: 'All' },
  { id: 'UI/UX', name: 'UI/UX' },
  { id: 'Graphic Design', name: 'Graphic Design' },
  { id: 'Web Design', name: 'Web Design' },
  { id: 'Illustration', name: 'Illustration' },
  { id: 'Branding', name: 'Branding' },
  { id: 'Other', name: 'Other' }
];

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  // const [searchQuery, setSearchQuery] = useState(''); // For input display
  // const [activeSearchQuery, setActiveSearchQuery] = useState(''); // For API calls
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [likesData, setLikesData] = useState({});
  const [likeLoading, setLikeLoading] = useState({});

  const fetchPortfolioItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      // if (activeSearchQuery) {
      //   params.append('search', activeSearchQuery);
      // }
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);


      const response = await axios.get(`/portfolio?${params.toString()}`);
      setPortfolioItems(response.data);
      
      
      // Fetch likes data for all portfolio items
      const likesPromises = response.data.map(async (item) => {
        try {
          const likesResponse = await axios.get(`/likes/count/${item._id || item.id}`);
          
          const isUserLiked = user && likesResponse.data.likes ? 
            likesResponse.data.likes.some(likeUser => likeUser._id === user.id) : false;
          
          return {
            id: item._id || item.id,
            count: likesResponse.data.count || 0,
            isLiked: isUserLiked
          };
        } catch (error) {
          console.error(`Error fetching likes for portfolio ${item._id}:`, error);
          return {
            id: item._id || item.id,
            count: 0,
            isLiked: false
          };
        }
      });
     console.log("promis" , likesPromises)

      const likesResults = await Promise.all(likesPromises);
      const likesDataMap = {};
      likesResults.forEach(result => {
        likesDataMap[result.id] = {
          count: result.count,
          isLiked: result.isLiked
        };
      });
      setLikesData(likesDataMap);
      // console.log(likesResults)
      console.log(likesDataMap)
      
      // Extract unique tags from all portfolio items
      const tags = new Set();
      response.data.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags([...tags]);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast.error('Failed to fetch portfolio items');
      setPortfolioItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedTags, user]);

  // Handle search form submission
  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   setActiveSearchQuery(searchQuery); // Update the active search query
  // };

  // // Clear search function
  // const handleClearSearch = () => {
  //   setSearchQuery('');
  //   setActiveSearchQuery('');
  // };

  // Handle like/unlike action
  const handleLikeToggle = async (portfolioId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    
    if (!user) {
      toast.error('Please login to like portfolios');
      return;
    }

    setLikeLoading(prev => ({ ...prev, [portfolioId]: true }));
    
    try {
      await axios.post(`/likes/${portfolioId}`);
      
      // Update likes data
      setLikesData(prev => {
        const currentData = prev[portfolioId] || { count: 0, isLiked: false };
        return {
          ...prev,
          [portfolioId]: {
            count: currentData.isLiked ? currentData.count - 1 : currentData.count + 1,
            isLiked: !currentData.isLiked
          }
        };
      });

      const currentData = likesData[portfolioId] || { count: 0, isLiked: false };
      toast.success(currentData.isLiked ? 'Portfolio unliked' : 'Portfolio liked');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(prev => ({ ...prev, [portfolioId]: false }));
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, [fetchPortfolioItems]);

  // Re-fetch data when page becomes visible (user navigates back from portfolio detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPortfolioItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchPortfolioItems]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-rose-100">Design Gallery</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Form */}
          {/* <form onSubmit={handleSearchSubmit} className="relative flex-1 flex">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-r-lg border border-blue-400 transition-colors duration-200 flex items-center"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Clear Search Button */}
            {/* {(searchQuery || activeSearchQuery) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="ml-2 px-3 py-2 bg-gray-500/80 hover:bg-gray-600/80 text-white rounded-lg border border-gray-400 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </form> */}  */

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/80 text-white border border-blue-400'
                    : 'bg-black/30 text-gray-200 border border-white/20 hover:bg-black/40'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Search Query Display */}
        {/* {activeSearchQuery && (
          <div className="mb-4 text-gray-300">
            <span>Searching for: "</span>
            <span className="text-blue-400 font-medium">{activeSearchQuery}</span>
            <span>"</span>
            <button
              onClick={handleClearSearch}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              (clear)
            </button>
          </div>
        )} */}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500/80 text-white border border-blue-400'
                  : 'bg-black/30 text-gray-200 border border-white/20 hover:bg-black/40'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(item => {
          const portfolioId = item._id || item.id;
          const itemLikesData = likesData[portfolioId] || { count: 0, isLiked: false };
          const isLikeLoading = likeLoading[portfolioId] || false;
          
          return (
            <div 
              key={portfolioId} 
              className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:bg-black/40 transition-all duration-200 border border-white/10"
            >
              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/portfolio/${portfolioId}`)}
              >
                <img
                  src={item.images && item.images.length > 0 
                    ? getImageUrl(item.images[0]?.url)
                    : '/icon.png'}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 text-white">{item.title}</h2>
                  <p className="text-gray-200 mb-4">{item.description}</p>
                  <div className="flex items-center mb-4 
                  
                  ">
                    <img
                      src={getImageUrl(item.user?.profileImage)}
                      alt={item.user?.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${item.user?._id || item.user?.id}`)}
                    />
                    <span className="text-gray-200 cursor-pointer" 
                    onClick={() => navigate(`/profile/${item.user?._id || item.user?.id}`)}>
                    {item.user?.name}
                      </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags?.map(tag => (
                      <span
                        key={tag}
                        className="bg-white/20 text-white px-2 py-1 rounded-full text-sm backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                
                
                {/* Like button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => handleLikeToggle(portfolioId, e)}
                    disabled={isLikeLoading || !user}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      itemLikesData.isLiked
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    } ${(!user || isLikeLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <svg 
                      className={`w-4 h-4 ${itemLikesData.isLiked ? 'fill-red-400' : 'fill-none stroke-current'}`} 
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
                    <span>{isLikeLoading ? '...' : itemLikesData.count}</span>
                  </button>
                  
                  {!user && (
                    <span className="text-xs text-gray-400">Login to like</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {portfolioItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-200">No portfolio items found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Gallery; 