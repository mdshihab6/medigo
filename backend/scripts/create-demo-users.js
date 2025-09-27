const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoUsers() {
  try {
    console.log('Creating demo users...');

    // Create demo patient
    const { data: patientAuth, error: patientAuthError } = await supabase.auth.admin.createUser({
      email: 'patient@demo.com',
      password: 'password123',
      email_confirm: true
    });

    if (patientAuthError) {
      console.error('Error creating patient auth:', patientAuthError);
      return;
    }

    const { data: patient, error: patientError } = await supabase
      .from('users')
      .insert([{
        id: patientAuth.user.id,
        email: 'patient@demo.com',
        name: 'Demo Patient',
        phone: '1234567890',
        role: 'user',
        is_verified: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (patientError) {
      console.error('Error creating patient:', patientError);
    } else {
      console.log('✅ Demo patient created:', patient.email);
    }

    // Create demo doctor
    const { data: doctorAuth, error: doctorAuthError } = await supabase.auth.admin.createUser({
      email: 'doctor@demo.com',
      password: 'password123',
      email_confirm: true
    });

    if (doctorAuthError) {
      console.error('Error creating doctor auth:', doctorAuthError);
      return;
    }

    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .insert([{
        id: doctorAuth.user.id,
        email: 'doctor@demo.com',
        name: 'Dr. Demo Doctor',
        phone: '9876543210',
        role: 'doctor',
        license_number: 'DEMO123456',
        is_verified: true,
        is_available: true,
        specialization: 'general',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (doctorError) {
      console.error('Error creating doctor:', doctorError);
    } else {
      console.log('✅ Demo doctor created:', doctor.email);
    }

    // Create demo admin
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@demo.com',
      password: 'password123',
      email_confirm: true
    });

    if (adminAuthError) {
      console.error('Error creating admin auth:', adminAuthError);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([{
        id: adminAuth.user.id,
        email: 'admin@demo.com',
        name: 'Demo Admin',
        phone: '5555555555',
        role: 'admin',
        is_verified: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin:', adminError);
    } else {
      console.log('✅ Demo admin created:', admin.email);
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nDemo Accounts:');
    console.log('Patient: patient@demo.com / password123');
    console.log('Doctor: doctor@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');

  } catch (error) {
    console.error('Error creating demo users:', error);
  }
}

createDemoUsers();
