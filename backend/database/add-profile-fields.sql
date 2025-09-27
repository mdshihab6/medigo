-- Add new doctor profile fields to existing users table
-- Run this in your Supabase SQL Editor

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS qualifications TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing demo doctor with sample data
UPDATE users 
SET 
  profile_picture = 'https://via.placeholder.com/300x300/2563EB/FFFFFF?text=Dr.+Demo',
  qualifications = 'MD from Harvard Medical School, Board Certified in Internal Medicine, Fellowship in Cardiology',
  years_experience = 8,
  description = 'Experienced physician with a passion for patient care and medical innovation. Specializing in general medicine with a focus on preventive care and chronic disease management.'
WHERE email = 'doctor@demo.com' AND role = 'doctor';

-- Verify the changes
SELECT id, name, email, specialization, profile_picture, qualifications, years_experience, description 
FROM users 
WHERE role = 'doctor' 
LIMIT 5;
