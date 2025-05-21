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

module.exports = {
  loadLanguage,
  clearLanguageCache,
  getAvailableLanguages
};
