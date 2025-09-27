import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Award,
  Clock,
  User,
  Navigation,
  Search,
  Filter
} from 'lucide-react';
import api from '../config/api';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const NearbyDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(12);
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, name

  useEffect(() => {
    fetchNearbyDoctors();
  }, [searchRadius]);

  const fetchNearbyDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, use mock patient location
      const mockLat = 23.7018; // Dhaka center
      const mockLng = 90.3742;
      
      console.log('🔍 Fetching nearby doctors...');
      const response = await api.get('/api/doctors/nearby', {
        params: {
          latitude: mockLat,
          longitude: mockLng,
          radius: searchRadius
        }
      });
      
      console.log('✅ Nearby doctors fetched:', response.data);
      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error('Error fetching nearby doctors:', err);
      setError('Failed to load nearby doctors. Please try again later.');
      toast.error('Failed to load nearby doctors.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    
    const sortedDoctors = [...doctors].sort((a, b) => {
      switch (newSortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    setDoctors(sortedDoctors);
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Finding nearby doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Doctors</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNearbyDoctors}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Nearby Doctors</h1>
              <p className="text-gray-600 mt-2">
                Find doctors within {searchRadius}km of your location
                <span className="text-blue-600 text-sm ml-2">(Demo: showing all verified doctors)</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Radius Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Radius:</label>
                <select
                  value={searchRadius}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={12}>12 km</option>
                  <option value={15}>15 km</option>
                  <option value={20}>20 km</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Found {doctors.length} doctors within {searchRadius}km
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Mock location: Dhaka, Bangladesh
                  </span>
                </div>
              </div>
              
              {doctors.length > 0 && (
                <button
                  onClick={fetchNearbyDoctors}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Refresh Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600 mb-4">
              No doctors found within {searchRadius}km of your location.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Demo Note:</strong> If you're seeing this message, it means there are no doctors registered in the database yet. 
                To test the Nearby Doctors feature, you can either:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 text-left max-w-md mx-auto">
                <li>• Register new doctors through the app</li>
                <li>• Run the SQL script in Supabase to add sample doctors</li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleRadiusChange(20)}
                className="btn-secondary"
              >
                Search 20km Radius
              </button>
              <button
                onClick={fetchNearbyDoctors}
                className="btn-primary"
              >
                Refresh Search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Doctor Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={doctor.profile_picture || 'https://via.placeholder.com/80x80?text=Dr.'}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {doctor.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({doctor.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distance and Experience */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Navigation className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {doctor.distance}km away
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {doctor.years_experience} years exp
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Qualifications */}
                  {doctor.qualifications && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {doctor.qualifications}
                      </p>
                    </div>
                  )}
                  
                  {/* Description */}
                  {doctor.description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {doctor.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/doctor/${doctor.id}/profile`}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </Link>
                    
                    {doctor.phone && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Demo Mode</span>
            </div>
            <p className="text-sm text-blue-700">
              Showing all verified doctors from the database. Location data is mocked for demo purposes. 
              In production, this would use real GPS coordinates and location-based filtering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyDoctors;
