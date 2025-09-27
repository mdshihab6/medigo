import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  Plus, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Phone,
  Calendar,
  User
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (data) => {
      const updated = data.request;
      setRequests((prev) => {
        const index = prev.findIndex((r) => r.id === updated.id);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    };

    const handleAccepted = (data) => {
      const updated = data.request;
      setRequests((prev) => {
        const index = prev.findIndex((r) => r.id === updated.id);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    };

    socket.on('request-status-updated', handleStatusUpdated);
    socket.on('request-accepted', handleAccepted);

    return () => {
      socket.off('request-status-updated', handleStatusUpdated);
      socket.off('request-accepted', handleAccepted);
    };
  }, [socket]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/users/requests');
      console.log('📋 Fetched requests:', response.data.requests);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
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
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your medical requests and get help when you need it.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/request"
            className="card hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Request Help</h3>
                <p className="text-sm text-gray-600">Submit a new medical request</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Requests</h3>
                <p className="text-sm text-gray-600">
                  {requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length} requests
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Completed</h3>
                <p className="text-sm text-gray-600">
                  {requests.filter(r => r.status === 'completed').length} requests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Medical Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-6">Submit your first medical request to get started.</p>
              <Link
                to="/request"
                className="btn-primary"
              >
                Request Help
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
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
                      
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                        {request.urgency_level && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.urgency_level === 'emergency' ? 'bg-red-100 text-red-800' :
                            request.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.urgency_level}
                          </span>
                        )}
                      </div>

                      {request.assigned_doctor && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Assigned to Dr. {request.assigned_doctor.name}
                              </span>
                            </div>
                            {request.assigned_doctor.id ? (
                              <Link
                                to={`/doctor/${request.assigned_doctor.id}/profile`}
                                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                <User className="w-3 h-3" />
                                <span>View Profile</span>
                              </Link>
                            ) : (
                              <span className="text-xs text-red-600">Doctor ID missing</span>
                            )}
                          </div>
                          {request.assigned_doctor.phone && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Phone className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-700">
                                {request.assigned_doctor.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Link
                        to={`/request/${request.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
