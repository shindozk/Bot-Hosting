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

    // Função auxiliar para deletar o canal e lidar com erros
    const deleteChannelSafely = (channel, delay = 5000) => {
      setTimeout(() => {
        channel.delete().catch(e => console.error(`[UP Command] Erro ao deletar o canal de setup (${channel.id}):`, e));
      }, delay);
    };
    
    // Adiar a resposta imediatamente para evitar erros de timeout
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Verificar se o usuário atingiu o limite de bots
    if (hasReachedContainerLimit(client.db, userId)) {
      return interaction.editReply({
        content: client.getText(userId, 'cmd_up_limit_reached'),
        flags: MessageFlags.Ephemeral
      });
    }
    
    // Criar canal de configuração
    const guild = interaction.guild;
    const category = guild.channels.cache.find(c => c.name === 'Bot Hosting' && c.type === 4) ||
      await guild.channels.create({ name: 'Bot Hosting', type: 4 });
    
    const channel = await guild.channels.create({
      name: `setup-${interaction.user.username}-${Date.now()}`, // para garantir unicidade
      type: 0, // Text Channel
      parent: category.id,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: client.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ],
    });
    
    await interaction.editReply({
      content: client.getText(userId, 'cmd_up_setup_channel', { channel: channel.toString() }),
      flags: MessageFlags.Ephemeral
    });
    
    await channel.send(client.getText(userId, 'cmd_up_hello', { user: interaction.user.toString() }));
    
    // --- ORDEM DAS PERGUNTAS ---
    const messageFilter = m => m.author.id === interaction.user.id;

    // Etapa 1: ID do Bot
    const botIdMsg = await channel.send(client.getText(userId, 'cmd_up_bot_id'));
    let botId;
    let botInfo;
    
    try {
      const botIdCollected = await channel.awaitMessages({ 
        filter: messageFilter, 
        max: 1, 
        time: 120000, 
        errors: ['time'] 
      });
      
      botId = botIdCollected.first().content.trim(); 
      
      try {
        await botIdCollected.first().delete();
      } catch (e) {
        console.error('[UP Command] Não foi possível excluir a mensagem do ID do bot:', e);
      }
      
      try {
        botInfo = await fetchBotInfo(client, botId);
        await botIdMsg.edit(`${client.getText(userId, 'cmd_up_bot_found', { botTag: botInfo.tag })}`);
      } catch (error) {
        await botIdMsg.edit(`${client.getText(userId, 'cmd_up_bot_not_found')}`);
        deleteChannelSafely(channel, 10000); 
        return;
      }
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout')); 
      deleteChannelSafely(channel);
      return;
    }

    // Etapa 2: Seleção de Linguagem
    const languageEmbed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'cmd_up_title'))
      .setDescription(client.getText(userId, 'cmd_up_description'))
      .setColor('#0099ff');
    
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
        content: client.getText(userId, 'cmd_up_language_selected', { languageName: languageConfig.name }), 
        embeds: [], 
        components: [] 
      });
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout'));
      deleteChannelSafely(channel);
      return;
    }

    // Etapa 3: Nome do Arquivo Principal
    const mainFileMsg = await channel.send(
      client.getText(userId, 'cmd_up_main_file', { examples: languageConfig.mainFileExample })
    );
    let mainFile;
    
    try {
      const mainFileCollected = await channel.awaitMessages({ 
        filter: messageFilter, 
        max: 1, 
        time: 120000, 
        errors: ['time'] 
      });
      
      mainFile = mainFileCollected.first().content.trim(); 
      
      try {
        await mainFileCollected.first().delete();
      } catch (e) {
        console.error('[UP Command] Não foi possível excluir a mensagem do arquivo principal:', e);
      }
      
      await mainFileMsg.edit(client.getText(userId, 'cmd_up_main_file_confirm', { fileName: mainFile })); 
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout'));
      deleteChannelSafely(channel);
      return;
    }
    
    // Etapa 4: Quantidade de RAM
    const ramMsg = await channel.send(client.getText(userId, 'cmd_up_ram', { maxRamPerContainer: client.config.maxRamPerContainer })); 
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
      
      try {
        await ramCollected.first().delete();
      } catch (e) {
        console.error('[UP Command] Não foi possível excluir a mensagem da RAM:', e);
      }
      
      await ramMsg.edit(client.getText(userId, 'cmd_up_ram_confirm', { ram: ram })); 
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_value'));
      deleteChannelSafely(channel);
      return;
    }

    // Etapa 5: Arquivo ZIP (última pergunta interativa)
    const zipMsg = await channel.send(client.getText(userId, 'cmd_up_zip'));
    let zipAttachment;
    let zipPath; 
    
    let zipCollectedMessage; // Referência à mensagem do usuário com o anexo ZIP

    try {
      zipCollectedMessage = await channel.awaitMessages({ 
        filter: m => m.author.id === interaction.user.id && m.attachments.size > 0, 
        max: 1, 
        time: 300000, 
        errors: ['time'] 
      });
      
      zipAttachment = zipCollectedMessage.first().attachments.first();
      
      if (!zipAttachment.name.endsWith('.zip')) {
        await channel.send(client.getText(userId, 'invalid_file'));
        deleteChannelSafely(channel);
        return;
      }
      
      await zipMsg.edit(client.getText(userId, 'cmd_up_zip_received'));

      // BAIXAR O ARQUIVO ZIP IMEDIATAMENTE APÓS RECEBÊ-LO
      await channel.send(client.getText(userId, 'cmd_up_downloading_zip')); 
      const tempPath = ensureTempDirectory();
      zipPath = path.join(tempPath, `${userId}_${Date.now()}_${botId}.zip`); // Inclui botId após ele ter sido coletado
      
      const downloadUrl = zipAttachment.url;
      
      try {
        const response = await axios.get(downloadUrl, {
          responseType: 'arraybuffer'
        });
        fs.writeFileSync(zipPath, Buffer.from(response.data));
        await channel.send(client.getText(userId, 'cmd_up_zip_downloaded'));
        
        // APAGAR A MENSAGEM DO USUÁRIO SOMENTE APÓS O DOWNLOAD BEM-SUCEDIDO
        try {
          await zipCollectedMessage.first().delete();
        } catch (e) {
          console.error('[UP Command] Não foi possível excluir a mensagem do arquivo ZIP após download:', e);
        }

      } catch (axiosError) {
        console.error(`[UP Command] Erro ao baixar o arquivo ZIP (${downloadUrl}):`, axiosError.message);
        if (axiosError.response) {
          console.error(`[UP Command] Status HTTP do erro: ${axiosError.response.status}`);
        }
        await channel.send(client.getText(userId, 'cmd_up_download_error', { error: axiosError.message }));
        deleteChannelSafely(channel, 30000);
        return;
      }

    } catch (error) {
      await channel.send(client.getText(userId, 'timeout')); 
      deleteChannelSafely(channel);
      return;
    }
    
    // Etapa 6: Criar ambiente e container (processamento final)
    await channel.send(client.getText(userId, 'cmd_up_creating_env'));
    
    try {
      // Criar diretórios
      const extractPath = ensureContainerDirectory(userId, botId);
      
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
        let projectName = 'Bot';
        try {
          const files = fs.readdirSync(extractPath);
          const csprojFile = files.find(file => file.endsWith('.csproj'));
          if (csprojFile) {
            projectName = csprojFile.replace('.csproj', '');
          }
        } catch (e) {
          console.error('[UP Command] Erro ao buscar arquivo .csproj:', e);
        }
        
        dockerfileContent = dockerfileContent.replace('{{PROJECT_NAME}}', projectName);
      }
      
      fs.writeFileSync(path.join(extractPath, 'Dockerfile'), dockerfileContent);
      
      // Criar container Docker
      await channel.send(client.getText(userId, 'cmd_up_creating_container'));
      
      const imageName = `bot-host-${userId}-${botId}`.toLowerCase();
      
      try {
        await exec(`docker build -t ${imageName} ${extractPath}`);
      } catch (buildError) {
        console.error('[UP Command] Erro ao construir a imagem Docker:', buildError);
        await channel.send(client.getText(userId, 'cmd_up_docker_build_error', { error: buildError.message }));
        deleteChannelSafely(channel, 30000);
        return;
      }

      let containerId;
      try {
        const createResult = await exec(
          `docker create --name ${botData.name} -m ${ram}m --memory-swap ${ram}m --cpu-shares 128 --restart unless-stopped ${imageName}`
        );
        containerId = createResult.stdout.trim();
        await exec(`docker start ${containerId}`);
      } catch (containerError) {
        console.error('[UP Command] Erro ao criar/iniciar o container Docker:', containerError);
        await channel.send(client.getText(userId, 'cmd_up_docker_container_error', { error: containerError.message }));
        deleteChannelSafely(channel, 30000);
        return;
      }
      
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
      
      // Enviar mensagem de sucesso final no canal de setup
      await channel.send(
        client.getText(userId, 'cmd_up_success', { containerId })
      );
      
      // Deletar o canal após 30 segundos
      deleteChannelSafely(channel, 30000);
    } catch (error) {
      console.error('[UP Command] Erro geral ao hospedar o bot:', error);
      await channel.send(
        client.getText(userId, 'cmd_up_error', { error: error.message })
      );
      deleteChannelSafely(channel, 30000);
    }
  }
};
