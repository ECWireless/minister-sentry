const { Intents, Client } = require('discord.js');
const fs = require('fs');

const { SECRETS } = require('./config');

// initialize discord client
const client = new Client({
  partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_INVITES,
  ],
});

// creating events reader
const eventFiles = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'));
eventFiles.forEach(file => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

client.login(SECRETS.TOKEN);
