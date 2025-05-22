// Gerenciador de idiomas
const fs = require('fs');
const path = require('path');

// Cache para armazenar os idiomas carregados
const languageCache = new Map();

/**
 * Carrega um arquivo de idioma
 * @param {string} lang - Código do idioma
 * @returns {Object} - Objeto com as strings traduzidas
 */
function loadLanguage(lang) {
  // Se o idioma já estiver em cache, retorna do cache
  if (languageCache.has(lang)) {
    return languageCache.get(lang);
  }
  
  try {
    // Caminho para o arquivo de idioma
    const langPath = path.join(__dirname, '..', 'languages', `${lang}.js`);
    
    // Verifica se o arquivo existe
    if (fs.existsSync(langPath)) {
      // Carrega o arquivo de idioma
      const langFile = require(langPath);
      
      // Armazena no cache
      languageCache.set(lang, langFile);
      
      return langFile;
    } else {
      // Se o arquivo não existir, tenta carregar o idioma padrão
      console.warn(`Arquivo de idioma ${lang} não encontrado. Usando idioma padrão.`);
      return loadLanguage('en');
    }
  } catch (error) {
    console.error(`Erro ao carregar arquivo de idioma ${lang}:`, error);
    
    // Em caso de erro, retorna um objeto vazio
    return {};
  }
}

/**
 * Limpa o cache de idiomas
 */
function clearLanguageCache() {
  languageCache.clear();
}

/**
 * Obtém a lista de idiomas disponíveis
 * @returns {Array} - Array com os códigos dos idiomas disponíveis
 */
function getAvailableLanguages() {
  const languagesPath = path.join(__dirname, '..', 'languages');
  
  try {
    // Lista os arquivos no diretório de idiomas
    const files = fs.readdirSync(languagesPath).filter(file => file.endsWith('.js'));
    
    // Extrai os códigos de idioma dos nomes dos arquivos
    return files.map(file => file.replace('.js', ''));
  } catch (error) {
    console.error('Erro ao obter idiomas disponíveis:', error);
    return [];
  }
}

/**
 * Inicializa o usuário no banco de dados se não existir
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} defaultLanguage - Idioma padrão
 */
function initializeUser(db, userId, defaultLanguage = 'en') {
  // Verifica se o usuário já existe no banco
  const userData = db.get(`users.${userId}`);
  
  // Se não existir, cria um registro para o usuário
  if (!userData) {
    db.set(`users.${userId}`, {
      language: defaultLanguage,
      containers: []
    });
    console.log(`Usuário ${userId} inicializado no banco de dados com idioma ${defaultLanguage}`);
  } else if (!userData.containers) {
    // Se existir mas não tiver o campo containers, adiciona
    db.set(`users.${userId}.containers`, []);
    console.log(`Campo containers adicionado para o usuário ${userId}`);
  }
  
  return db.get(`users.${userId}`);
}

/**
 * Obtém o idioma do usuário
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} defaultLanguage - Idioma padrão
 * @returns {string} - Código do idioma do usuário
 */
function getUserLanguage(db, userId, defaultLanguage = 'en') {
  // Inicializa o usuário se não existir
  initializeUser(db, userId, defaultLanguage);
  
  // Retorna o idioma do usuário
  return db.get(`users.${userId}.language`) || defaultLanguage;
}

/**
 * Obtém texto traduzido para o idioma do usuário
 * @param {Object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} key - Chave do texto a ser traduzido
 * @param {Object} replacements - Substituições a serem feitas no texto
 * @param {string} defaultLanguage - Idioma padrão
 * @returns {string} - Texto traduzido
 */
function getText(db, userId, key, replacements = {}, defaultLanguage = 'en') {
  // Obtém o idioma do usuário
  const userLanguage = getUserLanguage(db, userId, defaultLanguage);
  
  // Carrega o arquivo de idioma
  const langFile = loadLanguage(userLanguage);
  
  // Obtém o texto traduzido
  let text = langFile[key];
  
  // Se não encontrar, tenta no idioma padrão
  if (!text) {
    text = loadLanguage(defaultLanguage)[key];
  }
  
  // Se ainda não encontrar, retorna a chave
  if (!text) {
    return key;
  }
  
  // Faz as substituições
  Object.entries(replacements).forEach(([placeholder, value]) => {
    text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
  });
  
  return text;
}

module.exports = {
  loadLanguage,
  clearLanguageCache,
  getAvailableLanguages,
  initializeUser,
  getUserLanguage,
  getText
};
