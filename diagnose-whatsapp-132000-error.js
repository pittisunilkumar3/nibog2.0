/**
 * Diagnostic script for WhatsApp #132000 parameter mismatch error
 * This script helps identify the exact cause of the parameter count mismatch
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3111';

async function diagnoseWhatsApp132000Error() {
  console.log('🔍 DIAGNOSING WHATSAPP #132000 ERROR');
  console.log('='.repeat(60));
  
  // Step 1: Check environment configuration
  console.log('⚙️ Step 1: Environment Configuration Check');
  console.log('-'.repeat(40));
  
  const envConfig = {
    WHATSAPP_NOTIFICATIONS_ENABLED: process.env.WHATSAPP_NOTIFICATIONS_ENABLED,
    WHATSAPP_USE_TEMPLATES: process.env.WHATSAPP_USE_TEMPLATES,
    ZAPTRA_API_TOKEN: process.env.ZAPTRA_API_TOKEN ? '***SET***' : 'NOT_SET',
    ZAPTRA_API_URL: process.env.ZAPTRA_API_URL
  };
  
  console.log('📋 Environment Variables:');
  Object.entries(envConfig).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  if (envConfig.WHATSAPP_USE_TEMPLATES === 'true') {
    console.log('✅ Templates are ENABLED - this is likely the source of #132000 error');
  } else {
    console.log('⚠️ Templates are DISABLED - #132000 error should not occur');
  }
  
  // Step 2: Test template structure
  console.log('\n📋 Step 2: Template Structure Analysis');
  console.log('-'.repeat(40));
  
  try {
    const templatesResponse = await fetch(`${BASE_URL}/api/whatsapp/templates`);
    const templatesData = await templatesResponse.json();
    
    if (templatesData.success) {
      const bookingTemplate = templatesData.templates.find(t => t.name === 'booking_confirmation_latest');
      
      if (bookingTemplate) {
        console.log('✅ booking_confirmation_latest template found');
        console.log('📋 Template status:', bookingTemplate.status);
        
        // Parse template components to count parameters
        const components = JSON.parse(bookingTemplate.components);
        const bodyComponent = components.find(c => c.type === 'BODY');
        
        if (bodyComponent) {
          const parameters = bodyComponent.text.match(/\{\{\d+\}\}/g) || [];
          console.log('📋 Template parameters found:', parameters.length);
          console.log('📋 Parameters:', parameters);
          
          if (parameters.length !== 8) {
            console.log('🚨 TEMPLATE MISMATCH DETECTED!');
            console.log(`   Expected by service: 8 parameters`);
            console.log(`   Expected by template: ${parameters.length} parameters`);
            console.log('   This is the cause of #132000 error!');
          } else {
            console.log('✅ Template parameter count matches service expectation (8)');
          }
        }
      } else {
        console.log('❌ booking_confirmation_latest template NOT FOUND');
      }
    } else {
      console.log('❌ Failed to fetch templates:', templatesData.error);
    }
  } catch (error) {
    console.log('❌ Template analysis failed:', error.message);
  }
  
  // Step 3: Test manual payment data structure
  console.log('\n📱 Step 3: Manual Payment Data Structure Test');
  console.log('-'.repeat(40));
  
  // Simulate the data structure that manual payment creates
  const mockManualPaymentData = {
    bookingId: 12345,
    bookingRef: 'B0012345',
    parentName: 'Test Parent',
    parentPhone: '+916303727148',
    childName: 'Test Child',
    eventTitle: 'Manual Payment Test Event',
    eventDate: '2024-01-15',
    eventVenue: 'Test Venue',
    totalAmount: 2500,
    paymentMethod: 'Manual Payment', // This might be different from frontend
    transactionId: 'MANUAL_TEST_123',
    gameDetails: [{
      gameName: 'Test Game',
      gameTime: '10:00 AM - 11:00 AM',
      gamePrice: 2000
    }],
    addOns: [{
      name: 'Test Add-on',
      quantity: 1,
      price: 500
    }]
  };
  
  console.log('📋 Manual Payment WhatsApp Data Structure:');
  console.log('   bookingId:', mockManualPaymentData.bookingId);
  console.log('   bookingRef:', mockManualPaymentData.bookingRef);
  console.log('   parentName:', mockManualPaymentData.parentName);
  console.log('   parentPhone:', mockManualPaymentData.parentPhone);
  console.log('   childName:', mockManualPaymentData.childName);
  console.log('   eventTitle:', mockManualPaymentData.eventTitle);
  console.log('   eventDate:', mockManualPaymentData.eventDate);
  console.log('   eventVenue:', mockManualPaymentData.eventVenue);
  console.log('   totalAmount:', mockManualPaymentData.totalAmount);
  console.log('   paymentMethod:', mockManualPaymentData.paymentMethod);
  console.log('   transactionId:', mockManualPaymentData.transactionId);
  console.log('   gameDetails:', mockManualPaymentData.gameDetails.length, 'items');
  console.log('   addOns:', mockManualPaymentData.addOns.length, 'items');
  
  // Step 4: Simulate template parameter construction
  console.log('\n🔧 Step 4: Template Parameter Construction Simulation');
  console.log('-'.repeat(40));
  
  // This is how the WhatsApp service constructs template parameters
  const bookingRef = mockManualPaymentData.bookingRef || `B${String(mockManualPaymentData.bookingId).padStart(7, '0')}`;
  
  const templateData = [
    mockManualPaymentData.parentName || 'Customer',                    // {{1}} - customer_name
    mockManualPaymentData.eventTitle || 'NIBOG Event',                 // {{2}} - event_title
    mockManualPaymentData.eventDate || new Date().toLocaleDateString(), // {{3}} - event_date
    mockManualPaymentData.eventVenue || 'Event Venue',                 // {{4}} - venue_name
    mockManualPaymentData.childName || 'Child',                        // {{5}} - child_name
    bookingRef || 'N/A',                                               // {{6}} - booking_ref
    `₹${mockManualPaymentData.totalAmount || 0}`,                      // {{7}} - total_amount with currency
    mockManualPaymentData.paymentMethod || 'Payment'                   // {{8}} - payment_method
  ];
  
  // Sanitize parameters
  const sanitizedTemplateData = templateData.map(param =>
    param !== null && param !== undefined ? String(param) : 'N/A'
  );
  
  console.log('📋 Constructed Template Parameters:');
  sanitizedTemplateData.forEach((param, index) => {
    console.log(`   {{${index + 1}}}: "${param}" (type: ${typeof param}, length: ${param.length})`);
  });
  
  console.log(`📊 Parameter Count: ${sanitizedTemplateData.length}`);
  
  if (sanitizedTemplateData.length !== 8) {
    console.log('🚨 PARAMETER COUNT MISMATCH DETECTED!');
    console.log(`   Expected: 8, Got: ${sanitizedTemplateData.length}`);
    console.log('   This will cause #132000 error!');
  } else {
    console.log('✅ Parameter count is correct (8)');
  }
  
  // Step 5: Check for data quality issues
  console.log('\n🔍 Step 5: Data Quality Analysis');
  console.log('-'.repeat(40));
  
  const dataQualityIssues = [];
  
  sanitizedTemplateData.forEach((param, index) => {
    if (param === 'N/A') {
      dataQualityIssues.push(`Parameter {{${index + 1}}} is fallback value 'N/A'`);
    }
    if (param === '') {
      dataQualityIssues.push(`Parameter {{${index + 1}}} is empty string`);
    }
    if (param.length > 100) {
      dataQualityIssues.push(`Parameter {{${index + 1}}} is very long (${param.length} chars)`);
    }
  });
  
  if (dataQualityIssues.length > 0) {
    console.log('⚠️ Data Quality Issues Found:');
    dataQualityIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ No data quality issues detected');
  }
  
  // Step 6: Recommendations
  console.log('\n💡 Step 6: Recommendations');
  console.log('-'.repeat(40));
  
  console.log('🔧 IMMEDIATE FIXES:');
  console.log('1. Add enhanced logging to manual payment WhatsApp function');
  console.log('2. Add parameter validation before sending to Zaptra');
  console.log('3. Add fallback to text message if template fails');
  console.log('4. Verify template structure matches service expectations');
  
  console.log('\n🧪 TESTING STEPS:');
  console.log('1. Enable WHATSAPP_DEBUG=true for detailed logging');
  console.log('2. Test manual payment with real booking data');
  console.log('3. Check server logs for parameter construction details');
  console.log('4. Verify Zaptra template configuration');
  
  return {
    templateEnabled: envConfig.WHATSAPP_USE_TEMPLATES === 'true',
    parameterCount: sanitizedTemplateData.length,
    dataQualityIssues: dataQualityIssues.length,
    recommendations: [
      'Add enhanced logging',
      'Add parameter validation',
      'Add template fallback',
      'Verify template structure'
    ]
  };
}

// Run the diagnostic
if (require.main === module) {
  diagnoseWhatsApp132000Error()
    .then(result => {
      console.log('\n📊 DIAGNOSTIC SUMMARY:');
      console.log('='.repeat(30));
      console.log('Template Mode:', result.templateEnabled ? 'ENABLED' : 'DISABLED');
      console.log('Parameter Count:', result.parameterCount);
      console.log('Data Issues:', result.dataQualityIssues);
      console.log('Recommendations:', result.recommendations.length);
      
      console.log('\n🏁 Diagnostic completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Diagnostic failed:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseWhatsApp132000Error };
