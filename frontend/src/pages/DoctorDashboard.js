import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Stethoscope,
  MessageCircle,
  Navigation,
  Eye,
  Star,
  TrendingUp,
  Edit
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LocationTracker from '../components/LocationTracker';
import Chat from '../components/Chat';
import StarRating from '../components/StarRating';
import api from '../config/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [patientLocation, setPatientLocation] = useState(null);
  const [doctorLocation, setDoctorLocation] = useState(null);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [requestToAccept, setRequestToAccept] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Add a function to refresh verification status
  const refreshVerificationStatus = async () => {
    try {
      const profileRes = await api.get('/api/doctors/profile');
      const profileData = profileRes.data;
      
      if (profileData.is_verified && !isVerified) {
        // Doctor was just verified, refresh all data
        setIsVerified(true);
        toast.success('Your account has been verified! Welcome to the dashboard.');
        fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  // Check verification status every 30 seconds if not verified
  useEffect(() => {
    if (!isVerified) {
      const interval = setInterval(refreshVerificationStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isVerified]);

  const fetchData = async () => {
    try {
      console.log('Fetching doctor profile...');
      console.log('API Base URL:', api.defaults.baseURL);
      
      // First, get the doctor profile to check verification status
      const profileRes = await api.get('/api/doctors/profile');
      
      console.log('Profile response:', profileRes.data);
      const profileData = profileRes.data;
      
      setDoctorProfile(profileData.doctor);
      setRecentRatings(profileData.recent_ratings || []);
      
      // Set availability status from profile
      if (profileData.doctor) {
        setIsAvailable(profileData.doctor.is_available || false);
      }
      
      // Check if doctor is verified
      if (!profileData.is_verified) {
        console.log('Doctor not verified, showing pending status');
        setIsVerified(false);
        setRequests([]);
        setAcceptedRequests([]);
        return; // Don't fetch other data if not verified
      }
      
      console.log('Doctor verified, fetching dashboard data...');
      // If verified, fetch dashboard data
      setIsVerified(true);
      const [requestsRes, acceptedRes] = await Promise.all([
        api.get('/api/doctors/requests'),
        api.get('/api/doctors/accepted-requests')
      ]);
      
      setRequests(requestsRes.data.requests);
      setAcceptedRequests(acceptedRes.data.requests);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
      console.error('Request URL:', error.config?.url);
      console.error('Request baseURL:', error.config?.baseURL);
      
      const errorMessage = error.response?.data?.error || 'Failed to load dashboard data';
      
      // Check if it's a verification error
      if (error.response?.status === 403 && errorMessage.includes('not verified')) {
        setIsVerified(false);
        // Don't show error toast for unverified accounts
      } else if (error.response?.status === 404) {
        toast.error('Doctor profile not found. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (requestId) => {
    setRequestToAccept(requestId);
    setShowAcceptConfirmation(true);
  };

  const confirmAcceptRequest = async () => {
    try {
      const response = await api.post(`/api/doctors/accept/${requestToAccept}`);
      toast.success('Request accepted successfully!');
      fetchData(); // Refresh data
      setShowAcceptConfirmation(false);
      setRequestToAccept(null);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const cancelAcceptRequest = () => {
    setShowAcceptConfirmation(false);
    setRequestToAccept(null);
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.put(`/api/doctors/requests/${requestId}/status`, { status });
      toast.success('Request status updated!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  const handleToggleAvailability = async () => {
    setUpdatingAvailability(true);
    try {
      await api.put('/api/doctors/availability', { 
        is_available: !isAvailable 
      });
      setIsAvailable(!isAvailable);
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update availability';
      toast.error(errorMessage);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
    
    // Set patient location from request
    if (request.latitude && request.longitude) {
      setPatientLocation({
        lat: request.latitude,
        lng: request.longitude
      });
    }

    // Simulate doctor location (in real app, this would come from doctor's GPS)
    if (request.status === 'accepted' || request.status === 'in_progress') {
      // Simulate doctor location near patient
      const offsetLat = (Math.random() - 0.5) * 0.01; // Random offset within ~1km
      const offsetLng = (Math.random() - 0.5) * 0.01;
      setDoctorLocation({
        lat: request.latitude + offsetLat,
        lng: request.longitude + offsetLng
      });
    }
  };

  const handleCloseRequestDetails = () => {
    setShowRequestDetails(false);
    setSelectedRequest(null);
    setPatientLocation(null);
    setDoctorLocation(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, Dr. {user?.name}!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/edit-profile')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                <button
                  onClick={handleToggleAvailability}
                  disabled={updatingAvailability || !isVerified}
                  className={`flex items-center space-x-2 ${
                    !isVerified ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAvailable ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isAvailable ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        {!isVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account Verification Pending
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your account is not verified yet. Please wait for admin approval before you can accept medical requests.
                  </p>
                </div>
              </div>
              <button
                onClick={refreshVerificationStatus}
                className="btn-outline text-sm"
              >
                Check Status
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">In Progress</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {acceptedRequests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Completed</h3>
                <p className="text-2xl font-bold text-green-600">
                  {acceptedRequests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Accepted</h3>
                <p className="text-2xl font-bold text-primary-600">
                  {acceptedRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Overview */}
        {doctorProfile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Average Rating Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Rating</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {doctorProfile.average_rating || 0}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="flex-1">
                  <StarRating 
                    rating={doctorProfile.average_rating || 0} 
                    size="lg" 
                    showNumber={false}
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Based on {doctorProfile.total_ratings || 0} reviews
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              {recentRatings.length > 0 ? (
                <div className="space-y-3">
                  {recentRatings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <StarRating rating={rating.rating} size="sm" />
                          <span className="text-sm text-gray-600">
                            {rating.patient?.name || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.feedback && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {rating.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500">Complete some treatments to receive ratings</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Available Requests</h2>
              <p className="text-sm text-gray-600">Click to accept nearby medical requests</p>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests available</h3>
                <p className="text-gray-600">New requests will appear here when available.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.emergency_type}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>

                        {request.user && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                Patient: {request.user.name}
                              </span>
                            </div>
                            {request.user.phone && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Phone className="w-3 h-3 text-blue-600" />
                                <span className="text-xs text-blue-700">
                                  {request.user.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={!isVerified}
                          className={`text-sm ${
                            isVerified 
                              ? 'btn-primary' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isVerified ? 'Accept Request' : 'Verification Required'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accepted Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Accepted Requests</h2>
              <p className="text-sm text-gray-600">Manage your current and completed requests</p>
            </div>

            {acceptedRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted requests</h3>
                <p className="text-gray-600">Accepted requests will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {acceptedRequests.map((request) => (
                  <div key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.emergency_type}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>

                        {request.user && (
                          <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Patient: {request.user.name}
                              </span>
                            </div>
                            {request.user.phone && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Phone className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-700">
                                  {request.user.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRequestDetails(request)}
                            className="btn-secondary text-sm flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          
                          {request.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                              className="btn-primary text-sm"
                            >
                              Start Treatment
                            </button>
                          )}

                          {request.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'completed')}
                              className="btn-primary text-sm"
                            >
                              Complete Treatment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Details Modal */}
        {showRequestDetails && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Request Details - {selectedRequest.emergency_type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Patient: {selectedRequest.user?.name || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={handleCloseRequestDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Request Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Request Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Emergency Type:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.emergency_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="mt-1 text-gray-900">{selectedRequest.description}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.location}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                            {selectedRequest.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-900">{formatDate(selectedRequest.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    {selectedRequest.user && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">{selectedRequest.user.name}</span>
                          </div>
                          {selectedRequest.user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-blue-600" />
                              <span className="text-sm text-blue-700">{selectedRequest.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location and Chat */}
                  <div className="space-y-4">
                    {/* Location Tracking */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Real-time Location</h4>
                      {patientLocation ? (
                        <LocationTracker
                          patientLocation={patientLocation}
                          doctorLocation={doctorLocation}
                          patientName={selectedRequest.user?.name || 'Patient'}
                          doctorName={user?.name || 'Doctor'}
                          showRoute={true}
                        />
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Location not available</p>
                        </div>
                      )}
                    </div>

                    {/* Chat */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Chat with Patient</h4>
                      <Chat
                        requestId={selectedRequest.id}
                        patientName={selectedRequest.user?.name || 'Patient'}
                        doctorName={user?.name || 'Doctor'}
                        userRole={user.role}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accept Request Confirmation Dialog */}
        {showAcceptConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Accept Medical Request
                    </h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to accept this medical request? Once accepted, you will be responsible for providing medical assistance to the patient.
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You can only accept one request at a time. Make sure you're available to provide immediate assistance.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelAcceptRequest}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAcceptRequest}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
