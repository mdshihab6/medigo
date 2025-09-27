const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDoctorProfile() {
  try {
    console.log('🧪 Testing Doctor Profile Endpoint...\n');
    
    // First, get a doctor from the database
    const { data: doctors, error: doctorError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .limit(1);
    
    if (doctorError) {
      console.error('❌ Error fetching doctors:', doctorError);
      return;
    }
    
    if (!doctors || doctors.length === 0) {
      console.error('❌ No doctors found in database');
      return;
    }
    
    const doctor = doctors[0];
    console.log('✅ Found doctor:', doctor.name, 'Verified:', doctor.is_verified);
    
    // Create a JWT token for this doctor
    const token = jwt.sign(
      {
        id: doctor.id,
        email: doctor.email,
        role: doctor.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Generated JWT token');
    
    // Test the profile endpoint
    const axios = require('axios');
    const response = await axios.get('http://localhost:5000/api/doctors/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing doctor profile:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDoctorProfile();
