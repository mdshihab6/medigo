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

// Middleware to check if user is a doctor
const verifyDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }
  next();
};

// Test route to verify doctors routes are working
router.get('/test', verifyToken, verifyDoctor, (req, res) => {
  res.json({ 
    message: 'Doctors routes are working!', 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Get nearby pending requests
router.get('/requests', verifyToken, verifyDoctor, async (req, res) => {
  try {
    // Check if doctor is verified
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      return res.status(400).json({ error: 'Failed to verify doctor status' });
    }

    if (!doctor.is_verified) {
      return res.status(403).json({ 
        error: 'Your account is not verified yet. Please wait for admin approval before viewing requests.' 
      });
    }

    const { latitude, longitude, radius = 10 } = req.query;

    // If no coordinates provided, get all pending requests
    if (!latitude || !longitude) {
      const { data: requests, error } = await supabaseAdmin
        .from('medical_requests')
        .select(`
          *,
          user:users!user_id(name, phone)
        `)
        .eq('status', 'pending')
        .is('assigned_doctor_id', null);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ requests });
    }

    // Get pending requests within radius (simple distance calculation)
    const { data: requests, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        user:users!user_id(name, phone)
      `)
      .eq('status', 'pending')
      .is('assigned_doctor_id', null);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by distance (simplified calculation)
    const nearbyRequests = requests.filter(request => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        request.latitude,
        request.longitude
      );
      return distance <= parseFloat(radius);
    });

    res.json({ requests: nearbyRequests });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a medical request
router.post('/accept/:requestId', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if doctor is verified
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      return res.status(400).json({ error: 'Failed to verify doctor status' });
    }

    if (!doctor.is_verified) {
      return res.status(403).json({ 
        error: 'Your account is not verified yet. Please wait for admin approval before accepting requests.' 
      });
    }

    // Check if doctor already has an active request
    const { data: activeRequest, error: activeError } = await supabaseAdmin
      .from('medical_requests')
      .select('*')
      .eq('assigned_doctor_id', req.user.id)
      .in('status', ['accepted', 'in_progress'])
      .single();

    if (activeRequest) {
      return res.status(400).json({ 
        error: 'You already have an active request. Please complete it before accepting another one.' 
      });
    }

    // Check if request is still pending
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('medical_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found or already assigned' });
    }

    // Update request with assigned doctor
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('medical_requests')
      .update({
        assigned_doctor_id: req.user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select(`
        *,
        user:users!user_id(name, phone),
        assigned_doctor:users!assigned_doctor_id(name, phone, license_number)
      `)
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Notify user via Socket.IO
    const io = req.app.get('io');
    io.to(`user-${request.user_id}`).emit('request-accepted', {
      request: updatedRequest,
      message: 'Your request has been accepted by a doctor'
    });

    res.json({
      message: 'Request accepted successfully',
      request: updatedRequest
    });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor's accepted requests
router.get('/accepted-requests', verifyToken, verifyDoctor, async (req, res) => {
  try {
    // Check if doctor is verified
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      return res.status(400).json({ error: 'Failed to verify doctor status' });
    }

    if (!doctor.is_verified) {
      return res.status(403).json({ 
        error: 'Your account is not verified yet. Please wait for admin approval before viewing accepted requests.' 
      });
    }

    const { data: requests, error } = await supabaseAdmin
      .from('medical_requests')
      .select(`
        *,
        user:users!user_id(name, phone)
      `)
      .eq('assigned_doctor_id', req.user.id)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ requests });

  } catch (error) {
    console.error('Get accepted requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request status
router.put('/requests/:requestId/status', verifyToken, verifyDoctor, async (req, res) => {
  try {
    // Check if doctor is verified
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      return res.status(400).json({ error: 'Failed to verify doctor status' });
    }

    if (!doctor.is_verified) {
      return res.status(403).json({ 
        error: 'Your account is not verified yet. Please wait for admin approval before updating request status.' 
      });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    if (!['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be in_progress or completed' 
      });
    }

  const { data: request, error } = await supabaseAdmin
      .from('medical_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', requestId)
      .eq('assigned_doctor_id', req.user.id)
      .select(`
        *,
        user:users!user_id(name, phone),
        assigned_doctor:users!assigned_doctor_id(name, phone, license_number)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Notify user of status update
    const io = req.app.get('io');
    io.to(`user-${request.user_id}`).emit('request-status-updated', {
      request,
      message: `Request status updated to ${status}`
    });

    res.json({
      message: 'Request status updated successfully',
      request
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update doctor availability
router.put('/availability', verifyToken, verifyDoctor, async (req, res) => {
  try {
    // Check if doctor is verified
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      return res.status(400).json({ error: 'Failed to verify doctor status' });
    }

    if (!doctor.is_verified) {
      return res.status(403).json({ 
        error: 'Your account is not verified yet. Please wait for admin approval before updating availability.' 
      });
    }

    const { is_available, latitude, longitude } = req.body;

    const updateData = {
      is_available: is_available,
      updated_at: new Date().toISOString()
    };

    if (latitude && longitude) {
      updateData.latitude = parseFloat(latitude);
      updateData.longitude = parseFloat(longitude);
    }

    const { data: updatedDoctor, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Availability updated successfully',
      doctor: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        is_available: updatedDoctor.is_available,
        latitude: updatedDoctor.latitude,
        longitude: updatedDoctor.longitude
      }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor profile
router.get('/profile', verifyToken, verifyDoctor, async (req, res) => {
  try {
    console.log('Fetching profile for doctor:', req.user.id);
    
    // Get doctor profile
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (doctorError) {
      console.error('Error fetching doctor:', doctorError);
      return res.status(400).json({ error: doctorError.message });
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Doctor found:', doctor.name, 'Verified:', doctor.is_verified);

    // If doctor is not verified, return basic profile info only
    if (!doctor.is_verified) {
      return res.json({
        doctor: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: doctor.role,
          is_verified: false,
          created_at: doctor.created_at,
          specialization: doctor.specialization,
          license_number: doctor.license_number
        },
        is_verified: false,
        message: 'Your account is not verified yet. Please wait for admin approval.'
      });
    }

    // For verified doctors, try to get rating data (but don't fail if it doesn't exist)
    let average_rating = 0;
    let total_ratings = 0;
    let recent_ratings = [];

    try {
      // Try to get average rating
      const { data: avgRating } = await supabaseAdmin
        .rpc('get_doctor_average_rating', { doctor_uuid: req.user.id });
      average_rating = parseFloat(avgRating || 0);
    } catch (error) {
      console.log('Rating functions not available yet:', error.message);
    }

    try {
      // Try to get rating count
      const { data: ratingCount } = await supabaseAdmin
        .rpc('get_doctor_rating_count', { doctor_uuid: req.user.id });
      total_ratings = ratingCount || 0;
    } catch (error) {
      console.log('Rating count function not available yet:', error.message);
    }

    try {
      // Try to get recent ratings
      const { data: ratings } = await supabaseAdmin
        .from('ratings')
        .select(`
          *,
          patient:users!patient_id(name, email),
          request:medical_requests!request_id(emergency_type, description, created_at)
        `)
        .eq('doctor_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      recent_ratings = ratings || [];
    } catch (error) {
      console.log('Ratings table not available yet:', error.message);
    }

    res.json({
      doctor: {
        ...doctor,
        average_rating,
        total_ratings
      },
      recent_ratings,
      is_verified: true
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor's ratings
router.get('/ratings', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: ratings, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        patient:users!patient_id(name, email),
        request:medical_requests!request_id(emergency_type, description, created_at)
      `)
      .eq('doctor_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', req.user.id);

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

// Get doctor profile by ID (public route for patients to view doctor profiles)
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;

    // Get doctor profile
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'doctor')
      .eq('is_verified', true)
      .single();

    if (doctorError || !doctor) {
      return res.status(404).json({ error: 'Doctor not found or not verified' });
    }

    // Get doctor's average rating
    let average_rating = 0;
    let total_ratings = 0;
    let recent_ratings = [];
    let work_history = [];

    try {
      // Get average rating
      const { data: avgRating } = await supabaseAdmin
        .rpc('get_doctor_average_rating', { doctor_uuid: id });
      average_rating = parseFloat(avgRating || 0);
    } catch (error) {
      console.log('Rating functions not available:', error.message);
    }

    try {
      // Get rating count
      const { data: ratingCount } = await supabaseAdmin
        .rpc('get_doctor_rating_count', { doctor_uuid: id });
      total_ratings = ratingCount || 0;
    } catch (error) {
      console.log('Rating count function not available:', error.message);
    }

    try {
      // Get recent ratings with patient names
      const { data: ratings } = await supabaseAdmin
        .from('ratings')
        .select(`
          *,
          patient:users!patient_id(name),
          request:medical_requests!request_id(emergency_type, created_at)
        `)
        .eq('doctor_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      recent_ratings = ratings || [];
    } catch (error) {
      console.log('Ratings table not available:', error.message);
    }

    try {
      // Get work history (completed requests)
      const { data: completedRequests } = await supabaseAdmin
        .from('medical_requests')
        .select(`
          id,
          emergency_type,
          description,
          created_at,
          completed_at,
          fee,
          user:users!user_id(name)
        `)
        .eq('assigned_doctor_id', id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20);
      work_history = completedRequests || [];
    } catch (error) {
      console.log('Work history not available:', error.message);
    }

    res.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        profile_picture: doctor.profile_picture,
        qualifications: doctor.qualifications,
        years_experience: doctor.years_experience,
        description: doctor.description,
        license_number: doctor.license_number,
        created_at: doctor.created_at,
        average_rating,
        total_ratings
      },
      recent_ratings,
      work_history
    });

  } catch (error) {
    console.error('Get doctor profile by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update doctor profile (protected route for doctors to edit their profile)
router.put('/profile', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const { 
      name, 
      profile_picture, 
      specialization, 
      qualifications, 
      years_experience, 
      description 
    } = req.body;

    // Validate required fields
    if (!name || !specialization || !qualifications || !years_experience) {
      return res.status(400).json({ 
        error: 'Name, specialization, qualifications, and years of experience are required' 
      });
    }

    // Validate years_experience is a positive integer
    if (!Number.isInteger(years_experience) || years_experience < 0) {
      return res.status(400).json({ 
        error: 'Years of experience must be a positive integer' 
      });
    }

    const updateData = {
      name: name.trim(),
      specialization: specialization.trim(),
      qualifications: qualifications.trim(),
      years_experience: parseInt(years_experience),
      updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (profile_picture) {
      updateData.profile_picture = profile_picture.trim();
    }
    if (description) {
      updateData.description = description.trim();
    }

    const { data: updatedDoctor, error } = await supabaseAdmin
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
      doctor: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        specialization: updatedDoctor.specialization,
        profile_picture: updatedDoctor.profile_picture,
        qualifications: updatedDoctor.qualifications,
        years_experience: updatedDoctor.years_experience,
        description: updatedDoctor.description,
        updated_at: updatedDoctor.updated_at
      }
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Get nearby doctors (public endpoint)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 12 } = req.query;
    
    // For demo purposes, use mock patient location if not provided
    const patientLat = parseFloat(latitude) || 23.7018; // Dhaka center
    const patientLng = parseFloat(longitude) || 90.3742;
    const searchRadius = parseFloat(radius) || 12; // 12 km radius
    
    console.log(`🔍 Searching for doctors near ${patientLat}, ${patientLng} within ${searchRadius}km`);
    
    // Get all doctors (for demo, include all doctors regardless of verification status)
    console.log('🔍 Querying database for doctors...');
    const { data: doctors, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, name, specialization, profile_picture, qualifications, 
        years_experience, description, latitude, longitude, phone, is_verified
      `)
      .eq('role', 'doctor');
    
    console.log('Database query result:', { doctors: doctors?.length || 0, error: error?.message });
    
    if (error) {
      console.error('Error fetching doctors:', error);
      return res.status(400).json({ error: error.message });
    }
    
    console.log(`📊 Found ${doctors.length} doctors in database`);
    if (doctors.length > 0) {
      console.log('Sample doctor:', {
        name: doctors[0].name,
        specialization: doctors[0].specialization,
        is_verified: doctors[0].is_verified
      });
    }
    
    // For demo purposes, show ALL doctors and assign mock locations
    const nearbyDoctors = doctors
      .map((doctor, index) => {
        let doctorLat = doctor.latitude;
        let doctorLng = doctor.longitude;
        
        // Always assign mock location for demo (even if doctor has real location)
        const mockLocations = [
          { lat: 23.7200, lng: 90.3800 }, // 2km away
          { lat: 23.6800, lng: 90.3600 }, // 2.5km away
          { lat: 23.7500, lng: 90.4000 }, // 5km away
          { lat: 23.6500, lng: 90.3500 }, // 6km away
          { lat: 23.7800, lng: 90.4200 }, // 8km away
          { lat: 23.6200, lng: 90.3300 }, // 9km away
          { lat: 23.8000, lng: 90.4500 }, // 11km away
        ];
        const mockLocation = mockLocations[index % mockLocations.length];
        doctorLat = mockLocation.lat;
        doctorLng = mockLocation.lng;
        
        const distance = calculateDistance(
          patientLat, patientLng, 
          doctorLat, doctorLng
        );
        
        return {
          ...doctor,
          latitude: doctorLat,
          longitude: doctorLng,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          is_mock_location: true // Always mock for demo
        };
      })
      .filter(doctor => doctor.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance
    
    console.log(`✅ Found ${nearbyDoctors.length} doctors within ${searchRadius}km`);
    
    // Get ratings for each doctor
    const doctorsWithRatings = await Promise.all(
      nearbyDoctors.map(async (doctor) => {
        try {
          // Get average rating and total ratings
          const { data: ratingStats, error: ratingError } = await supabaseAdmin
            .from('ratings')
            .select('rating')
            .eq('doctor_id', doctor.id);
          
          if (ratingError) {
            console.error(`Error fetching ratings for doctor ${doctor.id}:`, ratingError);
            return {
              ...doctor,
              average_rating: 0,
              total_ratings: 0
            };
          }
          
          const totalRatings = ratingStats.length;
          const averageRating = totalRatings > 0 
            ? ratingStats.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
            : 0;
          
          return {
            ...doctor,
            average_rating: Math.round(averageRating * 10) / 10,
            total_ratings: totalRatings
          };
        } catch (error) {
          console.error(`Error processing ratings for doctor ${doctor.id}:`, error);
          return {
            ...doctor,
            average_rating: 0,
            total_ratings: 0
          };
        }
      })
    );
    
    res.json({
      message: 'Nearby doctors retrieved successfully',
      doctors: doctorsWithRatings,
      search_location: {
        latitude: patientLat,
        longitude: patientLng,
        radius: searchRadius
      },
      total_found: doctorsWithRatings.length
    });
    
  } catch (error) {
    console.error('Get nearby doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

module.exports = router;
