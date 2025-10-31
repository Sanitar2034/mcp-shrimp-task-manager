# API Configuration Implementation Plan

## 1. Translation Updates

### Russian (tools/task-viewer/src/i18n/locales/ru.json)
Add these keys to the "global" section (after line 121):

```json
"apiHostname": "Имя хоста API",
"apiHostnamePlaceholder": "localhost",
"apiPort": "Порт API",
"apiPortPlaceholder": "3005",
"apiPath": "Путь API",
"apiPathPlaceholder": "/v1/chat/completions",
"apiProtocol": "Протокол подключения",
"apiProtocolHttp": "HTTP",
"apiProtocolHttps": "HTTPS",
"apiConfiguration": "⚙️ Настройки API",
"apiConfigurationDesc": "Настройте параметры подключения к API для взаимодействия с ИИ-агентами."
```

### English (tools/task-viewer/src/i18n/locales/en.json)
Add these keys to the "global" section (after line 131):

```json
"apiHostname": "API Hostname",
"apiHostnamePlaceholder": "localhost",
"apiPort": "API Port",
"apiPortPlaceholder": "3005",
"apiPath": "API Path",
"apiPathPlaceholder": "/v1/chat/completions",
"apiProtocol": "Connection Protocol",
"apiProtocolHttp": "HTTP",
"apiProtocolHttps": "HTTPS",
"apiConfiguration": "⚙️ API Configuration",
"apiConfigurationDesc": "Configure API connection parameters for AI agent interactions."
```

## 2. Server-side Updates (tools/task-viewer/server.js)

### Update default global settings (around line 195)
Add default API configuration values:

```javascript
const defaultGlobalSettings = {
  claudeFolderPath: "",
  apiHostname: "localhost",
  apiPort: 3005,
  apiPath: "/v1/chat/completions",
  apiProtocol: "http",
  lastUpdated: getLocalISOString(),
  version: VERSION,
};
```

### Update OpenAI API request options (around line 1893)
Replace hardcoded values with settings:

```javascript
// Get API settings from global settings
const globalSettings = await loadGlobalSettings();
const apiHostname = globalSettings.apiHostname || "localhost";
const apiPort = globalSettings.apiPort || 3005;
const apiPath = globalSettings.apiPath || "/v1/chat/completions";
const apiProtocol = globalSettings.apiProtocol || "http";

const options = {
  hostname: apiHostname,
  port: apiPort,
  path: apiPath,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAIKey}`,
    "Content-Length": Buffer.byteLength(openAIData),
  },
};

// Use http or https module based on protocol
const requestModule = apiProtocol === "https" ? https : http;
const req = requestModule.request(options, (res) => {
  // ... existing response handling
});
```

### Update chat API request (around line 2213)
Apply same changes to the chat API endpoint:

```javascript
// Get API settings from global settings
const globalSettings = await loadGlobalSettings();
const apiHostname = globalSettings.apiHostname || "localhost";
const apiPort = globalSettings.apiPort || 3005;
const apiPath = globalSettings.apiPath || "/v1/chat/completions";
const apiProtocol = globalSettings.apiProtocol || "http";

const options = {
  hostname: apiHostname,
  port: apiPort,
  path: apiPath,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
    "Content-Length": Buffer.byteLength(openAIData),
  },
};

// Use http or https module based on protocol
const requestModule = apiProtocol === "https" ? https : http;
const req = requestModule.request(options, (res) => {
  // ... existing response handling
});
```

## 3. Frontend Updates (tools/task-viewer/src/components/GlobalSettingsView.jsx)

### Add state variables (after line 9):
```javascript
const [apiHostname, setApiHostname] = useState('');
const [apiPort, setApiPort] = useState('');
const [apiPath, setApiPath] = useState('');
const [apiProtocol, setApiProtocol] = useState('http');
```

### Update loadGlobalSettings (around line 24):
```javascript
const response = await fetch('/api/global-settings');
if (response.ok) {
  const settings = await response.json();
  setClaudeFolderPath(settings.claudeFolderPath || '');
  setOpenAIKey(settings.openAIKey || '');
  setApiHostname(settings.apiHostname || 'localhost');
  setApiPort(settings.apiPort || 3005);
  setApiPath(settings.apiPath || '/v1/chat/completions');
  setApiProtocol(settings.apiProtocol || 'http');
}
```

### Update handleSubmit (around line 52):
```javascript
body: JSON.stringify({
  claudeFolderPath: claudeFolderPath,
  openAIKey: openAIKey,
  apiHostname: apiHostname,
  apiPort: apiPort,
  apiPath: apiPath,
  apiProtocol: apiProtocol,
}),
```

### Add API Configuration form section (after line 147):
```jsx
<div className="form-group">
  <h3>{t('apiConfiguration')}</h3>
  <p className="form-description">{t('apiConfigurationDesc')}</p>
  
  <div className="form-row">
    <div className="form-group">
      <label htmlFor="apiProtocol">{t('apiProtocol')}:</label>
      <select
        id="apiProtocol"
        value={apiProtocol}
        onChange={(e) => setApiProtocol(e.target.value)}
        disabled={saving}
      >
        <option value="http">{t('apiProtocolHttp')}</option>
        <option value="https">{t('apiProtocolHttps')}</option>
      </select>
    </div>
    
    <div className="form-group">
      <label htmlFor="apiHostname">{t('apiHostname')}:</label>
      <input
        type="text"
        id="apiHostname"
        value={apiHostname}
        onChange={(e) => setApiHostname(e.target.value)}
        placeholder={t('apiHostnamePlaceholder')}
        disabled={saving}
      />
    </div>
    
    <div className="form-group">
      <label htmlFor="apiPort">{t('apiPort')}:</label>
      <input
        type="number"
        id="apiPort"
        value={apiPort}
        onChange={(e) => setApiPort(e.target.value)}
        placeholder={t('apiPortPlaceholder')}
        disabled={saving}
      />
    </div>
    
    <div className="form-group">
      <label htmlFor="apiPath">{t('apiPath')}:</label>
      <input
        type="text"
        id="apiPath"
        value={apiPath}
        onChange={(e) => setApiPath(e.target.value)}
        placeholder={t('apiPathPlaceholder')}
        disabled={saving}
      />
    </div>
  </div>
</div>
```

### Add CSS styles (in tools/task-viewer/src/index.css):
```css
.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-row .form-group {
  flex: 1;
  min-width: 200px;
}

.form-description {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}
```

## Implementation Order

1. Update translation files
2. Update server-side default settings and API request handling
3. Update frontend GlobalSettingsView component
4. Add necessary CSS styles
5. Test the functionality

## Testing Checklist

- [ ] Verify default values are loaded correctly
- [ ] Test saving new API configuration
- [ ] Test API calls with custom hostname/port/path/protocol
- [ ] Verify error handling for invalid configurations
- [ ] Test both HTTP and HTTPS protocols
- [ ] Verify settings persistence across server restarts