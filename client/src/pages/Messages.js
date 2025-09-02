import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import getImageUrl from '../utils/Imagepath';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/message/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
//    console.log(currentUser)
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);
  console.log( "Lastmessage" , conversations)

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-300 text-sm sm:text-base">Chat with your connections</p>
      </div>

      {conversations.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-1.022L3 21l1.022-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">Start chatting with your connections</p>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              onClick={() => navigate(`/chat/${conversation._id}`)}
              className="p-3 sm:p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors active:bg-white/10"
            >
              <div className="flex items-center space-x-3">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.user?.profileImage ? getImageUrl(conversation.user?.profileImage) : '/icon.png'}
                    alt={conversation.user?.name || 'User'}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate text-sm sm:text-base">
                      {conversation.user?.name || 'Unknown User'}
                    </h3>
                    <span className="text-gray-400 text-xs sm:text-sm flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessage?.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-xs sm:text-sm truncate ${conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-300'}`}>
                       {conversation.lastMessage?.sender === (currentUser?._id || currentUser?.id) ? 'You: ' : `${conversation.user?.name?.split(' ')[0]}: `}
                       {truncateMessage(conversation.lastMessage?.content || 'No messages yet', window.innerWidth < 640 ? 30 : 50)}
                    </p>
                    
                    {/* Mobile indicator for unread messages */}
                    {conversation.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 sm:hidden"></div>
                    )}
                  </div>
                </div>

                {/* Desktop chevron indicator */}
                <div className="hidden sm:block text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
