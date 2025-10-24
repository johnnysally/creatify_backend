const axios = require('axios');
const mpesaConfig = require('../config/mpesa.config');

async function getAccessToken() {
  if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }

  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  const resp = await axios.get(mpesaConfig.endpoints.oauth, { headers: { Authorization: `Basic ${auth}` } });
  return resp.data.access_token;
}

async function stkPush(payload) {
  const token = await getAccessToken();
  const resp = await axios.post(mpesaConfig.endpoints.stkPush, payload, { headers: { Authorization: `Bearer ${token}` } });
  return resp.data;
}

async function b2cPayment(payload) {
  if (!mpesaConfig.endpoints || !mpesaConfig.endpoints.b2c) {
    throw new Error('B2C endpoint not configured');
  }
  const token = await getAccessToken();
  const resp = await axios.post(mpesaConfig.endpoints.b2c, payload, { headers: { Authorization: `Bearer ${token}` } });
  return resp.data;
}

module.exports = { getAccessToken, stkPush, b2cPayment };
