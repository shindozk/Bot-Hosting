// Comando up - Hospeda um novo bot
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { hasReachedContainerLimit, addContainer, fetchBotInfo, ensureContainerDirectory, ensureTempDirectory } = require('../utils/userManager');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const AdmZip = require('adm-zip');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('up')
    .setDescription('Hospede um novo bot no sistema'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Verificar se o usuário atingiu o limite de bots
    if (hasReachedContainerLimit(client.db, userId)) {
      return interaction.reply({
        content: client.getText(userId, 'cmd_up_limit_reached'),
        ephemeral: true
      });
    }
    
    // Criar canal de configuração
    const guild = interaction.guild;
    const category = guild.channels.cache.find(c => c.name === 'Bot Hosting' && c.type === 4) ||
      await guild.channels.create({ name: 'Bot Hosting', type: 4 });
    
    const channel = await guild.channels.create({
      name: `setup-${interaction.user.username}`,
      type: 0, // Text Channel
      parent: category.id,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: interaction.client.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ],
    });
    
    await interaction.reply({
      content: client.getText(userId, 'cmd_up_setup_channel', { channel: channel.toString() }),
      ephemeral: true
    });
    
    await channel.send(client.getText(userId, 'cmd_up_hello', { user: interaction.user.toString() }));
    
    // Etapa 1: Seleção de Linguagem
    const languageEmbed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'cmd_up_title'))
      .setDescription(client.getText(userId, 'cmd_up_description'))
      .setColor('#0099ff');
    
    // Criar opções para o select menu com as linguagens de programação suportadas
    const options = client.config.supportedProgrammingLanguages.map(lang => ({
      label: lang.name,
      description: lang.description,
      value: lang.id
    }));
    
    const languageRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_language_up')
        .setPlaceholder(client.getText(userId, 'cmd_up_description'))
        .addOptions(options)
    );
    
    await channel.send({ embeds: [languageEmbed], components: [languageRow] });
    
    const languageFilter = i => i.customId === 'select_language_up' && i.user.id === interaction.user.id;
    let language;
    let languageConfig;
    
    try {
      const languageResponse = await channel.awaitMessageComponent({ filter: languageFilter, time: 120000 });
      language = languageResponse.values[0];
      languageConfig = client.config.supportedProgrammingLanguages.find(l => l.id === language);
      
      await languageResponse.update({ 
        content: `${client.getText(userId, 'cmd_up_description')}: ${languageConfig.name}`, 
        embeds: [], 
        components: [] 
      });
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout'));
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
      return;
    }
    
    // Etapa 2: Nome do Arquivo Principal
    const mainFileMsg = await channel.send(
      client.getText(userId, 'cmd_up_main_file', { examples: languageConfig.mainFileExample })
    );
    
    const mainFileFilter = m => m.author.id === interaction.user.id;
    let mainFile;
    
    try {
      const mainFileCollected = await channel.awaitMessages({ 
        filter: mainFileFilter, 
        max: 1, 
        time: 120000, 
        errors: ['time'] 
      });
      
      mainFile = mainFileCollected.first().content;
      
      // Tentar apagar a mensagem do usuário para limpar o chat
      try {
        await mainFileCollected.first().delete();
      } catch (e) {
        console.error('Não foi possível excluir a mensagem:', e);
      }
      
      await mainFileMsg.edit(`${client.getText(userId, 'cmd_up_main_file', { examples: languageConfig.mainFileExample })}: \`${mainFile}\``);
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout'));
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
      return;
    }
    
    // Etapa 3: ID do Bot
    const botIdMsg = await channel.send(client.getText(userId, 'cmd_up_bot_id'));
    let botId;
    let botInfo;
    
    try {
      const botIdCollected = await channel.awaitMessages({ 
        filter: mainFileFilter, 
        max: 1, 
        time: 120000, 
        errors: ['time'] 
      });
      
      botId = botIdCollected.first().content;
      
      // Tentar apagar a mensagem do usuário para limpar o chat
      try {
        await botIdCollected.first().delete();
      } catch (e) {
        console.error('Não foi possível excluir a mensagem:', e);
      }
      
      try {
        botInfo = await fetchBotInfo(client, botId);
        await botIdMsg.edit(`${client.getText(userId, 'cmd_up_bot_found', { botTag: botInfo.tag })}`);
      } catch (error) {
        await botIdMsg.edit(`${client.getText(userId, 'cmd_up_bot_not_found')}`);
        setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 10000);
        return;
      }
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_id'));
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
      return;
    }
    
    // Etapa 4: Quantidade de RAM
    const ramMsg = await channel.send(client.getText(userId, 'cmd_up_ram'));
    let ram;
    
    try {
      const ramCollected = await channel.awaitMessages({ 
        filter: m => m.author.id === interaction.user.id && 
                    !isNaN(m.content) && 
                    parseInt(m.content) >= 128 && 
                    parseInt(m.content) <= client.config.maxRamPerContainer, 
        max: 1, 
        time: 120000, 
        errors: ['time'] 
      });
      
      ram = parseInt(ramCollected.first().content);
      
      // Tentar apagar a mensagem do usuário para limpar o chat
      try {
        await ramCollected.first().delete();
      } catch (e) {
        console.error('Não foi possível excluir a mensagem:', e);
      }
      
      await ramMsg.edit(`${client.getText(userId, 'cmd_up_ram')}: \`${ram}MB\``);
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_value'));
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
      return;
    }
    
    // Etapa 5: Arquivo ZIP
    const zipMsg = await channel.send(client.getText(userId, 'cmd_up_zip'));
    let zipAttachment;
    
    try {
      const zipCollected = await channel.awaitMessages({ 
        filter: m => m.author.id === interaction.user.id && m.attachments.size > 0, 
        max: 1, 
        time: 300000, 
        errors: ['time'] 
      });
      
      zipAttachment = zipCollected.first().attachments.first();
      
      if (!zipAttachment.name.endsWith('.zip')) {
        await channel.send(client.getText(userId, 'invalid_file'));
        setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
        return;
      }
      
      // Tentar apagar a mensagem do usuário para limpar o chat
      try {
        await zipCollected.first().delete();
      } catch (e) {
        console.error('Não foi possível excluir a mensagem:', e);
      }
      
      await zipMsg.edit(client.getText(userId, 'cmd_up_zip_received'));
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_file'));
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 5000);
      return;
    }
    
    // Etapa 6: Criar ambiente e container
    await channel.send(client.getText(userId, 'cmd_up_creating_env'));
    
    try {
      // Criar diretórios
      const extractPath = ensureContainerDirectory(userId, botId);
      const tempPath = ensureTempDirectory();
      const zipPath = path.join(tempPath, `${botId}.zip`);
      
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
      fs.unlinkSync(zipPath);
      
      // Dados do bot
      const botData = {
        botId,
        name: `bot-${userId}-${botId}`,
        language,
        mainFile,
        ram
      };
      
      // Criar Dockerfile
      let dockerfileContent = languageConfig.dockerfile.replace('{{MAIN_FILE}}', mainFile);
      
      // Caso especial para C#
      if (language === 'csharp') {
        // Tentar encontrar o nome do projeto
        let projectName = 'Bot';
        try {
          const files = fs.readdirSync(extractPath);
          const csprojFile = files.find(file => file.endsWith('.csproj'));
          if (csprojFile) {
            projectName = csprojFile.replace('.csproj', '');
          }
        } catch (e) {
          console.error('Erro ao buscar arquivo .csproj:', e);
        }
        
        dockerfileContent = dockerfileContent.replace('{{PROJECT_NAME}}', projectName);
      }
      
      fs.writeFileSync(path.join(extractPath, 'Dockerfile'), dockerfileContent);
      
      // Criar container Docker
      await channel.send(client.getText(userId, 'cmd_up_creating_container'));
      
      const imageName = `bot-host-${userId}-${botId}`.toLowerCase();
      await exec(`docker build -t ${imageName} ${extractPath}`);
      
      const createResult = await exec(
        `docker create --name ${botData.name} -m ${ram}m --memory-swap ${ram}m --cpu-shares 128 --restart unless-stopped ${imageName}`
      );
      
      const containerId = createResult.stdout.trim();
      await exec(`docker start ${containerId}`);
      
      // Adicionar container ao banco de dados
      const containerData = {
        botId,
        containerId,
        name: botData.name,
        language,
        mainFile,
        ram,
        status: 'running',
        createdAt: new Date().toISOString()
      };
      
      addContainer(client.db, userId, containerData);
      
      // Enviar mensagem de sucesso
      await channel.send(
        client.getText(userId, 'cmd_up_success', { containerId })
      );
      
      // Deletar o canal após 30 segundos
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 30000);
    } catch (error) {
      console.error('Erro ao hospedar o bot:', error);
      await channel.send(
        client.getText(userId, 'cmd_up_error', { error: error.message })
      );
      
      // Deletar o canal após 30 segundos
      setTimeout(() => channel.delete().catch(e => console.error("Error deleting setup channel:", e)), 30000);
    }
  }
};
