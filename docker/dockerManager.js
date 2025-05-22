// Utilitários para Docker
const Docker = require('dockerode');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const AdmZip = require('adm-zip');

// Inicializa o cliente Docker
const docker = new Docker();

/**
 * Inicia um container Docker
 * @param {string} containerId - ID do container
 * @returns {Promise} - Promise com o resultado da operação
 */
async function startContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    return await container.start();
  } catch (error) {
    console.error(`Erro ao iniciar container ${containerId}:`, error);
    throw error;
  }
}

/**
 * Para um container Docker
 * @param {string} containerId - ID do container
 * @returns {Promise} - Promise com o resultado da operação
 */
async function stopContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    return await container.stop();
  } catch (error) {
    console.error(`Erro ao parar container ${containerId}:`, error);
    throw error;
  }
}

/**
 * Reinicia um container Docker
 * @param {string} containerId - ID do container
 * @returns {Promise} - Promise com o resultado da operação
 */
async function restartContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    return await container.restart();
  } catch (error) {
    console.error(`Erro ao reiniciar container ${containerId}:`, error);
    throw error;
  }
}

/**
 * Exclui um container Docker
 * @param {string} containerId - ID do container
 * @returns {Promise} - Promise com o resultado da operação
 */
async function deleteContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    
    // Verificar se o container está rodando e pará-lo se necessário
    try {
      await container.stop();
    } catch (e) {
      console.warn(`Could not stop container ${containerId}: ${e.message}`);
    }
    
    return await container.remove();
  } catch (error) {
    console.error(`Erro ao excluir container ${containerId}:`, error);
    throw error;
  }
}

/**
 * Obtém informações de um container Docker
 * @param {string} containerId - ID do container
 * @returns {Promise<Object>} - Promise com as informações do container
 */
async function getContainerInfo(containerId) {
  try {
    const container = docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });
    const inspectData = await container.inspect();
    
    // Cálculo de uso de CPU
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuUsage = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0;
    
    // Uso de memória
    const memoryUsage = stats.memory_stats.usage / (1024 * 1024);
    const memoryLimit = stats.memory_stats.limit / (1024 * 1024);
    
    // Uso de disco
    const diskUsage = await getDiskUsage(containerId);
    
    return {
      cpu: cpuUsage.toFixed(2),
      memory: {
        used: memoryUsage.toFixed(2),
        total: memoryLimit.toFixed(2)
      },
      disk: {
        used: diskUsage.toFixed(2)
      },
      status: inspectData.State.Status,
      uptime: inspectData.State.StartedAt
    };
  } catch (error) {
    console.error(`Erro ao obter informações do container ${containerId}:`, error);
    return {
      cpu: '0',
      memory: {
        used: '0',
        total: '0'
      },
      disk: {
        used: '0'
      },
      status: 'unknown',
      uptime: null
    };
  }
}

/**
 * Obtém o uso de disco de um container
 * @param {string} containerId - ID do container
 * @returns {Promise<number>} - Promise com o uso de disco em MB
 */
async function getDiskUsage(containerId) {
  try {
    const { stdout } = await exec(`docker exec ${containerId} du -s /app | cut -f1`);
    return parseInt(stdout.trim()) / 1024; // Converter para MB
  } catch (error) {
    console.error(`Erro ao obter uso de disco do container ${containerId}:`, error);
    return 0;
  }
}

/**
 * Verifica o status do Docker
 * @returns {Promise<boolean>} - Promise com o status do Docker
 */
async function checkDockerStatus() {
  try {
    await docker.ping();
    return true;
  } catch (error) {
    console.error('Erro ao verificar status do Docker:', error);
    return false;
  }
}

/**
 * Obtém informações do sistema
 * @returns {Promise<Object>} - Promise com as informações do sistema
 */
async function getSystemInfo() {
  try {
    const cpuUsage = await si.currentLoad();
    const memUsage = await si.mem();
    const uptime = await si.time().uptime;
    
    // Formatar tempo de atividade
    const uptimeDays = Math.floor(uptime / 86400);
    const uptimeHours = Math.floor((uptime % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeFormatted = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;
    
    return {
      cpu: {
        usage: cpuUsage.currentLoad.toFixed(2)
      },
      memory: {
        used: (memUsage.used / (1024 * 1024 * 1024)).toFixed(2), // GB
        total: (memUsage.total / (1024 * 1024 * 1024)).toFixed(2) // GB
      },
      uptime: uptimeFormatted
    };
  } catch (error) {
    console.error('Erro ao obter informações do sistema:', error);
    return {
      cpu: { usage: '0' },
      memory: { used: '0', total: '0' },
      uptime: '0d 0h 0m'
    };
  }
}

/**
 * Cria um backup de um container
 * @param {string} containerId - ID do container
 * @param {Object} containerData - Dados do container
 * @returns {Promise<string>} - Promise com o caminho do arquivo de backup
 */
async function createBackup(containerId, containerData) {
  try {
    const extractPath = path.join(__dirname, '..', 'containers', containerData.userId, containerData.botId);
    const zipPath = path.join(__dirname, '..', 'temp', `backup_${containerId}.zip`);

    fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });

    const zip = new AdmZip();
    zip.addLocalFolder(extractPath);
    zip.writeZip(zipPath);

    return zipPath;
  } catch (error) {
    console.error(`Erro ao criar backup do container ${containerId}:`, error);
    throw error;
  }
}

/**
 * Formata o tempo de uptime
 * @param {string} uptimeDate - Data de início do container
 * @returns {string} - Uptime formatado
 */
function formatUptime(uptimeDate) {
  if (!uptimeDate) return 'N/A';
  
  const startTime = new Date(uptimeDate);
  const now = new Date();
  const uptimeMs = now - startTime;
  const totalSeconds = Math.floor(uptimeMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (days > 0 ? `${days}d ` : '') +
         `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

module.exports = {
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
  getContainerInfo,
  getDiskUsage,
  checkDockerStatus,
  getSystemInfo,
  createBackup,
  formatUptime,
  docker
};
