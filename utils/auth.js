const crypto = require('crypto');

const { SECRETS } = require('./config');

const verifySignature = req => {
  const signature = crypto
    .createHmac('sha256', SECRETS.WEBHOOK_API_TOKEN)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return `sha256=${signature}` === req.headers.get('x-hub-signature-256');
};

module.exports = {
  verifySignature,
};
