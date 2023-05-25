const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const HASURA_ROUTER = express.Router();

HASURA_ROUTER.post('/create-channels', async (req, res) => {
  console.log(req.url);
  const { name } = req.body;
  console.log(name);

  return res.status(200).send('OK');
});

module.exports = HASURA_ROUTER;
