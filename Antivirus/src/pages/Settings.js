import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    realTimeProtection: true,
    autoScan: true,
    autoScanTime: '02:00',
    autoQuarantine: true,
    excludePaths: '',
    updateFrequency: 'daily'
  });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.electronAPI.getSettings();
      if (loadedSettings.appSettings) {
        setSettings(loadedSettings.appSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    try {
      const allSettings = {
        appSettings: settings
      };
      await window.electronAPI.saveSettings(allSettings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving settings');
      console.error('Error saving settings:', error);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings({
        realTimeProtection: true,
        autoScan: true,
        autoScanTime: '02:00',
        autoQuarantine: true,
        excludePaths: '',
        updateFrequency: 'daily'
      });
    }
  };

  return (
    <div className="settings">
      <h1>Settings</h1>

      <div className="settings-container">
        {/* Protection Settings */}
        <div className="settings-section">
          <h3>🛡️ Protection Settings</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="realTimeProtection">Real-Time Protection</label>
              <p className="description">Continuously monitor your system for threats</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                id="realTimeProtection"
                checked={settings.realTimeProtection}
                onChange={(e) => handleChange('realTimeProtection', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="autoQuarantine">Auto-Quarantine Threats</label>
              <p className="description">Automatically isolate detected threats</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                id="autoQuarantine"
                checked={settings.autoQuarantine}
                onChange={(e) => handleChange('autoQuarantine', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Scan Settings */}
        <div className="settings-section">
          <h3>⏱️ Scan Settings</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="autoScan">Automatic Scans</label>
              <p className="description">Schedule regular system scans</p>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                id="autoScan"
                checked={settings.autoScan}
                onChange={(e) => handleChange('autoScan', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {settings.autoScan && (
            <div className="setting-item">
              <label htmlFor="autoScanTime">Daily Scan Time</label>
              <input 
                type="time" 
                id="autoScanTime"
                value={settings.autoScanTime}
                onChange={(e) => handleChange('autoScanTime', e.target.value)}
              />
            </div>
          )}

          <div className="setting-item">
            <label htmlFor="updateFrequency">Database Update Frequency</label>
            <select 
              id="updateFrequency"
              value={settings.updateFrequency}
              onChange={(e) => handleChange('updateFrequency', e.target.value)}
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Exclusions */}
        <div className="settings-section">
          <h3>📁 Exclusions</h3>
          
          <div className="setting-item">
            <label htmlFor="excludePaths">Exclude Paths (one per line)</label>
            <textarea 
              id="excludePaths"
              value={settings.excludePaths}
              onChange={(e) => handleChange('excludePaths', e.target.value)}
              placeholder="Example:&#10;C:\Program Files\TrustedApp&#10;C:\Users\YourName\Projects"
              rows="6"
            />
            <p className="description">
              Files in these directories will not be scanned. Use absolute paths.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h3>ℹ️ About</h3>
          
          <div className="about-info">
            <div className="info-item">
              <span className="label">Application Name</span>
              <span className="value">Advanced Antivirus</span>
            </div>
            <div className="info-item">
              <span className="label">Version</span>
              <span className="value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="label">Virus Database</span>
              <span className="value">2024.01.15 (7000+ signatures)</span>
            </div>
            <div className="info-item">
              <span className="label">Last Update</span>
              <span className="value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Malware Types Detected */}
        <div className="settings-section">
          <h3>🔍 Supported Malware Types</h3>
          
          <div className="malware-types-grid">
            <div className="malware-type">
              <h4>Ransomware</h4>
              <p>WannaCry, Petya, Sodinokibi, Cryptolocker</p>
            </div>
            <div className="malware-type">
              <h4>Trojans</h4>
              <p>Zeus, Emotet, Trickbot, and variants</p>
            </div>
            <div className="malware-type">
              <h4>Worms</h4>
              <p>Stuxnet, MyDoom, propagation malware</p>
            </div>
            <div className="malware-type">
              <h4>Viruses</h4>
              <p>File infectors, boot sector viruses</p>
            </div>
            <div className="malware-type">
              <h4>Spyware</h4>
              <p>Keyloggers, remote access, stalkerware</p>
            </div>
            <div className="malware-type">
              <h4>Rootkits</h4>
              <p>Alureon, Conficker, kernel-mode threats</p>
            </div>
            <div className="malware-type">
              <h4>Botnet</h4>
              <p>Mirai, ZeroAccess, command &amp; control</p>
            </div>
            <div className="malware-type">
              <h4>Cryptojacking</h4>
              <p>CPU miners, resource hijacking</p>
            </div>
            <div className="malware-type">
              <h4>Adware</h4>
              <p>Advertisement injection, PUPs</p>
            </div>
            <div className="malware-type">
              <h4>Backdoors</h4>
              <p>Remote shells, webshells, access tools</p>
            </div>
            <div className="malware-type">
              <h4>Fileless Malware</h4>
              <p>PowerShell exploits, memory attacks</p>
            </div>
            <div className="malware-type">
              <h4>Heuristic Detection</h4>
              <p>Behavioral analysis, zero-day threats</p>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('success') ? 'success' : 'error'}`}>
            {saveStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="settings-actions">
          <button className="btn-save" onClick={saveSettings}>
            Save Settings
          </button>
          <button className="btn-reset" onClick={resetToDefaults}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
