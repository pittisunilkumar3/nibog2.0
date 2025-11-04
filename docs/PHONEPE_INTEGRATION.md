# PhonePe Payment Gateway Integration

This document explains how to set up and configure the PhonePe payment gateway integration for the NIBOG application.

## Environment Configuration

The PhonePe integration uses environment variables to securely store merchant credentials. These variables can be configured in either `.env` (for production) or `.env.local` (for development).

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PHONEPE_MERCHANT_ID` | Your PhonePe merchant ID | `NIBOGONLINE` |
| `PHONEPE_SALT_KEY` | Your PhonePe salt key | `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399` |
| `PHONEPE_SALT_INDEX` | Your PhonePe salt index | `1` |
| `PHONEPE_IS_TEST_MODE` | Whether to use test mode | `true` or `false` |

### Setting Up Environment Variables

1. **For Development:**
   - Copy `.env.example` to `.env.local`
   - Fill in your PhonePe merchant credentials
   - Set `PHONEPE_IS_TEST_MODE=true`

2. **For Production:**
   - Copy `.env.example` to `.env`
   - Fill in your PhonePe merchant credentials
   - Set `PHONEPE_IS_TEST_MODE=false`

### Client-Side Access (If Needed)

If you need to access any environment variables directly in the browser, prefix them with `NEXT_PUBLIC_`:

```
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
```

## PhonePe Merchant Account Setup

To use the PhonePe payment gateway, you need to:

1. **Register as a PhonePe merchant:**
   - Visit [PhonePe Business](https://business.phonepe.com/)
   - Sign up for a merchant account
   - Complete the verification process

2. **Get your merchant credentials:**
   - Merchant ID
   - Salt Key
   - Salt Index

3. **Configure callback URLs:**
   - Login to your PhonePe merchant dashboard
   - Navigate to the API settings
   - Add your callback URL: `https://your-domain.com/api/payments/phonepe-callback`
   - Add your redirect URL: `https://your-domain.com/payment-callback`

## Testing the Integration

### Test Mode

When `PHONEPE_IS_TEST_MODE=true`, the application will use PhonePe's sandbox environment:

- API Base URL: `https://api-preprod.phonepe.com/apis/pg-sandbox/`
- Test Cards: [PhonePe Test Cards Documentation](https://developer.phonepe.com/docs/test-cards)

### Test Credentials

For testing, you can use the following credentials:

- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### Verifying Payments

To verify that payments are working correctly:

1. Make a test payment
2. Check the payment status in the PhonePe merchant dashboard
3. Verify that the callback is received and processed correctly
4. Confirm that the booking status is updated accordingly

## Troubleshooting

### Common Issues

1. **Callback not received:**
   - Verify that your callback URL is correctly registered with PhonePe
   - Check server logs for any errors in processing the callback

2. **Payment initiation fails:**
   - Verify that your merchant credentials are correct
   - Check that the X-VERIFY header is being generated correctly

3. **Redirect not working:**
   - Ensure that the redirect URL is correctly formatted
   - Check that the URL is registered with PhonePe

### Logs

For debugging, check the following logs:

- Server logs for API route errors
- Browser console logs for client-side errors
- PhonePe merchant dashboard for payment status

## Going Live

When you're ready to go live:

1. Update your `.env` file with production credentials
2. Set `PHONEPE_IS_TEST_MODE=false`
3. Verify that all callbacks and redirects are configured for your production domain
4. Perform a test transaction to ensure everything works correctly

## Support

For issues with the PhonePe integration:

- PhonePe Merchant Support: [https://business.phonepe.com/support](https://business.phonepe.com/support)
- PhonePe Developer Documentation: [https://developer.phonepe.com/docs](https://developer.phonepe.com/docs)
