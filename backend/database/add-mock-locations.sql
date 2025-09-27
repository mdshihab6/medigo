-- Add mock location data for doctors
-- This script adds sample location data for demo purposes

-- Update existing doctors with mock locations
UPDATE users 
SET 
  latitude = 23.7018,  -- Dhaka, Bangladesh
  longitude = 90.3742,
  specialization = 'Cardiology',
  profile_picture = 'https://via.placeholder.com/300x300/2563EB/FFFFFF?text=Dr.+Demo',
  qualifications = 'MD from Harvard Medical School, Board Certified in Internal Medicine',
  years_experience = 8,
  description = 'Experienced physician with a passion for patient care and medical innovation.'
WHERE email = 'doctor@demo.com' AND role = 'doctor';

-- Add more sample doctors with different locations for nearby doctors feature
INSERT INTO users (
  id, email, name, phone, role, license_number, is_verified, verified_at, 
  is_available, latitude, longitude, specialization, profile_picture, 
  qualifications, years_experience, description
) VALUES 
(
  uuid_generate_v4(),
  'dr.smith@demo.com',
  'Dr. Sarah Smith',
  '9876543211',
  'doctor',
  'DOC123456',
  true,
  NOW(),
  true,
  23.7200,  -- 2km from center
  90.3800,
  'Pediatrics',
  'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Dr.+Smith',
  'MD from Johns Hopkins, Board Certified in Pediatrics',
  12,
  'Specialized in pediatric care with 12 years of experience.'
),
(
  uuid_generate_v4(),
  'dr.johnson@demo.com',
  'Dr. Michael Johnson',
  '9876543212',
  'doctor',
  'DOC123457',
  true,
  NOW(),
  true,
  23.6800,  -- 2.5km from center
  90.3600,
  'Orthopedics',
  'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=Dr.+Johnson',
  'MD from Stanford, Board Certified in Orthopedic Surgery',
  15,
  'Expert in orthopedic surgery and sports medicine.'
),
(
  uuid_generate_v4(),
  'dr.wilson@demo.com',
  'Dr. Emily Wilson',
  '9876543213',
  'doctor',
  'DOC123458',
  true,
  NOW(),
  true,
  23.7500,  -- 5km from center
  90.4000,
  'Dermatology',
  'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Dr.+Wilson',
  'MD from Mayo Clinic, Board Certified in Dermatology',
  10,
  'Specialized in dermatology and cosmetic procedures.'
),
(
  uuid_generate_v4(),
  'dr.brown@demo.com',
  'Dr. David Brown',
  '9876543214',
  'doctor',
  'DOC123459',
  true,
  NOW(),
  true,
  23.6500,  -- 6km from center
  90.3500,
  'Neurology',
  'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Dr.+Brown',
  'MD from Cleveland Clinic, Board Certified in Neurology',
  18,
  'Expert in neurological disorders and treatment.'
),
(
  uuid_generate_v4(),
  'dr.garcia@demo.com',
  'Dr. Maria Garcia',
  '9876543215',
  'doctor',
  'DOC123460',
  true,
  NOW(),
  true,
  23.7800,  -- 8km from center
  90.4200,
  'Gynecology',
  'https://via.placeholder.com/300x300/EC4899/FFFFFF?text=Dr.+Garcia',
  'MD from UCLA, Board Certified in Obstetrics and Gynecology',
  14,
  'Specialized in women''s health and reproductive medicine.'
),
(
  uuid_generate_v4(),
  'dr.lee@demo.com',
  'Dr. James Lee',
  '9876543216',
  'doctor',
  'DOC123461',
  true,
  NOW(),
  true,
  23.6200,  -- 9km from center
  90.3300,
  'Psychiatry',
  'https://via.placeholder.com/300x300/06B6D4/FFFFFF?text=Dr.+Lee',
  'MD from Yale, Board Certified in Psychiatry',
  16,
  'Expert in mental health and behavioral disorders.'
),
(
  uuid_generate_v4(),
  'dr.taylor@demo.com',
  'Dr. Jennifer Taylor',
  '9876543217',
  'doctor',
  'DOC123462',
  true,
  NOW(),
  true,
  23.8000,  -- 11km from center
  90.4500,
  'Emergency Medicine',
  'https://via.placeholder.com/300x300/84CC16/FFFFFF?text=Dr.+Taylor',
  'MD from Johns Hopkins, Board Certified in Emergency Medicine',
  13,
  'Specialized in emergency and critical care medicine.'
);

-- Add some sample ratings for the new doctors
INSERT INTO ratings (id, doctor_id, patient_id, request_id, rating, feedback, created_at)
SELECT 
  uuid_generate_v4(),
  u.id,
  (SELECT id FROM users WHERE email = 'patient@demo.com' LIMIT 1),
  (SELECT id FROM medical_requests WHERE user_id = (SELECT id FROM users WHERE email = 'patient@demo.com' LIMIT 1) LIMIT 1),
  CASE 
    WHEN u.specialization = 'Pediatrics' THEN 5
    WHEN u.specialization = 'Orthopedics' THEN 4
    WHEN u.specialization = 'Dermatology' THEN 5
    WHEN u.specialization = 'Neurology' THEN 4
    WHEN u.specialization = 'Gynecology' THEN 5
    WHEN u.specialization = 'Psychiatry' THEN 4
    WHEN u.specialization = 'Emergency Medicine' THEN 5
    ELSE 4
  END,
  CASE 
    WHEN u.specialization = 'Pediatrics' THEN 'Excellent pediatric care!'
    WHEN u.specialization = 'Orthopedics' THEN 'Great orthopedic specialist.'
    WHEN u.specialization = 'Dermatology' THEN 'Amazing dermatologist!'
    WHEN u.specialization = 'Neurology' THEN 'Very knowledgeable neurologist.'
    WHEN u.specialization = 'Gynecology' THEN 'Outstanding women''s health care.'
    WHEN u.specialization = 'Psychiatry' THEN 'Excellent mental health support.'
    WHEN u.specialization = 'Emergency Medicine' THEN 'Great emergency care!'
    ELSE 'Good doctor.'
  END,
  NOW() - INTERVAL '30 days' * RANDOM()
FROM users u 
WHERE u.role = 'doctor' 
  AND u.email != 'doctor@demo.com'
  AND u.email LIKE '%@demo.com';
