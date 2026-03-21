const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Scanning operations
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  scanFile: (filePath) => ipcRenderer.invoke('scan-file', filePath),
  quickScan: () => ipcRenderer.invoke('quick-scan'),
  fullScan: () => ipcRenderer.invoke('full-scan'),

  // Quarantine operations
  quarantineThreat: (filePath) => ipcRenderer.invoke('quarantine-threat', filePath),
  restoreThreat: (quarantinePath, originalPath) => ipcRenderer.invoke('restore-threat', quarantinePath, originalPath),
  deleteThreat: (filePath) => ipcRenderer.invoke('delete-threat', filePath),
  getQuarantineStatus: () => ipcRenderer.invoke('get-quarantine-status'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Event listeners
  onQuickScan: (callback) => ipcRenderer.on('run-quick-scan', callback),
  onFullScan: (callback) => ipcRenderer.on('run-full-scan', callback),
  onUpdateDatabase: (callback) => ipcRenderer.on('update-database', callback),
  onScanProgress: (callback) => ipcRenderer.on('scan-progress', callback),
  onThreatDetected: (callback) => ipcRenderer.on('threat-detected', callback),
  onProcessAlert: (callback) => ipcRenderer.on('process-alert', callback),
  onNetworkAlert: (callback) => ipcRenderer.on('network-alert', callback)
});
