// Arquivo principal do bot (index.js ou similar)
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
  MessageFlags,
  REST,
  Routes
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { JsonDatabase } = require('wio.db');
const config = require('./config/config.js');
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
client.config = config; // Garante que a configuração está no objeto client

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

// --- NOVO: Função para registrar comandos slash ---
async function registerSlashCommands() {
  try {
    console.log('Iniciando registro de comandos slash...');
      
    const commands = [];
    // Percorre todos os comandos carregados na coleção do client
    for (const command of client.commands.values()) {
      if ('data' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[AVISO] O comando "${command.name}" não tem a propriedade "data" necessária para registro de slash command.`);
      }
    }
      
    const rest = new REST({ version: '10' }).setToken(config.token); // Usa config.token diretamente
      
    await rest.put(
      Routes.applicationCommands(client.config.clientId),
      { body: commands }
    );
      
    console.log(`${commands.length} comandos slash registrados com sucesso!`);
  } catch (error) {
    console.error('Erro ao registrar comandos slash:', error);
  }
}
// --- FIM DA FUNÇÃO DE REGISTRO ---

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client)); // Passa o client
  } else {
    client.on(event.name, (...args) => event.execute(...args, client)); // Passa o client
  }
  
  console.log(`Evento carregado: ${event.name}`);
}

// Inicializar usuário antes de qualquer interação
client.on('interactionCreate', async (interaction) => {
  if (interaction.user && interaction.user.id) {
    initializeUser(db, interaction.user.id, config.defaultLanguage);
  }
});

// Chamar a função de registro de comandos antes do login do bot
(async () => {
  await registerSlashCommands();
  client.login(config.token);
})(); // Função auto-executável para esperar o registro dos comandos
