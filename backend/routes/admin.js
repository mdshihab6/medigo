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

// Middleware to check if user is admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Get all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all doctors
router.get('/doctors', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: doctors, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ doctors });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve doctor registration
router.put('/doctors/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: doctor, error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'doctor')
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      message: 'Doctor approved successfully',
      doctor
    });

  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject doctor registration
router.put('/doctors/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: doctor, error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: false,
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'doctor')
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      message: 'Doctor rejected successfully',
      doctor
    });

  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all requests
router.get('/requests', verifyToken, verifyAdmin, async (req, res) => {
  try {
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
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get total counts
    const [
      { count: totalUsers },
      { count: totalDoctors },
      { count: totalRequests },
      { count: pendingRequests },
      { count: completedRequests }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
      supabaseAdmin.from('medical_requests').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('medical_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('medical_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ]);

    // Get recent requests
    const { data: recentRequests } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        user:users!user_id(name, phone),
        assigned_doctor:users!assigned_doctor_id(name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      statistics: {
        totalUsers,
        totalDoctors,
        totalRequests,
        pendingRequests,
        completedRequests
      },
      recentRequests
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
