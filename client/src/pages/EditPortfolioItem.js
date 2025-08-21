import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

const EditPortfolioItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'Web Design',
    isPublic: true
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPortfolioItem();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPortfolioItem = async () => {
    try {
      const response = await axios.get(`/portfolio/${id}`);
      const item = response.data;
      
      setFormData({
        title: item.title,
        description: item.description,
        tags: item.tags?.join(', ') || '',
        category: item.category,
        isPublic: item.isPublic
      });
      setExistingImages(item.images || []);
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      toast.error('Failed to load portfolio item');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form data
      if (!formData.title.trim()) {
        toast.error('Title is required');
        setSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Description is required');
        setSubmitting(false);
        return;
      }
      if (!formData.category) {
        toast.error('Category is required');
        setSubmitting(false);
        return;
      }
      if (existingImages.length === 0 && images.length === 0) {
        toast.error('At least one image is required');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isPublic', String(formData.isPublic));
      
      // Handle tags properly
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
      
      // Send existing images that should be kept
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      
      // Add new images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await axios.put(`/portfolio/${id}`, formDataToSend);
      
      toast.success('Portfolio item updated successfully!');
      navigate(`/portfolio/${id}`);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update portfolio item';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-rose-100">Edit Portfolio Item</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-rose-100 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-rose-100 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-rose-100 mb-2">
              Current Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:5000${image.url}`}
                    alt={`Current ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div className="mb-6">
          <label htmlFor="images" className="block text-sm font-medium text-rose-100 mb-2">
            Add New Images (optional)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`New Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-rose-100 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Web Design">Web Design</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Illustration">Illustration</option>
            <option value="Branding">Branding</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-rose-100 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., web design, responsive, modern"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-rose-100">Make this portfolio item public</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/portfolio/${id}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Portfolio Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPortfolioItem;
