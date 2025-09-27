import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Calendar,
  Stethoscope,
  DollarSign,
  MessageCircle,
  Navigation,
  Star
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import LocationTracker from '../components/LocationTracker';
import Chat from '../components/Chat';
import { useSocket } from '../contexts/SocketContext';
import RatingForm from '../components/RatingForm';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';

const RequestStatus = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [patientLocation, setPatientLocation] = useState(null);
  const [doctorLocation, setDoctorLocation] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [ratingData, setRatingData] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (request && request.status === 'completed' && user.role === 'user') {
      checkCanRate();
    }
  }, [request, user]);

  // Listen for real-time status updates for this request
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (data) => {
      if (data.request.id === id) {
        setRequest(data.request);
      }
    };

    const handleAccepted = (data) => {
      if (data.request.id === id) {
        setRequest(data.request);
      }
    };

    socket.on('request-status-updated', handleStatusUpdated);
    socket.on('request-accepted', handleAccepted);

    return () => {
      socket.off('request-status-updated', handleStatusUpdated);
      socket.off('request-accepted', handleAccepted);
    };
  }, [socket, id]);

  useEffect(() => {
    if (request) {
      // Set patient location from request
      if (request.latitude && request.longitude) {
        setPatientLocation({
          lat: request.latitude,
          lng: request.longitude
        });
      }

      // Simulate doctor location (in real app, this would come from doctor's GPS)
      if (request.assigned_doctor && request.status === 'accepted') {
        // Simulate doctor location near patient
        const offsetLat = (Math.random() - 0.5) * 0.01; // Random offset within ~1km
        const offsetLng = (Math.random() - 0.5) * 0.01;
        setDoctorLocation({
          lat: request.latitude + offsetLat,
          lng: request.longitude + offsetLng
        });
      }
    }
  }, [request]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/api/requests/status/${id}`);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const checkCanRate = async () => {
    try {
      const response = await api.get(`/api/ratings/can-rate/${id}`);
      setCanRate(response.data.can_rate);
      setRatingData(response.data.request);
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      setCanRate(false);
    }
  };

  const handleRatingSuccess = (rating) => {
    setCanRate(false);
    toast.success('Thank you for your rating!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="w-8 h-8 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your request is being reviewed by nearby doctors.';
      case 'accepted':
        return 'A doctor has accepted your request and will be in touch soon.';
      case 'in_progress':
        return 'The doctor is currently providing treatment.';
      case 'completed':
        return 'Your medical request has been completed successfully.';
      case 'cancelled':
        return 'Your request has been cancelled.';
      default:
        return 'Request status unknown.';
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

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h1>
          <p className="text-gray-600 mb-6">The requested medical request could not be found.</p>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Request Status</h1>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getStatusIcon(request.status)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{request.emergency_type}</h2>
                  <p className="text-gray-600">{getStatusMessage(request.status)}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border-2 font-medium ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Request Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Submitted: {formatDate(request.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{request.location}</span>
                  </div>
                  {request.urgency_level && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Urgency: {request.urgency_level}</span>
                    </div>
                  )}
                </div>
              </div>

              {request.assigned_doctor && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assigned Doctor</h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Dr. {request.assigned_doctor.name}
                        </p>
                        <p className="text-sm text-green-600">
                          License: {request.assigned_doctor.license_number}
                        </p>
                        {request.assigned_doctor.phone && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-700">
                              {request.assigned_doctor.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'details', label: 'Details', icon: AlertCircle },
                { id: 'location', label: 'Location', icon: Navigation },
                { id: 'chat', label: 'Chat', icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{request.description}</p>
              </div>
            )}

            {activeTab === 'location' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Location</h3>
                {request.assigned_doctor ? (
                  <LocationTracker
                    patientLocation={patientLocation}
                    doctorLocation={doctorLocation}
                    patientName={request.user?.name || 'Patient'}
                    doctorName={request.assigned_doctor.name}
                    showRoute={true}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No doctor assigned yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat with Doctor</h3>
                {request.assigned_doctor ? (
                  <Chat
                    requestId={request.id}
                    patientName={request.user?.name || 'Patient'}
                    doctorName={request.assigned_doctor.name}
                    userRole={user.role}
                  />
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No doctor assigned yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Request Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request Submitted</p>
                  <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                </div>
              </div>

              {request.accepted_at && (
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Request Accepted</p>
                    <p className="text-sm text-gray-600">{formatDate(request.accepted_at)}</p>
                  </div>
                </div>
              )}

              {request.status === 'completed' && (
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Treatment Completed</p>
                    <p className="text-sm text-gray-600">{formatDate(request.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {request.status === 'completed' && request.fee && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Consultation Fee</p>
                      <p className="text-sm text-green-600">Payment completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-800">${request.fee}</p>
                    <p className="text-sm text-green-600">Total amount</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Section */}
        {request.status === 'completed' && user.role === 'user' && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
              {canRate ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Star className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">How was your experience?</p>
                        <p className="text-sm text-blue-600">
                          Help us improve by rating your doctor
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate Doctor</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">Thank you for your feedback!</p>
                      <p className="text-sm text-gray-600">
                        You have already rated this doctor
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/dashboard" className="btn-outline">
            Back to Dashboard
          </Link>
          {request.status === 'pending' && (
            <button className="btn-accent">
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && ratingData && (
        <RatingForm
          requestId={ratingData.id}
          doctorId={ratingData.doctor_id}
          onClose={() => setShowRatingForm(false)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default RequestStatus;
