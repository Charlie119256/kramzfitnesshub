// Test authentication flow
async function testAuth() {
  console.log('Testing authentication...');
  
  try {
    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kramzfitness.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', loginData.token);
      console.log('User role:', loginData.user.role);
      
      // Test dashboard access with token
      const dashboardResponse = await fetch('http://localhost:5000/api/admin-dashboard/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard access successful!');
        console.log('Dashboard data:', dashboardData);
      } else {
        const errorData = await dashboardResponse.json();
        console.log('❌ Dashboard access failed:', errorData);
      }
    } else {
      console.log('❌ Login failed:', loginData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth(); 