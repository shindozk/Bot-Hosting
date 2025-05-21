// Comando ping - Verifica latência e estado do sistema
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkDockerStatus, getSystemInfo } = require('../docker/dockerManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica latência e estado do sistema'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    await interaction.deferReply();
    
    const sent = await interaction.fetchReply();
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    
    // Verificar estado do Docker
    const dockerStatus = await checkDockerStatus();
    
    // Obter uso do sistema
    const systemInfo = await getSystemInfo();
    
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'ping_title'))
      .setDescription(client.getText(userId, 'ping_description'))
      .setColor('#0099ff')
      .addFields(
        { 
          name: client.getText(userId, 'ping_latency'), 
          value: `${ping}ms`, 
          inline: true 
        },
        { 
          name: client.getText(userId, 'ping_api_latency'), 
          value: `${Math.round(client.ws.ping)}ms`, 
          inline: true 
        },
        { 
          name: client.getText(userId, 'ping_docker_status'), 
          value: dockerStatus ? '🟢 Online' : '🔴 Offline', 
          inline: true 
        },
        { 
          name: client.getText(userId, 'ping_system_cpu'), 
          value: `${systemInfo.cpu.usage}%`, 
          inline: true 
        },
        { 
          name: client.getText(userId, 'ping_system_memory'), 
          value: `${systemInfo.memory.used}GB / ${systemInfo.memory.total}GB`, 
          inline: true 
        },
        { 
          name: client.getText(userId, 'ping_system_uptime'), 
          value: systemInfo.uptime, 
          inline: true 
        }
      )
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
};