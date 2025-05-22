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
  panel_title: "🤖 Painel do Bot: {botName}",
  panel_description: "Gerenciamento do seu bot hospedado (ID: `{containerId}`)",
  panel_status: "📊 Status",
  panel_language: "🌐 Linguagem",
  panel_main_file: "📄 Arquivo Principal",
  panel_uptime: "⏰ Uptime",
  panel_ram_allocated: "🧠 RAM Alocada",
  panel_cpu_usage: "💻 Uso de CPU",
  panel_ram_usage: "🧠 Uso de RAM",
  panel_disk_usage: "💾 Uso de Disco",
  panel_created_at: "📅 Criado em",
  panel_last_update: "Última atualização: {time}",
  
  // Botões do painel
  btn_start: "Iniciar",
  btn_stop: "Parar",
  btn_restart: "Reiniciar",
  btn_delete: "Excluir",
  btn_refresh: "Atualizar",
  btn_upload: "Atualizar Código",
  btn_change_ram: "Alterar RAM",
  btn_logs: "Ver Logs",
  btn_backup: "Backup",
  btn_back: "Voltar",
  
  // Comando up
  cmd_up_limit_reached: "Você atingiu o limite máximo de 3 bots hospedados. Delete algum bot para hospedar um novo.",
  cmd_up_setup_channel: "Canal de configuração criado: {channel}. Vá até lá para configurar seu bot.",
  cmd_up_hello: "Olá {user}, vamos configurar seu bot para hospedagem!",
  cmd_up_bot_id: "Qual é o ID do seu bot no Discord? (Este é o ID da aplicação, não o ID do seu usuário bot)",
  cmd_up_bot_found: "Bot encontrado: **{botTag}**.",
  cmd_up_bot_not_found: "Não foi possível encontrar um bot com esse ID ou ele não está acessível. Certifique-se de que o ID está correto.",
  cmd_up_title: "Selecione a Linguagem do seu Bot",
  cmd_up_description: "Por favor, selecione a linguagem de programação que seu bot utiliza na lista abaixo:",
  cmd_up_language_selected: "Linguagem selecionada: **{languageName}**.",
  cmd_up_main_file: "Qual é o nome do arquivo principal do seu bot? (Ex: `{examples}`)",
  cmd_up_main_file_confirm: "Arquivo principal: `{fileName}`. Entendido!",
  cmd_up_ram: "Quanta memória RAM você deseja alocar para o bot? (Mínimo: 128MB, Máximo: {maxRamPerContainer}MB)",
  cmd_up_ram_confirm: "RAM alocada: `{ram}MB`.",
  cmd_up_zip: "Por fim, envie o arquivo .zip do seu bot. **Importante:** Certifique-se de não incluir a pasta `node_modules` (se for um bot Node.js) e o arquivo `package-lock.json` para uma melhor performance e upload.",
  cmd_up_zip_received: "Arquivo ZIP recebido! Processando...",
  cmd_up_downloading_zip: "🚀 Ótimo! Estou baixando o arquivo ZIP agora. Isso pode levar um momento...",
  cmd_up_zip_downloaded: "✅ Arquivo ZIP baixado com sucesso! Iniciando a configuração...",
  cmd_up_creating_env: "Preparando o ambiente para o seu bot. Isso pode levar alguns segundos...",
  cmd_up_creating_container: "Criando e iniciando o container Docker do seu bot...",
  cmd_up_success: "🎉 Parabéns! Seu bot foi hospedado com sucesso! ID do Container: `{containerId}`\n\nVocê pode gerenciar seu bot usando o comando `/app`.",
  cmd_up_download_error: "❌ Ocorreu um erro ao baixar seu arquivo ZIP: {error}. Por favor, verifique o arquivo e tente novamente.",
  cmd_up_docker_build_error: "❌ Houve um erro ao construir a imagem Docker do seu bot: {error}. Verifique o seu código ou Dockerfile.",
  cmd_up_docker_container_error: "❌ Houve um erro ao criar ou iniciar o container do seu bot: {error}. Isso pode indicar um problema com o bot em si.",
  cmd_up_error: "❌ Ocorreu um erro inesperado ao hospedar seu bot: {error}. Por favor, tente novamente mais tarde.",
  timeout: "⏰ Tempo esgotado! Não recebi sua resposta a tempo. Por favor, execute o comando novamente.",
  invalid_file: "❌ Tipo de arquivo inválido. Por favor, envie um arquivo `.zip`.",
  invalid_value: "❌ Valor inválido. Por favor, forneça um número válido para a RAM (entre 128 e {maxRamPerContainer} MB).",
  
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
  ping_system_uptime: "Tempo de atividade",
  
  // Apt
  apt_title: "Instalação de Pacotes",
  apt_description: "Selecione um bot para instalar pacotes:",
  apt_installing: "Instalando pacotes: `{packages}`...",
  apt_success: "✅ Pacotes instalados!\n\nSaída:\n```{output}```",
  apt_error: "❌ Erro ao instalar pacotes: ```{error}```",
  
  // Backup
  backup_title: "Backup",
  backup_description: "Selecione onde enviar o backup:",
  backup_channel: "Enviar neste canal",
  backup_dm: "Enviar por DM",
  backup_generating: "Gerando backup... Por favor, aguarde.",
  backup_success_channel: "Aqui está o backup do bot **{botName}**:",
  backup_success_dm: "✅ Backup enviado por DM!",
  backup_error_dm: "❌ Não foi possível enviar o backup por DM.",
  backup_error: "❌ Erro ao criar backup: ```{error}```",
  
  // Ações de container
  container_start_success: "✅ Container do bot <@{botId}> iniciado!",
  container_stop_success: "✅ Container do bot <@{botId}> parado!",
  container_restart_success: "✅ Container do bot <@{botId}> reiniciado!",
  container_delete_success: "✅ Container do bot <@{botId}> excluído!",
  container_refresh_success: "✅ Painel atualizado!",
  container_not_found: "Container não encontrado!",
  container_no_permission: "Você não tem permissão para gerenciar este container!",
  
  // Mensagens temporárias
  temp_message_delete_after: "Esta mensagem será excluída em {seconds} segundos."
};
