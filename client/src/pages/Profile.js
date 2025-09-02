import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';
import getImageUrl from '../utils/Imagepath';


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
      const receivedResponse = await axios.get('/collaboration/received');
      const receivedRequest = receivedResponse.data.find(collab => collab.sender.id === user.id);
      
      if (receivedRequest) {
        setCollaborationStatus(receivedRequest.status);
        return;
      }
      
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
    setProfileImagePreview(getImageUrl(user.profileImage) || '/icon.png');
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
    setProfileImagePreview(getImageUrl(user.profileImage) || '/icon.png');
    setRemovingImage(false);
    setskills(user.skills || []);
    
    // Handle socialLinks properly whether it's array or object
    const socialLinksObj = Array.isArray(user.socialLinks) && user.socialLinks.length > 0 
      ? user.socialLinks[0] 
      : user.socialLinks || {};
    setsociallinks(socialLinksObj);
  };

  // const handleCancelEdit = () => {
  //   setEditMode(false);
  //   setBio(user.bio || '');
  //   setProfileImage(null);
  //   setProfileImagePreview(getImageUrl(user.profileImage) || '/icon.png');
  //   setRemovingImage(false);
  //   setskills(user.skills || []);
  //   
  //   // Handle socialLinks properly whether it's array or object
  //   const socialLinksObj = Array.isArray(user.socialLinks) && user.socialLinks.length > 0 
  //     ? user.socialLinks[0] 
  //     : user.socialLinks || {};
  //   setsociallinks(socialLinksObj);
  // };

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
    setProfileImagePreview('/icon.png');
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <img
              src={profileImagePreview}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base break-all">{user.email}</p>
            </div>
          </div>
          
          {isOwnProfile && !editMode && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          )}
          
          {!isOwnProfile && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {checkingCollaboration ? (
                <button 
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed text-sm sm:text-base"
                >
                  Checking...
                </button>
              ) : collaborationStatus === 'pending' ? (
                <button 
                  disabled
                  className="bg-yellow-500 text-white px-4 py-2 rounded cursor-not-allowed text-sm sm:text-base"
                >
                  Request Pending
                </button>
              ) : collaborationStatus === 'accepted' ? (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button 
                    disabled
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-not-allowed text-sm sm:text-base"
                  >
                    Connected
                  </button>
                  <button
                    onClick={() => navigate(`/chat/${user.id}`)}
                  className=" text-blue-600 px-4 py-2 rounded-full border-2 border-blue-600 hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 "
                  >
                    💬 Chat
                  </button>
                </div>
              ) : collaborationStatus === 'rejected' ? (
                <button 
                  disabled
                  className="bg-red-500 text-white px-4 py-2 rounded cursor-not-allowed text-sm sm:text-base"
                >
                  Request Rejected
                </button>
              ) : (
                <button
                  onClick={handleSendCollaborationRequest}
                  disabled={sendingRequest}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {sendingRequest ? 'Sending...' : 'Connect'}
                </button>
              )}
            </div>
          )}
        </div>

        {isOwnProfile && editMode ? (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Bio</label>
                <textarea
                  className="w-full border rounded p-3 text-sm sm:text-base resize-none"
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="w-full text-sm sm:text-base"
                />
                {profileImagePreview && (
                  <div className="mt-3 flex items-center space-x-3">
                    <img src={profileImagePreview} alt="Preview" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:underline text-sm sm:text-base"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Skills</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Add a skill and press Enter"
                    className="flex-1 border rounded p-2 text-sm sm:text-base"
                  />
                  <button 
                    type="button" 
                    onClick={addSkill} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span key={`${s}-${idx}`} className="inline-flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                      {s}
                      <button type="button" onClick={() => removeSkill(idx)} className="ml-2 text-red-600 hover:text-red-800">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Social Links</label>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">Portfolio Website</label>
                    <input
                      type="url"
                      value={socialLinks.website || ''}
                      onChange={(e) => setsociallinks(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://your-site.com"
                      className="w-full border rounded p-2 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-600 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={socialLinks.linkedin || ''}
                      onChange={(e) => setsociallinks(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full border rounded p-2 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {user.bio || 'No bio available'}
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Skills</h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 text-sm sm:text-base">No skills available</p>
              )}
            </div>

            {!hasSocial ? (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Social Links</h2>
                <p className="text-gray-700 text-sm sm:text-base">No social links available</p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Social Links</h2>
                <div className="space-y-3">
                  {socialLinksObj?.website && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"></path>
                      </svg>
                      <a
                        href={socialLinksObj.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base break-all"
                      >
                        Portfolio Website
                      </a>
                    </div>
                  )}
                  
                  {socialLinksObj?.linkedin && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
                      </svg>
                      <a
                        href={socialLinksObj.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base break-all"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {isOwnProfile && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Portfolio Statistics</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex">
                    <span className="text-gray-700 text-sm sm:text-base">Total Portfolios:</span>
                    <span className="font-semibold pl-2">{portfolioCount}</span>
                  </div>
                  <div className="flex ">
                    <span className="text-gray-700 text-sm sm:text-base">Total Likes Received:</span>
                    <span className="font-semibold pl-2 ">{totalLikes}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile ;