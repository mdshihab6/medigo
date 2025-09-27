import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Clock,
  User,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import api from '../config/api';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, [id]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/doctors/${id}/profile`);
      
      setDoctor(response.data.doctor);
      setRecentRatings(response.data.recent_ratings || []);
      setWorkHistory(response.data.work_history || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError(err.response?.data?.error || 'Failed to load doctor profile');
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">👨‍⚕️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">The doctor profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                {doctor.profile_picture ? (
                  <img
                    src={doctor.profile_picture}
                    alt={doctor.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-blue-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-blue-600" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 mt-4">{doctor.name}</h2>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              </div>

              {/* Rating */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <StarRating rating={doctor.average_rating} size="lg" />
                  <span className="text-2xl font-bold text-gray-900">
                    {doctor.average_rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-600">
                  {doctor.total_ratings} {doctor.total_ratings === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                {doctor.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{doctor.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{doctor.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{doctor.license_number}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{doctor.years_experience} years experience</span>
                </div>
              </div>

              {/* Qualifications */}
              {doctor.qualifications && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {doctor.qualifications}
                  </p>
                </div>
              )}

              {/* Description */}
              {doctor.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {doctor.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Reviews */}
            {recentRatings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {recentRatings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <StarRating rating={rating.rating} size="sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {rating.patient?.name || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>
                      {rating.feedback && (
                        <p className="text-gray-600 text-sm mt-2">{rating.feedback}</p>
                      )}
                      {rating.request && (
                        <p className="text-xs text-gray-500 mt-1">
                          For: {rating.request.emergency_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            {workHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Work History
                </h3>
                <div className="space-y-4">
                  {workHistory.map((request) => (
                    <div key={request.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{request.emergency_type}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(request.completed_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Patient: {request.user?.name || 'Anonymous'}</span>
                        {request.fee && (
                          <span className="font-medium text-green-600">
                            ${request.fee.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Messages */}
            {recentRatings.length === 0 && workHistory.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-600">
                  This doctor hasn't completed any requests or received reviews yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
