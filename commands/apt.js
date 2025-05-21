// Comando apt - Instala pacotes adicionais em um container Ubuntu
const { SlashCommandBuilder } = require('discord.js');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apt')
    .setDescription('Instala pacotes adicionais em um container Ubuntu')
    .addStringOption(option => 
      option.setName('container')
        .setDescription('ID do container')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('packages')
        .setDescription('Pacotes para instalar (separados por espaço)')
        .setRequired(true)),
  
  async execute(interaction) {
    const { client } = interaction;
    const userId = interaction.user.id;
    const containerId = interaction.options.getString('container');
    const packages = interaction.options.getString('packages');
    
    // Verificar se o usuário é dono do container
    const userContainers = client.db.get(`users.${userId}.containers`) || [];
    const container = userContainers.find(c => c.containerId === containerId);
    
    if (!container) {
      return interaction.reply({ 
        content: `${client.getText(userId, 'error')}: Container não encontrado ou você não tem permissão.`, 
        ephemeral: true 
      });
    }
    
    await interaction.deferReply();
    
    try {
      // Executar comando apt-get no container
      const { stdout, stderr } = await exec(`docker exec ${containerId} apt-get update && docker exec ${containerId} apt-get install -y ${packages}`);
      
      // Limitar a saída para evitar mensagens muito longas
      const output = stdout.slice(-1500);
      
      await interaction.editReply({
        content: `✅ ${client.getText(userId, 'success')}:\n\`\`\`\n${output}\n\`\`\``
      });
    } catch (error) {
      console.error('Erro ao instalar pacotes:', error);
      await interaction.editReply({
        content: `❌ ${client.getText(userId, 'error')}:\n\`\`\`\n${error.message.slice(0, 1500)}\n\`\`\``
      });
    }
  }
};
