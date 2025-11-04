/**
 * Script to analyze the booking_confirmation template structure
 */

async function analyzeTemplate() {
  console.log('🔍 Analyzing booking_confirmation_latest template structure...');

  const ZAPTRA_API_URL = 'https://zaptra.in/api/wpbox';
  const ZAPTRA_API_TOKEN = 'ub94jy7OiCmCiggguxLZ2ETkbYkh5OtpNX3ZYISD737595b9';
  
  try {
    // Get the specific template
    const response = await fetch(`${ZAPTRA_API_URL}/getTemplates?token=${ZAPTRA_API_TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      const templates = result.templates;
      const bookingTemplate = templates.find(t => t.name === 'booking_confirmation_latest');

      if (bookingTemplate) {
        console.log('🎯 Found booking_confirmation_latest template!');
        console.log('📋 Template ID:', bookingTemplate.id);
        console.log('📋 Language:', bookingTemplate.language);
        console.log('📋 Status:', bookingTemplate.status);
        
        // Parse the components
        const components = JSON.parse(bookingTemplate.components);
        console.log('\n📝 Template Components:');
        
        components.forEach((component, index) => {
          console.log(`\n${index + 1}. Component Type: ${component.type}`);
          
          if (component.type === 'HEADER') {
            console.log(`   Header Text: "${component.text}"`);
            if (component.text.includes('{{')) {
              const headerParams = component.text.match(/\{\{\d+\}\}/g);
              console.log(`   Header Parameters: ${headerParams ? headerParams.length : 0}`);
              console.log(`   Header Params: ${headerParams ? headerParams.join(', ') : 'None'}`);
            }
          }
          
          if (component.type === 'BODY') {
            console.log(`   Body Text: "${component.text}"`);
            const bodyParams = component.text.match(/\{\{\d+\}\}/g);
            console.log(`   Body Parameters: ${bodyParams ? bodyParams.length : 0}`);
            console.log(`   Body Params: ${bodyParams ? bodyParams.join(', ') : 'None'}`);
            
            if (component.example && component.example.body_text) {
              console.log(`   Example provided: ${JSON.stringify(component.example.body_text)}`);
            }
          }
          
          if (component.type === 'FOOTER') {
            console.log(`   Footer Text: "${component.text}"`);
          }
        });
        
        // Count total parameters
        const allText = components.map(c => c.text || '').join(' ');
        const allParams = allText.match(/\{\{\d+\}\}/g);
        const uniqueParams = [...new Set(allParams || [])];
        
        console.log('\n📊 Parameter Analysis:');
        console.log(`   Total parameter occurrences: ${allParams ? allParams.length : 0}`);
        console.log(`   Unique parameters: ${uniqueParams.length}`);
        console.log(`   Parameters found: ${uniqueParams.join(', ')}`);
        
        // Check what the highest parameter number is
        if (uniqueParams.length > 0) {
          const paramNumbers = uniqueParams.map(p => parseInt(p.replace(/[{}]/g, '')));
          const maxParam = Math.max(...paramNumbers);
          console.log(`   Highest parameter number: {{${maxParam}}}`);
          console.log(`   Expected parameter count: ${maxParam}`);
        }
        
      } else {
        console.log('❌ booking_confirmation template not found!');
      }
    } else {
      console.error('❌ Failed to get templates:', result.message);
    }
    
  } catch (error) {
    console.error('🚨 Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeTemplate();
