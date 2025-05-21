// Utilitários para Docker
const Docker = require('dockerode');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');

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
    const data = await container.inspect();
    if (data.State.Running) {
      await container.stop();
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
    
    // Calcular uso de CPU
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus;
    const cpuUsage = (cpuDelta / systemCpuDelta) * cpuCount * 100;
    
    // Calcular uso de memória
    const memoryUsage = stats.memory_stats.usage / (1024 * 1024); // Converter para MB
    const memoryLimit = stats.memory_stats.limit / (1024 * 1024); // Converter para MB
    
    // Obter uso de disco
    const diskUsage = await getDiskUsage(containerId);
    
    return {
      cpu: cpuUsage.toFixed(2),
      memory: {
        used: memoryUsage.toFixed(2),
        total: memoryLimit.toFixed(2)
      },
      disk: {
        used: diskUsage.toFixed(2)
      }
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
      }
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
  // Diretório temporário para o backup
  const backupDir = path.join(__dirname, '..', 'temp', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  
  const backupPath = path.join(backupDir, `backup_${containerId}_${Date.now()}.zip`);
  
  // Copiar arquivos do container para um diretório temporário local
  const tempDir = path.join(backupDir, containerId);
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // Usar docker cp para copiar os arquivos do container
    await exec(`docker cp ${containerId}:/app/. ${tempDir}`);
    
    // Criar um arquivo zip dos arquivos
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    // Adicionar todos os arquivos do tempDir para o zip
    const files = getAllFiles(tempDir);
    for (const file of files) {
      const relativePath = path.relative(tempDir, file);
      zip.addLocalFile(file, path.dirname(relativePath));
    }
    
    // Escrever o arquivo zip
    zip.writeZip(backupPath);
    
    // Limpar o diretório temporário
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return backupPath;
  } catch (error) {
    console.error(`Erro ao criar backup do container ${containerId}:`, error);
    // Limpar o diretório temporário em caso de erro
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Obtém todos os arquivos em um diretório, incluindo subdiretórios
 * @param {string} dirPath - Caminho do diretório
 * @param {Array} arrayOfFiles - Array para armazenar os arquivos
 * @returns {Array} - Array com os caminhos dos arquivos
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
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
  getAllFiles,
  docker
};
