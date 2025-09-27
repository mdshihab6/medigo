import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Clock, Phone, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RequestForm = () => {
  const [formData, setFormData] = useState({
    emergency_type: '',
    description: '',
    urgency_level: 'medium',
    location: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const navigate = useNavigate();

  const emergencyTypes = [
    'General Consultation',
    'Chest Pain',
    'Breathing Difficulty',
    'High Fever',
    'Severe Headache',
    'Abdominal Pain',
    'Allergic Reaction',
    'Injury/Trauma',
    'Mental Health Crisis',
    'Other'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-600', bg: 'bg-red-100' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setMapCenter([latitude, longitude]);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          toast.success('Location detected successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. Please select on map.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access or select on map.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please select on map.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please select on map.';
              break;
            default:
              errorMessage = 'Location detection failed. Please select on map.';
              break;
          }
          
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select your location on the map');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/users/request', formData);
      toast.success('Medical request submitted successfully!');
      navigate(`/request/${response.data.request.id}`);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      }
    });
    return null;
  };

  const MapComponent = () => {
    const map = useMap();
    
    useEffect(() => {
      if (formData.latitude && formData.longitude) {
        map.setView([formData.latitude, formData.longitude], 15);
      }
    }, [formData.latitude, formData.longitude, map]);
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request Medical Help</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to request medical assistance.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 text-accent-600 mr-2" />
              Emergency Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergency_type" className="label">
                  Type of Emergency
                </label>
                <select
                  id="emergency_type"
                  name="emergency_type"
                  required
                  value={formData.emergency_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select emergency type</option>
                  {emergencyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="urgency_level" className="label">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {urgencyLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`relative cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                        formData.urgency_level === level.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency_level"
                        value={level.value}
                        checked={formData.urgency_level === level.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className={`text-sm font-medium ${level.color}`}>
                          {level.label}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Describe your symptoms, medical condition, or emergency situation..."
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-primary-600 mr-2" />
              Location
            </h2>

            <div className="mb-4">
              <label htmlFor="location" className="label">
                Address or Location Description
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your current address or location"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Click on the map to set your exact location:
              </p>
              <div className="h-96 rounded-lg overflow-hidden border">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapEvents />
                  <MapComponent />
                  {formData.latitude && formData.longitude && (
                    <Marker position={[formData.latitude, formData.longitude]} />
                  )}
                </MapContainer>
              </div>
            </div>

            {currentLocation && (
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn-outline text-sm"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Your request will be sent to nearby doctors in real-time</li>
                  <li>• The first available doctor will accept your request</li>
                  <li>• You'll receive notifications about your request status</li>
                  <li>• For life-threatening emergencies, call emergency services immediately</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
