/**
 * M-Pesa Payment Configuration
 *
 * Configure your M-Pesa API credentials here.
 * Get your credentials from Safaricom Daraja API portal.
 */

module.exports = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  shortCode: process.env.MPESA_SHORTCODE || '',
  passkey: process.env.MPESA_PASSKEY || '',
  // Callback URL that Safaricom will hit after STK push completes.
  // Default points to the payments callback route this project exposes.
  callbackURL: process.env.MPESA_CALLBACK_URL || 'http://localhost:5000/api/payments/callback',
  
  // API Endpoints
  endpoints: {
    oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    // Optional: B2C endpoint for Business to Customer payments (payouts)
    b2c: process.env.MPESA_B2C_ENDPOINT || '',
    queryStatus: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
  },
  b2cResultUrl: process.env.MPESA_B2C_RESULT_URL || '',
  b2cTimeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || '',
  initiatorName: process.env.MPESA_INITIATOR_NAME || '',
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
  
  // Commission rate (20% platform fee)
  platformCommission: 0.20
};
