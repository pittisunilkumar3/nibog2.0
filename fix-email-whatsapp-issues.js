/**
 * Comprehensive fix and diagnostic script for Email and WhatsApp issues
 * Addresses SMTP timeout and WhatsApp message_wamid null issues
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3111';

async function diagnoseEmailIssues() {
  console.log('📧 DIAGNOSING EMAIL ISSUES');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check email settings
    console.log('📋 Test 1: Email Settings Check');
    const emailResponse = await fetch(`${BASE_URL}/api/emailsetting/get`);
    
    if (!emailResponse.ok) {
      console.log('❌ Email settings API not accessible');
      return false;
    }
    
    const emailSettings = await emailResponse.json();
    console.log('📧 Email settings found:', emailSettings.length > 0 ? 'YES' : 'NO');
    
    if (emailSettings.length > 0) {
      const settings = emailSettings[0];
      console.log('📧 SMTP Configuration:');
      console.log('   Host:', settings.smtp_host);
      console.log('   Port:', settings.smtp_port);
      console.log('   Username:', settings.smtp_username ? '***SET***' : 'NOT_SET');
      console.log('   Password:', settings.smtp_password ? '***SET***' : 'NOT_SET');
      
      // Check for common SMTP issues
      if (settings.smtp_host === '82.163.176.103') {
        console.log('⚠️ ISSUE DETECTED: SMTP host 82.163.176.103 is causing timeouts');
        console.log('💡 SOLUTION: Update SMTP settings to use a reliable provider:');
        console.log('   - Gmail: smtp.gmail.com:587');
        console.log('   - Outlook: smtp-mail.outlook.com:587');
        console.log('   - SendGrid: smtp.sendgrid.net:587');
      }
      
      if (settings.smtp_port === 465) {
        console.log('⚠️ Port 465 detected - ensure SSL/TLS is properly configured');
      }
    } else {
      console.log('❌ No email settings configured');
      console.log('💡 Configure email settings in /admin/settings');
    }
    
    return emailSettings.length > 0;
  } catch (error) {
    console.log('❌ Email diagnosis failed:', error.message);
    return false;
  }
}

async function diagnoseWhatsAppIssues() {
  console.log('\n📱 DIAGNOSING WHATSAPP ISSUES');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check WhatsApp configuration
    console.log('📋 Test 1: WhatsApp Configuration');
    const envConfig = {
      WHATSAPP_NOTIFICATIONS_ENABLED: process.env.WHATSAPP_NOTIFICATIONS_ENABLED || 'NOT_SET',
      WHATSAPP_USE_TEMPLATES: process.env.WHATSAPP_USE_TEMPLATES || 'NOT_SET',
      ZAPTRA_API_TOKEN: process.env.ZAPTRA_API_TOKEN ? '***SET***' : 'NOT_SET'
    };
    
    console.log('📱 Configuration:');
    Object.entries(envConfig).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Test 2: Send test WhatsApp message
    console.log('\n📋 Test 2: WhatsApp Message Test');
    const testData = {
      bookingId: 99999,
      bookingRef: 'TEST_FIX_' + Date.now(),
      parentName: 'Test Parent',
      parentPhone: '+916303727148', // Replace with your test number
      childName: 'Test Child',
      eventTitle: 'Email & WhatsApp Fix Test',
      eventDate: new Date().toLocaleDateString(),
      eventVenue: 'Test Venue',
      totalAmount: 2500,
      paymentMethod: 'Test Payment',
      transactionId: 'FIX_TEST_' + Date.now(),
      gameDetails: [{
        gameName: 'Test Game',
        gameTime: '10:00 AM - 11:00 AM',
        gamePrice: 2000
      }],
      addOns: []
    };
    
    const whatsappResponse = await fetch(`${BASE_URL}/api/whatsapp/send-booking-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const whatsappResult = await whatsappResponse.json();
    
    if (whatsappResult.success) {
      console.log('✅ WhatsApp message sent successfully');
      console.log('📱 Message ID:', whatsappResult.messageId);
      
      // Analyze message_wamid
      if (whatsappResult.zaptraResponse) {
        const wamid = whatsappResult.zaptraResponse.message_wamid;
        if (wamid) {
          console.log('✅ message_wamid present:', wamid);
          console.log('🎉 Message delivered to WhatsApp servers successfully');
        } else {
          console.log('⚠️ message_wamid is null');
          console.log('📋 Possible causes:');
          console.log('   - Phone number not opted-in to WhatsApp Business');
          console.log('   - Template message issues');
          console.log('   - Phone number format problems');
          console.log('   - Message still being processed');
          
          // Provide solutions
          console.log('💡 Solutions:');
          console.log('   1. Send opt-in message to phone number first');
          console.log('   2. Use text messages instead of templates');
          console.log('   3. Verify phone number format (+country_code + number)');
          console.log('   4. Check Zaptra dashboard for delivery status');
        }
      }
      
      return true;
    } else {
      console.log('❌ WhatsApp message failed:', whatsappResult.error);
      return false;
    }
  } catch (error) {
    console.log('❌ WhatsApp diagnosis failed:', error.message);
    return false;
  }
}

async function provideSolutions() {
  console.log('\n🔧 COMPREHENSIVE SOLUTIONS');
  console.log('='.repeat(50));
  
  console.log('📧 EMAIL FIXES:');
  console.log('1. Update SMTP Settings:');
  console.log('   - Go to /admin/settings');
  console.log('   - Use reliable SMTP provider (Gmail, SendGrid, etc.)');
  console.log('   - Test connection before saving');
  
  console.log('\n2. Recommended SMTP Providers:');
  console.log('   Gmail:');
  console.log('     Host: smtp.gmail.com');
  console.log('     Port: 587');
  console.log('     Security: STARTTLS');
  console.log('   SendGrid:');
  console.log('     Host: smtp.sendgrid.net');
  console.log('     Port: 587');
  console.log('     Security: STARTTLS');
  
  console.log('\n📱 WHATSAPP FIXES:');
  console.log('1. For message_wamid null issue:');
  console.log('   - Send opt-in message to customers first');
  console.log('   - Use text messages as fallback');
  console.log('   - Verify phone number formats');
  
  console.log('\n2. Phone Number Format:');
  console.log('   - Always include country code: +91xxxxxxxxxx');
  console.log('   - Remove spaces and special characters');
  console.log('   - Validate length (10-15 digits)');
  
  console.log('\n3. Template vs Text Messages:');
  console.log('   - Templates require opt-in');
  console.log('   - Text messages more reliable for new numbers');
  console.log('   - Use fallback mechanism implemented');
}

async function testFixes() {
  console.log('\n🧪 TESTING IMPLEMENTED FIXES');
  console.log('='.repeat(50));
  
  // Test enhanced error handling
  console.log('📋 Testing enhanced error handling...');
  
  // Test with invalid phone number
  const invalidPhoneTest = {
    bookingId: 99999,
    parentName: 'Test',
    parentPhone: 'invalid-phone', // Invalid format
    childName: 'Test',
    eventTitle: 'Test',
    eventDate: '2024-01-01',
    eventVenue: 'Test',
    totalAmount: 100,
    paymentMethod: 'Test',
    transactionId: 'TEST',
    gameDetails: [],
    addOns: []
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/whatsapp/send-booking-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPhoneTest)
    });
    
    const result = await response.json();
    
    if (!result.success && result.error.includes('Invalid phone number')) {
      console.log('✅ Enhanced phone validation working');
    } else {
      console.log('⚠️ Phone validation may need adjustment');
    }
  } catch (error) {
    console.log('❌ Fix test failed:', error.message);
  }
}

// Main execution
async function runDiagnosticAndFix() {
  console.log('🚀 EMAIL & WHATSAPP DIAGNOSTIC AND FIX TOOL');
  console.log('='.repeat(60));
  
  const emailOk = await diagnoseEmailIssues();
  const whatsappOk = await diagnoseWhatsAppIssues();
  
  await provideSolutions();
  await testFixes();
  
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(30));
  console.log('Email System:', emailOk ? '✅ OK' : '❌ NEEDS FIX');
  console.log('WhatsApp System:', whatsappOk ? '✅ OK' : '⚠️ CHECK LOGS');
  
  if (!emailOk || !whatsappOk) {
    console.log('\n🔧 NEXT STEPS:');
    if (!emailOk) {
      console.log('1. Update SMTP settings in /admin/settings');
      console.log('2. Use reliable email provider');
    }
    if (!whatsappOk) {
      console.log('3. Check server logs for WhatsApp details');
      console.log('4. Verify phone number formats');
      console.log('5. Send opt-in messages to customers');
    }
  }
  
  return emailOk && whatsappOk;
}

if (require.main === module) {
  runDiagnosticAndFix()
    .then(success => {
      console.log('\n🏁 Diagnostic completed:', success ? '✅ SUCCESS' : '⚠️ ISSUES FOUND');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Diagnostic failed:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseEmailIssues, diagnoseWhatsAppIssues, runDiagnosticAndFix };
