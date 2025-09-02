import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import getImageUrl from '../utils/Imagepath.js';

const Chat = () => {
  const { id } = useParams(); // Chat partner's ID
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);



  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
console.log("current user" , currentUser)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages between current user and chat partner
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/message/connect/${id}`);
        setMessages(response.data);
        
        // Set chat partner info from first message
        if (response.data.length > 0) {
          const firstMessage = response.data[0];
           const partner = firstMessage.sender?._id === currentUser?.id 
            ? firstMessage.receiver 
            : firstMessage.sender;
          setChatPartner(partner);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.response?.status === 400) {
          alert('You can only message your connections');
          navigate('/network');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUser) {
      fetchMessages();
    }
  }, [id, currentUser, navigate]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await axios.post('/message/sent', {
        receiver: id,
        content: newMessage.trim(),
        messageType: 'text'
      });
console.log("response" , response)

const newmessagewithsender = {
  ...response.data,
  sender : {
    _id : currentUser.id,

  }
}
console.log("new message" , newmessagewithsender)

      // Add new message to messages array
      setMessages(prev => [...prev, newmessagewithsender]);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };
console.log("chat patner" , chatPartner)
  if (loading || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/messages')}
            className="text-white hover:text-purple-300 transition-colors p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {chatPartner && (
            <>
              <img
                src={chatPartner?.profileImage ? getImageUrl(chatPartner?.profileImage) : '/icon.png'}
                alt={chatPartner.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                onClick={() => navigate(`/profile/${chatPartner._id || chatPartner.id}`)}
              />
              <div className="min-w-0 flex-1">
                <h2 
                  className="text-white font-semibold cursor-pointer text-sm sm:text-base truncate" 
                  onClick={() => navigate(`/profile/${chatPartner._id || chatPartner.id}`)}
                >
                  {chatPartner.name}
                </h2>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 flex-1 overflow-y-auto mb-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-1.022L3 21l1.022-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <p className="text-gray-400 text-sm sm:text-base">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender._id === currentUser.id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-white/20 text-white rounded-bl-sm'
                  }`}>
                    <p className="text-sm sm:text-base break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-purple-200' : 'text-gray-300'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 flex-shrink-0">
        <div className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/20 text-white placeholder-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors text-sm sm:text-base flex-shrink-0"
          >
            {sending ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Sending...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
