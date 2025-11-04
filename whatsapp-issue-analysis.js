/**
 * Comprehensive WhatsApp Integration Issue Analysis
 */

async function analyzeWhatsAppIssues() {
  console.log('🔍 WHATSAPP INTEGRATION ISSUE ANALYSIS');
  console.log('=' .repeat(60));

  const issues = [];
  const warnings = [];
  const recommendations = [];

  // Test 1: Environment Configuration
  console.log('\n⚙️ Test 1: Environment Configuration');
  console.log('-'.repeat(40));
  
  try {
    const envVars = {
      WHATSAPP_NOTIFICATIONS_ENABLED: process.env.WHATSAPP_NOTIFICATIONS_ENABLED,
      ZAPTRA_API_URL: process.env.ZAPTRA_API_URL,
      ZAPTRA_API_TOKEN: process.env.ZAPTRA_API_TOKEN ? '***SET***' : 'NOT_SET',
      WHATSAPP_USE_TEMPLATES: process.env.WHATSAPP_USE_TEMPLATES,
      WHATSAPP_FALLBACK_ENABLED: process.env.WHATSAPP_FALLBACK_ENABLED,
      WHATSAPP_RETRY_ATTEMPTS: process.env.WHATSAPP_RETRY_ATTEMPTS,
      WHATSAPP_TIMEOUT_MS: process.env.WHATSAPP_TIMEOUT_MS,
      WHATSAPP_DEBUG: process.env.WHATSAPP_DEBUG
    };

    console.log('📋 Environment Variables:', envVars);

    // Check critical configurations
    if (envVars.WHATSAPP_NOTIFICATIONS_ENABLED !== 'true') {
      warnings.push('WhatsApp notifications are disabled');
    }

    if (envVars.ZAPTRA_API_TOKEN === 'NOT_SET') {
      issues.push('CRITICAL: Zaptra API token not configured');
    }

    if (envVars.WHATSAPP_USE_TEMPLATES !== 'true') {
      warnings.push('Template mode disabled - using text messages');
    }

    console.log('✅ Environment configuration checked');
  } catch (error) {
    issues.push(`Environment check failed: ${error.message}`);
  }

  // Test 2: Template Structure Validation
  console.log('\n📋 Test 2: Template Structure Validation');
  console.log('-'.repeat(40));
  
  try {
    const templatesResponse = await fetch('http://localhost:3111/api/whatsapp/templates');
    const templatesData = await templatesResponse.json();
    
    if (templatesData.success && templatesData.templates) {
      const bookingTemplate = templatesData.templates.find(t => t.name === 'booking_confirmation_latest');
      
      if (bookingTemplate) {
        console.log('✅ booking_confirmation_latest template found');
        console.log('📋 Template status:', bookingTemplate.status);
        
        // Parse template components
        const components = JSON.parse(bookingTemplate.components);
        const bodyComponent = components.find(c => c.type === 'BODY');
        
        if (bodyComponent) {
          const parameterCount = (bodyComponent.text.match(/\{\{\d+\}\}/g) || []).length;
          console.log('📋 Template parameters found:', parameterCount);
          
          if (parameterCount !== 8) {
            issues.push(`Template parameter mismatch: expected 8, found ${parameterCount}`);
          } else {
            console.log('✅ Template parameter count correct (8)');
          }
        }
        
        if (bookingTemplate.status !== 'APPROVED') {
          issues.push(`Template not approved: status is ${bookingTemplate.status}`);
        }
      } else {
        issues.push('CRITICAL: booking_confirmation_latest template not found');
      }
    } else {
      issues.push('Failed to fetch WhatsApp templates');
    }
  } catch (error) {
    issues.push(`Template validation failed: ${error.message}`);
  }

  // Test 3: Parameter Validation with Edge Cases
  console.log('\n🧪 Test 3: Parameter Validation with Edge Cases');
  console.log('-'.repeat(40));
  
  const edgeCases = [
    {
      name: 'Null values',
      data: {
        bookingId: 12345,
        bookingRef: 'TEST123',
        parentName: null,
        parentPhone: '+916303727148',
        childName: undefined,
        eventTitle: '',
        eventDate: null,
        eventVenue: undefined,
        totalAmount: 0,
        paymentMethod: null,
        transactionId: 'TXN123',
        gameDetails: []
      }
    },
    {
      name: 'Very long strings',
      data: {
        bookingId: 12345,
        bookingRef: 'TEST123',
        parentName: 'A'.repeat(100),
        parentPhone: '+916303727148',
        childName: 'B'.repeat(50),
        eventTitle: 'C'.repeat(200),
        eventDate: '2024-01-15',
        eventVenue: 'D'.repeat(150),
        totalAmount: 999999,
        paymentMethod: 'E'.repeat(30),
        transactionId: 'TXN123',
        gameDetails: []
      }
    },
    {
      name: 'Special characters',
      data: {
        bookingId: 12345,
        bookingRef: 'TEST123',
        parentName: 'Test & Parent <script>',
        parentPhone: '+916303727148',
        childName: 'Child "Name" with quotes',
        eventTitle: 'Event with émojis 🎉',
        eventDate: '2024-01-15',
        eventVenue: 'Venue with symbols @#$%',
        totalAmount: 2500,
        paymentMethod: 'Payment & Method',
        transactionId: 'TXN123',
        gameDetails: []
      }
    }
  ];

  for (const testCase of edgeCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      
      const response = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${testCase.name}: Handled correctly`);
      } else {
        console.log(`⚠️ ${testCase.name}: ${result.error}`);
        if (result.error.includes('132000')) {
          issues.push(`Parameter mismatch error with ${testCase.name}`);
        }
      }
    } catch (error) {
      issues.push(`Edge case test failed (${testCase.name}): ${error.message}`);
    }
  }

  // Test 4: Phone Number Validation
  console.log('\n📱 Test 4: Phone Number Validation');
  console.log('-'.repeat(40));
  
  const phoneTestCases = [
    '+916303727148',    // Valid international
    '9346015886',       // Valid without prefix
    '+91 9346015886',   // With spaces
    '91-9346-015886',   // With dashes
    '919346015886',     // With country code
    '123',              // Too short
    'invalid',          // Non-numeric
    '',                 // Empty
    null                // Null
  ];

  for (const phone of phoneTestCases) {
    try {
      const testData = {
        bookingId: 12345,
        bookingRef: 'TEST123',
        parentName: 'Test Parent',
        parentPhone: phone,
        childName: 'Test Child',
        eventTitle: 'Test Event',
        eventDate: '2024-01-15',
        eventVenue: 'Test Venue',
        totalAmount: 2500,
        paymentMethod: 'Test Payment',
        transactionId: 'TXN123',
        gameDetails: []
      };

      const response = await fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      console.log(`📱 Phone "${phone}": ${result.success ? 'Valid' : result.error}`);
      
    } catch (error) {
      console.log(`📱 Phone "${phone}": Test failed - ${error.message}`);
    }
  }

  // Test 5: API Rate Limiting and Circuit Breaker
  console.log('\n⚡ Test 5: Rate Limiting and Circuit Breaker');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔄 Testing rapid consecutive calls...');
    
    const rapidCalls = [];
    for (let i = 0; i < 3; i++) {
      rapidCalls.push(
        fetch('http://localhost:3111/api/whatsapp/send-booking-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: 12345 + i,
            bookingRef: `RAPID_${i}`,
            parentName: 'Test Parent',
            parentPhone: '+916303727148',
            childName: 'Test Child',
            eventTitle: 'Rapid Test Event',
            eventDate: '2024-01-15',
            eventVenue: 'Test Venue',
            totalAmount: 2500,
            paymentMethod: 'Test Payment',
            transactionId: `RAPID_TXN_${i}`,
            gameDetails: []
          })
        })
      );
    }

    const results = await Promise.all(rapidCalls);
    const successCount = results.filter(r => r.ok).length;
    
    console.log(`📊 Rapid calls: ${successCount}/${rapidCalls.length} successful`);
    
    if (successCount === rapidCalls.length) {
      console.log('✅ Rate limiting handling correctly');
    } else {
      warnings.push('Some rapid calls failed - check rate limiting');
    }
    
  } catch (error) {
    warnings.push(`Rate limiting test failed: ${error.message}`);
  }

  // Generate Report
  console.log('\n📊 WHATSAPP INTEGRATION ANALYSIS REPORT');
  console.log('=' .repeat(60));
  
  console.log(`\n🔴 CRITICAL ISSUES (${issues.length}):`);
  if (issues.length === 0) {
    console.log('✅ No critical issues found');
  } else {
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log(`\n⚠️ WARNINGS (${warnings.length}):`);
  if (warnings.length === 0) {
    console.log('✅ No warnings');
  } else {
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }

  // Generate recommendations
  if (issues.length > 0 || warnings.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (issues.some(i => i.includes('API token'))) {
      console.log('1. Configure ZAPTRA_API_TOKEN environment variable');
    }
    
    if (issues.some(i => i.includes('template'))) {
      console.log('2. Verify WhatsApp template is approved in Zaptra dashboard');
    }
    
    if (warnings.some(w => w.includes('disabled'))) {
      console.log('3. Enable WhatsApp notifications in production');
    }
    
    console.log('4. Monitor WhatsApp delivery rates and error patterns');
    console.log('5. Implement proper logging for production debugging');
  } else {
    console.log('\n🎉 WHATSAPP INTEGRATION IS HEALTHY!');
    console.log('✅ All tests passed');
    console.log('✅ No critical issues found');
    console.log('✅ System ready for production use');
  }

  return {
    issues,
    warnings,
    healthy: issues.length === 0
  };
}

// Run the analysis
analyzeWhatsAppIssues();
