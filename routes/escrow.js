const express = require('express');
const Discord = require('discord.js');

const { initAirtableClient } = require('../config');
const { discordLogger } = require('../utils/logger');
const { SECRETS } = require('../config');

require('dotenv').config();

const raids_v2_table = initAirtableClient();

const ESCROW_ROUTER = express.Router();

ESCROW_ROUTER.post('/validate-raid', async (req, res) => {
  try {
    if (req.body.ID === '') res.json('NOT_FOUND');

    const result = await raids_v2_table
      .select({
        filterByFormula: `{Raid ID} = '${req.body.ID}'`,
      })
      .firstPage();

    if (result.length === 0) res.json('NOT_FOUND');

    res.json(result[0].fields);
  } catch (err) {
    if (err.error === 'NOT_FOUND') {
      console.log(err);
      discordLogger('Error caught in validate-raid route.');
      res.json(err.error);
    }
  }
});

ESCROW_ROUTER.post('/update-raid', async (req, res) => {
  try {
    const { ID, Hash, Index } = req.body;
    const data = {
      'Locker Hash': Hash,
      'Escrow Index': Index,
    };

    await raids_v2_table.update(ID, data);
    res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in update-raid route.');
    res.json('ERROR');
  }
});

ESCROW_ROUTER.post('/update-invoice', async (req, res) => {
  try {
    const { ID, Hash, Index } = req.body;
    const data = {
      'Locker Hash': Hash,
      'Invoice ID': Index,
    };

    const recordToUpdate = await raids_v2_table
      .select({
        filterByFormula: `{Raid ID} = '${ID}'`,
      })
      .firstPage();

    const refId = recordToUpdate[0].fields['Ref ID'];
    await raids_v2_table.update(refId, data);

    res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in update-invoice route.');
    res.json('ERROR');
  }
});

ESCROW_ROUTER.post('/notify-spoils', async (req, res) => {
  const { token, raidPartyShare, guildShare, txLink } = req.body;

  try {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff3864')
      .setTitle('Spoils Alert')
      .setURL(txLink)
      .addFields(
        {
          name: 'Guild Spoils',
          value: `${guildShare} ${token}`,
        },
        {
          name: 'Raid Party Share',
          value: `${raidPartyShare} ${token}`,
        },
      );

    req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.cache.get(SECRETS.SMART_ESCROW_CHANNEL_ID)
      .send({ embeds: [embed] });

    res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error caught in notify-spoils route.');
    res.json('ERROR');
  }
});

module.exports = ESCROW_ROUTER;
