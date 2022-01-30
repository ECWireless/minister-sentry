const dotenv = require('dotenv');

const createServer = require('../server');

const { setDiscordClient } = require('../utils/logger');

dotenv.config();

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);

    setDiscordClient(client);

    createServer();
  }
};
