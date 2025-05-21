// Comando help - Exibe ajuda sobre como usar o bot de hospedagem
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Exibe ajuda sobre como usar o bot de hospedagem'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'help_title'))
      .setDescription(client.getText(userId, 'help_description'))
      .setColor('#0099ff')
      .addFields(
        { name: '/up', value: client.getText(userId, 'help_up'), inline: false },
        { name: '/app', value: client.getText(userId, 'help_app'), inline: false },
        { name: '/ping', value: client.getText(userId, 'help_ping'), inline: false },
        { name: '/apt', value: client.getText(userId, 'help_apt'), inline: false },
        { name: '/language', value: client.getText(userId, 'help_language'), inline: false },
        { name: '/help', value: client.getText(userId, 'help_help'), inline: false }
      )
      .setFooter({ text: 'Bot Host v2.0' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};