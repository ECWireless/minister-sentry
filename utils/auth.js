const crypto = require('crypto');

const { SECRETS } = require('../config');

const verifySignature = req => {
  const signature = crypto
    .createHmac('sha256', SECRETS.WEBHOOK_API_TOKEN)
    .update(JSON.stringify(req.body))
    .digest('hex');

  console.log('signature', `sha256=${signature}`);
  const signature2 = req.headers['x-hub-signature-256'];
  console.log('x-hub-signature-256', signature2);
  const signature3 = req.headers.get('x-hub-signature-256');
  console.log('x-hub-signature-256', signature3);
  return `sha256=${signature}` === req.headers.get('x-hub-signature-256');
};

module.exports = {
  verifySignature,
};
