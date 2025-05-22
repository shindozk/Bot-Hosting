// events/ready.js
const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Bot iniciado como ${client.user.tag}`);
    
    // Define o status do bot
    client.user.setPresence({
      activities: [{ name: 'Docker containers', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
