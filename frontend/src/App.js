import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestForm from './pages/RequestForm';
import RequestStatus from './pages/RequestStatus';
import DoctorProfile from './pages/DoctorProfile';
import EditProfile from './pages/EditProfile';
import NearbyDoctors from './pages/NearbyDoctors';
import NearbyHospitals from './pages/NearbyHospitals';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/doctor-dashboard" element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/request" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <RequestForm />
                  </ProtectedRoute>
                } />
                <Route path="/request/:id" element={
                  <ProtectedRoute>
                    <RequestStatus />
                  </ProtectedRoute>
                } />
                <Route path="/doctor/:id/profile" element={<DoctorProfile />} />
                <Route path="/edit-profile" element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <EditProfile />
                  </ProtectedRoute>
                } />
                <Route path="/nearby-doctors" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <NearbyDoctors />
                  </ProtectedRoute>
                } />
                <Route path="/nearby-hospitals" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <NearbyHospitals />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
