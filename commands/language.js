// Comando language - Altera o idioma do bot
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getAvailableLanguages } = require('../utils/languageManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Altera o idioma do bot'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Obter idiomas disponíveis
    const availableLanguages = getAvailableLanguages();
    
    // Mapear nomes de idiomas
    const languageNames = {
      'en': 'English',
      'pt-br': 'Português (Brasil)',
      'fr': 'Français',
      'ja': '日本語',
      'zh': '中文',
      'es': 'Español'
    };
    
    // Criar opções para o select menu
    const options = availableLanguages.map(lang => ({
      label: languageNames[lang] || lang,
      value: lang,
      default: client.db.get(`users.${userId}.language`) === lang
    }));
    
    // Criar embed
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'language_title'))
      .setDescription(client.getText(userId, 'language_description'))
      .setColor('#0099ff');
    
    // Criar select menu
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_language')
        .setPlaceholder(client.getText(userId, 'language_description'))
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
