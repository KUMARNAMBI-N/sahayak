const fetch = require('node-fetch');

async function testCORS() {
  console.log('🧪 Testing CORS Configuration...\n');

  try {
    // Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await fetch('http://localhost:5000/api/test');
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    }

    // Test CORS info
    console.log('\n2. Testing CORS info...');
    const corsResponse = await fetch('http://localhost:5000/api/cors-info');
    console.log(`   Status: ${corsResponse.status}`);
    if (corsResponse.ok) {
      const corsData = await corsResponse.json();
      console.log(`   Allowed origins: ${corsData.allowedOrigins.length}`);
      corsData.allowedOrigins.forEach((origin, index) => {
        console.log(`     ${index + 1}. ${origin}`);
      });
    }

    // Test with origin header
    console.log('\n3. Testing with origin header...');
    const originResponse = await fetch('http://localhost:5000/api/test', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${originResponse.status}`);
    console.log(`   CORS Headers:`);
    console.log(`     Access-Control-Allow-Origin: ${originResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`     Access-Control-Allow-Methods: ${originResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`     Access-Control-Allow-Headers: ${originResponse.headers.get('Access-Control-Allow-Headers')}`);

    console.log('\n✅ CORS test completed successfully!');

  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

// Run the test
testCORS(); 