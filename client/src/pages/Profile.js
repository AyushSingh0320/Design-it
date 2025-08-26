import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150';
  if (imagePath.startsWith('http')) return imagePath;
  // Normalize backslashes and ensure leading slash
  const normalized = `/${imagePath}`.replace(/\\\\/g, '/').replace(/\/+/, '/');
  return `http://localhost:5000${normalized}`;
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
  const [skills , setskills] = useState([])
  const [socialLinks , setsociallinks] = useState({})
  const [skillInput, setSkillInput] = useState('');
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState(null);
  const [checkingCollaboration, setCheckingCollaboration] = useState(false);

  // Helpers to manage skills
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (!skills.includes(s)) 
     setskills(prev => [...prev, s]);
    setSkillInput('');
  };
  const removeSkill = (idx) => setskills(prev => prev.filter((_, i) => i !== idx));
  // const removeskill = (skill) => setskills(prev => prev.filter(s => s !== skill));

  // Define isOwnProfile early so it can be used in useEffects
  const isOwnProfile = currentUser?.id === user?.id;

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
          setskills(response.data.skills || []);
          
          // Handle socialLinks properly whether it's array or object
          const socialLinksData = Array.isArray(response.data.socialLinks) && response.data.socialLinks.length > 0 
            ? response.data.socialLinks[0] 
            : response.data.socialLinks || {};
          setsociallinks(socialLinksData);
          
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

  // Fetch portfolio count when user data is loaded and it's own profile
  useEffect(() => {
    const fetchPortfolioCount = async () => {
      if (user && currentUser?.id === user.id) {
        try {
          const response = await axios.get('/users/userdata');
          console.log(response)
          if (response.data && response.data.length > 0) {
            setPortfolioCount(response.data[0].Portfoliocount || 0);
          }
        } catch (err) {
          console.error('Failed to fetch portfolio count:', err);
        }
      }
    };

    fetchPortfolioCount();
  }, [user, currentUser]);

  // Fetch total likes when user data is loaded and it's own profile
  useEffect(() => {
    const fetchTotalLikes = async () => {
      if (user && currentUser?.id === user.id) {
        try {
          const response = await axios.get('/users/totallikes');
          console.log('Total likes response:', response.data);
          if (response.data) {
            setTotalLikes(response.data.totalLikes || 0);
          }
        } catch (err) {
          console.error('Failed to fetch total likes:', err);
          setTotalLikes(0); // Set to 0 if API fails
        }
      }
    };

    fetchTotalLikes();
  }, [user, currentUser]);

  // Check collaboration status when viewing other users' profiles
  useEffect(() => {
    if (user && currentUser && !isOwnProfile) {
      checkCollaborationStatus();
    }
  }, [user, currentUser, isOwnProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const handleSendCollaborationRequest = async () => {
    try {
      setSendingRequest(true);
      await axios.post('/collaboration', {
        receiver: user.id  // Send the profile owner's ID as receiver
      });
      toast.success('Collaboration request sent successfully!');
      // After sending, check the collaboration status again
      checkCollaborationStatus();
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send collaboration request');
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const checkCollaborationStatus = async () => {
    if (!user || !currentUser || isOwnProfile) return;
    
    try {
      setCheckingCollaboration(true);
      // Check if current user has sent a request to this profile owner
      const sentResponse = await axios.get('/collaboration/sent');
      const sentRequest = sentResponse.data.find(collab => collab.receiver.id === user.id);
      console.log("sebder response data",sentResponse)
      
      if (sentRequest) {
        setCollaborationStatus(sentRequest.status);
        return;
      }
      
      // Check if profile owner has sent a request to current user
      // const receivedResponse = await axios.get('/collaboration/received');
      // const receivedRequest = receivedResponse.data.find(collab => collab.sender.id === user.id);
      
      // if (receivedRequest) {
      //   setCollaborationStatus(receivedRequest.status);
      //   return;
      // }
      
      // No collaboration found
      setCollaborationStatus(null);
    } catch (error) {
      console.error('Error checking collaboration status:', error);
      setCollaborationStatus(null);
    } finally {
      setCheckingCollaboration(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setBio(user.bio || '');
    setProfileImage(null);
    setProfileImagePreview(getImageUrl(user.profileImage) || 'https://via.placeholder.com/150');
    setRemovingImage(false);
    setskills(user.skills || []);
    
    // Handle socialLinks properly whether it's array or object
    const socialLinksObj = Array.isArray(user.socialLinks) && user.socialLinks.length > 0 
      ? user.socialLinks[0] 
      : user.socialLinks || {};
    setsociallinks(socialLinksObj);
  };

  const handleCancel = () => {
    setEditMode(false);
    setBio(user.bio || '');
    setProfileImage(null);
    setProfileImagePreview(getImageUrl(user.profileImage) || 'https://via.placeholder.com/150');
    setRemovingImage(false);
    setskills(user.skills || []);
    
    // Handle socialLinks properly whether it's array or object
    const socialLinksObj = Array.isArray(user.socialLinks) && user.socialLinks.length > 0 
      ? user.socialLinks[0] 
      : user.socialLinks || {};
    setsociallinks(socialLinksObj);
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
      formData.append('skills', JSON.stringify(skills));
      formData.append('socialLinks', JSON.stringify(socialLinks));
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
      setskills(response.data.skills || []);
      
      // Handle socialLinks properly whether it's array or object
      const socialLinksData = Array.isArray(response.data.socialLinks) && response.data.socialLinks.length > 0 
        ? response.data.socialLinks[0] 
        : response.data.socialLinks || {};
      setsociallinks(socialLinksData);
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

  // Handle socialLinks whether it's an array or object
  const socialLinksObj = Array.isArray(user.socialLinks) && user.socialLinks.length > 0 
    ? user.socialLinks[0] 
    : user.socialLinks || {};
  
  const hasSocial = socialLinksObj && Object.values(socialLinksObj).some(v => (v || '').toString().trim() !== '');
  
  // Debug logging
  // console.log('user.socialLinks:', user.socialLinks);
  // console.log('socialLinksObj:', socialLinksObj);
  // console.log('hasSocial:', hasSocial);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={profileImagePreview}
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
          
          {!isOwnProfile && (
            <div className="flex space-x-2">
              {checkingCollaboration ? (
                <button 
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  Checking...
                </button>
              ) : collaborationStatus === 'pending' ? (
                <button 
                  disabled
                  className="bg-yellow-500 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  Request Pending
                </button>
              ) : collaborationStatus === 'accepted' ? (
                <div className="flex space-x-2">
                  <button 
                    disabled
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-not-allowed"
                  >
                    Connected
                  </button>
                  <button
                    onClick={() => navigate(`/chat/${user.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    💬 Chat
                  </button>
                </div>
              ) : collaborationStatus === 'rejected' ? (
                <button 
                  disabled
                  className="bg-red-500 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  Request Rejected
                </button>
              ) : (
                <button
                  onClick={handleSendCollaborationRequest}
                  disabled={sendingRequest}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingRequest ? 'Sending...' : 'Connect'}
                </button>
              )}
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
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 border rounded p-2"
                />
                <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((s, idx) => (
                  <span key={`${s}-${idx}`} className="inline-flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(idx)} className="ml-2 text-red-600 hover:text-red-800">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Social Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    value={socialLinks.website || ''}
                    onChange={(e) => setsociallinks(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://your-site.com"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setsociallinks(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full border rounded p-2"
                  />
                </div>
              
              </div>
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

         <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <p className="text-gray-700">{user.skills.join(', ') || 'No skills available'}</p>
          </div>

          {!hasSocial && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Social Links</h2>
              <p className="text-gray-700">No social links available</p>
            </div>
          )}

          {hasSocial && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Social Links</h2>
              <div className="space-y-2">
                {socialLinksObj?.website && (
                  <div>
                    <a
                      href={socialLinksObj.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Portfolio Website
                    </a>
                  </div>
                )}
                
                {socialLinksObj?.linkedin && (
                  <div>
                    <h3 className="text-lg font-medium mb-1">Connect me on:</h3>
                    <a
                      href={socialLinksObj.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                
              </div>
            </div>
          )}
          
          {isOwnProfile && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Portfolio Statistics</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Total Portfolios:</span> {portfolioCount}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Total Likes Received:</span> {totalLikes}
                </p>
              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default Profile ;