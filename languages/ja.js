// Arquivo de idioma japonês
module.exports = {
  // Mensagens gerais
  welcome: "Bot Hostへようこそ！",
  error: "エラーが発生しました",
  success: "操作が正常に完了しました",
  
  // Comandos
  cmd_app_title: "ボット管理パネル",
  cmd_app_description: "管理するボットを選択してください：",
  cmd_app_no_bots: "まだホストされているボットがありません。`/up`コマンドを使用してボットをホストしてください。",
  cmd_app_footer: "{count}個のホストされたボット",
  
  // Painel de gerenciamento
  panel_title: "ボット: {botName}",
  panel_description: "ホストされたボットの管理",
  panel_status: "ステータス",
  panel_language: "言語",
  panel_main_file: "メインファイル",
  panel_ram_allocated: "割り当てRAM",
  panel_cpu_usage: "CPU使用率",
  panel_ram_usage: "RAM使用率",
  panel_disk_usage: "ディスク使用率",
  panel_created_at: "作成日時",
  
  // Botões do painel
  btn_start: "開始",
  btn_stop: "停止",
  btn_restart: "再起動",
  btn_delete: "削除",
  btn_refresh: "更新",
  btn_upload: "アップロード",
  btn_change_ram: "RAM変更",
  btn_logs: "ログ",
  btn_backup: "バックアップ",
  btn_back: "戻る",
  
  // Comando up
  cmd_up_title: "言語を選択",
  cmd_up_description: "ボットはどの言語を使用していますか？",
  cmd_up_setup_channel: "設定チャンネルが作成されました: {channel}。ボットを設定するにはそこに移動してください。",
  cmd_up_hello: "こんにちは{user}、ボットのホスティング設定を始めましょう！",
  cmd_up_main_file: "ボットのメインファイル名は何ですか？(例: {examples})",
  cmd_up_bot_id: "ボットのDiscord IDは何ですか？",
  cmd_up_bot_found: "ボットが見つかりました: {botTag}",
  cmd_up_bot_not_found: "Discordでボットが見つかりません。IDが正しいことを確認してください。",
  cmd_up_ram: "ボットに割り当てるRAMはどれくらいですか？(128〜512 MB)",
  cmd_up_zip: "最後に、ボットの.zipファイルをアップロードしてください。パフォーマンス向上のため、node_modulesフォルダとpackage-lock.jsonファイルを含めないようにしてください。",
  cmd_up_zip_received: "ZIPファイルを受信しました！処理中...",
  cmd_up_creating_env: "ボット用の環境を作成しています。これには数分かかる場合があります...",
  cmd_up_creating_container: "Dockerコンテナを作成中...",
  cmd_up_success: "✅ ボットが正常にホストされました！コンテナID: `{containerId}`\n\n`/app`コマンドを使用してボットを管理できます。",
  cmd_up_error: "❌ ボットのホスティング中にエラーが発生しました: {error}",
  cmd_up_limit_reached: "ホストできるボットの最大数3に達しました。新しいボットをホストするには、既存のボットを削除してください。",
  
  // Logs
  logs_title: "ボットのログ: {botName}",
  logs_description: "コンテナログの最新50行",
  logs_empty: "利用可能なログはありません。",
  
  // Erros e avisos
  timeout: "タイムアウトしました。プロセスがキャンセルされました。",
  invalid_id: "タイムアウトまたは無効なID。プロセスがキャンセルされました。",
  invalid_value: "タイムアウトまたは無効な値。プロセスがキャンセルされました。",
  invalid_file: "タイムアウトまたは無効なファイル。プロセスがキャンセルされました。",
  
  // Sistema de idiomas
  language_title: "言語設定",
  language_description: "希望する言語を選択してください：",
  language_success: "言語が{language}に正常に変更されました！",
  
  // Ajuda
  help_title: "🤖 Bot Host - ホスティングシステム",
  help_description: "このボットを使用すると、DiscordボットをDockerコンテナでホストできます。",
  help_up: "新しいボットのホスティングプロセスを開始します",
  help_app: "すでにホストされているボットを管理します",
  help_ping: "レイテンシーとシステム状態を確認します",
  help_apt: "Ubuntuコンテナに追加パッケージをインストールします",
  help_help: "このヘルプメッセージを表示します",
  help_language: "ボットの言語を変更します",
  
  // Ping
  ping_title: "🏓 Ping",
  ping_description: "ボットのレイテンシーとシステム状態",
  ping_latency: "ボットのレイテンシー",
  ping_api_latency: "APIレイテンシー",
  ping_docker_status: "Dockerの状態",
  ping_system_cpu: "システムCPU",
  ping_system_memory: "システムメモリ",
  ping_system_uptime: "システム稼働時間"
};