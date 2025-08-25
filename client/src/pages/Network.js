import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/80';
  if (imagePath.startsWith('http')) return imagePath;
  // Normalize backslashes and ensure leading slash
  const normalized = `/${imagePath}`.replace(/\\\\/g, '/').replace(/\/+/, '/');
  return `http://localhost:5000${normalized}`;
};

const Network = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/collaboration/received');
      console.log('Received requests:', response.data);
     const pending

    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch collaboration requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: action }));
      
      await axios.patch(`/collaboration/${requestId}`, {
        status: action
      });

      // Remove the request from the list after action
      setRequests(prev => prev.filter(request => request._id !== requestId));
      
      const actionText = action === 'accepted' ? 'accepted' : 'rejected';
      toast.success(`Collaboration request ${actionText} successfully`);
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      toast.error(`Failed to ${action} collaboration request`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-rose-100 ">My Network</h1>
          <p className="text-rose-100 mt-1">
            Manage your collaboration requests ({requests.length} pending)
          </p>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center">
                <svg 
                  className="w-16 h-16 text-gray-300 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1" 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                <h3 className="text-lg font-medium text-rose-100 mb-2">No collaboration requests</h3>
                <p className="text-rose-100">You don't have any pending collaboration requests at the moment.</p>
              </div>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  {/* Sender Info */}
                  <div className="flex items-center space-x-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${request.sender.id}`)}
                    >
                      <img
                        src={getImageUrl(request.sender.profileImage)}
                        alt={request.sender.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                        onClick={() => navigate(`/profile/${request.sender.id}`)}
                      >
                        {request.sender.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Wants to collaborate with you
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {/* Accept Button */}
                    <button
                      onClick={() => handleRequestAction(request._id, 'accepted')}
                      disabled={actionLoading[request._id]}
                      className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Accept collaboration request"
                    >
                      {actionLoading[request._id] === 'accepted' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Reject Button */}
                    <button
                      onClick={() => handleRequestAction(request._id, 'rejected')}
                      disabled={actionLoading[request._id]}
                      className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject collaboration request"
                    >
                      {actionLoading[request._id] === 'rejected' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>

                    {/* View Profile Button */}
                    <button
                      onClick={() => navigate(`/profile/${request.sender.id}`)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;
