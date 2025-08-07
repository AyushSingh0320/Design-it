import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

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
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const fetchPortfolioItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await axios.get(`/portfolio?${params.toString()}`);
      setPortfolioItems(response.data);
      
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
  }, [selectedCategory, searchQuery, selectedTags]);

  useEffect(() => {
    fetchPortfolioItems();
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
      <h1 className="text-3xl font-bold mb-8">Design Gallery</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate(`/portfolio/${item._id || item.id}`)}
          >
            <img
              src={item.images && item.images.length > 0 
                ? `http://localhost:5000${item.images[0].url}` 
                : 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center mb-4">
                <img
                  src={item.user?.profileImage || 'https://via.placeholder.com/40'}
                  alt={item.user?.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-700">{item.user?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags?.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No portfolio items found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Gallery; 