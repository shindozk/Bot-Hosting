// Comando app - Gerencia bots hospedados
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { getUserContainers } = require('../utils/userManager');
const { refreshBotPanel } = require('../events/interactionCreate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('app')
    .setDescription('Gerencia seus bots hospedados'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Obter containers do usuário
    const userContainers = getUserContainers(client.db, userId);
    
    // Verificar se o usuário tem bots hospedados
    if (userContainers.length === 0) {
      return interaction.reply({
        content: client.getText(userId, 'cmd_app_no_bots'),
        ephemeral: true
      });
    }
    
    // Criar embed com lista de bots
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'cmd_app_title'))
      .setDescription(client.getText(userId, 'cmd_app_description'))
      .setColor('#0099ff')
      .setFooter({ 
        text: client.getText(userId, 'cmd_app_footer', { count: userContainers.length }) 
      });
    
    // Criar opções para o select menu
    const options = [];
    for (const container of userContainers) {
      try {
        const botInfo = await client.users.fetch(container.botId);
        options.push({
          label: botInfo.username || `Bot ${container.botId}`,
          description: `Status: ${container.status} | RAM: ${container.ram}MB`,
          value: container.containerId
        });
      } catch (error) {
        options.push({
          label: `Bot ${container.botId}`,
          description: `Status: ${container.status} | RAM: ${container.ram}MB`,
          value: container.containerId
        });
      }
    }
    
    // Criar select menu
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_bot')
        .setPlaceholder(client.getText(userId, 'cmd_app_description'))
        .addOptions(options)
    );
    
    // Enviar resposta
    await interaction.reply({ 
      embeds: [embed], 
      components: [row], 
      ephemeral: true 
    });
  }
};
