/**
 * Script to check available WhatsApp templates in Zaptra
 */

async function checkAvailableTemplates() {
  console.log('🔍 Checking available WhatsApp templates in Zaptra...');
  
  const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
  const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
  
  try {
    // Get all available templates - try with token as query parameter
    const response = await fetch(`${ZAPTRA_API_URL}/getTemplates?token=${ZAPTRA_API_TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 API Response Status:', response.status);
    const result = await response.json();
    console.log('📡 API Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Templates retrieved successfully!');
      
      // Look for booking_confirmation template
      const templates = result.templates || result.data || result;
      if (Array.isArray(templates)) {
        console.log(`📋 Found ${templates.length} templates:`);
        
        templates.forEach((template, index) => {
          console.log(`\n${index + 1}. Template: ${template.name}`);
          console.log(`   Language: ${template.language}`);
          console.log(`   Status: ${template.status}`);
          console.log(`   Category: ${template.category}`);
          
          if (template.components) {
            console.log(`   Components:`, JSON.stringify(template.components, null, 4));
          }
          
          // Check if this is our booking_confirmation_latest template
          if (template.name === 'booking_confirmation_latest') {
            console.log('🎯 Found booking_confirmation_latest template!');
            console.log('📝 Template details:', JSON.stringify(template, null, 4));
          }
        });
      } else {
        console.log('📋 Templates data:', templates);
      }
    } else {
      console.error('❌ Failed to get templates');
      console.error('Error:', result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('🚨 Request failed:', error.message);
  }
}

// Run the check
checkAvailableTemplates();
