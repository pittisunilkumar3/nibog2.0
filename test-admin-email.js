/**
 * Test script to verify admin notification email functionality
 * This script tests the admin email notification system without making actual payments
 */

const testAdminEmailNotification = async () => {
  console.log('🧪 Testing Admin Email Notification System');
  console.log('==========================================');

  // Test data that mimics a real booking confirmation
  const testBookingData = {
    bookingId: 999,
    bookingRef: 'TEST999',
    parentName: 'Test Parent',
    parentEmail: 'test.parent@example.com',
    childName: 'Test Child',
    eventTitle: 'New India Baby Olympic Games Hyderabad 2025',
    eventDate: '2025-11-08',
    eventVenue: 'Shri Kotla Vijaya Bhaskar Reddy Stadium',
    totalAmount: 1800,
    paymentMethod: 'PhonePe',
    transactionId: 'TEST_TRANSACTION_123',
    gameDetails: [
      {
        gameName: 'Running Race',
        gameTime: '10:00 AM - 11:00 AM',
        gamePrice: 1800
      }
    ]
  };

  try {
    console.log('📧 Testing admin notification email generation...');
    
    // Test the email API endpoint
    const response = await fetch('http://localhost:3111/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'newindiababyolympics@gmail.com',
        subject: `🚨 New Booking Alert - ${testBookingData.eventTitle} | Booking #${testBookingData.bookingId}`,
        html: generateTestAdminHTML(testBookingData),
        settings: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_username: 'test@example.com',
          smtp_password: 'test_password',
          sender_name: 'NIBOG Test',
          sender_email: 'test@example.com'
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Admin email API test successful:', result);
    } else {
      const error = await response.json();
      console.log('❌ Admin email API test failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n📋 Test Summary:');
  console.log('- Admin email recipient: newindiababyolympics@gmail.com');
  console.log('- Email includes booking details, customer info, and payment info');
  console.log('- Email is sent after successful customer confirmation email');
  console.log('- Admin email failures do not affect booking completion');
};

// Generate test HTML for admin notification
function generateTestAdminHTML(bookingData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Notification - NIBOG Admin</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #495057; }
        .detail-value { color: #212529; }
        .payment-info { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New Booking Alert (TEST)</h1>
          <p>A new booking has been confirmed and payment completed</p>
        </div>

        <div class="content">
          <div class="alert-box">
            <strong>⚡ Action Required:</strong> A new booking has been successfully processed. Please review the details below.
          </div>

          <div class="booking-details">
            <h3>📋 Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span class="detail-value">${bookingData.bookingRef}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${bookingData.bookingId}</span>
            </div>
          </div>

          <div class="booking-details">
            <h3>👨‍👩‍👧‍👦 Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Parent Name:</span>
              <span class="detail-value">${bookingData.parentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Child Name:</span>
              <span class="detail-value">${bookingData.childName}</span>
            </div>
          </div>

          <div class="payment-info">
            <h3>💳 Payment Information</h3>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value"><strong>₹${bookingData.totalAmount}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value"><strong style="color: #28a745;">✅ COMPLETED</strong></span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testAdminEmailNotification();
}

module.exports = { testAdminEmailNotification };
