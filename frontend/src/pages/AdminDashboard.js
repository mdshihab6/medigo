import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorRatings, setDoctorRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, doctorsRes, requestsRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/doctors'),
        axios.get('/api/admin/requests')
      ]);
      
      setStats(statsRes.data.statistics);
      setDoctors(doctorsRes.data.doctors);
      setRequests(requestsRes.data.requests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorRatings = async () => {
    setLoadingRatings(true);
    try {
      const ratingsWithAverages = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const response = await axios.get(`/api/ratings/doctors/${doctor.id}/average`);
            return {
              ...doctor,
              average_rating: response.data.average_rating,
              total_ratings: response.data.total_ratings,
              distribution: response.data.distribution
            };
          } catch (error) {
            return {
              ...doctor,
              average_rating: 0,
              total_ratings: 0,
              distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
          }
        })
      );
      setDoctorRatings(ratingsWithAverages);
    } catch (error) {
      console.error('Error fetching doctor ratings:', error);
      toast.error('Failed to load doctor ratings');
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      await axios.put(`/api/admin/doctors/${doctorId}/approve`);
      toast.success('Doctor approved successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Failed to approve doctor');
    }
  };

  const handleRejectDoctor = async (doctorId, reason) => {
    try {
      await axios.put(`/api/admin/doctors/${doctorId}/reject`, { reason });
      toast.success('Doctor rejected successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Failed to reject doctor');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage the Medigo platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Users</h3>
                <p className="text-2xl font-bold text-primary-600">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Doctors</h3>
                <p className="text-2xl font-bold text-secondary-600">{stats?.totalDoctors || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Requests</h3>
                <p className="text-2xl font-bold text-accent-600">{stats?.totalRequests || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingRequests || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats?.completedRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Shield },
                { id: 'doctors', label: 'Doctors', icon: Stethoscope },
                { id: 'requests', label: 'Requests', icon: FileText },
                { id: 'ratings', label: 'Ratings', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {stats?.recentRequests?.slice(0, 5).map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{request.emergency_type}</p>
                        <p className="text-sm text-gray-600">{request.user?.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Doctor Approvals */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Pending Doctor Approvals</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {doctors.filter(d => !d.is_verified).slice(0, 5).map((doctor) => (
                  <div key={doctor.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-600">License: {doctor.license_number}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveDoctor(doctor.id)}
                          className="btn-secondary text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDoctor(doctor.id, 'License verification failed')}
                          className="btn-accent text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Doctors</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.license_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctor.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doctor.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!doctor.is_verified && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveDoctor(doctor.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectDoctor(doctor.id, 'License verification failed')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.emergency_type}</div>
                          <div className="text-sm text-gray-500">{request.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.user?.name}</div>
                        <div className="text-sm text-gray-500">{request.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.assigned_doctor ? (
                          <div>
                            <div className="text-sm text-gray-900">{request.assigned_doctor.name}</div>
                            <div className="text-sm text-gray-500">{request.assigned_doctor.license_number}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Doctor Ratings</h2>
              <button
                onClick={fetchDoctorRatings}
                disabled={loadingRatings}
                className="btn-primary flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{loadingRatings ? 'Loading...' : 'Refresh Ratings'}</span>
              </button>
            </div>

            {/* Ratings Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Average Rating</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {doctorRatings.length > 0 
                        ? (doctorRatings.reduce((sum, doctor) => sum + (doctor.average_rating || 0), 0) / doctorRatings.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Total Reviews</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {doctorRatings.reduce((sum, doctor) => sum + (doctor.total_ratings || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rated Doctors</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {doctorRatings.filter(doctor => (doctor.total_ratings || 0) > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Ratings Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Doctor Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviews
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distribution
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctorRatings
                      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
                      .map((doctor) => (
                      <tr key={doctor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                            <div className="text-sm text-gray-500">License: {doctor.license_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StarRating 
                              rating={doctor.average_rating || 0} 
                              size="sm" 
                              showNumber={true}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.total_ratings || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex flex-col items-center">
                                <span className="text-xs text-gray-500">{star}</span>
                                <div className="w-8 h-2 bg-gray-200 rounded">
                                  <div 
                                    className="h-2 bg-yellow-400 rounded"
                                    style={{ 
                                      width: `${((doctor.distribution?.[star] || 0) / Math.max(doctor.total_ratings || 1, 1)) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {doctor.distribution?.[star] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doctor.is_verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doctor.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
