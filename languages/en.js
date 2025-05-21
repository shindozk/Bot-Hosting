// Arquivo de idioma inglês (padrão)
module.exports = {
  // Mensagens gerais
  welcome: "Welcome to Bot Host!",
  error: "An error occurred",
  success: "Operation completed successfully",
  
  // Comandos
  cmd_app_title: "Bot Management Panel",
  cmd_app_description: "Select a bot to manage:",
  cmd_app_no_bots: "You don't have any hosted bots yet. Use the `/up` command to host a bot.",
  cmd_app_footer: "{count} hosted bots",
  
  // Painel de gerenciamento
  panel_title: "Bot: {botName}",
  panel_description: "Management of your hosted bot",
  panel_status: "Status",
  panel_language: "Language",
  panel_main_file: "Main File",
  panel_ram_allocated: "Allocated RAM",
  panel_cpu_usage: "CPU Usage",
  panel_ram_usage: "RAM Usage",
  panel_disk_usage: "Disk Usage",
  panel_created_at: "Created at",
  
  // Botões do painel
  btn_start: "Start",
  btn_stop: "Stop",
  btn_restart: "Restart",
  btn_delete: "Delete",
  btn_refresh: "Refresh",
  btn_upload: "Upload",
  btn_change_ram: "Change RAM",
  btn_logs: "Logs",
  btn_backup: "Backup",
  btn_back: "Back",
  
  // Comando up
  cmd_up_title: "Select Language",
  cmd_up_description: "Which language does your bot use?",
  cmd_up_setup_channel: "Configuration channel created: {channel}. Go there to configure your bot.",
  cmd_up_hello: "Hello {user}, let's configure your bot for hosting!",
  cmd_up_main_file: "What is the name of your bot's main file? (Ex: {examples})",
  cmd_up_bot_id: "What is your bot's Discord ID?",
  cmd_up_bot_found: "Bot found: {botTag}",
  cmd_up_bot_not_found: "Bot not found on Discord. Make sure the ID is correct.",
  cmd_up_ram: "How much RAM do you want to allocate to the bot? (between 128 and 512 MB)",
  cmd_up_zip: "Finally, upload the .zip file of your bot. Make sure not to include the node_modules folder and package-lock.json file for better performance.",
  cmd_up_zip_received: "ZIP file received! Processing...",
  cmd_up_creating_env: "Creating the environment for your bot. This may take a few minutes...",
  cmd_up_creating_container: "Creating Docker container...",
  cmd_up_success: "✅ Bot successfully hosted! Container ID: `{containerId}`\n\nYou can manage your bot using the `/app` command.",
  cmd_up_error: "❌ An error occurred while hosting your bot: {error}",
  cmd_up_limit_reached: "You have reached the maximum limit of 3 hosted bots. Delete a bot to host a new one.",
  
  // Logs
  logs_title: "Logs for Bot: {botName}",
  logs_description: "Last 50 lines of container logs",
  logs_empty: "No logs available.",
  
  // Erros e avisos
  timeout: "Timeout. Process canceled.",
  invalid_id: "Timeout or invalid ID. Process canceled.",
  invalid_value: "Timeout or invalid value. Process canceled.",
  invalid_file: "Timeout or invalid file. Process canceled.",
  
  // Sistema de idiomas
  language_title: "Language Settings",
  language_description: "Select your preferred language:",
  language_success: "Language changed to {language} successfully!",
  
  // Ajuda
  help_title: "🤖 Bot Host - Hosting System",
  help_description: "This bot allows you to host your Discord bots in Docker containers.",
  help_up: "Starts the process of hosting a new bot",
  help_app: "Manages your already hosted bots",
  help_ping: "Checks latency and system status",
  help_apt: "Installs additional packages in an Ubuntu container",
  help_help: "Displays this help message",
  help_language: "Changes the bot's language",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "Bot latency and system status",
  ping_latency: "Bot latency",
  ping_api_latency: "API latency",
  ping_docker_status: "Docker status",
  ping_system_cpu: "System CPU",
  ping_system_memory: "System memory",
  ping_system_uptime: "System uptime"
};