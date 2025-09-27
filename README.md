# Medigo - Doctor on Demand

A prototype web application for a "Doctor on Demand" system, similar to Uber but for medical help. Built for a Skills & Innovation Competition.

## 🎯 Project Overview

Medigo connects patients with verified doctors in real-time, allowing users to request medical help and doctors to accept nearby requests instantly.

### Key Features

- **Real-time Request Matching**: Patients submit requests, doctors receive notifications instantly
- **Location-based Services**: Uses GPS and OpenStreetMap for location services
- **Role-based Access**: Separate dashboards for patients, doctors, and admins
- **Real-time Notifications**: Socket.IO integration for instant updates
- **Payment System**: Mock fee calculation based on urgency and doctor specialization

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Leaflet.js** - Open-source mapping library
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Database & Services
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication service
- **OpenStreetMap** - Free mapping tiles

## 🎨 Design System

### Color Palette
- **Primary**: #2563EB (Blue 600) - Trust, professionalism
- **Secondary**: #10B981 (Green 500) - Health, safety
- **Accent**: #EF4444 (Red 500) - Urgency, emergency
- **Background**: #F9FAFB (Gray 50) - Soft light background
- **Text**: #111827 (Gray 900) - High readability

## 📂 Project Structure

```
medigo/
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, Socket)
│   │   ├── pages/          # Page components
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── config/             # Configuration files
│   ├── database/           # Database schema
│   ├── package.json
│   └── server.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medigo
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Run the SQL schema from `backend/database/schema.sql` in your Supabase SQL editor

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `POST /api/users/request` - Submit medical request
- `GET /api/users/requests` - Get user's requests
- `GET /api/users/requests/:id` - Get specific request
- `PUT /api/users/profile` - Update user profile

### Doctors
- `GET /api/doctors/requests` - Get nearby requests
- `POST /api/doctors/accept/:id` - Accept request
- `GET /api/doctors/accepted-requests` - Get accepted requests
- `PUT /api/doctors/requests/:id/status` - Update request status
- `PUT /api/doctors/availability` - Update availability

### Requests
- `GET /api/requests/status/:id` - Get request status
- `POST /api/requests/:id/calculate-fee` - Calculate fee

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/requests` - Get all requests
- `GET /api/admin/dashboard` - Get dashboard stats
- `PUT /api/admin/doctors/:id/approve` - Approve doctor
- `PUT /api/admin/doctors/:id/reject` - Reject doctor

## 👥 User Roles

### Patient (User)
- Register and login
- Submit medical requests with location
- View request status and assigned doctor
- Receive real-time notifications

### Doctor
- Register with license number (requires admin approval)
- Set availability status
- Receive real-time request notifications
- Accept and manage requests
- Update request status

### Admin
- Approve/reject doctor registrations
- View all users, doctors, and requests
- Monitor platform statistics
- Manage system settings

## 🔄 Request Flow

1. **Patient submits request** with location and symptoms
2. **System notifies nearby doctors** in real-time
3. **First doctor to accept** gets assigned
4. **Status updates** are sent to both parties
5. **Fee calculation** occurs upon completion

## 🗺️ Location Services

- **Browser GPS** for automatic location detection
- **OpenStreetMap** for map display and interaction
- **Leaflet.js** for interactive mapping
- **Distance calculation** for nearby doctor matching

## 💰 Payment System (Demo)

- **Base fee**: $50 consultation
- **Urgency multiplier**: 1.0x to 2.0x based on urgency level
- **Specialization multiplier**: 1.0x to 1.5x based on doctor specialization
- **Dynamic calculation** based on request parameters

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**Backend (.env)**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🧪 Demo Accounts

For testing purposes, you can create these demo accounts:

- **Patient**: patient@demo.com / password123
- **Doctor**: doctor@demo.com / password123  
- **Admin**: admin@demo.com / password123

## 🔒 Security Features

- **JWT Authentication** for secure API access
- **Role-based Access Control** (RBAC)
- **Row Level Security** (RLS) in Supabase
- **Password hashing** with bcrypt
- **CORS protection** for API endpoints

## 📱 Real-time Features

- **Socket.IO** for instant notifications
- **Room-based messaging** for targeted updates
- **Automatic reconnection** on connection loss
- **Status updates** for all parties involved

## 🎨 UI/UX Features

- **Responsive design** for all screen sizes
- **Dark/light theme** support
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Interactive maps** with location selection
- **Modern card-based layout**

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend CORS is configured for frontend URL
2. **Socket connection fails**: Check if backend is running and accessible
3. **Map not loading**: Verify Leaflet CSS is included in index.html
4. **Authentication errors**: Check JWT secret and token expiration

### Development Tips

- Use browser dev tools to monitor network requests
- Check console for JavaScript errors
- Verify environment variables are set correctly
- Test with different user roles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Medigo** - Healthcare made accessible, convenient, and reliable.
