const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const HASURA_ROUTER = express.Router();

JOINUS_ROUTER.post('/create-channels', async (req, res) => {
  console.log('create-channels');
  console.log(req.body);
});

module.exports = HASURA_ROUTER;
