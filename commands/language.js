// Comando language - Altera o idioma do bot
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Altera o idioma do bot'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Obter idioma atual
    const currentLanguage = client.db.get(`users.${userId}.language`) || client.config.defaultLanguage;
    
    // Criar embed com opções de idioma
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'language_title'))
      .setDescription(client.getText(userId, 'language_description'))
      .setColor('#0099ff');
    
    // Mapear idiomas disponíveis para o select menu
    const languageOptions = [
      { label: 'English', value: 'en', description: 'English language', emoji: '🇺🇸' },
      { label: 'Português (Brasil)', value: 'pt-br', description: 'Idioma português do Brasil', emoji: '🇧🇷' },
      { label: 'Français', value: 'fr', description: 'Langue française', emoji: '🇫🇷' },
      { label: '日本語', value: 'ja', description: 'Japanese language', emoji: '🇯🇵' },
      { label: '中文', value: 'zh', description: 'Chinese language', emoji: '🇨🇳' },
      { label: 'Español', value: 'es', description: 'Idioma español', emoji: '🇪🇸' }
    ];
    
    // Criar select menu
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_language')
          .setPlaceholder(client.getText(userId, 'language_description'))
          .addOptions(languageOptions)
      );
    
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};