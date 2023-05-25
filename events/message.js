const anonymousSuggestion = require('../features/anonymous-suggestions');
const { discordLogger } = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    try {
      if (message.channel.type === 'DM') {
        anonymousSuggestion(message);
      }
    } catch (err) {
      console.log(err);
      discordLogger('Error caught in message event.');
    }
  },
};
