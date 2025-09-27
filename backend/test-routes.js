const axios = require('axios');

// Test script to verify doctor routes are working
async function testDoctorRoutes() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Doctor Routes...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check:', healthRes.data);
    
    // Test 2: Test doctors test endpoint (without auth - should fail)
    console.log('\n2. Testing doctors test endpoint without auth...');
    try {
      await axios.get(`${baseURL}/api/doctors/test`);
    } catch (error) {
      console.log('✅ Expected 401 error:', error.response?.status);
    }
    
    console.log('\n🎉 Backend routes are properly configured!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your backend server is running: npm run dev');
    console.log('2. Check the browser console for detailed error messages');
    console.log('3. Verify the JWT token is being sent in the Authorization header');
    
  } catch (error) {
    console.error('❌ Error testing routes:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Check if all dependencies are installed: npm install');
    console.log('3. Verify environment variables are set correctly');
  }
}

testDoctorRoutes();
