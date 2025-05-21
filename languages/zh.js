// Arquivo de idioma chinês
module.exports = {
  // Mensagens gerais
  welcome: "欢迎使用 Bot Host！",
  error: "发生错误",
  success: "操作成功完成",
  
  // Comandos
  cmd_app_title: "机器人管理面板",
  cmd_app_description: "选择要管理的机器人：",
  cmd_app_no_bots: "您还没有托管任何机器人。使用 `/up` 命令来托管一个机器人。",
  cmd_app_footer: "{count} 个托管的机器人",
  
  // Painel de gerenciamento
  panel_title: "机器人: {botName}",
  panel_description: "管理您的托管机器人",
  panel_status: "状态",
  panel_language: "语言",
  panel_main_file: "主文件",
  panel_ram_allocated: "分配的内存",
  panel_cpu_usage: "CPU 使用率",
  panel_ram_usage: "内存使用率",
  panel_disk_usage: "磁盘使用率",
  panel_created_at: "创建于",
  
  // Botões do painel
  btn_start: "启动",
  btn_stop: "停止",
  btn_restart: "重启",
  btn_delete: "删除",
  btn_refresh: "刷新",
  btn_upload: "上传",
  btn_change_ram: "更改内存",
  btn_logs: "日志",
  btn_backup: "备份",
  btn_back: "返回",
  
  // Comando up
  cmd_up_title: "选择语言",
  cmd_up_description: "您的机器人使用哪种语言？",
  cmd_up_setup_channel: "配置频道已创建: {channel}。请前往该频道配置您的机器人。",
  cmd_up_hello: "您好 {user}，让我们为您的机器人配置托管环境！",
  cmd_up_main_file: "您的机器人的主文件名是什么？(例如: {examples})",
  cmd_up_bot_id: "您的机器人的 Discord ID 是什么？",
  cmd_up_bot_found: "找到机器人: {botTag}",
  cmd_up_bot_not_found: "在 Discord 上找不到机器人。请确保 ID 正确。",
  cmd_up_ram: "您想为机器人分配多少内存？(128 到 512 MB 之间)",
  cmd_up_zip: "最后，上传您机器人的 .zip 文件。为了获得更好的性能，请确保不包含 node_modules 文件夹和 package-lock.json 文件。",
  cmd_up_zip_received: "已收到 ZIP 文件！正在处理...",
  cmd_up_creating_env: "正在为您的机器人创建环境。这可能需要几分钟...",
  cmd_up_creating_container: "正在创建 Docker 容器...",
  cmd_up_success: "✅ 机器人成功托管！容器 ID: `{containerId}`\n\n您可以使用 `/app` 命令管理您的机器人。",
  cmd_up_error: "❌ 托管机器人时发生错误: {error}",
  cmd_up_limit_reached: "您已达到最多 3 个托管机器人的限制。删除一个机器人以托管新机器人。",
  
  // Logs
  logs_title: "机器人日志: {botName}",
  logs_description: "容器日志的最后 50 行",
  logs_empty: "没有可用的日志。",
  
  // Erros e avisos
  timeout: "超时。进程已取消。",
  invalid_id: "超时或无效 ID。进程已取消。",
  invalid_value: "超时或无效值。进程已取消。",
  invalid_file: "超时或无效文件。进程已取消。",
  
  // Sistema de idiomas
  language_title: "语言设置",
  language_description: "选择您偏好的语言：",
  language_success: "语言已成功更改为 {language}！",
  
  // Ajuda
  help_title: "🤖 Bot Host - 托管系统",
  help_description: "此机器人允许您在 Docker 容器中托管您的 Discord 机器人。",
  help_up: "开始托管新机器人的流程",
  help_app: "管理您已托管的机器人",
  help_ping: "检查延迟和系统状态",
  help_apt: "在 Ubuntu 容器中安装额外的软件包",
  help_help: "显示此帮助信息",
  help_language: "更改机器人的语言",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "机器人延迟和系统状态",
  ping_latency: "机器人延迟",
  ping_api_latency: "API 延迟",
  ping_docker_status: "Docker 状态",
  ping_system_cpu: "系统 CPU",
  ping_system_memory: "系统内存",
  ping_system_uptime: "系统运行时间"
};