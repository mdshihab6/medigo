import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const patientIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ef4444" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const doctorIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#10b981" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapUpdater = ({ patientLocation, doctorLocation, mapCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (patientLocation && doctorLocation) {
      const bounds = L.latLngBounds([patientLocation, doctorLocation]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (mapCenter) {
      map.setView(mapCenter, 15);
    }
  }, [patientLocation, doctorLocation, mapCenter, map]);

  return null;
};

const LocationTracker = ({ 
  patientLocation, 
  doctorLocation, 
  patientName = "Patient", 
  doctorName = "Doctor",
  showRoute = false 
}) => {
  const [mapCenter, setMapCenter] = useState([23.7018, 90.3742]); // Default to Dhaka

  useEffect(() => {
    if (patientLocation) {
      setMapCenter([patientLocation.lat, patientLocation.lng]);
    }
  }, [patientLocation]);

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const calculateETA = (distance) => {
    if (!distance) return null;
    // Assuming average speed of 30 km/h in city traffic
    const averageSpeed = 30;
    const timeInHours = distance / averageSpeed;
    const minutes = Math.round(timeInHours * 60);
    return minutes;
  };

  const distance = calculateDistance(patientLocation, doctorLocation);
  const eta = calculateETA(distance);

  return (
    <div className="space-y-4">
      {/* Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patientLocation && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-red-800">{patientName} Location</span>
            </div>
            <p className="text-sm text-red-700">
              Lat: {patientLocation.lat.toFixed(6)}, Lng: {patientLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {doctorLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">{doctorName} Location</span>
            </div>
            <p className="text-sm text-green-700">
              Lat: {doctorLocation.lat.toFixed(6)}, Lng: {doctorLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Distance and ETA */}
      {distance && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">Distance</p>
              <p className="text-2xl font-bold text-blue-600">{distance.toFixed(2)} km</p>
            </div>
            {eta && (
              <div>
                <p className="font-medium text-blue-800">Estimated Time</p>
                <p className="text-2xl font-bold text-blue-600">{eta} min</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
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
          <MapUpdater 
            patientLocation={patientLocation} 
            doctorLocation={doctorLocation} 
            mapCenter={mapCenter}
          />
          
          {patientLocation && (
            <Marker 
              position={[patientLocation.lat, patientLocation.lng]} 
              icon={patientIcon}
            />
          )}
          
          {doctorLocation && (
            <Marker 
              position={[doctorLocation.lat, doctorLocation.lng]} 
              icon={doctorIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationTracker;
