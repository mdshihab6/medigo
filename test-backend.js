const axios = require('axios');

async function testBackend() {
  console.log('🧪 Testing Backend Connection...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthRes.data);
    
    // Test 2: Test doctors test endpoint (without auth - should fail)
    console.log('\n2. Testing doctors test endpoint without auth...');
    try {
      await axios.get('http://localhost:5000/api/doctors/test');
    } catch (error) {
      console.log('✅ Expected 401 error:', error.response?.status);
    }
    
    console.log('\n🎉 Backend is running correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your backend server is running: cd backend && npm run dev');
    console.log('2. Make sure your frontend server is running: cd frontend && npm start');
    console.log('3. Check the browser console for detailed error messages');
    console.log('4. Verify the JWT token is being sent in the Authorization header');
    
  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Check if all dependencies are installed: npm install');
    console.log('3. Verify environment variables are set correctly');
    console.log('4. Check if there are any port conflicts');
  }
}

testBackend();
