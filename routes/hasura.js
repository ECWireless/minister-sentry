const express = require('express');
const dotenv = require('dotenv');
const { MessageEmbed, Permissions } = require('discord.js');
const axios = require('axios');

const { discordLogger } = require('../utils/logger');
const { SECRETS } = require('../config');
const { getUserbyUsername } = require('../lib/users');
const { rolesHasuraToDiscord } = require('../utils/constants');

dotenv.config();

const HASURA_ROUTER = express.Router();

HASURA_ROUTER.post('/create-channels', async (req, res) => {
  const { name, id } = req.body;
  const botId = req.CLIENT.user.id;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET env variables',
    );
  }

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

    const mutation = `
      mutation RaidMutation {
        update_raids(where: { id: { _eq: "${id}"}}, _set: { raid_channel_id: "${createdInternalRaidChannel.id}"}) {
          returning {
            raid_channel_id
          }
        }
      }
    `;

    const headers = {
      'x-hasura-admin-secret': SECRETS.HASURA_GRAPHQL_ADMIN_SECRET,
    };

    const embed = new MessageEmbed()
      .setColor('#ff3864')
      .setTitle(`New Raid: ${name}`)
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

    const response = await axios({
      url: SECRETS.HASURA_GRAPHQL_ENDPOINT,
      method: 'post',
      headers,
      data: {
        query: mutation,
      },
    });

    if (response.data.errors) {
      console.log(response.data.errors);
      res.json('ERROR');
      return;
    }

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error creating new raid channels.');
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/cleric-added', async (req, res) => {
  const { cleric_id, raid_channel_id } = req.body;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!cleric_id || !raid_channel_id) {
    return res.json('ERROR: Missing cleric_id or raid_channel_id');
  }

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET env variables',
    );
  }

  try {
    const query = `
      query MemeberQuery {
        members(where: {id: {_eq: "${cleric_id}"}}) {
          contact_info {
            discord
          }
        }
      }
    `;

    const headers = {
      'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
    };

    const response = await axios({
      url: HASURA_GRAPHQL_ENDPOINT,
      method: 'post',
      headers,
      data: {
        query,
      },
    });

    if (response.data.errors) {
      console.log(response.data.errors);
      res.json('ERROR');
      return;
    }

    const clericDiscordUsername =
      response.data.data.members[0].contact_info.discord.split('#')[0];

    const clericDiscordUser = await getUserbyUsername(
      clericDiscordUsername,
      req.CLIENT,
    );

    if (!clericDiscordUser) {
      return res.json('ERROR: Could not find cleric in discord');
    }

    const raidChannel = req.CLIENT.channels.cache.get(raid_channel_id);
    await raidChannel.send(
      `New cleric added to raid: <@${clericDiscordUser.id}>`,
    );

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error sending new cleric notification.');
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/role-added', async (req, res) => {
  const { role, raid_id } = req.body;
  const {
    HASURA_GRAPHQL_ENDPOINT,
    HASURA_GRAPHQL_ADMIN_SECRET,
    WHO_IS_AVAILABLE_CHANNEL_ID,
  } = SECRETS;

  if (!role || !raid_id) {
    return res.json('ERROR: Missing role or raid_id');
  }

  if (
    !HASURA_GRAPHQL_ENDPOINT ||
    !HASURA_GRAPHQL_ADMIN_SECRET ||
    !WHO_IS_AVAILABLE_CHANNEL_ID
  ) {
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET or WHO_IS_AVAILABLE_CHANNEL_ID env variables',
    );
  }

  try {
    const query = `
      query RaidQuery {
        raids(where: {id: {_eq: "${raid_id}"}}) {
          name
        }
      }
    `;

    const headers = {
      'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
    };

    const response = await axios({
      url: HASURA_GRAPHQL_ENDPOINT,
      method: 'post',
      headers,
      data: {
        query,
      },
    });

    if (response.data.errors) {
      console.log(response.data.errors);
      return res.json('ERROR');
    }

    const { name } = response.data.data.raids[0];

    const whoIsAvailableChannel = req.CLIENT.channels.cache.get(
      WHO_IS_AVAILABLE_CHANNEL_ID,
    );

    const roleDiscordId = rolesHasuraToDiscord[role];

    if (!roleDiscordId) {
      return res.json('ERROR: Could not find role ID in discord');
    }

    await whoIsAvailableChannel.send(
      `The role <@${roleDiscordId}> is needed for "${name}"\n\nPlease reach out to the Cleric to join the raid party.\n\nView raid details at https://dm.raidguild.org/raids/${raid_id}`,
    );

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error sending new role required notification.');
    return res.json('ERROR');
  }
});

module.exports = HASURA_ROUTER;
