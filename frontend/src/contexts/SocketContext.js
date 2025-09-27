import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        
        // Join appropriate rooms based on user role
        if (user.role === 'doctor') {
          newSocket.emit('join-doctor-room', user.id);
        } else if (user.role === 'user') {
          newSocket.emit('join-user-room', user.id);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      // Listen for new medical requests (doctors only)
      newSocket.on('new-medical-request', (data) => {
        if (user.role === 'doctor') {
          toast.success('New medical request in your area!', {
            duration: 6000,
            style: {
              background: '#10b981',
              color: '#fff',
            }
          });
        }
      });

      // Listen for request acceptance (users only)
      newSocket.on('request-accepted', (data) => {
        if (user.role === 'user') {
          toast.success('Your request has been accepted by a doctor!', {
            duration: 6000,
            style: {
              background: '#10b981',
              color: '#fff',
            }
          });
        }
      });

      // Listen for status updates
      newSocket.on('request-status-updated', (data) => {
        const statusMessages = {
          'pending': 'Request is pending',
          'accepted': 'Request has been accepted',
          'in_progress': 'Doctor is on the way',
          'completed': 'Request completed',
          'cancelled': 'Request cancelled'
        };

        const message = statusMessages[data.request.status] || 'Request status updated';
        
        toast.success(message, {
          duration: 4000,
          style: {
            background: '#3b82f6',
            color: '#fff',
          }
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const emit = useCallback((event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  const value = {
    socket,
    emit,
    on,
    off,
    isConnected: socket?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
