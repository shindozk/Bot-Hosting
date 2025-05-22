// Utilitários para gerenciamento de usuários e containers
const { JsonDatabase } = require('wio.db');
const { initializeUser } = require('./languageManager');
const path = require('path');
const fs = require('fs');

/**
 * Busca informações de um bot no Discord
 * @param {Object} client - Cliente do Discord
 * @param {string} botId - ID do bot
 * @returns {Promise<Object>} - Informações do bot
 */
async function fetchBotInfo(client, botId) {
  try {
    const bot = await client.users.fetch(botId);
    return {
      id: bot.id,
      username: bot.username,
      tag: bot.tag,
      avatarURL: bot.displayAvatarURL({ dynamic: true }),
      createdAt: bot.createdAt
    };
  } catch (error) {
    console.error(`Erro ao buscar informações do bot ${botId}:`, error);
    return {
      id: botId,
      username: `Bot Desconhecido (${botId})`,
      tag: `Bot ${botId}`,
      avatarURL: null,
      createdAt: null
    };
  }
}

/**
 * Garante que o diretório de containers exista
 * @param {string} userId - ID do usuário
 * @param {string} botId - ID do bot
 * @returns {string} - Caminho do diretório
 */
function ensureContainerDirectory(userId, botId) {
  const extractPath = path.join(__dirname, '..', 'containers', userId, botId);
  fs.mkdirSync(extractPath, { recursive: true });
  return extractPath;
}

/**
 * Garante que o diretório temporário exista
 * @returns {string} - Caminho do diretório
 */
function ensureTempDirectory() {
  const tempPath = path.join(__dirname, '..', 'temp');
  fs.mkdirSync(tempPath, { recursive: true });
  return tempPath;
}

/**
 * Obtém os containers de um usuário
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @returns {Array} - Lista de containers do usuário
 */
function getUserContainers(db, userId) {
  // Inicializa o usuário se não existir
  initializeUser(db, userId);
  
  // Retorna os containers do usuário
  return db.get(`users.${userId}.containers`) || [];
}

/**
 * Atualiza um container no banco de dados
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {Object} container - Dados do container
 * @returns {boolean} - Se a atualização foi bem-sucedida
 */
function updateContainer(db, userId, container) {
  try {
    const userContainers = getUserContainers(db, userId);
    const containerIndex = userContainers.findIndex(c => c.containerId === container.containerId);
    
    if (containerIndex === -1) {
      return false;
    }
    
    userContainers[containerIndex] = container;
    db.set(`users.${userId}.containers`, userContainers);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar container ${container.containerId}:`, error);
    return false;
  }
}

/**
 * Adiciona um container ao banco de dados
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {Object} container - Dados do container
 * @returns {boolean} - Se a adição foi bem-sucedida
 */
function addContainer(db, userId, container) {
  try {
    const userContainers = getUserContainers(db, userId);
    
    // Adiciona o userId ao container para facilitar backups
    container.userId = userId;
    
    userContainers.push(container);
    db.set(`users.${userId}.containers`, userContainers);
    return true;
  } catch (error) {
    console.error(`Erro ao adicionar container para o usuário ${userId}:`, error);
    return false;
  }
}

/**
 * Remove um container do banco de dados
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} containerId - ID do container
 * @returns {boolean} - Se a remoção foi bem-sucedida
 */
function removeContainer(db, userId, containerId) {
  try {
    const userContainers = getUserContainers(db, userId);
    const containerIndex = userContainers.findIndex(c => c.containerId === containerId);
    
    if (containerIndex === -1) {
      return false;
    }
    
    userContainers.splice(containerIndex, 1);
    db.set(`users.${userId}.containers`, userContainers);
    return true;
  } catch (error) {
    console.error(`Erro ao remover container ${containerId}:`, error);
    return false;
  }
}

/**
 * Busca um container no banco de dados
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} containerId - ID do container
 * @returns {Object|null} - Dados do container ou null se não encontrado
 */
function getContainer(db, userId, containerId) {
  try {
    const userContainers = getUserContainers(db, userId);
    return userContainers.find(c => c.containerId === containerId) || null;
  } catch (error) {
    console.error(`Erro ao buscar container ${containerId}:`, error);
    return null;
  }
}

/**
 * Verifica se um usuário atingiu o limite de containers
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {number} limit - Limite de containers
 * @returns {boolean} - Se o usuário atingiu o limite
 */
function hasReachedContainerLimit(db, userId, limit = 3) {
  const userContainers = getUserContainers(db, userId);
  return userContainers.length >= limit;
}

module.exports = {
  fetchBotInfo,
  ensureContainerDirectory,
  ensureTempDirectory,
  getUserContainers,
  updateContainer,
  addContainer,
  removeContainer,
  getContainer,
  hasReachedContainerLimit
};
