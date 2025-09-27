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

// Demo doctors data
const demoDoctors = [
  {
    email: 'sarah.johnson@medigo.com',
    name: 'Dr. Sarah Johnson',
    phone: '+880-1711-123001',
    license_number: 'CARD-2024-001',
    specialization: 'Cardiology',
    qualifications: 'MD from Harvard Medical School, Fellowship in Interventional Cardiology, Board Certified',
    years_experience: 8,
    description: 'Experienced cardiologist specializing in heart disease prevention and treatment. Expert in cardiac catheterization and angioplasty procedures.',
    latitude: 23.7200,
    longitude: 90.3800,
    profile_picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'michael.chen@medigo.com',
    name: 'Dr. Michael Chen',
    phone: '+880-1711-123002',
    license_number: 'NEURO-2024-002',
    specialization: 'Neurology',
    qualifications: 'MD in Neurology, PhD in Neuroscience, Board Certified Neurologist',
    years_experience: 12,
    description: 'Specialized in treating neurological disorders including epilepsy, stroke, and movement disorders. Research focus on neurodegenerative diseases.',
    latitude: 23.6800,
    longitude: 90.3600,
    profile_picture: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'emily.rodriguez@medigo.com',
    name: 'Dr. Emily Rodriguez',
    phone: '+880-1711-123003',
    license_number: 'PED-2024-003',
    specialization: 'Pediatrics',
    qualifications: 'MD in Pediatrics, Fellowship in Pediatric Emergency Medicine, Board Certified',
    years_experience: 6,
    description: 'Passionate about children\'s health and development. Specializes in pediatric emergency care and preventive medicine.',
    latitude: 23.7500,
    longitude: 90.4000,
    profile_picture: 'https://images.unsplash.com/photo-1594824388850-889f345a8b5a?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'james.wilson@medigo.com',
    name: 'Dr. James Wilson',
    phone: '+880-1711-123004',
    license_number: 'ORTHO-2024-004',
    specialization: 'Orthopedic Surgery',
    qualifications: 'MD in Orthopedic Surgery, Fellowship in Sports Medicine, Board Certified',
    years_experience: 15,
    description: 'Expert in joint replacement, sports injuries, and trauma surgery. Specializes in minimally invasive procedures.',
    latitude: 23.6500,
    longitude: 90.3500,
    profile_picture: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'lisa.thompson@medigo.com',
    name: 'Dr. Lisa Thompson',
    phone: '+880-1711-123005',
    license_number: 'DERM-2024-005',
    specialization: 'Dermatology',
    qualifications: 'MD in Dermatology, Fellowship in Cosmetic Dermatology, Board Certified',
    years_experience: 10,
    description: 'Specialized in medical and cosmetic dermatology. Expert in skin cancer detection and aesthetic treatments.',
    latitude: 23.7800,
    longitude: 90.4200,
    profile_picture: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'robert.kim@medigo.com',
    name: 'Dr. Robert Kim',
    phone: '+880-1711-123006',
    license_number: 'GASTRO-2024-006',
    specialization: 'Gastroenterology',
    qualifications: 'MD in Internal Medicine, Fellowship in Gastroenterology, Board Certified',
    years_experience: 9,
    description: 'Expert in digestive system disorders, endoscopy procedures, and liver diseases. Specializes in inflammatory bowel disease.',
    latitude: 23.6200,
    longitude: 90.3300,
    profile_picture: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'maria.garcia@medigo.com',
    name: 'Dr. Maria Garcia',
    phone: '+880-1711-123007',
    license_number: 'PSYCH-2024-007',
    specialization: 'Psychiatry',
    qualifications: 'MD in Psychiatry, Fellowship in Child and Adolescent Psychiatry, Board Certified',
    years_experience: 11,
    description: 'Specialized in mental health disorders, psychotherapy, and medication management. Focus on anxiety and mood disorders.',
    latitude: 23.8000,
    longitude: 90.4500,
    profile_picture: 'https://images.unsplash.com/photo-1594824388850-889f345a8b5a?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'david.lee@medigo.com',
    name: 'Dr. David Lee',
    phone: '+880-1711-123008',
    license_number: 'OPHTH-2024-008',
    specialization: 'Ophthalmology',
    qualifications: 'MD in Ophthalmology, Fellowship in Retinal Surgery, Board Certified',
    years_experience: 7,
    description: 'Expert in eye surgery, cataract removal, and retinal disorders. Specializes in diabetic retinopathy treatment.',
    latitude: 23.7000,
    longitude: 90.3700,
    profile_picture: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'jennifer.brown@medigo.com',
    name: 'Dr. Jennifer Brown',
    phone: '+880-1711-123009',
    license_number: 'GYN-2024-009',
    specialization: 'Gynecology',
    qualifications: 'MD in Obstetrics and Gynecology, Fellowship in Reproductive Endocrinology, Board Certified',
    years_experience: 13,
    description: 'Specialized in women\'s health, pregnancy care, and reproductive medicine. Expert in high-risk pregnancies.',
    latitude: 23.7300,
    longitude: 90.3900,
    profile_picture: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'ahmed.hassan@medigo.com',
    name: 'Dr. Ahmed Hassan',
    phone: '+880-1711-123010',
    license_number: 'EM-2024-010',
    specialization: 'Emergency Medicine',
    qualifications: 'MD in Emergency Medicine, Fellowship in Critical Care, Board Certified',
    years_experience: 5,
    description: 'Expert in emergency and critical care medicine. Specializes in trauma care and acute medical emergencies.',
    latitude: 23.7100,
    longitude: 90.3750,
    profile_picture: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  }
];

async function create10DemoDoctors() {
  try {
    console.log('🏥 Creating 10 Demo Doctors...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < demoDoctors.length; i++) {
      const doctor = demoDoctors[i];
      
      try {
        console.log(`Creating ${i + 1}/10: ${doctor.name}...`);

        // Step 1: Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: doctor.email,
          password: 'password123',
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Auth error for ${doctor.email}:`, authError.message);
          errorCount++;
          continue;
        }

        // Step 2: Insert user data into users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            id: authUser.user.id,
            email: doctor.email,
            name: doctor.name,
            phone: doctor.phone,
            role: 'doctor',
            license_number: doctor.license_number,
            is_verified: true,
            verified_at: new Date().toISOString(),
            is_available: i % 3 !== 0, // Mix of available/unavailable
            latitude: doctor.latitude,
            longitude: doctor.longitude,
            specialization: doctor.specialization,
            profile_picture: doctor.profile_picture,
            qualifications: doctor.qualifications,
            years_experience: doctor.years_experience,
            description: doctor.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (userError) {
          console.error(`❌ User data error for ${doctor.email}:`, userError.message);
          errorCount++;
          continue;
        }

        console.log(`✅ ${doctor.name} created successfully`);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Unexpected error for ${doctor.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Demo Doctors Creation Complete!');
    console.log(`✅ Successfully created: ${successCount} doctors`);
    console.log(`❌ Failed to create: ${errorCount} doctors`);
    
    if (successCount > 0) {
      console.log('\n📋 Demo Doctor Accounts Created:');
      demoDoctors.slice(0, successCount).forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.name} (${doctor.specialization})`);
        console.log(`   Email: ${doctor.email} / Password: password123`);
      });
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Go to http://localhost:3000');
      console.log('2. Login as patient@demo.com / password123');
      console.log('3. Click "Nearby Doctors" - should show all created doctors!');
      console.log('4. Click on any doctor to view their profile');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

create10DemoDoctors();