const express = require('express');
const dotenv = require('dotenv');
const { MessageEmbed, Permissions } = require('discord.js');
const axios = require('axios');

const { discordLogger } = require('../utils/logger');
const { trimString } = require('../utils/helpers');
const { SECRETS } = require('../config');
const { getUserbyUsername } = require('../lib/users');
const {
  rolesHasuraToDiscord,
  PROJECT_TYPE_MAP,
  BUDGET_RANGE_MAP,
  SERVICES_MAP,
  SKILL_MAP,
  SKILL_TYPE_MAP,
  AVAILABILITY_MAP,
} = require('../utils/constants');

dotenv.config();

const HASURA_ROUTER = express.Router();

HASURA_ROUTER.post('/cohort-submission', async (req, res) => {
  const { id } = req.body;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    discordLogger('ERROR: missing envs.');
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET env variables',
    );
  }

  if (!id) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing id');
  }

  try {
    const query = `
      query ApplicationQuery {
        applications(where: {id: {_eq: "${id}"}}) {
          name
          contact_info {
            discord
            twitter
          }
          applications_skills {
            skill_type_key
            skill_key
          }
          technical_skill_type_key
          crypto_experience
          availability_key
          introduction
          learning_goals
          passion
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR');
    }

    const application = response.data.data.applications[0];

    const name = application.name;
    const discord = application.contact_info.discord;
    const twitter = application.contact_info.twitter;
    const classType = SKILL_TYPE_MAP[application.technical_skill_type_key];
    const bio = application.introduction;
    const goals = application.learning_goals;
    const passion = application.passion;
    const cryptoExp = application.crypto_experience;
    const primarySkills = application.applications_skills
      .filter(skill => skill.skill_type_key === 'PRIMARY')
      .map(skill => SKILL_MAP[skill.skill_key]);
    const availability = AVAILABILITY_MAP[application.availability_key];

    const embed = new MessageEmbed()
      .setColor('#ff3864')
      .setTitle('New Application')
      .setAuthor(name)
      .addFields(
        {
          name: 'Discord',
          value: discord || 'N/A',
        },
        {
          name: 'Twitter',
          value: twitter || 'N/A',
        },
        {
          name: 'Class Type',
          value: classType,
        },
        {
          name: 'Bio',
          value: trimString(bio, 1024),
        },
        {
          name: 'Goals',
          value: trimString(goals, 1024),
        },
        {
          name: 'Passion',
          value: trimString(passion, 1024),
        },
        {
          name: 'Experience in Crypto',
          value: cryptoExp.toString(),
        },
        {
          name: 'Primary Skills',
          value: primarySkills.join(', '),
        },
        {
          name: 'Availability',
          value: availability,
        },
      )
      .setTimestamp();

    req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.cache.get(SECRETS.COHORT_SUBMISSIONS_CHANNEL_ID)
      .send({ embeds: [embed] });

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error sending new cohort application notification.');
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/consultation-submission', async (req, res) => {
  const { id } = req.body;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    discordLogger('ERROR: missing envs.');
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET env variables',
    );
  }

  if (!id) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing id');
  }

  try {
    const query = `
      query ConsultationQuery {
        consultations(where: {id: {_eq: "${id}"}}) {
          name
          link
          project_type {
            project_type
          }
          consultations_services_required {
            guild_service_key
          }
          budget_key
          consultations_contacts {
            contact {
              name
              contact_info {
                discord
              }
            }
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR');
    }

    const consultation = response.data.data.consultations[0];

    const projectName = consultation.name;
    const name = consultation.consultations_contacts[0].contact.name;
    const projectType =
      PROJECT_TYPE_MAP[consultation.project_type.project_type];
    const projectLink = consultation.link;
    const budgetRange = BUDGET_RANGE_MAP[consultation.budget_key];
    const services = consultation.consultations_services_required.map(
      service => SERVICES_MAP[service.guild_service_key],
    );
    const discord =
      consultation.consultations_contacts[0].contact.contact_info.discord;

    const embed = new MessageEmbed()
      .setColor('#ff3864')
      .setTitle(projectName)
      .setAuthor(name)
      .setURL(`https://dm.raidguild.org/consultations/${id}`)
      .addFields(
        {
          name: 'Project Type',
          value: projectType,
        },
        {
          name: 'Specs Link',
          value: projectLink || 'None Provided',
        },

        {
          name: 'Budget Range',
          value: budgetRange,
        },
        {
          name: 'Services Required',
          value: services.join(', '),
        },
        {
          name: 'Discord',
          value: discord || 'Not Provided',
        },
      )
      .setTimestamp();

    await req.CLIENT.guilds.cache
      .get(SECRETS.GUILD_ID)
      .channels.cache.get(SECRETS.CLIENT_SUBMISSION_CHANNEL_ID)
      .send({ embeds: [embed] });

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('Error sending new consultation application notification.');
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/create-channels', async (req, res) => {
  const { name, id } = req.body;
  const botId = req.CLIENT.user.id;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    discordLogger('ERROR: missing envs.');
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR');
    }

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('ERROR: issue creating new raid channels.');
    return res.json('ERROR: Issue creating new raid channels');
  }
});

HASURA_ROUTER.post('/cleric-added', async (req, res) => {
  const { cleric_id, raid_channel_id } = req.body;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!cleric_id || !raid_channel_id) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing cleric_id or raid_channel_id');
  }

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    discordLogger('ERROR: missing envs.');
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR');
    }

    let clericDiscordUsername =
      response.data.data.members[0].contact_info.discord.split('#')[0];

    if (clericDiscordUsername.includes('@')) {
      clericDiscordUsername = clericDiscordUsername.split('@')[1];
    }

    const clericDiscordUser = await getUserbyUsername(
      clericDiscordUsername,
      req.CLIENT,
    );

    if (!clericDiscordUser) {
      discordLogger('ERROR: could not find cleric in discord.');
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
    discordLogger('ERROR: missing request data.');
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR');
    }

    const { name } = response.data.data.raids[0];

    const whoIsAvailableChannel = req.CLIENT.channels.cache.get(
      WHO_IS_AVAILABLE_CHANNEL_ID,
    );

    const roleDiscordId = rolesHasuraToDiscord[role];

    if (!roleDiscordId) {
      discordLogger('ERROR: could not find role ID in discord.');
      return res.json('ERROR: Could not find role ID in discord');
    }

    await whoIsAvailableChannel.send(
      `The role <@&${roleDiscordId}> is needed for "${name}"\n\nPlease reach out to the Cleric to join the raid party.\n\nView raid details [here](https://dm.raidguild.org/raids/${raid_id})`,
      { embeds: [] },
    );

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('ERROR: issue sending new role required notification.');
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/raider-added', async (req, res) => {
  const { member_id, raid_id } = req.body;
  const { HASURA_GRAPHQL_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } = SECRETS;

  if (!member_id || !raid_id) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing member_id or raid_id');
  }

  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_GRAPHQL_ADMIN_SECRET) {
    discordLogger('ERROR: missing envs.');
    return res.json(
      'ERROR: Missing HASURA_GRAPHQL_ENDPOINT or HASURA_GRAPHQL_ADMIN_SECRET env variables',
    );
  }

  try {
    const query = `
      query RaidQuery {
        raids(where: {id: {_eq: "${raid_id}"}}) {
          raid_channel_id
        }
        members(where: {id: {_eq: "${member_id}"}}) {
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
      discordLogger('ERROR: issue querying DM API.');
      return res.json('ERROR: Issue querying DM API');
    }

    const { raid_channel_id } = response.data.data.raids[0];
    const {
      contact_info: { discord },
    } = response.data.data.members[0];

    let raiderDiscordUsername = discord.split('#')[0];

    if (raiderDiscordUsername.includes('@')) {
      raiderDiscordUsername = raiderDiscordUsername.split('@')[1];
    }

    const raiderDiscordUser = await getUserbyUsername(
      raiderDiscordUsername,
      req.CLIENT,
    );

    if (!raiderDiscordUser) {
      discordLogger('ERROR: Could not find raider in discord.');
      return res.json('ERROR: Could not find raider in discord');
    }

    const raidChannel = req.CLIENT.channels.cache.get(raid_channel_id);
    await raidChannel.send(
      `A new raider has been added to the party: <@${raiderDiscordUser.id}>`,
    );

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger(
      'ERROR: issue notifying raid channel about new raider in party.',
    );
    return res.json('ERROR');
  }
});

HASURA_ROUTER.post('/status-updated', async (req, res) => {
  const { id, status_key, raid_channel_id } = req.body;

  if (!id || !status_key || !raid_channel_id) {
    discordLogger('ERROR: missing request data.');
    return res.json('ERROR: Missing id or status_key or raid_channel_id');
  }

  try {
    const raidChannel = req.CLIENT.channels.cache.get(raid_channel_id);
    await raidChannel.send(
      `The status of this [raid](https://dm.raidguild.org/raids/${id}) has been updated to: ${status_key}`,
      { embeds: [] },
    );

    return res.json('SUCCESS');
  } catch (err) {
    console.log(err);
    discordLogger('ERROR: issue sending raid status update notification.');
    return res.json('ERROR');
  }
});

module.exports = HASURA_ROUTER;
