import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Camera,
  Award,
  Clock,
  FileText
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profile_picture: '',
    specialization: '',
    qualifications: '',
    years_experience: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching doctor profile...');
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      const response = await api.get('/api/doctors/profile');
      console.log('✅ Profile fetch successful:', response.data);
      
      if (response.data.doctor) {
        setFormData({
          name: response.data.doctor.name || '',
          profile_picture: response.data.doctor.profile_picture || '',
          specialization: response.data.doctor.specialization || '',
          qualifications: response.data.doctor.qualifications || '',
          years_experience: response.data.doctor.years_experience || '',
          description: response.data.doctor.description || ''
        });
        console.log('📝 Form data set:', {
          name: response.data.doctor.name,
          specialization: response.data.doctor.specialization,
          qualifications: response.data.doctor.qualifications,
          years_experience: response.data.doctor.years_experience
        });
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.qualifications.trim()) {
      newErrors.qualifications = 'Qualifications are required';
    }

    if (!formData.years_experience) {
      newErrors.years_experience = 'Years of experience is required';
    } else if (isNaN(formData.years_experience) || parseInt(formData.years_experience) < 0) {
      newErrors.years_experience = 'Years of experience must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Submitting profile update...');
      console.log('Form data:', formData);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      const response = await api.put('/api/doctors/profile', {
        ...formData,
        years_experience: parseInt(formData.years_experience)
      });

      console.log('✅ Profile update successful:', response.data);
      toast.success('Profile updated successfully!');
      navigate('/doctor-dashboard');
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/doctor-dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600">Update your professional information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-600" />
              Profile Picture
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="profile_picture"
                  name="profile_picture"
                  value={formData.profile_picture}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to your profile picture. You can upload to services like Imgur, Cloudinary, etc.
                </p>
              </div>
              {formData.profile_picture && (
                <div className="flex items-center space-x-4">
                  <img
                    src={formData.profile_picture}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Preview</p>
                    <p>Your profile picture will appear like this</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dr. John Smith"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Cardiology, General Medicine, etc."
                />
                {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications *
                </label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.qualifications ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MD from Harvard Medical School, Board Certified in Internal Medicine, Fellowship in Cardiology..."
                />
                {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  List your degrees, certifications, and professional qualifications
                </p>
              </div>

              <div>
                <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.years_experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5"
                />
                {errors.years_experience && <p className="text-red-500 text-sm mt-1">{errors.years_experience}</p>}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              About You
            </h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Professional Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell patients about your approach to medicine, your philosophy, or any special areas of interest..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Share your approach to patient care and what makes you unique
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/doctor-dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
