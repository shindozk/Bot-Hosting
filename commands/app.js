// Comando app - Gerencia bots hospedados
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getContainerInfo } = require('../docker/dockerManager');

// Função para buscar informações do bot
async function fetchBotInfo(client, botId) {
  try {
    const bot = await client.users.fetch(botId);
    return {
      username: bot.username,
      tag: bot.tag,
      avatarURL: bot.displayAvatarURL({ dynamic: true })
    };
  } catch (error) {
    console.error(`Erro ao buscar informações do bot ${botId}:`, error);
    return {
      username: `Bot ${botId}`,
      tag: `Bot ${botId}`,
      avatarURL: null
    };
  }
}

// Função para atualizar o painel de controle do bot
async function refreshBotPanel(interaction, userId, containerId) {
  const { client } = interaction;
  const db = client.db;
  const userContainers = db.get(`users.${userId}.containers`) || [];
  const container = userContainers.find(c => c.containerId === containerId);
  
  if (!container) {
    return interaction.editReply({ 
      content: client.getText(userId, 'error'), 
      embeds: [], 
      components: [] 
    });
  }
  
  // Obter informações do container
  try {
    const containerInfo = await getContainerInfo(containerId);
    const botInfo = await fetchBotInfo(client, container.botId);
    
    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'panel_title').replace('{botName}', botInfo.username))
      .setDescription(client.getText(userId, 'panel_description'))
      .setThumbnail(botInfo.avatarURL)
      .addFields(
        { name: client.getText(userId, 'panel_status'), value: container.status, inline: true },
        { name: client.getText(userId, 'panel_language'), value: container.language, inline: true },
        { name: client.getText(userId, 'panel_main_file'), value: container.mainFile, inline: true },
        { name: client.getText(userId, 'panel_ram_allocated'), value: `${container.ram}MB`, inline: true },
        { name: client.getText(userId, 'panel_cpu_usage'), value: `${containerInfo.cpu}%`, inline: true },
        { name: client.getText(userId, 'panel_ram_usage'), value: `${containerInfo.memory.used}MB / ${container.ram}MB`, inline: true },
        { name: client.getText(userId, 'panel_disk_usage'), value: `${containerInfo.disk.used}MB`, inline: true },
        { name: client.getText(userId, 'panel_created_at'), value: new Date(container.createdAt).toLocaleString(), inline: true }
      )
      .setColor('#00ff00')
      .setTimestamp();
      
    // Primeira linha de botões - ações básicas
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`start_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_start'))
          .setStyle(ButtonStyle.Success)
          .setDisabled(container.status === 'running'),
        new ButtonBuilder()
          .setCustomId(`stop_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_stop'))
          .setStyle(ButtonStyle.Danger)
          .setDisabled(container.status === 'stopped'),
        new ButtonBuilder()
          .setCustomId(`restart_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_restart'))
          .setStyle(ButtonStyle.Primary)
          .setDisabled(container.status === 'stopped'),
        new ButtonBuilder()
          .setCustomId(`delete_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_delete'))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`refresh_${userId}_${containerId}`)
          .setEmoji('🔄')
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Segunda linha de botões - ações avançadas
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`commit_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_upload'))
          .setEmoji('📤')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`resetmemory_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_change_ram'))
          .setEmoji('💾')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`terminal_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_logs'))
          .setEmoji('📄')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`backup_${userId}_${containerId}`)
          .setLabel(client.getText(userId, 'btn_backup'))
          .setEmoji('💾')
          .setStyle(ButtonStyle.Success)
      );
      
    return await interaction.editReply({ embeds: [embed], components: [row1, row2] });
  } catch (error) {
    console.error('Erro ao atualizar painel:', error);
    return await interaction.editReply({ 
      content: `${client.getText(userId, 'error')}: ${error.message}`, 
      embeds: [], 
      components: [] 
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('app')
    .setDescription('Gerencia seus bots hospedados'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Buscar usuário no banco de dados
    let userContainers = client.db.get(`users.${userId}.containers`) || [];
    
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
        text: client.getText(userId, 'cmd_app_footer').replace('{count}', userContainers.length) 
      });
    
    // Criar select menu com lista de bots
    const options = [];
    for (const container of userContainers) {
      try {
        const botInfo = await interaction.client.users.fetch(container.botId);
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
    
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_bot')
          .setPlaceholder(client.getText(userId, 'cmd_app_description'))
          .addOptions(options)
      );
    
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
  
  refreshBotPanel
};