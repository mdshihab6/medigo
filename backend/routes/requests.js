const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const jwt = require('jsonwebtoken');

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

// Get request status
router.get('/status/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        user:users!user_id(name, phone),
        assigned_doctor:users!assigned_doctor_id(name, phone, license_number)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user has access to this request
    if (req.user.role === 'user' && request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'doctor' && request.assigned_doctor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Get request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all requests (for admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Only admin can access all requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { data: requests, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        user:users!user_id(name, phone, email),
        assigned_doctor:users!assigned_doctor_id(name, phone, license_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ requests });

  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request status (for admin)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    // Only admin can update request status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
      });
    }

    const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users!user_id(name, phone),
        assigned_doctor:users!assigned_doctor_id(name, phone, license_number)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Notify relevant parties
    const io = req.app.get('io');
    if (request.user_id) {
      io.to(`user-${request.user_id}`).emit('request-status-updated', {
        request,
        message: `Request status updated to ${status}`
      });
    }

    if (request.assigned_doctor_id) {
      io.to(`doctor-${request.assigned_doctor_id}`).emit('request-status-updated', {
        request,
        message: `Request status updated to ${status}`
      });
    }

    res.json({
      message: 'Request status updated successfully',
      request
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate fee for completed request
router.post('/:id/calculate-fee', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        assigned_doctor:doctors(license_number, specialization)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Request must be completed to calculate fee' });
    }

    // Simple fee calculation (mock)
    const baseFee = 50; // Base consultation fee
    const urgencyMultiplier = {
      'low': 1.0,
      'medium': 1.2,
      'high': 1.5,
      'emergency': 2.0
    };

    const specializationMultiplier = {
      'general': 1.0,
      'cardiology': 1.3,
      'neurology': 1.4,
      'emergency': 1.5
    };

    const urgency = request.urgency_level || 'medium';
    const specialization = request.assigned_doctor?.specialization || 'general';

    const fee = Math.round(
      baseFee * 
      (urgencyMultiplier[urgency] || 1.2) * 
      (specializationMultiplier[specialization] || 1.0)
    );

    // Update request with calculated fee
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('medical_requests')
      .update({
        fee: fee,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Fee calculated successfully',
      fee,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Calculate fee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
