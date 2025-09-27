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

// Middleware to check if user is a patient
const verifyPatient = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied. Patient role required.' });
  }
  next();
};

// Submit a rating for a completed request
router.post('/', verifyToken, verifyPatient, async (req, res) => {
  try {
    const { doctor_id, request_id, rating, feedback } = req.body;

    // Validate input
    if (!doctor_id || !request_id || !rating) {
      return res.status(400).json({ 
        error: 'doctor_id, request_id, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Check if the request exists and belongs to the patient
    const { data: request, error: requestError } = await supabaseAdmin
      .from('medical_requests')
      .select('*')
      .eq('id', request_id)
      .eq('user_id', req.user.id)
      .eq('status', 'completed')
      .single();

    if (requestError || !request) {
      return res.status(404).json({ 
        error: 'Request not found, not completed, or does not belong to you' 
      });
    }

    // Check if the doctor is assigned to this request
    if (request.assigned_doctor_id !== doctor_id) {
      return res.status(400).json({ 
        error: 'This doctor is not assigned to this request' 
      });
    }

    // Check if rating already exists for this request
    const { data: existingRating, error: existingError } = await supabaseAdmin
      .from('ratings')
      .select('id')
      .eq('request_id', request_id)
      .single();

    if (existingRating) {
      return res.status(400).json({ 
        error: 'You have already rated this request' 
      });
    }

    // Create the rating
    const { data: newRating, error: ratingError } = await supabaseAdmin
      .from('ratings')
      .insert([{
        doctor_id,
        patient_id: req.user.id,
        request_id,
        rating,
        feedback: feedback || null
      }])
      .select(`
        *,
        doctor:users!doctor_id(name, email),
        patient:users!patient_id(name, email)
      `)
      .single();

    if (ratingError) {
      return res.status(400).json({ error: ratingError.message });
    }

    // Notify doctor about the new rating
    const io = req.app.get('io');
    io.to(`doctor-${doctor_id}`).emit('new-rating', {
      rating: newRating,
      message: 'You received a new rating!'
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all ratings for a specific doctor
router.get('/doctors/:doctorId', verifyToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { data: ratings, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        patient:users!patient_id(name, email),
        request:medical_requests!request_id(emergency_type, description, created_at)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId);

    if (countError) {
      return res.status(400).json({ error: countError.message });
    }

    res.json({
      ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get doctor ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get average rating for a doctor
router.get('/doctors/:doctorId/average', verifyToken, async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get average rating using the database function
    const { data: avgRating, error: avgError } = await supabaseAdmin
      .rpc('get_doctor_average_rating', { doctor_uuid: doctorId });

    if (avgError) {
      return res.status(400).json({ error: avgError.message });
    }

    // Get rating count
    const { data: ratingCount, error: countError } = await supabaseAdmin
      .rpc('get_doctor_rating_count', { doctor_uuid: doctorId });

    if (countError) {
      return res.status(400).json({ error: countError.message });
    }

    // Get rating distribution
    const { data: distribution, error: distError } = await supabaseAdmin
      .from('ratings')
      .select('rating')
      .eq('doctor_id', doctorId);

    if (distError) {
      return res.status(400).json({ error: distError.message });
    }

    // Calculate distribution
    const distributionCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(rating => {
      distributionCount[rating.rating]++;
    });

    res.json({
      average_rating: parseFloat(avgRating),
      total_ratings: ratingCount,
      distribution: distributionCount
    });

  } catch (error) {
    console.error('Get average rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient's own ratings
router.get('/my-ratings', verifyToken, verifyPatient, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: ratings, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        doctor:users!doctor_id(name, email, license_number),
        request:medical_requests!request_id(emergency_type, description, created_at)
      `)
      .eq('patient_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', req.user.id);

    if (countError) {
      return res.status(400).json({ error: countError.message });
    }

    res.json({
      ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if a request can be rated
router.get('/can-rate/:requestId', verifyToken, verifyPatient, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if request exists and is completed
    const { data: request, error: requestError } = await supabaseAdmin
      .from('medical_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', req.user.id)
      .eq('status', 'completed')
      .single();

    if (requestError || !request) {
      return res.json({ can_rate: false, reason: 'Request not found or not completed' });
    }

    // Check if already rated
    const { data: existingRating, error: existingError } = await supabaseAdmin
      .from('ratings')
      .select('id')
      .eq('request_id', requestId)
      .single();

    if (existingRating) {
      return res.json({ can_rate: false, reason: 'Already rated' });
    }

    res.json({ 
      can_rate: true,
      request: {
        id: request.id,
        doctor_id: request.assigned_doctor_id,
        emergency_type: request.emergency_type,
        description: request.description
      }
    });

  } catch (error) {
    console.error('Check can rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
