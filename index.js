// Arquivo principal do bot
const { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  AttachmentBuilder, 
  MessageFlags 
} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
const { JsonDatabase } = require('wio.db');
const config = require('./config/config');
const { initializeUser, getUserLanguage, getText } = require('./utils/languageManager');
const { getUserContainers } = require('./utils/userManager');

// Inicialização do banco de dados
const db = new JsonDatabase({ databasePath: './database.json' });

// Configuração do cliente Discord
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ] 
});

// Coleções para armazenar comandos e eventos
client.commands = new Collection();
client.db = db;
client.config = config;

// Função para obter texto traduzido
client.getText = function(userId, key, replacements = {}) {
  return getText(db, userId, key, replacements, config.defaultLanguage);
};

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`Comando carregado: ${command.data.name}`);
  } else {
    console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" necessária.`);
  }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  console.log(`Evento carregado: ${event.name}`);
}

// Inicializar usuário antes de qualquer interação
client.on('interactionCreate', async (interaction) => {
  // Inicializar usuário no banco de dados se não existir
  if (interaction.user && interaction.user.id) {
    initializeUser(db, interaction.user.id, config.defaultLanguage);
  }
});

// Login do bot
client.login(config.token);
