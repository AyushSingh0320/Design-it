import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000${imagePath}`;
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [removingImage, setRemovingImage] = useState(false);

  useEffect(() => {
    const userId = id || currentUser?.id;
    if (authLoading) return;
    if (userId) {
      const fetchUserProfile = async () => {
        setProfileLoading(true);
        try {
          const response = await axios.get(`/users/${userId}`);
          setUser(response.data);
          setBio(response.data.bio || '');
          setProfileImagePreview(getImageUrl(response.data.profileImage));
          setError(null);
        } catch (err) {
          setError('Failed to load profile. Please try again later.');
          toast.error('Failed to load profile. Please try again later.');
        } finally {
          setProfileLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      toast.info('Please log in to view your profile.');
      navigate('/login');
    }
  }, [id, currentUser, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setBio(user.bio || '');
    setProfileImage(null);
    setProfileImagePreview(user.profileImage || 'https://via.placeholder.com/150');
    setRemovingImage(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setBio(user.bio || '');
    setProfileImage(null);
    setProfileImagePreview(user.profileImage || 'https://via.placeholder.com/150');
    setRemovingImage(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setRemovingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview('https://via.placeholder.com/150');
    setRemovingImage(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      if (removingImage) {
        formData.append('profileImage', ''); // Signal to remove image
      }
      await axios.patch('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile updated successfully');
      setEditMode(false);
      // Refetch profile
      const response = await axios.get(`/users/${user.id}`);
      setUser(response.data);
      setBio(response.data.bio || '');
      setProfileImagePreview(getImageUrl(response.data.profileImage));
      setRemovingImage(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (profileLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={editMode ? profileImagePreview : getImageUrl(user.profileImage)}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          {isOwnProfile && !editMode && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {isOwnProfile && editMode ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Edit Profile</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Bio</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {profileImagePreview && (
                <div className="mt-2 flex items-center space-x-2">
                  <img src={profileImagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{user.bio || 'No bio available'}</p>
          </div>
        )}

        {user.socialLinks && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Social Links</h2>
            <div className="flex space-x-4">
              {user.socialLinks.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  GitHub
                </a>
              )}
              {user.socialLinks.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  LinkedIn
                </a>
              )}
              {user.socialLinks.website && (
                <a
                  href={user.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-2">Portfolio Items</h2>
          {user.portfolioItems?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No portfolio items available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 