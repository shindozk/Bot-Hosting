// Evento para interações (comandos, botões, select menus, etc.)
const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags, AttachmentBuilder } = require('discord.js');
const { initializeUser } = require('../utils/languageManager');
const { getUserContainers, getContainer, updateContainer, removeContainer, fetchBotInfo } = require('../utils/userManager');
const { getContainerInfo, startContainer, stopContainer, restartContainer, deleteContainer, createBackup, formatUptime } = require('../docker/dockerManager');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

/**
 * Atualiza o painel de informações do bot.
 * @param {import('discord.js').Interaction | import('discord.js').Message} target A interação ou mensagem a ser editada.
 * @param {string} userId O ID do usuário.
 * @param {string} containerId O ID do contêiner.
 */
async function refreshBotPanel(target, userId, containerId, client) {
  const db = client.db;
  const container = getContainer(db, userId, containerId);
  const isInteraction = typeof target.deferReply === 'function';

  if (!container) {
    const embed = new EmbedBuilder()
      .setTitle('Bot Não Encontrado')
      .setDescription('O container selecionado não foi encontrado ou foi excluído.')
      .setColor('#ff0000');
    try {
      if (isInteraction) {
        await target.editReply({ embeds: [embed], components: [] });
      } else {
        await target.edit({ embeds: [embed], components: [] });
      }
    } catch (e) {
      console.error(`Erro ao editar painel para container ${containerId}:`, e.message);
    }
    return;
  }

  try {
    const containerInfo = await getContainerInfo(containerId);
    let uptimeFormatted = 'N/A';
    if (containerInfo.uptime && containerInfo.status === 'running') {
      uptimeFormatted = formatUptime(containerInfo.uptime);
    }

    const botInfo = await fetchBotInfo(client, container.botId);

    const embed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'panel_title', { botName: botInfo.username }))
      .setDescription(client.getText(userId, 'panel_description', { containerId: containerId }))
      .setThumbnail(botInfo.avatarURL)
      .addFields(
        { name: client.getText(userId, 'panel_status'), value: `\`${containerInfo.status.toUpperCase()}\``, inline: true },
        { name: client.getText(userId, 'panel_language'), value: `\`${container.language}\``, inline: true },
        { name: client.getText(userId, 'panel_main_file'), value: `\`${container.mainFile}\``, inline: true },
        { name: client.getText(userId, 'panel_uptime'), value: `\`${uptimeFormatted}\``, inline: true },
        { name: client.getText(userId, 'panel_cpu_usage'), value: `\`${containerInfo.cpu}%\``, inline: true },
        { name: client.getText(userId, 'panel_ram_usage'), value: `\`${containerInfo.memory.used}MB / ${container.ram}MB\``, inline: true },
        { name: client.getText(userId, 'panel_disk_usage'), value: `\`${containerInfo.disk.used}MB\``, inline: true },
        { name: client.getText(userId, 'panel_created_at'), value: `<t:${Math.floor(new Date(container.createdAt).getTime() / 1000)}:f>`, inline: true }
      )
      .setColor(containerInfo.status === 'running' ? '#57F287' : '#ED4245')
      .setFooter({ text: client.getText(userId, 'panel_last_update', { time: new Date().toLocaleString() }) })
      .setTimestamp();

    // Linha 1 - Botões básicos
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_${userId}_${containerId}`)
        .setLabel(client.getText(userId, 'btn_start'))
        .setStyle(ButtonStyle.Success)
        .setDisabled(containerInfo.status === 'running'),
      new ButtonBuilder()
        .setCustomId(`stop_${userId}_${containerId}`)
        .setLabel(client.getText(userId, 'btn_stop'))
        .setStyle(ButtonStyle.Danger)
        .setDisabled(containerInfo.status !== 'running'),
      new ButtonBuilder()
        .setCustomId(`restart_${userId}_${containerId}`)
        .setLabel(client.getText(userId, 'btn_restart'))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(containerInfo.status !== 'running'),
      new ButtonBuilder()
        .setCustomId(`delete_${userId}_${containerId}`)
        .setLabel(client.getText(userId, 'btn_delete'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId(`refresh_${userId}_${containerId}`)
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary)
    );

    // Linha 2 - Botões avançados
    const row2 = new ActionRowBuilder().addComponents(
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
        .setEmoji('📦')
        .setStyle(ButtonStyle.Success)
    );

    if (isInteraction) {
      await target.editReply({ embeds: [embed], components: [row1, row2] });
    } else {
      await target.edit({ embeds: [embed], components: [row1, row2] });
    }
  } catch (error) {
    console.error(`Erro ao atualizar o painel do container ${containerId}:`, error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('Erro ao Carregar Painel')
      .setDescription(`Ocorreu um erro ao obter informações do seu bot.\n\`\`\`${error.message}\`\`\``)
      .setColor('#ff0000');
    try {
      if (isInteraction) {
        await target.editReply({ embeds: [errorEmbed], components: [] });
      } else {
        await target.edit({ embeds: [errorEmbed], components: [] });
      }
    } catch (e) {
      console.error(`Erro crítico ao renderizar o painel (${containerId}):`, e.message);
    }
  }
}

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    const { client } = interaction;
    
    // Inicializar usuário no banco de dados se não existir
    if (interaction.user && interaction.user.id) {
      initializeUser(client.db, interaction.user.id, client.config.defaultLanguage);
    }
    
    // Comandos Slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      
      if (!command) {
        console.error(`Comando não encontrado: ${interaction.commandName}`);
        return;
      }
      
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
        
        const errorReply = {
          content: `Ocorreu um erro ao executar este comando: \`${error.message}\``,
          ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorReply);
        } else {
          await interaction.reply(errorReply);
        }
      }
      
      return;
    }
    
    // Select Menus
    if (interaction.isStringSelectMenu()) {
      // Seleção de bot no painel
      if (interaction.customId === 'select_bot') {
        const containerId = interaction.values[0];
        const userId = interaction.user.id;
        
        await interaction.deferUpdate();
        await refreshBotPanel(interaction, userId, containerId, client);
        return;
      }
      
      // Seleção de idioma
      if (interaction.customId === 'select_language') {
        const userId = interaction.user.id;
        const language = interaction.values[0];
        
        // Salvar idioma no banco de dados
        client.db.set(`users.${userId}.language`, language);
        
        // Obter nome do idioma para exibição
        const languageNames = {
          'en': 'English',
          'pt-br': 'Português (Brasil)',
          'fr': 'Français',
          'ja': 'Japanese',
          'zh': 'Chinese',
          'es': 'Español'
        };
        
        await interaction.update({ 
          content: client.getText(userId, 'language_success', { language: languageNames[language] || language }),
          embeds: [],
          components: []
        });
        return;
      }
      
      // Seleção de linguagem no comando up
      if (interaction.customId === 'select_language_up') {
        // Tratado no comando up
        return;
      }
      
      // Seleção para backup
      if (interaction.customId.startsWith('backup_location_')) {
        const [, location, userId, containerId] = interaction.customId.split('_');
        const locationChoice = interaction.values[0]; // "channel" ou "dm"
        await interaction.deferUpdate();
        
        try {
          const container = getContainer(client.db, userId, containerId);
          if (!container) {
            const replyMessage = await interaction.followUp({ 
              content: client.getText(userId, 'container_not_found'), 
              ephemeral: true 
            });
            setTimeout(() => replyMessage.delete().catch(e => console.error("Error deleting reply:", e)), 7000);
            return;
          }
          
          await interaction.editReply({ 
            content: client.getText(userId, 'backup_generating'), 
            components: [], 
            embeds: [] 
          });
          
          const backupZipPath = await createBackup(containerId, { userId, botId: container.botId });
          const botInfo = await fetchBotInfo(client, container.botId);
          const backupFile = new AttachmentBuilder(backupZipPath, {
            name: `backup_${botInfo.username.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.zip`
          });
          
          if (locationChoice === 'channel') {
            await interaction.editReply({
              content: client.getText(userId, 'backup_success_channel', { botName: botInfo.username }),
              files: [backupFile],
              components: [],
              embeds: []
            });
          } else if (locationChoice === 'dm') {
            try {
              const dmChannel = await interaction.user.createDM();
              await dmChannel.send({ 
                content: client.getText(userId, 'backup_success_channel', { botName: botInfo.username }), 
                files: [backupFile] 
              });
              await interaction.editReply(client.getText(userId, 'backup_success_dm'));
            } catch (error) {
              console.error('Erro ao enviar DM:', error);
              await interaction.editReply(client.getText(userId, 'backup_error_dm'));
            }
          }
          
          fs.unlinkSync(backupZipPath);
        } catch (error) {
          console.error('Erro ao criar backup:', error);
          await interaction.editReply(client.getText(userId, 'backup_error', { error: error.message }));
        }
        
        // Atualiza o painel após o backup
        await refreshBotPanel(interaction.message, userId, containerId, client);
        return;
      }
      
      // Seleção para apt install
      if (interaction.customId.startsWith('apt_install_')) {
        const packages = interaction.customId.split('_')[2];
        const containerId = interaction.values[0];
        const userId = interaction.user.id;
        
        await interaction.deferUpdate();
        await interaction.editReply({ 
          content: client.getText(userId, 'apt_installing', { packages }), 
          components: [], 
          embeds: [] 
        });
        
        try {
          const container = getContainer(client.db, userId, containerId);
          if (!container) {
            await interaction.editReply(client.getText(userId, 'container_not_found'));
            return;
          }
          
          await exec(`docker exec ${containerId} apt-get update`);
          const { stdout } = await exec(`docker exec ${containerId} apt-get install -y ${packages}`);
          
          await interaction.editReply(
            client.getText(userId, 'apt_success', { 
              output: stdout.slice(0,1500) + (stdout.length > 1500 ? '...' : '') 
            })
          );
        } catch (error) {
          console.error('Erro ao instalar pacotes:', error);
          await interaction.editReply(client.getText(userId, 'apt_error', { error: error.message }));
        }
        
        await refreshBotPanel(interaction.message, userId, containerId, client);
        return;
      }
    }
    
    // Botões
    if (interaction.isButton()) {
      const [action, userId, containerId] = interaction.customId.split('_');
      
      if (userId !== interaction.user.id) {
        const replyMessage = await interaction.reply({ 
          content: client.getText(interaction.user.id, 'container_no_permission'), 
          ephemeral: true 
        });
        setTimeout(() => replyMessage.delete().catch(e => console.error("Error deleting reply:", e)), 7000);
        return;
      }
      
      const container = getContainer(client.db, userId, containerId);
      if (!container) {
        const replyMessage = await interaction.reply({ 
          content: client.getText(userId, 'container_not_found'), 
          ephemeral: true 
        });
        setTimeout(() => replyMessage.delete().catch(e => console.error("Error deleting reply:", e)), 7000);
        return;
      }
      
      await interaction.deferUpdate();
      
      let successMessage = '';
      try {
        switch(action) {
          case 'start':
            await startContainer(containerId);
            container.status = 'running';
            updateContainer(client.db, userId, container);
            successMessage = client.getText(userId, 'container_start_success', { botId: container.botId });
            break;
            
          case 'stop':
            await stopContainer(containerId);
            container.status = 'stopped';
            updateContainer(client.db, userId, container);
            successMessage = client.getText(userId, 'container_stop_success', { botId: container.botId });
            break;
            
          case 'restart':
            await restartContainer(containerId);
            container.status = 'running';
            updateContainer(client.db, userId, container);
            successMessage = client.getText(userId, 'container_restart_success', { botId: container.botId });
            break;
            
          case 'delete':
            await deleteContainer(containerId);
            removeContainer(client.db, userId, containerId);
            successMessage = client.getText(userId, 'container_delete_success', { botId: container.botId });
            
            const userContainers = getUserContainers(client.db, userId);
            if (userContainers.length === 0) {
              await interaction.editReply({ 
                content: client.getText(userId, 'cmd_app_no_bots'), 
                embeds: [], 
                components: [] 
              });
              return;
            } else {
              const embed = new EmbedBuilder()
                .setTitle(client.getText(userId, 'cmd_app_title'))
                .setDescription(client.getText(userId, 'cmd_app_description'))
                .setColor('#0099ff')
                .setFooter({ 
                  text: client.getText(userId, 'cmd_app_footer', { count: userContainers.length }) 
                });
                
              const options = [];
              for (const c of userContainers) {
                try {
                  const botInfo = await fetchBotInfo(client, c.botId);
                  options.push({
                    label: botInfo.username || `Bot ${c.botId}`,
                    description: `Status: ${c.status} | RAM: ${c.ram}MB`,
                    value: c.containerId
                  });
                } catch (error) {
                  options.push({
                    label: `Bot ${c.botId}`,
                    description: `Status: ${c.status} | RAM: ${c.ram}MB`,
                    value: c.containerId
                  });
                }
              }
              
              const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('select_bot')
                  .setPlaceholder(client.getText(userId, 'cmd_app_description'))
                  .addOptions(options)
              );
              
              await interaction.editReply({ embeds: [embed], components: [row] });
              return;
            }
            
          case 'refresh':
            successMessage = client.getText(userId, 'container_refresh_success');
            break;
            
          case 'backup':
            const backupRow = new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`backup_location_${userId}_${containerId}`)
                .setPlaceholder(client.getText(userId, 'backup_description'))
                .addOptions([
                  {
                    label: client.getText(userId, 'backup_channel'),
                    value: 'channel',
                    emoji: '📝'
                  },
                  {
                    label: client.getText(userId, 'backup_dm'),
                    value: 'dm',
                    emoji: '📨'
                  }
                ])
            );
            
            const backupEmbed = new EmbedBuilder()
              .setTitle(client.getText(userId, 'backup_title'))
              .setDescription(client.getText(userId, 'backup_description'))
              .setColor('#0099ff');
              
            await interaction.editReply({ embeds: [backupEmbed], components: [backupRow] });
            return;
            
          case 'terminal':
            try {
              // Obter logs do container
              const { stdout } = await exec(`docker logs --tail 50 ${containerId}`);
              
              // Formatando logs para embed
              const logs = stdout.slice(-4000); // Limitar a 4000 caracteres por causa das limitações do Discord
              
              const embed = new EmbedBuilder()
                .setTitle(client.getText(userId, 'logs_title', { botName: container.name }))
                .setDescription(client.getText(userId, 'logs_description'))
                .setColor('#0099ff')
                .setTimestamp();
              
              // Criar múltiplos fields se necessário (limitação de 1024 caracteres por field)
              if (logs.length === 0) {
                embed.addFields({ 
                  name: client.getText(userId, 'logs_title', { botName: '' }), 
                  value: client.getText(userId, 'logs_empty') 
                });
              } else if (logs.length <= 1024) {
                embed.addFields({ 
                  name: client.getText(userId, 'logs_title', { botName: '' }), 
                  value: `\`\`\`\n${logs}\n\`\`\`` 
                });
              } else {
                // Dividir logs em partes
                for (let i = 0; i < logs.length; i += 1000) {
                  const part = logs.substring(i, Math.min(i + 1000, logs.length));
                  embed.addFields({ 
                    name: i === 0 ? client.getText(userId, 'logs_title', { botName: '' }) : '...', 
                    value: `\`\`\`\n${part}\n\`\`\`` 
                  });
                }
              }
              
              // Botão para voltar
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`backToPanel_${userId}_${containerId}`)
                  .setLabel(client.getText(userId, 'btn_back'))
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(`refreshLogs_${userId}_${containerId}`)
                  .setLabel(client.getText(userId, 'btn_refresh'))
                  .setStyle(ButtonStyle.Primary)
              );
              
              await interaction.editReply({ embeds: [embed], components: [row] });
              return;
            } catch (error) {
              console.error('Erro ao obter logs:', error);
              const logsReply = await interaction.editReply({ 
                content: `❌ ${client.getText(userId, 'error')}: \`\`\`${error.message}\`\`\``, 
                embeds: [], 
                components: [] 
              });
              setTimeout(() => logsReply.delete().catch(e => console.error("Error deleting logs reply:", e)), 7000);
              await refreshBotPanel(interaction.message, userId, containerId, client);
              return;
            }
            
          case 'backToPanel':
            // Voltar para o painel principal do bot
            await refreshBotPanel(interaction, userId, containerId, client);
            return;
            
          case 'refreshLogs':
            try {
              // Obter logs atualizados do container
              const { stdout } = await exec(`docker logs --tail 50 ${containerId}`);
              
              // Formatando logs para embed
              const logs = stdout.slice(-4000); // Limitar a 4000 caracteres por causa das limitações do Discord
              
              const embed = new EmbedBuilder()
                .setTitle(client.getText(userId, 'logs_title', { botName: container.name }))
                .setDescription(client.getText(userId, 'logs_description'))
                .setColor('#0099ff')
                .setTimestamp();
              
              // Criar múltiplos fields se necessário (limitação de 1024 caracteres por field)
              if (logs.length === 0) {
                embed.addFields({ 
                  name: client.getText(userId, 'logs_title', { botName: '' }), 
                  value: client.getText(userId, 'logs_empty') 
                });
              } else if (logs.length <= 1024) {
                embed.addFields({ 
                  name: client.getText(userId, 'logs_title', { botName: '' }), 
                  value: `\`\`\`\n${logs}\n\`\`\`` 
                });
              } else {
                // Dividir logs em partes
                for (let i = 0; i < logs.length; i += 1000) {
                  const part = logs.substring(i, Math.min(i + 1000, logs.length));
                  embed.addFields({ 
                    name: i === 0 ? client.getText(userId, 'logs_title', { botName: '' }) : '...', 
                    value: `\`\`\`\n${part}\n\`\`\`` 
                  });
                }
              }
              
              // Botão para voltar
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`backToPanel_${userId}_${containerId}`)
                  .setLabel(client.getText(userId, 'btn_back'))
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(`refreshLogs_${userId}_${containerId}`)
                  .setLabel(client.getText(userId, 'btn_refresh'))
                  .setStyle(ButtonStyle.Primary)
              );
              
              await interaction.editReply({ embeds: [embed], components: [row] });
              return;
            } catch (error) {
              console.error('Erro ao atualizar logs:', error);
              const logsReply = await interaction.editReply({ 
                content: `❌ ${client.getText(userId, 'error')}: \`\`\`${error.message}\`\`\``, 
                embeds: [], 
                components: [] 
              });
              setTimeout(() => logsReply.delete().catch(e => console.error("Error deleting logs reply:", e)), 7000);
              await refreshBotPanel(interaction.message, userId, containerId, client);
              return;
            }
            
          case 'resetmemory':
            // Criar um modal para alterar a memória RAM
            try {
              await interaction.editReply({ 
                content: client.getText(userId, 'cmd_up_ram'),
                embeds: [], 
                components: [] 
              });
              
              // Filtro para mensagens de resposta
              const filter = m => m.author.id === interaction.user.id && 
                                !isNaN(m.content) && 
                                parseInt(m.content) >= 128 && 
                                parseInt(m.content) <= 512;
              
              const channel = interaction.channel;
              const collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
              const newRam = parseInt(collected.first().content);
              
              // Tentar apagar a mensagem do usuário para limpar o chat
              try {
                await collected.first().delete();
              } catch (e) {
                console.error('Não foi possível excluir a mensagem:', e);
              }
              
              await interaction.editReply({ content: client.getText(userId, 'success') });
              
              // Parar o container
              await stopContainer(containerId);
              
              // Atualizar configurações
              await exec(`docker update --memory=${newRam}m --memory-swap=${newRam}m ${containerId}`);
              
              // Iniciar o container novamente
              await startContainer(containerId);
              
              // Atualizar o banco de dados
              container.ram = newRam;
              container.status = 'running';
              updateContainer(client.db, userId, container);
              
              // Atualizar o painel de controle
              await refreshBotPanel(interaction.message, userId, containerId, client);
              return;
            } catch (error) {
              console.error('Erro ao alterar memória RAM:', error);
              if (error.name === 'Error [INTERACTION_COLLECTOR_ERROR]') {
                await interaction.editReply({ content: client.getText(userId, 'timeout') });
              } else {
                await interaction.editReply({ 
                  content: `${client.getText(userId, 'error')}: ${error.message}` 
                });
              }
              await refreshBotPanel(interaction.message, userId, containerId, client);
              return;
            }
            
          case 'commit':
            // Implementação do botão de atualização de código
            // Será tratado separadamente devido à complexidade
            return;
        }
        
        if (['start', 'stop', 'restart'].includes(action)) {
          updateContainer(client.db, userId, container);
        }
        
        const tempReply = await interaction.followUp({ 
          content: successMessage, 
          ephemeral: true 
        });
        
        setTimeout(() => tempReply.delete().catch(e => console.error("Error deleting temp reply:", e)), 7000);
        await refreshBotPanel(interaction.message, userId, containerId, client);
      } catch (error) {
        console.error(`Erro no botão (${interaction.customId}):`, error);
        const tempErrorReply = await interaction.followUp({ 
          content: `❌ ${client.getText(userId, 'error')}: \`\`\`${error.message}\`\`\``, 
          ephemeral: true 
        });
        
        setTimeout(() => tempErrorReply.delete().catch(e => console.error("Error deleting error reply:", e)), 7000);
        await refreshBotPanel(interaction.message, userId, containerId, client);
      }
    }
  },
  refreshBotPanel
};
