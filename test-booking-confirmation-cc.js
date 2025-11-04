/**
 * Test script to verify booking confirmation emails are sent with CC to newindiababyolympics@gmail.com
 * This script tests the send-receipt-email API with CC functionality
 */

const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  testEmail: 'test-customer@example.com',
  ccEmail: 'newindiababyolympics@gmail.com'
};

// Mock email settings (you'll need to replace with actual settings)
const mockEmailSettings = {
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: 'your-email@gmail.com',
  smtp_password: 'your-app-password',
  sender_name: 'NIBOG',
  sender_email: 'your-email@gmail.com'
};

// Mock booking confirmation data
const mockBookingData = {
  bookingId: 12345,
  bookingRef: 'B0012345',
  parentName: 'Test Parent',
  parentEmail: TEST_CONFIG.testEmail,
  childName: 'Test Child',
  eventTitle: 'Test NIBOG Event',
  eventDate: new Date().toLocaleDateString(),
  eventVenue: 'Test Stadium',
  totalAmount: 500,
  paymentMethod: 'PhonePe',
  transactionId: 'TEST_TXN_123',
  gameDetails: [
    {
      gameName: 'Test Game 1',
      gameDescription: 'A fun test game',
      gamePrice: 250,
      gameDuration: 30,
      gameTime: '10:00 AM - 10:30 AM',
      slotPrice: 250,
      maxParticipants: 10,
      customPrice: 250
    },
    {
      gameName: 'Test Game 2',
      gameDescription: 'Another fun test game',
      gamePrice: 250,
      gameDuration: 30,
      gameTime: '11:00 AM - 11:30 AM',
      slotPrice: 250,
      maxParticipants: 8,
      customPrice: 250
    }
  ]
};

// Generate simple HTML content for testing
function generateTestHTML(bookingData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Confirmation Test</title>
    </head>
    <body>
      <h1>🎉 Booking Confirmed - ${bookingData.eventTitle}</h1>
      <p>Dear ${bookingData.parentName},</p>
      <p>Your booking has been confirmed!</p>
      <div>
        <h3>Booking Details:</h3>
        <p><strong>Booking Reference:</strong> ${bookingData.bookingRef}</p>
        <p><strong>Child Name:</strong> ${bookingData.childName}</p>
        <p><strong>Event:</strong> ${bookingData.eventTitle}</p>
        <p><strong>Date:</strong> ${bookingData.eventDate}</p>
        <p><strong>Venue:</strong> ${bookingData.eventVenue}</p>
        <p><strong>Total Amount:</strong> ₹${bookingData.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
        <p><strong>Transaction ID:</strong> ${bookingData.transactionId}</p>
      </div>
      <div>
        <h3>Games:</h3>
        ${bookingData.gameDetails.map(game => `
          <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0;">
            <strong>${game.gameName}</strong><br>
            ${game.gameDescription}<br>
            <small>Duration: ${game.gameDuration} minutes | Time: ${game.gameTime} | Price: ₹${game.gamePrice}</small>
          </div>
        `).join('')}
      </div>
      <p>This is a test email to verify CC functionality.</p>
      <p>Best regards,<br>NIBOG Team</p>
    </body>
    </html>
  `;
}

async function testBookingConfirmationWithCC() {
  console.log('🧪 Testing booking confirmation email with CC functionality...');
  console.log(`📧 Primary recipient: ${TEST_CONFIG.testEmail}`);
  console.log(`📧 CC recipient: ${TEST_CONFIG.ccEmail}`);
  
  try {
    const htmlContent = generateTestHTML(mockBookingData);
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/send-receipt-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: TEST_CONFIG.testEmail,
        subject: `🎉 TEST: Booking Confirmed - ${mockBookingData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: mockEmailSettings,
        cc: TEST_CONFIG.ccEmail
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email sent successfully!');
      console.log('📧 Response:', result);
      console.log('');
      console.log('🔍 Please check both email addresses:');
      console.log(`   1. Primary: ${TEST_CONFIG.testEmail}`);
      console.log(`   2. CC: ${TEST_CONFIG.ccEmail}`);
      console.log('');
      console.log('✅ If both recipients received the email, the CC functionality is working correctly!');
    } else {
      const error = await response.json();
      console.error('❌ Test failed:', error);
      console.log('');
      console.log('🔧 Troubleshooting tips:');
      console.log('   1. Make sure the server is running (npm run dev)');
      console.log('   2. Check email settings in the admin panel');
      console.log('   3. Verify SMTP credentials are correct');
      console.log('   4. Check if the email service allows CC functionality');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('');
    console.log('🔧 Make sure the server is running: npm run dev');
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 Starting booking confirmation CC test...');
  console.log('');
  testBookingConfirmationWithCC();
}

module.exports = { testBookingConfirmationWithCC };
