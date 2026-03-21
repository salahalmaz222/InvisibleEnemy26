import React, { useState } from 'react';
import './Scanner.css';

export default function Scanner({ setIsScanning: setParentIsScanning, setThreatCount, setLastScan, onLoadStatus }) {
  const [scanType, setScanType] = useState('quick');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [selectedPath, setSelectedPath] = useState('C:\\');
  const [isScanning, setIsScanning] = useState(false);

  const startQuickScan = async () => {
    await startScan('quick');
  };

  const startFullScan = async () => {
    await startScan('full');
  };

  const startCustomScan = async () => {
    await startScan('custom', selectedPath);
  };

  const startScan = async (type, path = null) => {
    setIsScanning(true);
    setScanResults(null);
    setScanProgress(0);

    try {
      let result;
      
      if (type === 'quick') {
        result = await window.electronAPI.quickScan();
      } else if (type === 'full') {
        result = await window.electronAPI.fullScan();
      } else {
        result = await window.electronAPI.scanDirectory(path);
      }

      setScanResults(result);
      setThreatCount(result.threatsFound || 0);
      setLastScan(new Date().toLocaleString());
      setScanProgress(100);

      // Save scan results to settings
      const settings = await window.electronAPI.getSettings();
      settings.scanStats = {
        totalScans: (settings.scanStats?.totalScans || 0) + 1,
        threatsBlocked: (settings.scanStats?.threatsBlocked || 0) + (result.threatsFound || 0),
        protectionTime: settings.scanStats?.protectionTime || '0 days'
      };
      await window.electronAPI.saveSettings(settings);

      onLoadStatus();
    } catch (error) {
      console.error('Scan error:', error);
      setScanResults({ error: error.message });
    } finally {
      setIsScanning(false);
    }
  };

  const quarantineThreat = async (threat) => {
    try {
      const result = await window.electronAPI.quarantineThreat(threat.filePath);
      if (result.success) {
        alert(`Threat quarantined: ${threat.filePath}`);
        onLoadStatus();
      }
    } catch (error) {
      console.error('Quarantine error:', error);
    }
  };

  const deleteThreat = async (threat) => {
    if (window.confirm(`Delete ${threat.fileName}?`)) {
      try {
        await window.electronAPI.deleteThreat(threat.filePath);
        alert(`Threat deleted: ${threat.filePath}`);
        onLoadStatus();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="scanner">
      <h1>Threat Scanner</h1>

      {/* Scan Type Selection */}
      <div className="scan-options">
        <div className="option-card">
          <h3>⚡ Quick Scan</h3>
          <p>Scans critical system areas and recently used files</p>
          <p className="time">Estimated time: 2-5 minutes</p>
          <button 
            className="btn-primary" 
            onClick={startQuickScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Start Quick Scan'}
          </button>
        </div>

        <div className="option-card">
          <h3>🔍 Full Scan</h3>
          <p>Comprehensive scan of all drives and partitions</p>
          <p className="time">Estimated time: 20-60 minutes</p>
          <button 
            className="btn-primary" 
            onClick={startFullScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Start Full Scan'}
          </button>
        </div>

        <div className="option-card">
          <h3>📁 Custom Scan</h3>
          <p>Scan a specific folder or drive</p>
          <div className="custom-scan">
            <input 
              type="text" 
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              placeholder="Enter path to scan"
            />
            <button 
              className="btn-primary" 
              onClick={startCustomScan}
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="scan-progress">
          <h3>Scan in Progress...</h3>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${scanProgress}%` }}></div>
          </div>
          <p>{scanProgress}% Complete</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResults && !isScanning && (
        <div className="scan-results">
          <h3>Scan Results</h3>

          {scanResults.error ? (
            <div className="error-message">
              <p>❌ Scan Error: {scanResults.error}</p>
            </div>
          ) : (
            <>
              <div className="results-summary">
                <div className="summary-item">
                  <p className="label">Files Scanned</p>
                  <p className="value">{scanResults.totalFilesScanned}</p>
                </div>
                <div className="summary-item">
                  <p className="label">Threats Found</p>
                  <p className={`value ${scanResults.threatsFound > 0 ? 'warning' : 'safe'}`}>
                    {scanResults.threatsFound}
                  </p>
                </div>
                <div className="summary-item">
                  <p className="label">Scan Type</p>
                  <p className="value">{scanResults.scanType}</p>
                </div>
              </div>

              {scanResults.threats && scanResults.threats.length > 0 && (
                <div className="threats-list">
                  <h4>Detected Threats</h4>
                  {scanResults.threats.map((threat, idx) => (
                    <div key={idx} className={`threat-item ${threat.riskLevel}`}>
                      <div className="threat-info">
                        <p className="threat-name">{threat.fileName}</p>
                        <p className="threat-path">{threat.filePath}</p>
                        <div className="threat-details">
                          {threat.threats && threat.threats.map((t, tidx) => (
                            <span key={tidx} className={`threat-type ${t.category}`}>
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="threat-actions">
                        <button 
                          className="btn-quarantine"
                          onClick={() => quarantineThreat(threat)}
                        >
                          Quarantine
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteThreat(threat)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
