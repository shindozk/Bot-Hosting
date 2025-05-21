// Comando up - Hospeda um novo bot
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('up')
    .setDescription('Hospede um novo bot no sistema'),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    
    // Buscar ou criar usuário no banco de dados
    let userContainers = client.db.get(`users.${userId}.containers`) || [];
    
    // Verificar limites
    if (userContainers.length >= 3) {
      return interaction.reply({ 
        content: client.getText(userId, 'cmd_up_limit_reached'), 
        ephemeral: true 
      });
    }
    
    // Criar canal temporário para configuração
    const guild = interaction.guild;
    const category = guild.channels.cache.find(c => c.name === 'Bot Hosting' && c.type === 4) || 
                    await guild.channels.create({ name: 'Bot Hosting', type: 4 });
    
    const channel = await guild.channels.create({
      name: `setup-${interaction.user.username}`,
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
    
    await interaction.reply({ 
      content: client.getText(userId, 'cmd_up_setup_channel').replace('{channel}', channel.toString()), 
      ephemeral: true 
    });
    
    // Iniciar processo de configuração no canal
    await channel.send(client.getText(userId, 'cmd_up_hello').replace('{user}', interaction.user.toString()));
    
    // Etapa 1: Escolher linguagem (usando select menu)
    const languageEmbed = new EmbedBuilder()
      .setTitle(client.getText(userId, 'cmd_up_title'))
      .setDescription(client.getText(userId, 'cmd_up_description'))
      .setColor('#0099ff');
    
    // Criar opções para o select menu com base nas linguagens suportadas
    const languageOptions = client.config.supportedProgrammingLanguages.map(lang => ({
      label: lang.name,
      description: lang.description,
      value: lang.id
    }));
    
    const languageRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_language_up')
          .setPlaceholder(client.getText(userId, 'cmd_up_description'))
          .addOptions(languageOptions)
      );
    
    const languageMsg = await channel.send({ embeds: [languageEmbed], components: [languageRow] });
    
    // Aguardar seleção de linguagem
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
      setTimeout(() => channel.delete(), 5000);
      return;
    }
    
    // Etapa 2: Arquivo principal
    const mainFileMsg = await channel.send(
      client.getText(userId, 'cmd_up_main_file').replace('{examples}', languageConfig.mainFileExample)
    );
    
    const mainFileFilter = m => m.author.id === interaction.user.id;
    
    let mainFile;
    try {
      const mainFileCollected = await channel.awaitMessages({ filter: mainFileFilter, max: 1, time: 120000, errors: ['time'] });
      mainFile = mainFileCollected.first().content;
      await channel.send(`${client.getText(userId, 'panel_main_file')}: ${mainFile}`);
    } catch (error) {
      await channel.send(client.getText(userId, 'timeout'));
      setTimeout(() => channel.delete(), 5000);
      return;
    }
    
    // Etapa 3: ID do Bot
    const botIdMsg = await channel.send(client.getText(userId, 'cmd_up_bot_id'));
    
    const botIdFilter = m => m.author.id === interaction.user.id && /^\d{17,19}$/.test(m.content);
    
    let botId;
    try {
      const botIdCollected = await channel.awaitMessages({ filter: botIdFilter, max: 1, time: 120000, errors: ['time'] });
      botId = botIdCollected.first().content;
      
      // Verificar se o bot existe
      try {
        const bot = await interaction.client.users.fetch(botId);
        await channel.send(client.getText(userId, 'cmd_up_bot_found').replace('{botTag}', bot.tag));
      } catch (error) {
        await channel.send(client.getText(userId, 'cmd_up_bot_not_found'));
        setTimeout(() => channel.delete(), 10000);
        return;
      }
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_id'));
      setTimeout(() => channel.delete(), 5000);
      return;
    }
    
    // Etapa 4: Memória RAM
    const ramMsg = await channel.send(client.getText(userId, 'cmd_up_ram'));
    
    const ramFilter = m => m.author.id === interaction.user.id && 
                          !isNaN(m.content) && 
                          parseInt(m.content) >= 128 && 
                          parseInt(m.content) <= 512;
    
    let ram;
    try {
      const ramCollected = await channel.awaitMessages({ filter: ramFilter, max: 1, time: 120000, errors: ['time'] });
      ram = parseInt(ramCollected.first().content);
      await channel.send(`${client.getText(userId, 'panel_ram_allocated')}: ${ram}MB`);
    } catch (error) {
      await channel.send(client.getText(userId, 'invalid_value'));
      setTimeout(() => channel.delete(), 5000);
      return;
    }
    
    // Etapa 5: Upload do arquivo ZIP
    await channel.send(client.getText(userId, 'cmd_up_zip'));
    
    const zipFilter = m => m.author.id === interaction.user.id && 
                          m.attachments.size > 0 && 
                          m.attachments.first().name.endsWith('.zip');
    
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
    
    // Etapa 6: Processar o ZIP e criar o container
    await channel.send(client.getText(userId, 'cmd_up_creating_env'));
    
    try {
      // Baixar o arquivo ZIP
      const zipPath = path.join(__dirname, '..', 'temp', `${userId}_${botId}.zip`);
      const extractPath = path.join(__dirname, '..', 'containers', userId, botId);
      
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
      
      // Preparar os dados do bot
      const botData = {
        botId,
        name: `bot-${userId}-${botId}`,
        language,
        mainFile,
        ram
      };
      
      // Criar o Dockerfile
      let dockerfileContent = languageConfig.dockerfile.replace('{{MAIN_FILE}}', mainFile);
      
      // Caso especial para C#
      if (language === 'csharp') {
        // Extrair nome do projeto do arquivo principal
        const projectName = path.basename(mainFile, '.cs');
        dockerfileContent = dockerfileContent.replace('{{PROJECT_NAME}}', projectName);
      }
      
      fs.writeFileSync(path.join(extractPath, 'Dockerfile'), dockerfileContent);
      
      // Criar o container
      await channel.send(client.getText(userId, 'cmd_up_creating_container'));
      
      // Construir a imagem Docker
      const imageName = `bot-host-${userId}-${botId}`.toLowerCase();
      
      await exec(`docker build -t ${imageName} ${extractPath}`);
      
      // Criar e iniciar o container
      const createResult = await exec(`docker create --name ${botData.name} -m ${ram}m --memory-swap ${ram}m --cpu-shares 128 --restart unless-stopped ${imageName}`);
      
      const containerId = createResult.stdout.trim();
      
      await exec(`docker start ${containerId}`);
      
      // Salvar no banco de dados
      userContainers.push({
        botId,
        containerId,
        name: botData.name,
        language,
        mainFile,
        ram,
        status: 'running',
        createdAt: new Date().toISOString()
      });
      
      client.db.set(`users.${userId}.containers`, userContainers);
      
      await channel.send(
        client.getText(userId, 'cmd_up_success').replace('{containerId}', containerId)
      );
      
      // Fechar o canal após alguns segundos
      setTimeout(() => channel.delete(), 30000);
      
    } catch (error) {
      console.error('Erro ao hospedar o bot:', error);
      await channel.send(
        client.getText(userId, 'cmd_up_error').replace('{error}', error.message)
      );
      setTimeout(() => channel.delete(), 30000);
    }
  }
};
