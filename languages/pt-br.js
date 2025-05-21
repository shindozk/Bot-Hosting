// Arquivo de idioma português do Brasil
module.exports = {
  // Mensagens gerais
  welcome: "Bem-vindo ao Bot Host!",
  error: "Ocorreu um erro",
  success: "Operação concluída com sucesso",
  
  // Comandos
  cmd_app_title: "Painel de Gerenciamento de Bots",
  cmd_app_description: "Selecione um bot para gerenciar:",
  cmd_app_no_bots: "Você ainda não tem nenhum bot hospedado. Use o comando `/up` para hospedar um bot.",
  cmd_app_footer: "{count} bots hospedados",
  
  // Painel de gerenciamento
  panel_title: "Bot: {botName}",
  panel_description: "Gerenciamento do seu bot hospedado",
  panel_status: "Status",
  panel_language: "Linguagem",
  panel_main_file: "Arquivo Principal",
  panel_ram_allocated: "RAM Alocada",
  panel_cpu_usage: "Uso de CPU",
  panel_ram_usage: "Uso de RAM",
  panel_disk_usage: "Uso de Disco",
  panel_created_at: "Criado em",
  
  // Botões do painel
  btn_start: "Iniciar",
  btn_stop: "Parar",
  btn_restart: "Reiniciar",
  btn_delete: "Excluir",
  btn_refresh: "Atualizar",
  btn_upload: "Upload",
  btn_change_ram: "Alterar RAM",
  btn_logs: "Logs",
  btn_backup: "Backup",
  btn_back: "Voltar",
  
  // Comando up
  cmd_up_title: "Selecione a Linguagem",
  cmd_up_description: "Qual linguagem seu bot utiliza?",
  cmd_up_setup_channel: "Canal de configuração criado: {channel}. Vá até lá para configurar seu bot.",
  cmd_up_hello: "Olá {user}, vamos configurar seu bot para hospedagem!",
  cmd_up_main_file: "Qual é o nome do arquivo principal do seu bot? (Ex: {examples})",
  cmd_up_bot_id: "Qual é o ID do seu bot no Discord?",
  cmd_up_bot_found: "Bot encontrado: {botTag}",
  cmd_up_bot_not_found: "Bot não encontrado no Discord. Certifique-se de que o ID está correto.",
  cmd_up_ram: "Quanta memória RAM você deseja alocar para o bot? (entre 128 e 512 MB)",
  cmd_up_zip: "Por fim, envie o arquivo .zip do seu bot. Certifique-se de não incluir a pasta node_modules e o arquivo package-lock.json para melhor performance.",
  cmd_up_zip_received: "Arquivo ZIP recebido! Processando...",
  cmd_up_creating_env: "Criando o ambiente para o seu bot. Isso pode levar alguns minutos...",
  cmd_up_creating_container: "Criando container Docker...",
  cmd_up_success: "✅ Bot hospedado com sucesso! ID do container: `{containerId}`\n\nVocê pode gerenciar seu bot usando o comando `/app`.",
  cmd_up_error: "❌ Ocorreu um erro ao hospedar seu bot: {error}",
  cmd_up_limit_reached: "Você atingiu o limite máximo de 3 bots hospedados. Delete algum bot para hospedar um novo.",
  
  // Logs
  logs_title: "Logs do Bot: {botName}",
  logs_description: "Últimas 50 linhas de logs do container",
  logs_empty: "Nenhum log disponível.",
  
  // Erros e avisos
  timeout: "Tempo esgotado. Processo cancelado.",
  invalid_id: "Tempo esgotado ou ID inválido. Processo cancelado.",
  invalid_value: "Tempo esgotado ou valor inválido. Processo cancelado.",
  invalid_file: "Tempo esgotado ou arquivo inválido. Processo cancelado.",
  
  // Sistema de idiomas
  language_title: "Configurações de Idioma",
  language_description: "Selecione seu idioma preferido:",
  language_success: "Idioma alterado para {language} com sucesso!",
  
  // Ajuda
  help_title: "🤖 Bot Host - Sistema de Hospedagem",
  help_description: "Este bot permite que você hospede seus bots do Discord em contêineres Docker.",
  help_up: "Inicia o processo de hospedagem de um novo bot",
  help_app: "Gerencia seus bots já hospedados",
  help_ping: "Verifica latência e estado do sistema",
  help_apt: "Instala pacotes adicionais em um container Ubuntu",
  help_help: "Exibe esta mensagem de ajuda",
  help_language: "Altera o idioma do bot",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "Latência do bot e estado do sistema",
  ping_latency: "Latência do bot",
  ping_api_latency: "Latência da API",
  ping_docker_status: "Estado do Docker",
  ping_system_cpu: "CPU do sistema",
  ping_system_memory: "Memória do sistema",
  ping_system_uptime: "Tempo de atividade"
};