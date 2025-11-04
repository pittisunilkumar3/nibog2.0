# WhatsApp Integration Deployment Plan

This document outlines the step-by-step deployment strategy for integrating WhatsApp notifications into the Nibog booking system using Zaptra's WhatsApp API.

## 📋 Pre-Deployment Checklist

- [ ] Zaptra WhatsApp Business API account is active and configured
- [ ] API token has been generated and tested
- [ ] WhatsApp message templates have been approved (if using templates)
- [ ] Test phone numbers are registered for development testing
- [ ] Environment variables are prepared for each environment
- [ ] Rollback strategy is documented and understood by the team

## 🔑 Required Environment Variables

```
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

## 🚀 Deployment Strategy

### Phase 1: Development Environment Deployment

1. **Deploy code changes to development environment**
   ```bash
   git checkout -b feature/whatsapp-integration
   git add .
   git commit -m "Add WhatsApp integration for booking confirmations"
   git push origin feature/whatsapp-integration
   ```

2. **Configure environment variables in development**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=true`
   - Set `ZAPTRA_API_TOKEN` to a valid test token
   - Set `WHATSAPP_DEBUG=true` for detailed logging

3. **Run initial tests**
   - Test the `/api/whatsapp/test` endpoint with a valid phone number
   - Verify the health check endpoint at `/api/whatsapp/health`
   - Create a test booking and verify WhatsApp notification is sent

4. **Monitor logs and fix any issues**
   - Check for any errors or warnings in the logs
   - Verify message delivery status
   - Adjust timeout settings if needed

### Phase 2: Staging Environment Deployment

1. **Create pull request for review**
   ```bash
   # Create PR from feature/whatsapp-integration to staging
   ```

2. **Deploy to staging environment after approval**
   ```bash
   git checkout staging
   git merge feature/whatsapp-integration
   git push origin staging
   ```

3. **Configure environment variables in staging**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=true`
   - Set `ZAPTRA_API_TOKEN` to the staging token
   - Set `WHATSAPP_DEBUG=true` for detailed logging

4. **Conduct comprehensive testing**
   - Test the complete booking flow with real phone numbers
   - Verify WhatsApp messages are received
   - Test error scenarios (invalid phone, API timeout, etc.)
   - Test circuit breaker functionality

5. **Perform load testing**
   - Simulate multiple concurrent bookings
   - Monitor API response times and success rates
   - Adjust retry and timeout settings if needed

### Phase 3: Production Deployment (Controlled Rollout)

1. **Create production deployment PR**
   ```bash
   # Create PR from staging to main
   ```

2. **Deploy to production with feature flag disabled**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

3. **Configure environment variables in production**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=false` (initially disabled)
   - Set `ZAPTRA_API_TOKEN` to the production token
   - Set `WHATSAPP_DEBUG=false` for production

4. **Perform smoke tests**
   - Verify the application works normally with WhatsApp disabled
   - Check health endpoint returns correct status
   - Ensure no unexpected errors in logs

5. **Enable for a subset of users (A/B testing)**
   - Implement A/B testing logic to enable for 10% of users
   - Monitor success rates and user feedback
   - Gradually increase percentage if successful

6. **Full production enablement**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=true` for all users
   - Continue monitoring for any issues

## 🔄 Rollback Strategy

### Immediate Rollback (Critical Issues)

If critical issues are detected (high error rates, system instability):

1. **Disable WhatsApp integration immediately**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=false` in environment variables
   - No code rollback required due to feature flag

2. **Notify team and document issue**
   - Create incident report
   - Collect logs and error data

### Planned Rollback (Non-Critical Issues)

For non-critical issues requiring code changes:

1. **Disable the feature temporarily**
   - Set `WHATSAPP_NOTIFICATIONS_ENABLED=false`

2. **Create fix in development**
   - Address issues in development environment
   - Test fixes thoroughly

3. **Deploy fix following the same deployment process**
   - Follow phases 1-3 again with the fixed code

## 📊 Monitoring Plan

### Key Metrics to Monitor

1. **WhatsApp Message Success Rate**
   - Target: >95% success rate
   - Alert threshold: <90% success rate

2. **API Response Time**
   - Target: <2 seconds average
   - Alert threshold: >5 seconds average

3. **Circuit Breaker Activations**
   - Target: <1 per day
   - Alert threshold: >3 per day

4. **Error Rates**
   - Target: <1% of total messages
   - Alert threshold: >5% of total messages

### Logging Strategy

- All WhatsApp events are logged with the following data:
  - Event type (attempt, success, failure, disabled)
  - Booking ID
  - Phone number (masked for privacy)
  - Error details (if applicable)
  - Duration
  - Timestamp

- Health check status is logged every hour

## 🔍 Post-Deployment Verification

1. **Verify successful integration**
   - Create test bookings in production
   - Confirm WhatsApp messages are received
   - Check logs for any warnings or errors

2. **User feedback collection**
   - Monitor customer support for any WhatsApp-related issues
   - Collect feedback on message content and timing

3. **Performance impact assessment**
   - Verify no negative impact on booking flow performance
   - Check for any increased error rates in the main application

## 📝 Documentation Updates

- Update internal documentation with WhatsApp integration details
- Document API endpoints and configuration options
- Create troubleshooting guide for common issues

## 🛠️ Additional APIs Needed (n8n)

If you need additional APIs to be created in n8n for enhanced functionality:

1. **Booking Data Enrichment API**
   - Endpoint: `GET /api/booking/{bookingId}/whatsapp-data`
   - Purpose: Get complete booking data with customer phone number for WhatsApp
   - Required fields: customer phone, event details, venue information

2. **WhatsApp Template Management API**
   - Endpoint: `POST /api/whatsapp/templates/sync`
   - Purpose: Sync approved WhatsApp templates from Zaptra
   - Use case: Dynamic template selection based on event type

3. **Customer Preference API**
   - Endpoint: `GET /api/customer/{customerId}/preferences`
   - Purpose: Check if customer has opted out of WhatsApp notifications
   - Required for GDPR compliance

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

1. **WhatsApp messages not being sent**
   - Check if `WHATSAPP_NOTIFICATIONS_ENABLED=true`
   - Verify `ZAPTRA_API_TOKEN` is correct
   - Check `/api/whatsapp/health` endpoint

2. **Invalid phone number errors**
   - Ensure phone numbers are in international format (+91xxxxxxxxxx)
   - Check phone number validation logic

3. **API timeout errors**
   - Increase `WHATSAPP_TIMEOUT_MS` value
   - Check Zaptra API status

4. **Circuit breaker activated**
   - Check recent error logs
   - Wait for circuit breaker to reset (1 minute)
   - Investigate root cause of failures
