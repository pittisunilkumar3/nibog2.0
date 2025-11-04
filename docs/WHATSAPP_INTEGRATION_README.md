# WhatsApp Integration for Nibog Booking System

This integration adds WhatsApp notifications to the Nibog booking system using Zaptra's WhatsApp API platform.

## 🎯 Overview

When a customer completes a booking and payment, they will automatically receive a WhatsApp confirmation message with their booking details. This serves as both a customer service enhancement and a promotional touchpoint for Zaptra.

## 🔧 Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# WhatsApp Integration via Zaptra
WHATSAPP_NOTIFICATIONS_ENABLED=false
ZAPTRA_API_URL=https://demo.zaptra.in/api/wpbox
ZAPTRA_API_TOKEN=your_zaptra_api_token_here

# WhatsApp Safety Configuration
WHATSAPP_FALLBACK_ENABLED=true
WHATSAPP_RETRY_ATTEMPTS=3
WHATSAPP_TIMEOUT_MS=10000
WHATSAPP_DEBUG=false
```

### 2. Zaptra Configuration

1. Ensure your Zaptra WhatsApp Business API is configured and active
2. Generate an API token from the Zaptra admin panel
3. Test the API connectivity using the health check endpoint

### 3. Enable the Integration

Set `WHATSAPP_NOTIFICATIONS_ENABLED=true` in your environment variables.

## 📱 API Endpoints

### Send Booking Confirmation
```
POST /api/whatsapp/send-booking-confirmation
```

**Request Body:**
```json
{
  "bookingId": 123,
  "bookingRef": "B0000123",
  "parentName": "John Doe",
  "parentPhone": "+919876543210",
  "childName": "Jane Doe",
  "eventTitle": "Spring Carnival",
  "eventDate": "2024-03-15",
  "eventVenue": "Main Stadium",
  "totalAmount": 1500,
  "paymentMethod": "PhonePe",
  "transactionId": "TXN123456",
  "gameDetails": [
    {
      "gameName": "Treasure Hunt",
      "gameTime": "10:00 AM",
      "gamePrice": 500
    }
  ]
}
```

### Test Integration
```
POST /api/whatsapp/test
```

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

### Health Check
```
GET /api/whatsapp/health
```

**Response:**
```json
{
  "healthy": true,
  "enabled": true,
  "circuitBreaker": {
    "isOpen": false,
    "failures": 0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Integration Flow

1. **Customer completes booking** → Payment processed
2. **Booking created successfully** → Email notification sent
3. **WhatsApp notification triggered** → Message sent via Zaptra API
4. **Customer receives WhatsApp message** → Booking confirmation with details

## 🛡️ Safety Features

- **Feature Flag**: Can be disabled instantly via environment variable
- **Circuit Breaker**: Automatically stops sending if API fails repeatedly
- **Retry Logic**: Automatically retries failed messages up to 3 times
- **Timeout Protection**: Prevents hanging API calls
- **Fallback Handling**: Graceful degradation if WhatsApp service is unavailable
- **Error Logging**: Comprehensive logging for monitoring and debugging

## 📊 Monitoring

The integration includes comprehensive logging and monitoring:

- All WhatsApp events are logged with booking ID, phone number (masked), and status
- Health check endpoint provides real-time status
- Circuit breaker status is monitored
- Success/failure rates are tracked

## 🔍 Testing

### Development Testing

1. Set `WHATSAPP_DEBUG=true` for detailed logging
2. Use the test endpoint to verify connectivity
3. Create test bookings to verify the complete flow

### Production Testing

1. Start with `WHATSAPP_NOTIFICATIONS_ENABLED=false`
2. Enable for a small percentage of users initially
3. Monitor success rates and gradually increase coverage

## 🚨 Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check if `WHATSAPP_NOTIFICATIONS_ENABLED=true`
   - Verify API token is correct
   - Check health endpoint for status

2. **Invalid phone number errors**
   - Ensure phone numbers are in international format
   - Check phone number validation logic

3. **API timeouts**
   - Increase `WHATSAPP_TIMEOUT_MS` value
   - Check Zaptra API status

### Emergency Rollback

To immediately disable WhatsApp notifications:
```env
WHATSAPP_NOTIFICATIONS_ENABLED=false
```

No code deployment required - the feature flag will disable the integration immediately.

## 📝 Message Template

The WhatsApp message includes:
- Booking confirmation with emoji
- Customer and child names
- Event details (title, date, venue)
- Booking reference number
- Game details and pricing
- Total amount and payment method
- Transaction ID
- Zaptra branding

## 🔗 Related Documentation

- [Deployment Plan](./WHATSAPP_INTEGRATION_DEPLOYMENT.md)
- [Zaptra API Documentation](https://documenter.getpostman.com/view/8538142/2s9Ykn8gvj)
- [WhatsApp Business API Guidelines](https://developers.facebook.com/docs/whatsapp)
