const db = require('../models');
const axios = require('axios');
const mpesaConfig = require('../config/mpesa.config');
const mpesa = require('../utils/mpesa');

// Initiate STK Push
exports.initiateStkPush = async (req, res) => {
  try {
    const { amount, phoneNumber, itemId, itemTitle, creatorId } = req.body;
    const buyerId = req.user.id;

    const totalAmount = parseFloat(amount);
    const platformCommission = totalAmount * mpesaConfig.platformCommission;
    const creatorAmount = totalAmount - platformCommission;

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    const password = Buffer.from(
      `${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`
    ).toString('base64');

    const stkPushData = {
      BusinessShortCode: mpesaConfig.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(totalAmount),
      PartyA: phoneNumber,
      PartyB: mpesaConfig.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: mpesaConfig.callbackURL,
      AccountReference: `CreativeHub-${itemId}`,
      TransactionDesc: `Payment for ${itemTitle}`,
    };

    const response = await mpesa.stkPush(stkPushData);

    const payment = await db.Payment.create({
      transactionId: response.data.CheckoutRequestID,
      buyerId,
      creatorId,
      amount: totalAmount,
      creatorAmount,
      platformCommission,
      phoneNumber,
      status: 'pending',
      itemId,
      itemTitle,
    });

    res.json({
      success: true,
      message: 'STK push sent successfully',
      data: {
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        paymentId: payment.id,
      },
    });
  } catch (error) {
    console.error('STK Push error:', error);
    res.status(500).json({
      error: 'Failed to initiate payment',
      message: error.message,
    });
  }
};

// M-Pesa callback handler (stub / safe handler)
exports.mpesaCallback = async (req, res) => {
  // The real implementation should process the M-Pesa callback payload.
  // For now return 200 to acknowledge receipt.
  try {
    console.log('Received MPesa callback');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('MPesa callback error:', err);
    res.status(500).json({ error: 'Callback processing failed' });
  }
};

// Query payment status (stub)
exports.queryPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  res.status(200).json({ data: { paymentId, status: 'unknown' } });
};

// Commission stats (stub)
exports.getCommissionStats = async (req, res) => {
  res.json({ data: { totalCommission: 0 } });
};

// Creator earnings (stub)
exports.getCreatorEarnings = async (req, res) => {
  res.json({ data: { earnings: 0 } });
};

// Withdraw earnings (stub)
exports.withdrawEarnings = async (req, res) => {
  res.status(501).json({ error: 'Withdraw not implemented' });
};

// Get payout account (stub)
exports.getPayoutAccount = async (req, res) => {
  res.json({ data: null });
};

// Save/update payout account (stub)
exports.savePayoutAccount = async (req, res) => {
  res.status(201).json({ success: true });
};

// Get payout (transaction) history (stub)
exports.getPayoutHistory = async (req, res) => {
  res.json({ data: [] });
};

// Handler for Daraja B2C result webhook
exports.mpesaB2cResult = async (req, res) => {
  try {
    console.log('Received MPesa B2C result:', req.body);
    // In production this should update payout/transaction records.
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('MPesa B2C result error:', err);
    res.status(500).json({ error: 'Failed to process B2C result' });
  }
};

// Admin-triggered B2C payout (stub)
exports.adminB2cPayout = async (req, res) => {
  // This endpoint would normally trigger a B2C payout via MPesa.
  res.status(501).json({ error: 'Admin B2C payout not implemented' });
};
