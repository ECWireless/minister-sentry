let discordClient = '';

const setDiscordClient = (_client) => {
  discordClient = _client;
};

const discordLogger = (_msg) => {
  if (discordClient) {
    try {
      discordClient.guilds.cache
        .get(process.env.GUILD_ID)
        .channels.cache.get(process.env.COMMAND_CENTER_ID)
        .send({ content: _msg });
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = {
  setDiscordClient,
  discordLogger
};
