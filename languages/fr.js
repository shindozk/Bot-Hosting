// Arquivo de idioma francês
module.exports = {
  // Mensagens gerais
  welcome: "Bienvenue sur Bot Host!",
  error: "Une erreur s'est produite",
  success: "Opération terminée avec succès",
  
  // Comandos
  cmd_app_title: "Panneau de Gestion des Bots",
  cmd_app_description: "Sélectionnez un bot à gérer:",
  cmd_app_no_bots: "Vous n'avez pas encore de bots hébergés. Utilisez la commande `/up` pour héberger un bot.",
  cmd_app_footer: "{count} bots hébergés",
  
  // Painel de gerenciamento
  panel_title: "Bot: {botName}",
  panel_description: "Gestion de votre bot hébergé",
  panel_status: "Statut",
  panel_language: "Langage",
  panel_main_file: "Fichier Principal",
  panel_ram_allocated: "RAM Allouée",
  panel_cpu_usage: "Utilisation CPU",
  panel_ram_usage: "Utilisation RAM",
  panel_disk_usage: "Utilisation Disque",
  panel_created_at: "Créé le",
  
  // Botões do painel
  btn_start: "Démarrer",
  btn_stop: "Arrêter",
  btn_restart: "Redémarrer",
  btn_delete: "Supprimer",
  btn_refresh: "Actualiser",
  btn_upload: "Télécharger",
  btn_change_ram: "Modifier RAM",
  btn_logs: "Logs",
  btn_backup: "Sauvegarde",
  btn_back: "Retour",
  
  // Comando up
  cmd_up_title: "Sélectionnez le Langage",
  cmd_up_description: "Quel langage utilise votre bot?",
  cmd_up_setup_channel: "Canal de configuration créé: {channel}. Allez-y pour configurer votre bot.",
  cmd_up_hello: "Bonjour {user}, configurons votre bot pour l'hébergement!",
  cmd_up_main_file: "Quel est le nom du fichier principal de votre bot? (Ex: {examples})",
  cmd_up_bot_id: "Quel est l'ID Discord de votre bot?",
  cmd_up_bot_found: "Bot trouvé: {botTag}",
  cmd_up_bot_not_found: "Bot non trouvé sur Discord. Assurez-vous que l'ID est correct.",
  cmd_up_ram: "Combien de RAM souhaitez-vous allouer au bot? (entre 128 et 512 MB)",
  cmd_up_zip: "Enfin, téléchargez le fichier .zip de votre bot. Assurez-vous de ne pas inclure le dossier node_modules et le fichier package-lock.json pour de meilleures performances.",
  cmd_up_zip_received: "Fichier ZIP reçu! Traitement en cours...",
  cmd_up_creating_env: "Création de l'environnement pour votre bot. Cela peut prendre quelques minutes...",
  cmd_up_creating_container: "Création du conteneur Docker...",
  cmd_up_success: "✅ Bot hébergé avec succès! ID du conteneur: `{containerId}`\n\nVous pouvez gérer votre bot en utilisant la commande `/app`.",
  cmd_up_error: "❌ Une erreur s'est produite lors de l'hébergement de votre bot: {error}",
  cmd_up_limit_reached: "Vous avez atteint la limite maximale de 3 bots hébergés. Supprimez un bot pour en héberger un nouveau.",
  
  // Logs
  logs_title: "Logs du Bot: {botName}",
  logs_description: "50 dernières lignes des logs du conteneur",
  logs_empty: "Aucun log disponible.",
  
  // Erros e avisos
  timeout: "Délai expiré. Processus annulé.",
  invalid_id: "Délai expiré ou ID invalide. Processus annulé.",
  invalid_value: "Délai expiré ou valeur invalide. Processus annulé.",
  invalid_file: "Délai expiré ou fichier invalide. Processus annulé.",
  
  // Sistema de idiomas
  language_title: "Paramètres de Langue",
  language_description: "Sélectionnez votre langue préférée:",
  language_success: "Langue changée en {language} avec succès!",
  
  // Ajuda
  help_title: "🤖 Bot Host - Système d'Hébergement",
  help_description: "Ce bot vous permet d'héberger vos bots Discord dans des conteneurs Docker.",
  help_up: "Démarre le processus d'hébergement d'un nouveau bot",
  help_app: "Gère vos bots déjà hébergés",
  help_ping: "Vérifie la latence et l'état du système",
  help_apt: "Installe des packages supplémentaires dans un conteneur Ubuntu",
  help_help: "Affiche ce message d'aide",
  help_language: "Change la langue du bot",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "Latence du bot et état du système",
  ping_latency: "Latence du bot",
  ping_api_latency: "Latence de l'API",
  ping_docker_status: "État de Docker",
  ping_system_cpu: "CPU du système",
  ping_system_memory: "Mémoire du système",
  ping_system_uptime: "Temps de fonctionnement"
};