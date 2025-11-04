// Simple test script to verify footer settings API integration
// This can be run in the browser console or as a Node.js script

const testFooterAPI = async () => {
  console.log('🧪 Testing Footer Settings API Integration...\n');

  // Test data
  const testFooterData = {
    company_name: "Nibog Test Ltd",
    company_description: "Test description for Nibog footer settings API integration.",
    address: "Test Address, Test City, Test State, 123456",
    phone: "+91-1234567890",
    email: "test@nibog.com",
    newsletter_enabled: true,
    copyright_text: "© 2025 Nibog Test. All rights reserved.",
    facebook_url: "https://www.facebook.com/share/1K8H6SPtR5/",
    instagram_url: "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
    linkedin_url: "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    youtube_url: "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
  };

  try {
    // Test 1: POST - Create/Update Footer Settings
    console.log('📤 Test 1: Creating/Updating footer settings...');
    const postResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/footer_setting/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFooterData)
    });

    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST Success:', postResult);
    } else {
      console.log('❌ POST Failed:', postResponse.status, postResponse.statusText);
      const errorText = await postResponse.text();
      console.log('Error details:', errorText);
    }

    // Test 2: GET - Retrieve Footer Settings
    console.log('\n📥 Test 2: Retrieving footer settings...');
    const getResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/footer_setting/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET Success:', getResult);
      
      // Verify data integrity
      if (Array.isArray(getResult) && getResult.length > 0) {
        const footerData = getResult[0];
        console.log('\n🔍 Data Verification:');
        console.log('Company Name:', footerData.company_name);
        console.log('Email:', footerData.email);
        console.log('Newsletter Enabled:', footerData.newsletter_enabled);
        console.log('Social Media URLs:');
        console.log('  Facebook:', footerData.facebook_url);
        console.log('  Instagram:', footerData.instagram_url);
        console.log('  LinkedIn:', footerData.linkedin_url);
        console.log('  YouTube:', footerData.youtube_url);
      }
    } else {
      console.log('❌ GET Failed:', getResponse.status, getResponse.statusText);
      const errorText = await getResponse.text();
      console.log('Error details:', errorText);
    }

    console.log('\n✨ Footer API Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
};

// Test the service functions if running in a browser with the service loaded
const testFooterService = async () => {
  console.log('🧪 Testing Footer Service Functions...\n');

  try {
    // This would work if the service is imported in the browser
    if (typeof getFooterSetting !== 'undefined' && typeof saveFooterSetting !== 'undefined') {
      console.log('📥 Testing getFooterSetting...');
      const footerData = await getFooterSetting();
      console.log('✅ Service GET Success:', footerData);

      console.log('\n📤 Testing saveFooterSetting...');
      const testData = {
        company_name: "Service Test Company",
        company_description: "Testing footer service integration",
        address: "Service Test Address",
        phone: "+91-9999999999",
        email: "service@test.com",
        newsletter_enabled: true,
        copyright_text: "© 2025 Service Test. All rights reserved."
      };
      
      const saveResult = await saveFooterSetting(testData);
      console.log('✅ Service POST Success:', saveResult);
    } else {
      console.log('ℹ️ Footer service functions not available in this context');
    }
  } catch (error) {
    console.error('❌ Service Test Error:', error);
  }
};

// Instructions for manual testing
console.log(`
🚀 Footer Settings API Integration Test

To run this test:

1. In Browser Console:
   - Open browser developer tools
   - Copy and paste this entire script
   - Run: testFooterAPI()

2. Manual Testing Steps:
   a) Visit the superadmin footer settings page: /superadmin/footer-settings
   b) Fill in the form with test data
   c) Save the settings
   d) Check the frontend footer to see if data appears
   e) Visit the admin footer management page: /admin/footer
   f) Verify the data is loaded correctly

3. API Endpoints:
   - POST: https://ai.nibog.in/webhook/v1/nibog/footer_setting/post
   - GET: https://ai.nibog.in/webhook/v1/nibog/footer_setting/get

4. Expected Behavior:
   - Footer component should display dynamic data from API
   - Social media icons should only show when URLs are provided
   - Newsletter section should be conditional based on newsletter_enabled
   - Copyright text should support {year} placeholder
   - All forms should save and load data correctly

Run testFooterAPI() to start the test!
`);

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFooterAPI, testFooterService };
}
