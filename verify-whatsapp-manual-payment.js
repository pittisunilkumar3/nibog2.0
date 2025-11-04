/**
 * Verification script for WhatsApp manual payment implementation
 * This script checks if all the necessary components are in place
 */

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, filePath);
  return fs.existsSync(fullPath);
}

function checkFileContains(filePath, searchString) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    return false;
  }
}

function verifyWhatsAppManualPaymentImplementation() {
  console.log('🔍 Verifying WhatsApp Manual Payment Implementation...');
  console.log('='.repeat(60));
  
  const checks = [];
  
  // Check 1: Core service file modifications
  console.log('📁 Step 1: Checking core service modifications...');
  
  const paymentServiceExists = checkFileExists('services/paymentService.ts');
  const hasWhatsAppFunction = checkFileContains('services/paymentService.ts', 'sendWhatsAppNotificationForManualPayment');
  const hasWhatsAppTrigger = checkFileContains('services/paymentService.ts', 'payment_status === \'successful\'');
  
  checks.push({
    name: 'Payment Service File',
    status: paymentServiceExists,
    details: paymentServiceExists ? '✅ Found' : '❌ Missing'
  });
  
  checks.push({
    name: 'WhatsApp Function Added',
    status: hasWhatsAppFunction,
    details: hasWhatsAppFunction ? '✅ Found' : '❌ Missing sendWhatsAppNotificationForManualPayment function'
  });
  
  checks.push({
    name: 'WhatsApp Trigger Logic',
    status: hasWhatsAppTrigger,
    details: hasWhatsAppTrigger ? '✅ Found' : '❌ Missing payment status check'
  });
  
  // Check 2: API endpoint
  console.log('📁 Step 2: Checking API endpoint...');
  
  const apiEndpointExists = checkFileExists('app/api/payments/manual/create/route.ts');
  const hasApiValidation = checkFileContains('app/api/payments/manual/create/route.ts', 'requiredFields');
  
  checks.push({
    name: 'Manual Payment API',
    status: apiEndpointExists,
    details: apiEndpointExists ? '✅ Found' : '❌ Missing API endpoint'
  });
  
  checks.push({
    name: 'API Validation',
    status: hasApiValidation,
    details: hasApiValidation ? '✅ Found' : '❌ Missing validation logic'
  });
  
  // Check 3: Admin UI updates
  console.log('📁 Step 3: Checking admin UI updates...');
  
  const manualPaymentDialogExists = checkFileExists('components/admin/ManualPaymentDialog.tsx');
  const hasUpdatedMessage = checkFileContains('components/admin/ManualPaymentDialog.tsx', 'WhatsApp confirmation will be sent');
  
  checks.push({
    name: 'Manual Payment Dialog',
    status: manualPaymentDialogExists,
    details: manualPaymentDialogExists ? '✅ Found' : '❌ Missing component'
  });
  
  checks.push({
    name: 'Updated Success Message',
    status: hasUpdatedMessage,
    details: hasUpdatedMessage ? '✅ Found' : '❌ Missing WhatsApp message update'
  });
  
  // Check 4: WhatsApp service dependencies
  console.log('📁 Step 4: Checking WhatsApp service dependencies...');
  
  const whatsappServiceExists = checkFileExists('services/whatsappService.ts');
  const whatsappConfigExists = checkFileExists('services/whatsappConfigService.ts');
  const whatsappApiExists = checkFileExists('app/api/whatsapp/send-booking-confirmation/route.ts');
  
  checks.push({
    name: 'WhatsApp Service',
    status: whatsappServiceExists,
    details: whatsappServiceExists ? '✅ Found' : '❌ Missing service'
  });
  
  checks.push({
    name: 'WhatsApp Config',
    status: whatsappConfigExists,
    details: whatsappConfigExists ? '✅ Found' : '❌ Missing config'
  });
  
  checks.push({
    name: 'WhatsApp API Endpoint',
    status: whatsappApiExists,
    details: whatsappApiExists ? '✅ Found' : '❌ Missing API'
  });
  
  // Check 5: Documentation
  console.log('📁 Step 5: Checking documentation...');
  
  const documentationExists = checkFileExists('WHATSAPP_MANUAL_PAYMENT_IMPLEMENTATION.md');
  
  checks.push({
    name: 'Implementation Documentation',
    status: documentationExists,
    details: documentationExists ? '✅ Found' : '❌ Missing documentation'
  });
  
  // Display results
  console.log('');
  console.log('📊 VERIFICATION RESULTS:');
  console.log('='.repeat(40));
  
  let passedChecks = 0;
  let totalChecks = checks.length;
  
  checks.forEach((check, index) => {
    const status = check.status ? '✅' : '❌';
    console.log(`${index + 1}. ${check.name}: ${status} ${check.details}`);
    if (check.status) passedChecks++;
  });
  
  console.log('');
  console.log(`📈 Overall Status: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 All checks passed! Implementation is complete.');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Set up environment variables for WhatsApp:');
    console.log('   - WHATSAPP_NOTIFICATIONS_ENABLED=true');
    console.log('   - ZAPTRA_API_TOKEN=your_token');
    console.log('   - ZAPTRA_API_URL=https://demo.zaptra.in/api/wpbox');
    console.log('3. Test manual payment recording in admin panel');
    console.log('4. Verify WhatsApp messages are sent');
    console.log('');
    console.log('📖 See WHATSAPP_MANUAL_PAYMENT_IMPLEMENTATION.md for detailed testing instructions');
  } else {
    console.log('⚠️ Some checks failed. Please review the missing components.');
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    checks.forEach((check, index) => {
      if (!check.status) {
        console.log(`- Fix: ${check.name} - ${check.details}`);
      }
    });
  }
  
  return passedChecks === totalChecks;
}

// Run verification
if (require.main === module) {
  const success = verifyWhatsAppManualPaymentImplementation();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyWhatsAppManualPaymentImplementation };
