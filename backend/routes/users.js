const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Submit medical request
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { 
      emergency_type, 
      description, 
      location, 
      latitude, 
      longitude,
      urgency_level = 'medium' 
    } = req.body;

    if (!emergency_type || !description || !location || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Emergency type, description, location, and coordinates are required' 
      });
    }

    const requestData = {
      id: uuidv4(),
      user_id: req.user.id,
      emergency_type,
      description,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      urgency_level,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Notify nearby doctors via Socket.IO
    const io = req.app.get('io');
    io.emit('new-medical-request', {
      request,
      message: 'New medical request in your area'
    });

    res.status(201).json({
      message: 'Medical request submitted successfully',
      request
    });

  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's requests
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        assigned_doctor:users!assigned_doctor_id(*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fix the assigned_doctor object to include the ID
    const fixedRequests = requests.map(request => {
      if (request.assigned_doctor && request.assigned_doctor_id) {
        request.assigned_doctor.id = request.assigned_doctor_id;
      }
      return request;
    });

    res.json({ requests: fixedRequests });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific request
router.get('/requests/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        assigned_doctor:users!assigned_doctor_id(*)
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Fix the assigned_doctor object to include the ID
    if (request.assigned_doctor && request.assigned_doctor_id) {
      request.assigned_doctor.id = request.assigned_doctor_id;
    }

    res.json({ request });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
