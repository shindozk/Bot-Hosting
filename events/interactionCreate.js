// Evento para interações (botões, select menus, etc.)
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { startContainer, stopContainer, restartContainer, deleteContainer, createBackup } = require('../docker/dockerManager');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { refreshBotPanel } = require('../commands/app');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    const { client } = interaction;
    
    // Ignorar interações que não são de botões ou select menus
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    
    // Processar select menu para selecionar bot
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_bot') {
      const userId = interaction.user.id;
      const containerId = interaction.values[0];
      
      await interaction.deferUpdate();
      await refreshBotPanel(interaction, userId, containerId);
      return;
    }
    
    // Processar select menu para selecionar idioma
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_language') {
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
        content: client.getText(userId, 'language_success').replace('{language}', languageNames[language] || language),
        embeds: [],
        components: []
      });
      return;
    }
    
    // Processar botões
    if (interaction.isButton()) {
      // Extrair informações do customId (formato: ação_userId_containerId)
      const parts = interaction.customId.split('_');
      const action = parts[0];
      const userId = parts[1];
      const containerId = parts[2];
      
      // Verificar se o usuário é o dono do container
      if (interaction.user.id !== userId) {
        return interaction.reply({ 
          content: client.getText(interaction.user.id, 'error'), 
          ephemeral: true 
        });
      }
      
      // Buscar container no banco de dados
      const userContainers = client.db.get(`users.${userId}.containers`) || [];
      const containerIndex = userContainers.findIndex(c => c.containerId === containerId);
      
      if (containerIndex === -1) {
        return interaction.reply({ 
          content: client.getText(userId, 'error'), 
          ephemeral: true 
        });
      }
      
      const container = userContainers[containerIndex];
      
      // Processar ação do botão
      await interaction.deferUpdate();
      
      switch (action) {
        case 'start':
          try {
            await startContainer(containerId);
            
            // Atualizar status no banco de dados
            container.status = 'running';
            userContainers[containerIndex] = container;
            client.db.set(`users.${userId}.containers`, userContainers);
            
            // Atualizar painel
            await refreshBotPanel(interaction, userId, containerId);
          } catch (error) {
            console.error('Erro ao iniciar container:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'stop':
          try {
            await stopContainer(containerId);
            
            // Atualizar status no banco de dados
            container.status = 'stopped';
            userContainers[containerIndex] = container;
            client.db.set(`users.${userId}.containers`, userContainers);
            
            // Atualizar painel
            await refreshBotPanel(interaction, userId, containerId);
          } catch (error) {
            console.error('Erro ao parar container:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'restart':
          try {
            await restartContainer(containerId);
            
            // Atualizar status no banco de dados
            container.status = 'running';
            userContainers[containerIndex] = container;
            client.db.set(`users.${userId}.containers`, userContainers);
            
            // Atualizar painel
            await refreshBotPanel(interaction, userId, containerId);
          } catch (error) {
            console.error('Erro ao reiniciar container:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'delete':
          try {
            await deleteContainer(containerId);
            
            // Remover do banco de dados
            userContainers.splice(containerIndex, 1);
            client.db.set(`users.${userId}.containers`, userContainers);
            
            // Voltar para a lista de bots
            const embed = new EmbedBuilder()
              .setTitle(client.getText(userId, 'cmd_app_title'))
              .setDescription(client.getText(userId, 'cmd_app_description'))
              .setColor('#0099ff')
              .setFooter({ 
                text: client.getText(userId, 'cmd_app_footer').replace('{count}', userContainers.length) 
              });
            
            if (userContainers.length === 0) {
              await interaction.editReply({ 
                content: client.getText(userId, 'cmd_app_no_bots'), 
                embeds: [], 
                components: [] 
              });
            } else {
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
              
              await interaction.editReply({ embeds: [embed], components: [row] });
            }
          } catch (error) {
            console.error('Erro ao excluir container:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'refresh':
          // Atualizar painel
          await refreshBotPanel(interaction, userId, containerId);
          break;
          
        case 'backup':
          try {
            await interaction.editReply({ 
              content: client.getText(userId, 'success'), 
              embeds: [], 
              components: [] 
            });
            
            // Criar backup
            const backupPath = await createBackup(containerId, container);
            
            // Enviar arquivo de backup
            await interaction.followUp({
              content: `${client.getText(userId, 'success')}`,
              files: [backupPath],
              ephemeral: true
            });
            
            // Remover arquivo de backup após envio
            fs.unlinkSync(backupPath);
            
            // Atualizar painel
            await refreshBotPanel(interaction, userId, containerId);
          } catch (error) {
            console.error('Erro ao criar backup:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'terminal':
          try {
            // Obter logs do container
            const { stdout } = await exec(`docker logs --tail 50 ${containerId}`);
            
            // Formatando logs para embed
            const logs = stdout.slice(-4000); // Limitar a 4000 caracteres por causa das limitações do Discord
            
            const embed = new EmbedBuilder()
              .setTitle(client.getText(userId, 'logs_title').replace('{botName}', container.name))
              .setDescription(client.getText(userId, 'logs_description'))
              .setColor('#0099ff')
              .setTimestamp();
            
            // Criar múltiplos fields se necessário (limitação de 1024 caracteres por field)
            if (logs.length === 0) {
              embed.addFields({ name: client.getText(userId, 'logs_title'), value: client.getText(userId, 'logs_empty') });
            } else if (logs.length <= 1024) {
              embed.addFields({ name: client.getText(userId, 'logs_title'), value: `\`\`\`\n${logs}\n\`\`\`` });
            } else {
              // Dividir logs em partes
              for (let i = 0; i < logs.length; i += 1000) {
                const part = logs.substring(i, Math.min(i + 1000, logs.length));
                embed.addFields({ name: i === 0 ? client.getText(userId, 'logs_title') : '...', value: `\`\`\`\n${part}\n\`\`\`` });
              }
            }
            
            // Botão para voltar
            const row = new ActionRowBuilder()
              .addComponents(
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
          } catch (error) {
            console.error('Erro ao obter logs:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
        case 'backToPanel':
          // Voltar para o painel principal do bot
          await refreshBotPanel(interaction, userId, containerId);
          break;
          
        case 'refreshLogs':
          try {
            // Obter logs atualizados do container
            const { stdout } = await exec(`docker logs --tail 50 ${containerId}`);
            
            // Formatando logs para embed
            const logs = stdout.slice(-4000); // Limitar a 4000 caracteres por causa das limitações do Discord
            
            const embed = new EmbedBuilder()
              .setTitle(client.getText(userId, 'logs_title').replace('{botName}', container.name))
              .setDescription(client.getText(userId, 'logs_description'))
              .setColor('#0099ff')
              .setTimestamp();
            
            // Criar múltiplos fields se necessário (limitação de 1024 caracteres por field)
            if (logs.length === 0) {
              embed.addFields({ name: client.getText(userId, 'logs_title'), value: client.getText(userId, 'logs_empty') });
            } else if (logs.length <= 1024) {
              embed.addFields({ name: client.getText(userId, 'logs_title'), value: `\`\`\`\n${logs}\n\`\`\`` });
            } else {
              // Dividir logs em partes
              for (let i = 0; i < logs.length; i += 1000) {
                const part = logs.substring(i, Math.min(i + 1000, logs.length));
                embed.addFields({ name: i === 0 ? client.getText(userId, 'logs_title') : '...', value: `\`\`\`\n${part}\n\`\`\`` });
              }
            }
            
            // Botão para voltar
            const row = new ActionRowBuilder()
              .addComponents(
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
          } catch (error) {
            console.error('Erro ao atualizar logs:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
          
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
            userContainers[containerIndex] = container;
            client.db.set(`users.${userId}.containers`, userContainers);
            
            // Atualizar o painel de controle
            await refreshBotPanel(interaction, userId, containerId);
            
          } catch (error) {
            console.error('Erro ao alterar memória RAM:', error);
            if (error.name === 'Error [INTERACTION_COLLECTOR_ERROR]') {
              await interaction.editReply({ content: client.getText(userId, 'timeout') });
            } else {
              await interaction.editReply({ 
                content: `${client.getText(userId, 'error')}: ${error.message}` 
              });
            }
          }
          break;
          
        case 'commit':
          try {
            // Criar canal temporário para upload
            const guild = interaction.guild;
            const category = guild.channels.cache.find(c => c.name === 'Bot Hosting' && c.type === 4) || 
                            await guild.channels.create({ name: 'Bot Hosting', type: 4 });
            
            const channel = await guild.channels.create({
              name: `update-${interaction.user.username}`,
              type: 0, // Text Channel
              parent: category.id,
              permissionOverwrites: [
                {
                  id: guild.id,
                  deny: ['ViewChannel'],
                },
                {
                  id: interaction.user.id,
                  allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
                {
                  id: interaction.client.user.id,
                  allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
              ],
            });
            
            await interaction.editReply({ 
              content: client.getText(userId, 'cmd_up_setup_channel').replace('{channel}', channel.toString()), 
              embeds: [], 
              components: [] 
            });
            
            // Iniciar processo de upload no canal
            await channel.send(client.getText(userId, 'cmd_up_hello').replace('{user}', interaction.user.toString()));
            await channel.send(client.getText(userId, 'cmd_up_zip'));
            
            // Filtro para arquivo ZIP
            const zipFilter = m => m.author.id === interaction.user.id && 
                                  m.attachments.size > 0 && 
                                  m.attachments.first().name.endsWith('.zip');
            
            // Aguardar upload do arquivo ZIP
            let zipAttachment;
            try {
              const zipCollected = await channel.awaitMessages({ filter: zipFilter, max: 1, time: 300000, errors: ['time'] });
              zipAttachment = zipCollected.first().attachments.first();
              await channel.send(client.getText(userId, 'cmd_up_zip_received'));
            } catch (error) {
              await channel.send(client.getText(userId, 'invalid_file'));
              setTimeout(() => channel.delete(), 5000);
              return;
            }
            
            // Processar o ZIP e atualizar o container
            await channel.send(client.getText(userId, 'cmd_up_creating_env'));
            
            // Baixar o arquivo ZIP
            const zipPath = path.join(__dirname, '..', 'temp', `${userId}_${container.botId}.zip`);
            const extractPath = path.join(__dirname, '..', 'containers', userId, container.botId);
            
            // Criar diretórios necessários
            fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });
            fs.mkdirSync(extractPath, { recursive: true });
            
            // Baixar o arquivo ZIP
            const response = await axios({
              method: 'get',
              url: zipAttachment.url,
              responseType: 'arraybuffer'
            });
            
            fs.writeFileSync(zipPath, Buffer.from(response.data));
            
            // Extrair o arquivo ZIP
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);
            
            // Remover o arquivo ZIP temporário
            fs.unlinkSync(zipPath);
            
            // Criar o Dockerfile
            const config = client.config;
            const languageConfig = config.supportedProgrammingLanguages.find(l => l.id === container.language);
            
            if (!languageConfig) {
              await channel.send(`${client.getText(userId, 'error')}: Linguagem não suportada`);
              setTimeout(() => channel.delete(), 5000);
              return;
            }
            
            let dockerfileContent = languageConfig.dockerfile.replace('{{MAIN_FILE}}', container.mainFile);
            
            // Caso especial para C#
            if (container.language === 'csharp') {
              // Extrair nome do projeto do arquivo principal
              const projectName = path.basename(container.mainFile, '.cs');
              dockerfileContent = dockerfileContent.replace('{{PROJECT_NAME}}', projectName);
            }
            
            fs.writeFileSync(path.join(extractPath, 'Dockerfile'), dockerfileContent);
            
            // Criar o container
            await channel.send(client.getText(userId, 'cmd_up_creating_container'));
            
            // Construir a imagem Docker
            const imageName = `bot-host-${userId}-${container.botId}`.toLowerCase();
            
            await exec(`docker build -t ${imageName} ${extractPath}`);
            
            // Parar e remover o container antigo
            await stopContainer(containerId);
            await deleteContainer(containerId);
            
            // Criar e iniciar o novo container
            const createResult = await exec(`docker create --name ${container.name} -m ${container.ram}m --memory-swap ${container.ram}m --cpu-shares 128 --restart unless-stopped ${imageName}`);
            
            const newContainerId = createResult.stdout.trim();
            await exec(`docker start ${newContainerId}`);
            
            // Atualizar o banco de dados
            container.containerId = newContainerId;
            container.status = 'running';
            container.updatedAt = new Date().toISOString();
            userContainers[containerIndex] = container;
            client.db.set(`users.${userId}.containers`, userContainers);
            
            await channel.send(`✅ ${client.getText(userId, 'success')}! ID: \`${newContainerId}\``);
            setTimeout(() => channel.delete(), 30000);
            
            // Atualizar o painel de controle
            await refreshBotPanel(interaction, userId, newContainerId);
            
          } catch (error) {
            console.error('Erro ao atualizar container:', error);
            await interaction.editReply({ 
              content: `${client.getText(userId, 'error')}: ${error.message}`, 
              embeds: [], 
              components: [] 
            });
          }
          break;
      }
    }
  }
};
