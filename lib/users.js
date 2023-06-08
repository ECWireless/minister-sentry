const { SECRETS } = require('../config');

const getUserbyUsername = async (username, client) => {
  const members = await client.guilds.cache
    .get(SECRETS.GUILD_ID)
    .members.fetch();

  return members.find(member => {
    return member.user.username === username;
  });
};

module.exports = { getUserbyUsername };
