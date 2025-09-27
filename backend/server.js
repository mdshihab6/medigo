const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const ratingRoutes = require('./routes/ratings');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medigo API is running' });
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join doctor room for notifications
  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
    console.log(`Doctor ${doctorId} joined their room`);
  });

  // Join user room for status updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join chat room
  socket.on('join-chat-room', (requestId) => {
    socket.join(`chat-${requestId}`);
    console.log(`User joined chat room for request ${requestId}`);
  });

  // Leave chat room
  socket.on('leave-chat-room', (requestId) => {
    socket.leave(`chat-${requestId}`);
    console.log(`User left chat room for request ${requestId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    const { requestId, message } = data;
    // Broadcast message to all users in the chat room (including sender)
    io.to(`chat-${requestId}`).emit('new-message', {
      requestId,
      message
    });
    console.log(`Message sent in chat room ${requestId}:`, message.text);
  });

  // Typing indicator
  socket.on('user-typing', (data) => {
    socket.to(`chat-${data.requestId}`).emit('user-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Medigo API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
