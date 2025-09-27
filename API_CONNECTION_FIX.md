# API Connection Fix - Doctor Dashboard

## 🎯 **Problem Identified**
The frontend was making requests to `localhost:3000` (React dev server) instead of `localhost:5000` (backend server), causing 404 errors.

## ✅ **Fixes Applied**

### 1. **Created API Configuration**
- **New file**: `/frontend/src/config/api.js`
- **Centralized axios instance** with proper base URL
- **Automatic token injection** in all requests
- **Error handling** for expired tokens

### 2. **Updated Doctor Dashboard**
- **Replaced all axios calls** with the new `api` instance
- **Added debugging logs** to track API calls
- **Enhanced error handling** with detailed logging

### 3. **Key Changes Made**

#### New API Configuration (`/frontend/src/config/api.js`):
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Updated Doctor Dashboard:
```javascript
// Before (causing 404)
const profileRes = await axios.get('/api/doctors/profile');

// After (working)
const profileRes = await api.get('/api/doctors/profile');
```

## 🧪 **How to Test the Fix**

### Step 1: Test Backend Connection
```bash
# Run the test script
node test-backend.js
```

### Step 2: Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 3: Test Doctor Login
1. **Login as doctor**: `doctor@demo.com` / `password123`
2. **Check browser console** for logs:
   ```
   Fetching doctor profile...
   API Base URL: http://localhost:5000
   Profile response: { doctor: {...}, is_verified: true/false }
   ```

### Step 4: Verify Network Requests
1. **Open browser dev tools**
2. **Go to Network tab**
3. **Look for requests to `localhost:5000`** (not 3000)
4. **Check Authorization header** is present

## 🔍 **Debugging Steps**

### If Still Getting 404 Errors:

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"OK","message":"Medigo API is running"}
   ```

2. **Check Frontend Console**:
   - Look for "API Base URL: http://localhost:5000"
   - Check for any CORS errors
   - Verify JWT token is present

3. **Test API Directly**:
   ```bash
   # Test with curl (replace TOKEN with actual JWT)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5000/api/doctors/profile
   ```

4. **Check Environment Variables**:
   - Make sure `REACT_APP_API_URL` is not set (or set to `http://localhost:5000`)
   - Verify backend is running on port 5000

## 🎉 **Expected Results**

### ✅ **Working Doctor Dashboard**
- **Console logs show**: "API Base URL: http://localhost:5000"
- **Network requests go to**: `localhost:5000` (not 3000)
- **Profile loads successfully**: No more "Doctor profile not found" error
- **Proper verification status**: Shows pending or verified correctly

### ✅ **Console Logs Should Show**
```
Fetching doctor profile...
API Base URL: http://localhost:5000
Profile response: { doctor: {...}, is_verified: true/false }
```

## 🚀 **Next Steps**

1. **Test the fix** with both verified and unverified doctors
2. **Verify all API calls** are going to the correct backend
3. **Check that the dashboard loads** without errors
4. **Test the complete flow**: Register → Admin Verify → Doctor Login

The doctor dashboard should now load properly with the correct API connections! 🎉

## 🔧 **If Issues Persist**

1. **Clear browser cache** and refresh
2. **Restart both servers** completely
3. **Check for port conflicts** (make sure 5000 and 3000 are free)
4. **Verify all dependencies** are installed: `npm install` in both directories
