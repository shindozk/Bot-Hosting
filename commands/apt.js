// Comando apt - Instala pacotes adicionais em um container Ubuntu
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { getUserContainers } = require('../utils/userManager');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apt')
    .setDescription('Instala pacotes adicionais em um container Ubuntu')
    .addStringOption(option => 
      option.setName('pacotes')
        .setDescription('Nome dos pacotes a serem instalados (separados por espaço)')
        .setRequired(true)),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    const packages = interaction.options.getString('pacotes');
    
    await interaction.deferReply({ ephemeral: true });
    
    // Obter containers do usuário
    const userContainers = getUserContainers(client.db, userId);
    
    // Verificar se o usuário tem bots hospedados
    if (userContainers.length === 0) {
      return interaction.editReply(client.getText(userId, 'cmd_app_no_bots'));
    }
    
    // Criar opções para o select menu
    const options = [];
    for (const container of userContainers) {
      try {
        const botInfo = await client.users.fetch(container.botId);
        options.push({
          label: botInfo.username || `Bot ${container.botId}`,
          description: `Status: ${container.status}`,
          value: container.containerId
        });
      } catch (error) {
        options.push({
          label: `Bot ${container.botId}`,
          description: `Status: ${container.status}`,
          value: container.containerId
        });
      }
    }
    
    // Criar select menu
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`apt_install_${packages}`)
        .setPlaceholder(client.getText(userId, 'apt_description'))
        .addOptions(options)
    );
    
    // Enviar resposta
    await interaction.editReply({ 
      content: client.getText(userId, 'apt_installing', { packages }), 
      components: [row] 
    });
  }
};
