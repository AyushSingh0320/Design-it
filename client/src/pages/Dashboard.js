import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/portfolio/${id}`);
        setPortfolioItems(portfolioItems.filter(item => item.id !== id));
        toast.success('Portfolio item deleted successfully');
      } catch (error) {
        console.error('Error deleting portfolio item:', error);
        toast.error('Failed to delete portfolio item');
      }
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold  text-rose-100">My Portfolio</h1>
        <Link
          to="/portfolio/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add New Item
        </Link>
      </div>

      {portfolioItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-rose-100 mb-4">You haven't added any portfolio items yet.</p>
          <Link
            to="/portfolio/new"
            className="text-blue-500 hover:text-blue-600"
          >
            Add your first item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(`/portfolio/${item._id}`)}
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/portfolio/${item.id}/edit`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
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