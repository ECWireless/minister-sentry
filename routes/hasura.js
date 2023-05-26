const express = require('express');
const dotenv = require('dotenv');
const { MessageEmbed, Permissions } = require('discord.js');

const { discordLogger } = require('../utils/logger');
const { SECRETS } = require('../config');

dotenv.config();

const HASURA_ROUTER = express.Router();

HASURA_ROUTER.post('/create-channels', async (req, res) => {
  const { name, id } = req.body;
  const botId = req.CLIENT.user.id;

  try {
    // creating standard raid channel permissions
    let channelPermissions = [
      {
        id: SECRETS.GUILD_ID,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      {
        id: botId,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      {
        id: SECRETS.MEMBER_ROLE_ID,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      },
    ];

    const createdExternalCampChannel = await req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.create(name, {
        type: 'GUILD_TEXT',
        parent: SECRETS.CAMPS_CATEGORY_ID,
        permissionOverwrites: channelPermissions,
      });

    const createdInternalRaidChannel = await req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.create(`raid-${name}`, {
        type: 'GUILD_TEXT',
        parent: SECRETS.RAIDS_CATEGORY_ID,
        permissionOverwrites: channelPermissions,
      });

    const embed = new MessageEmbed()
      .setColor('#ff3864')
      .setTitle(`New raid: ${name}`)
      .setDescription(
        `New raid created!

        View details at https://dm.raidguild.org/raids/${id}

        External camp channel: <#${createdExternalCampChannel.id}>
        Internal raid channel: <#${createdInternalRaidChannel.id}>`,
      );

    const announcementChannel = req.CLIENT.channels.cache.get(
      SECRETS.HQ_ANNOUNCEMENTS_CHANNEL_ID,
    );

    await announcementChannel.send({ embeds: [embed] });

    res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error creating new raid channels.');
    res.json('ERROR');
  }
});

module.exports = HASURA_ROUTER;
