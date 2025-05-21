// Arquivo de idioma espanhol
module.exports = {
  // Mensagens gerais
  welcome: "¡Bienvenido a Bot Host!",
  error: "Se ha producido un error",
  success: "Operación completada con éxito",
  
  // Comandos
  cmd_app_title: "Panel de Gestión de Bots",
  cmd_app_description: "Seleccione un bot para gestionar:",
  cmd_app_no_bots: "Aún no tienes ningún bot alojado. Usa el comando `/up` para alojar un bot.",
  cmd_app_footer: "{count} bots alojados",
  
  // Painel de gerenciamento
  panel_title: "Bot: {botName}",
  panel_description: "Gestión de tu bot alojado",
  panel_status: "Estado",
  panel_language: "Lenguaje",
  panel_main_file: "Archivo Principal",
  panel_ram_allocated: "RAM Asignada",
  panel_cpu_usage: "Uso de CPU",
  panel_ram_usage: "Uso de RAM",
  panel_disk_usage: "Uso de Disco",
  panel_created_at: "Creado el",
  
  // Botões do painel
  btn_start: "Iniciar",
  btn_stop: "Detener",
  btn_restart: "Reiniciar",
  btn_delete: "Eliminar",
  btn_refresh: "Actualizar",
  btn_upload: "Subir",
  btn_change_ram: "Cambiar RAM",
  btn_logs: "Registros",
  btn_backup: "Copia de seguridad",
  btn_back: "Volver",
  
  // Comando up
  cmd_up_title: "Seleccione el Lenguaje",
  cmd_up_description: "¿Qué lenguaje utiliza tu bot?",
  cmd_up_setup_channel: "Canal de configuración creado: {channel}. Ve allí para configurar tu bot.",
  cmd_up_hello: "Hola {user}, ¡vamos a configurar tu bot para alojamiento!",
  cmd_up_main_file: "¿Cuál es el nombre del archivo principal de tu bot? (Ej: {examples})",
  cmd_up_bot_id: "¿Cuál es el ID de Discord de tu bot?",
  cmd_up_bot_found: "Bot encontrado: {botTag}",
  cmd_up_bot_not_found: "Bot no encontrado en Discord. Asegúrate de que el ID sea correcto.",
  cmd_up_ram: "¿Cuánta memoria RAM deseas asignar al bot? (entre 128 y 512 MB)",
  cmd_up_zip: "Por último, sube el archivo .zip de tu bot. Asegúrate de no incluir la carpeta node_modules y el archivo package-lock.json para un mejor rendimiento.",
  cmd_up_zip_received: "¡Archivo ZIP recibido! Procesando...",
  cmd_up_creating_env: "Creando el entorno para tu bot. Esto puede llevar unos minutos...",
  cmd_up_creating_container: "Creando contenedor Docker...",
  cmd_up_success: "✅ ¡Bot alojado con éxito! ID del contenedor: `{containerId}`\n\nPuedes gestionar tu bot usando el comando `/app`.",
  cmd_up_error: "❌ Se produjo un error al alojar tu bot: {error}",
  cmd_up_limit_reached: "Has alcanzado el límite máximo de 3 bots alojados. Elimina un bot para alojar uno nuevo.",
  
  // Logs
  logs_title: "Registros del Bot: {botName}",
  logs_description: "Últimas 50 líneas de registros del contenedor",
  logs_empty: "No hay registros disponibles.",
  
  // Erros e avisos
  timeout: "Tiempo de espera agotado. Proceso cancelado.",
  invalid_id: "Tiempo de espera agotado o ID no válido. Proceso cancelado.",
  invalid_value: "Tiempo de espera agotado o valor no válido. Proceso cancelado.",
  invalid_file: "Tiempo de espera agotado o archivo no válido. Proceso cancelado.",
  
  // Sistema de idiomas
  language_title: "Configuración de Idioma",
  language_description: "Selecciona tu idioma preferido:",
  language_success: "¡Idioma cambiado a {language} con éxito!",
  
  // Ajuda
  help_title: "🤖 Bot Host - Sistema de Alojamiento",
  help_description: "Este bot te permite alojar tus bots de Discord en contenedores Docker.",
  help_up: "Inicia el proceso de alojamiento de un nuevo bot",
  help_app: "Gestiona tus bots ya alojados",
  help_ping: "Verifica la latencia y el estado del sistema",
  help_apt: "Instala paquetes adicionales en un contenedor Ubuntu",
  help_help: "Muestra este mensaje de ayuda",
  help_language: "Cambia el idioma del bot",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "Latencia del bot y estado del sistema",
  ping_latency: "Latencia del bot",
  ping_api_latency: "Latencia de la API",
  ping_docker_status: "Estado de Docker",
  ping_system_cpu: "CPU del sistema",
  ping_system_memory: "Memoria del sistema",
  ping_system_uptime: "Tiempo de actividad"
};