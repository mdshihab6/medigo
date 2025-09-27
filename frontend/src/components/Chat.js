import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const Chat = ({ requestId, patientName, doctorName, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket, emit, on } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // Join chat room for this request
      emit('join-chat-room', requestId);

      // Define message handler
      const handleNewMessage = (data) => {
        if (data.requestId === requestId) {
          setMessages(prev => [...prev, data.message]);
        }
      };

      // Define typing handler
      const handleTyping = (data) => {
        if (data.requestId === requestId && data.userId !== user.id) {
          // Handle typing indicator
        }
      };

      // Listen for new messages
      on('new-message', handleNewMessage);

      // Listen for typing indicators
      on('user-typing', handleTyping);

      return () => {
        // Clean up event listeners
        if (socket) {
          socket.off('new-message', handleNewMessage);
          socket.off('user-typing', handleTyping);
          emit('leave-chat-room', requestId);
        }
      };
    }
  }, [socket, requestId, user.id, emit, on]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      timestamp: new Date().toISOString(),
      requestId
    };

    try {
      setLoading(true);
      
      // Emit message to socket
      emit('send-message', {
        requestId,
        message
      });

      // Clear input immediately (message will come back through socket)
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderIcon = (role) => {
    return role === 'doctor' ? (
      <Stethoscope className="w-4 h-4" />
    ) : (
      <User className="w-4 h-4" />
    );
  };

  const getSenderColor = (role) => {
    return role === 'doctor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-lg border h-96 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
        </div>
        <p className="text-sm text-gray-600">
          {userRole === 'doctor' ? `Patient: ${patientName}` : `Doctor: ${doctorName}`}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.senderId !== user.id && (
                  <div className="flex items-center space-x-1 mb-1">
                    {getSenderIcon(message.senderRole)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getSenderColor(message.senderRole)}`}>
                      {message.senderName}
                    </span>
                  </div>
                )}
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user.id ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
