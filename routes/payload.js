const express = require('express');
const Discord = require('discord.js');

const { discordLogger } = require('../utils/logger');
const { SECRETS } = require('../config');

const PAYLOAD_ROUTER = express.Router();

PAYLOAD_ROUTER.post('/', (req, res) => {
  const { html_url, title } = req.body.issue;
  const { name } = req.body.label;
  const { LIBRARY_CHANNEL_ID, OPS_CHANNEL_ID } = SECRETS;

  if (!html_url || !title || !name) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing html_url or title or name');
  }

  if (!LIBRARY_CHANNEL_ID || !OPS_CHANNEL_ID) {
    discordLogger('ERROR: missing envs.');
    return res.json(
      'ERROR: Missing LIBRARY_CHANNEL_ID or OPS_CHANNEL_ID env variables',
    );
  }

  try {
    if (req.body.action === 'labeled') {
      if (name === 'apprentice-issue') {
        const embed = new Discord.MessageEmbed()
          .setColor('#ff3864')
          .setTitle(title)
          .setURL(html_url)
          .setAuthor('Issue Alert for Apprentice')
          .setTimestamp();

        req.CLIENT.guilds.cache
          .get(SECRETS.GUILD_ID)
          .channels.cache.get(SECRETS.LIBRARY_CHANNEL_ID)
          .send({ embeds: [embed] });
      }

      if (name === 'proposal') {
        const embed = new Discord.MessageEmbed()
          .setColor('#ff3864')
          .setTitle(title)
          .setURL(html_url)
          .setAuthor('RIP Proposal Alert')
          .setTimestamp();

        req.CLIENT.guilds.cache
          .get(SECRETS.GUILD_ID)
          .channels.cache.get(SECRETS.OPS_CHANNEL_ID)
          .send({ embeds: [embed] });
      }
    }

    return res.send('Received');
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in proposal alert.');
    return res.send('Error');
  }
});

module.exports = PAYLOAD_ROUTER;
