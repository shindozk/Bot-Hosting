// Evento ready - Executado quando o bot está pronto
const { Events, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Bot iniciado como ${client.user.tag}`);
    
    // Definir status do bot
    client.user.setPresence({
      activities: [{ name: 'Docker containers', type: ActivityType.Watching }],
      status: 'online',
    });
    
    // Registrar comandos slash
    try {
      console.log('Iniciando registro de comandos slash...');
      
      const commands = [];
      const commandsPath = path.join(__dirname, '..', 'commands');
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command) {
          commands.push(command.data.toJSON());
        } else {
          console.log(`[AVISO] O comando em ${filePath} não tem a propriedade "data" necessária.`);
        }
      }
      
      const rest = new REST({ version: '10' }).setToken(client.config.token);
      
      await rest.put(
        Routes.applicationCommands(client.config.clientId),
        { body: commands },
      );
      
      console.log(`${commands.length} comandos slash registrados com sucesso!`);
    } catch (error) {
      console.error('Erro ao registrar comandos slash:', error);
    }
  }
};
