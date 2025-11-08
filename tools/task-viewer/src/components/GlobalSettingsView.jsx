import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function GlobalSettingsView({ showToast }) {
  const { t } = useTranslation();
  const [claudeFolderPath, setClaudeFolderPath] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [aiModel, setAiModel] = useState('glm-4-6');
  const [apiHostname, setApiHostname] = useState('localhost');
  const [apiPort, setApiPort] = useState(3005);
  const [apiPath, setApiPath] = useState('/v1/chat/completions');
  const [apiProtocol, setApiProtocol] = useState('http');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from server on mount
  useEffect(() => {
    loadGlobalSettings();
  }, []);


  const loadGlobalSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/global-settings');
      if (response.ok) {
        const settings = await response.json();
        setClaudeFolderPath(settings.claudeFolderPath || '');
        setAiKey(settings.openAIKey || '');
        setAiModel(settings.aiModel || 'glm-4-6');
        setApiHostname(settings.apiHostname || 'localhost');
        setApiPort(settings.apiPort || 3005);
        setApiPath(settings.apiPath || '/v1/chat/completions');
        setApiProtocol(settings.apiProtocol || 'http');
      } else {
        console.error('Failed to load global settings');
        if (showToast) {
          showToast('Failed to load settings', 'error');
        }
      }
    } catch (err) {
      console.error('Error loading global settings:', err);
      if (showToast) {
        showToast('Error loading settings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/global-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claudeFolderPath: claudeFolderPath,
          openAIKey: aiKey,
          aiModel: aiModel,
          apiHostname: apiHostname,
          apiPort: apiPort,
          apiPath: apiPath,
          apiProtocol: apiProtocol,
        }),
      });

      if (response.ok) {
        if (showToast) {
          showToast(t('settingsSaved'), 'success');
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving global settings:', err);
      if (showToast) {
        showToast('Error saving settings', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="settings-panel">
        <h2>{t('globalSettings')}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="claudeFolderPath">{t('claudeFolderPath')}:</label>
            <input
              type="text"
              id="claudeFolderPath"
              value={claudeFolderPath}
              onChange={(e) => setClaudeFolderPath(e.target.value)}
              placeholder={t('claudeFolderPathPlaceholder')}
              title={t('claudeFolderPath')}
              disabled={saving}
            />
            <span className="form-hint">
              {t('claudeFolderPathDesc')}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="aiKey">
              AI API Key
              {aiKey && (
                <span style={{ 
                  marginLeft: '10px', 
                  fontSize: '12px', 
                  color: '#22c55e',
                  fontWeight: 'normal'
                }}>
                  ✓ Configured
                </span>
              )}
            </label>
            <div className="api-key-input-wrapper">
              <input
                type={showApiKey ? "text" : "password"}
                id="aiKey"
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                placeholder="sk-proj-..."
                title="AI API Key for AI agent assignment"
                disabled={saving}
                className="api-key-input"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="api-key-toggle"
                title={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <span className="form-hint">
              <strong>Used for:</strong> AI-powered agent assignment and chat functionality.<br/>
              <strong>Get your key:</strong>{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                platform.openai.com/api-keys
              </a>
              {' '}(requires AI service account)<br/>
              <strong>Note:</strong> The API key is required for the chat feature to work.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="aiModel">AI Model:</label>
            <input
              type="text"
              id="aiModel"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="glm-4-6"
              title="AI model name for chat and agent assignment"
              disabled={saving}
            />
            <span className="form-hint">
              <strong>Model name:</strong> Enter the AI model to use for chat and agent assignment (e.g., glm-4-6)
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apiProtocol">{t('apiProtocol')}:</label>
              <select
                id="apiProtocol"
                value={apiProtocol}
                onChange={(e) => setApiProtocol(e.target.value)}
                disabled={saving}
              >
                <option value="http">http</option>
                <option value="https">https</option>
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
          
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Saving...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GlobalSettingsView;