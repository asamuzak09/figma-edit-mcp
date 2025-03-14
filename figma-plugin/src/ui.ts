const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cursor Figma Assistant</title>
  <style>
    body {
      font-family: Inter, sans-serif;
      margin: 0;
      padding: 20px;
    }
    
    h2 {
      margin-top: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .status {
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 4px;
    }
    
    .status.connected {
      background-color: #E9F9EE;
      color: #18A957;
    }
    
    .status.disconnected {
      background-color: #FFEBE6;
      color: #F24822;
    }
    
    .log {
      height: 200px;
      overflow-y: auto;
      border: 1px solid #E5E5E5;
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 16px;
      font-family: monospace;
      font-size: 12px;
    }
    
    .log-entry {
      margin-bottom: 4px;
      word-break: break-all;
    }
    
    .log-entry.error {
      color: #F24822;
    }
    
    .log-entry.success {
      color: #18A957;
    }
    
    .log-entry.debug {
      color: #1E88E5;
    }
    
    button {
      background-color: #18A0FB;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
      cursor: pointer;
    }
    
    button:hover {
      background-color: #0D8CE6;
    }
    
    button.secondary {
      background-color: transparent;
      color: #333;
      border: 1px solid #E5E5E5;
    }
    
    button.secondary:hover {
      background-color: #F5F5F5;
    }
  </style>
</head>
<body>
  <h2>Figma MCP Plugin</h2>

  <div id="status" class="status disconnected">
    Disconnected
  </div>

  <div class="log" id="log"></div>

  <button id="healthcheck">Connect to MCP Server</button>
  <button id="cancel" class="secondary">Close Plugin</button>

  <script>
    // ステータス表示
    const statusEl = document.getElementById('status');
    const logEl = document.getElementById('log');

    // ログ表示関数
    function addLogEntry(message, type = 'info') {
      const entry = document.createElement('div');
      entry.className = 'log-entry ' + type;
      entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }

    // 初期ログ
    addLogEntry('Plugin initialized');

    // ステータス更新
    function updateStatus(connected) {
      statusEl.className = 'status ' + (connected ? 'connected' : 'disconnected');
      statusEl.textContent = connected ? 'Connected to MCP Server' : 'Disconnected';
    }

    // イベントリスナー
    document.getElementById('healthcheck').addEventListener('click', () => {
      parent.postMessage({ pluginMessage: { type: 'register' } }, '*');
      addLogEntry('Connecting to MCP server...');
    });

    document.getElementById('cancel').addEventListener('click', () => {
      parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    });

    // プラグインからのメッセージを処理
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      
      if (!message) return;
      
      if (message.type === 'connection-success') {
        updateStatus(true);
        addLogEntry('Connected to MCP server with file ID: ' + message.fileId, 'success');
      } else if (message.type === 'connection-error') {
        updateStatus(false);
        addLogEntry('Failed to connect to MCP server: ' + message.error, 'error');
      } else if (message.type === 'mcp-message') {
        addLogEntry('Received message from MCP server: ' + JSON.stringify(message.message));
      } else if (message.type === 'update-success') {
        addLogEntry('Applied updates: ' + JSON.stringify(message.updates), 'success');
      } else if (message.type === 'update-error') {
        addLogEntry('Error applying updates: ' + message.error, 'error');
      } else if (message.type === 'debug') {
        addLogEntry(message.message, 'debug');
      }
    };
  </script>
</body>
</html>
`;

export default html; 