const express = require('express');
const Discord = require('discord.js');
const dotenv = require('dotenv');

const { initPgClient } = require('../config');
const { discordLogger } = require('../utils/logger');
const { SECRETS } = require('../config');

dotenv.config();

const client = initPgClient();
client.connect();

const HIREUS_V2_ROUTER = express.Router();

HIREUS_V2_ROUTER.post('/awaiting-raids', async (req, res) => {
  try {
    const { rows } = await client.query(
      `SELECT * FROM raids_v2 WHERE raid_status IS NULL`
    );
    return res.json(rows);
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in awaiting-raids route.');
    return res.json(err);
  }
});

HIREUS_V2_ROUTER.post('/submission', async (req, res) => {
  let { selectedDay } = req.body;

  if (selectedDay === '') {
    selectedDay = new Date().toLocaleDateString();
  } else {
    selectedDay = new Date(selectedDay).toLocaleDateString();
  }

  try {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff3864')
      .setTitle(req.body.project_name)
      .setURL(
        `https://blockscout.com/xdai/mainnet/tx/${req.body.submission_hash}`
      )
      .setAuthor(req.body.name)
      .addFields(
        {
          name: 'Project Type',
          value: req.body.project_type
        },
        {
          name: 'Specs Link',
          value: req.body.project_link || 'None Provided'
        },

        {
          name: 'Budget Range',
          value: req.body.budget_range
        },
        {
          name: 'Services Required',
          value: req.body.services_needed.toString()
        },
        {
          name: 'Discord',
          value: req.body.discord || 'Not Provided'
        }
      )
      .setTimestamp();

    req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.cache.get(SECRETS.CLIENT_SUBMISSION_CHANNEL_ID)
      .send({ embeds: [embed] });

    res.send('success');
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in posting client submission notification.');
  }
});

module.exports = HIREUS_V2_ROUTER;
