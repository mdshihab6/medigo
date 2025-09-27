import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Building2,
  Clock,
  DollarSign,
  X,
  ExternalLink
} from 'lucide-react';

const DEMO_HOSPITALS = [
  {
    id: 1,
    name: 'Square Hospital',
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka',
    phone: '+880-2-8144400',
    website: 'https://www.squarehospital.com',
    rating: 4.4,
    doctors_schedule: [
      { name: 'Dr. Ahsan Karim', specialization: 'Cardiologist', hours: '10 AM - 2 PM' },
      { name: 'Dr. Nusrat Jahan', specialization: 'Neurologist', hours: '3 PM - 7 PM' }
    ],
    services: [
      { test: 'MRI Scan', price_bdt: 12000 },
      { test: 'Blood Test (Basic)', price_bdt: 1500 },
      { test: 'X-Ray', price_bdt: 800 }
    ]
  },
  {
    id: 2,
    name: 'Evercare Hospital Dhaka',
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka',
    phone: '+880-2-55037242',
    website: 'https://www.evercarebd.com',
    rating: 4.3,
    doctors_schedule: [
      { name: 'Dr. Mahmud Hasan', specialization: 'Orthopedic', hours: '9 AM - 1 PM' },
      { name: 'Dr. Ruma Akter', specialization: 'Pediatrician', hours: '4 PM - 8 PM' }
    ],
    services: [
      { test: 'Ultrasound', price_bdt: 2500 },
      { test: 'Diabetes Test', price_bdt: 1000 },
      { test: 'CT Scan', price_bdt: 10000 }
    ]
  },
  {
    id: 3,
    name: 'United Hospital',
    address: 'Plot 15, Road 71, Gulshan, Dhaka',
    phone: '+880-2-8836000',
    website: 'https://www.uhlbd.com',
    rating: 4.2,
    doctors_schedule: [
      { name: 'Dr. Farhan Rahman', specialization: 'Dermatologist', hours: '11 AM - 3 PM' },
      { name: 'Dr. Tasnia Khan', specialization: 'Gynecologist', hours: '5 PM - 9 PM' }
    ],
    services: [
      { test: 'ECG', price_bdt: 1200 },
      { test: 'Endoscopy', price_bdt: 7000 },
      { test: 'Blood Sugar Test', price_bdt: 600 }
    ]
  },
  {
    id: 4,
    name: 'Islami Bank Central Hospital',
    address: 'Kakrail, Dhaka',
    phone: '+880-2-9355801',
    website: 'http://ibchbd.com',
    rating: 4.0,
    doctors_schedule: [
      { name: 'Dr. Mizanur Rahman', specialization: 'General Surgeon', hours: '10 AM - 1 PM' },
      { name: 'Dr. Laila Sultana', specialization: 'ENT Specialist', hours: '2 PM - 6 PM' }
    ],
    services: [
      { test: 'CBC Test', price_bdt: 800 },
      { test: 'Urine Test', price_bdt: 500 },
      { test: 'Chest X-Ray', price_bdt: 700 }
    ]
  },
  {
    id: 5,
    name: 'BSMMU (PG Hospital)',
    address: 'Shahbagh, Dhaka',
    phone: '+880-2-9661051',
    website: 'http://www.bsmmu.edu.bd',
    rating: 4.1,
    doctors_schedule: [
      { name: 'Dr. Kamal Hossain', specialization: 'Oncologist', hours: '9 AM - 12 PM' },
      { name: 'Dr. Shirin Akhter', specialization: 'Psychiatrist', hours: '1 PM - 5 PM' }
    ],
    services: [
      { test: 'Cancer Screening', price_bdt: 5000 },
      { test: 'Liver Function Test', price_bdt: 1800 },
      { test: 'Kidney Function Test', price_bdt: 2200 }
    ]
  },
  {
    id: 6,
    name: 'Popular Diagnostic Center',
    address: 'House 16, Road 2, Dhanmondi, Dhaka',
    phone: '+880-2-9669480',
    website: 'https://www.populardiagnostic.com',
    rating: 4.2,
    doctors_schedule: [
      { name: 'Dr. Shafiqul Islam', specialization: 'Pathologist', hours: '8 AM - 12 PM' },
      { name: 'Dr. Jahanara Begum', specialization: 'Radiologist', hours: '2 PM - 6 PM' }
    ],
    services: [
      { test: 'Thyroid Test', price_bdt: 1500 },
      { test: 'Ultrasound (Abdomen)', price_bdt: 3500 },
      { test: 'Echo', price_bdt: 4000 }
    ]
  },
  {
    id: 7,
    name: 'Dhaka Medical College Hospital',
    address: 'Secretariat Road, Dhaka',
    phone: '+880-2-55165088',
    website: 'http://dmch.gov.bd',
    rating: 3.9,
    doctors_schedule: [
      { name: 'Dr. Aminul Haque', specialization: 'Emergency Medicine', hours: '24/7' },
      { name: 'Dr. Rubina Yasmin', specialization: 'Anesthesiologist', hours: '10 AM - 3 PM' }
    ],
    services: [
      { test: 'Basic Blood Test', price_bdt: 500 },
      { test: 'CT Scan (Head)', price_bdt: 8000 },
      { test: 'MRI (Spine)', price_bdt: 15000 }
    ]
  }
];

const NearbyHospitals = () => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHospital(null);
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website) => {
    window.open(website, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nearby Hospitals</h1>
              <p className="text-gray-600">Demo list of hospitals with contact info, schedules and services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_HOSPITALS.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{hospital.rating}</span>
                        <span className="text-xs text-gray-500">(Google Maps)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{hospital.address}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{hospital.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button onClick={() => handleViewDetails(hospital)} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedHospital.name}</h2>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{selectedHospital.rating}</span>
                    <span className="text-xs text-gray-500">(Google Maps)</span>
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hospital Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-600">{selectedHospital.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <button onClick={() => handleCall(selectedHospital.phone)} className="text-sm text-blue-600 hover:text-blue-800">
                      {selectedHospital.phone}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <button onClick={() => handleWebsite(selectedHospital.website)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Doctors Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiting Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedHospital.doctors_schedule.map((doctor, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{doctor.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doctor.specialization}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{doctor.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                  Services & Prices
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedHospital.services.map((service, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.test}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">৳{service.price_bdt.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button onClick={() => handleCall(selectedHospital.phone)} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call Hospital</span>
              </button>
              <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyHospitals;


