import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

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
          const partner = firstMessage.sender._id === currentUser._id 
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

      // Add new message to messages array
      setMessages(prev => [...prev, response.data]);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Chat Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/messages')}
            className="text-white hover:text-purple-300 transition-colors"
          >
            ← Back
          </button>
          {chatPartner && (
            <>
              <img
                src={chatPartner.profileImage ? `/uploads/${chatPartner.profileImage}` : '/default-avatar.png'}
                alt={chatPartner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-white font-semibold">{chatPartner.name}</h2>
                <p className="text-gray-300 text-sm">Online</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender._id === currentUser._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
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
      <form onSubmit={handleSendMessage} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/20 text-white placeholder-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
