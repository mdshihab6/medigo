-- Medigo Database Schema
-- This file contains the SQL schema for the Medigo application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'doctor', 'admin')),
    license_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    is_available BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    specialization TEXT,
    profile_picture TEXT,
    qualifications TEXT,
    years_experience INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical requests table
CREATE TABLE medical_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    emergency_type TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    fee DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES medical_requests(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id) -- One rating per request
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_is_available ON users(is_available);
CREATE INDEX idx_medical_requests_user_id ON medical_requests(user_id);
CREATE INDEX idx_medical_requests_doctor_id ON medical_requests(assigned_doctor_id);
CREATE INDEX idx_medical_requests_status ON medical_requests(status);
CREATE INDEX idx_medical_requests_created_at ON medical_requests(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_ratings_doctor_id ON ratings(doctor_id);
CREATE INDEX idx_ratings_patient_id ON ratings(patient_id);
CREATE INDEX idx_ratings_request_id ON ratings(request_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_requests_updated_at BEFORE UPDATE ON medical_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON medical_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" ON medical_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Doctors can view requests assigned to them
CREATE POLICY "Doctors can view assigned requests" ON medical_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'doctor' 
            AND users.id = medical_requests.assigned_doctor_id
        )
    );

-- Doctors can update requests assigned to them
CREATE POLICY "Doctors can update assigned requests" ON medical_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'doctor' 
            AND users.id = medical_requests.assigned_doctor_id
        )
    );

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Ratings policies
-- Patients can create ratings for their completed requests
CREATE POLICY "Patients can create ratings" ON ratings
    FOR INSERT WITH CHECK (
        auth.uid() = patient_id AND
        EXISTS (
            SELECT 1 FROM medical_requests 
            WHERE medical_requests.id = ratings.request_id 
            AND medical_requests.user_id = auth.uid()
            AND medical_requests.status = 'completed'
        )
    );

-- Patients can view their own ratings
CREATE POLICY "Patients can view own ratings" ON ratings
    FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can view ratings for themselves
CREATE POLICY "Doctors can view own ratings" ON ratings
    FOR SELECT USING (auth.uid() = doctor_id);

-- Everyone can view ratings (for public display)
CREATE POLICY "Public can view ratings" ON ratings
    FOR SELECT USING (true);

-- Insert default admin user (you'll need to create this user in Supabase Auth first)
-- INSERT INTO users (id, email, name, role, is_verified) 
-- VALUES ('your-admin-uuid', 'admin@medigo.com', 'Admin User', 'admin', true);

-- Create a function to get nearby doctors
CREATE OR REPLACE FUNCTION get_nearby_doctors(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    license_number TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.license_number,
        u.latitude,
        u.longitude,
        ROUND(
            6371 * acos(
                cos(radians(user_lat)) * 
                cos(radians(u.latitude)) * 
                cos(radians(u.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(u.latitude))
            )::DECIMAL, 2
        ) AS distance_km
    FROM users u
    WHERE u.role = 'doctor' 
    AND u.is_verified = true 
    AND u.is_available = true
    AND u.latitude IS NOT NULL 
    AND u.longitude IS NOT NULL
    AND (
        6371 * acos(
            cos(radians(user_lat)) * 
            cos(radians(u.latitude)) * 
            cos(radians(u.longitude) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(u.latitude))
        )
    ) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get doctor average rating
CREATE OR REPLACE FUNCTION get_doctor_average_rating(doctor_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM ratings
    WHERE doctor_id = doctor_uuid;
    
    RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get doctor rating count
CREATE OR REPLACE FUNCTION get_doctor_rating_count(doctor_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    rating_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rating_count
    FROM ratings
    WHERE doctor_id = doctor_uuid;
    
    RETURN rating_count;
END;
$$ LANGUAGE plpgsql;
