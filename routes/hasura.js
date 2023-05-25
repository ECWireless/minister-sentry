const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const HASURA_ROUTER = express.Router();

HASURA_ROUTER.post('/create-channels', async (req, res) => {
  console.log('create-channels');
  const { event } = req.body;
  console.log(event?.data?.new);

  return res.status(200).send('OK');
});

module.exports = HASURA_ROUTER;
