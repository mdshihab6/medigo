#!/bin/bash

# Medigo Setup Script
# This script sets up the Medigo application for development

echo "🚀 Setting up Medigo - Doctor on Demand Application"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Setup Backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -f package.json ]; then
    echo "❌ Backend package.json not found. Please check the project structure."
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Create .env file for backend if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Backend .env file created"
    echo "⚠️  Please update the .env file with your Supabase credentials"
else
    echo "✅ Backend .env file already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f package.json ]; then
    echo "❌ Frontend package.json not found. Please check the project structure."
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Create .env file for frontend if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your Supabase project:"
echo "   - Go to https://supabase.com and create a new project"
echo "   - Run the SQL schema from backend/database/schema.sql"
echo "   - Get your project URL and API keys from Settings > API"
echo ""
echo "2. Update environment variables:"
echo "   - Edit backend/.env with your Supabase credentials"
echo "   - Edit frontend/.env if needed"
echo ""
echo "3. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm start"
echo ""
echo "4. Open your browser and go to http://localhost:3000"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "🔗 Useful links:"
echo "   - Supabase Dashboard: https://app.supabase.com"
echo "   - Supabase Docs: https://supabase.com/docs"
echo "   - React Docs: https://reactjs.org/docs"
echo "   - Tailwind CSS: https://tailwindcss.com/docs"
echo ""
echo "Happy coding! 🚀"
