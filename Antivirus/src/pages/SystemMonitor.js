import React, { useState, useEffect } from 'react';
import './SystemMonitor.css';

export default function SystemMonitor() {
  const [processes, setProcesses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    packetsIn: 0,
    packetsOut: 0,
    bytesIn: 0,
    bytesOut: 0
  });
  const [monitoringActive, setMonitoringActive] = useState(false);

  useEffect(() => {
    // Setup event listeners
    const unlistenProcess = window.electronAPI.onProcessAlert((event, data) => {
      if (data.threats && data.threats.length > 0) {
        setAlerts(prev => [...prev, {
          timestamp: new Date(),
          type: 'process',
          data: data.threats
        }]);
      }
    });

    const unlistenNetwork = window.electronAPI.onNetworkAlert((event, data) => {
      setAlerts(prev => [...prev, {
        timestamp: new Date(),
        type: 'network',
        data: data
      }]);
    });

    setMonitoringActive(true);

    return () => {
      setMonitoringActive(false);
    };
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getThreatSeverityColor = (severity) => {
    const colors = {
      critical: '#ff4444',
      high: '#ffaa44',
      medium: '#ffdd44',
      low: '#44ff44'
    };
    return colors[severity] || '#00d4ff';
  };

  return (
    <div className="system-monitor">
      <h1>System Monitor</h1>

      {/* Status */}
      <div className="monitor-status">
        <div className="status-item">
          <span className={`indicator ${monitoringActive ? 'active' : 'inactive'}`}></span>
          <span className="text">
            {monitoringActive ? 'Real-time monitoring active' : 'Monitoring inactive'}
          </span>
        </div>
        <button 
          className="btn-clear"
          onClick={clearAlerts}
          disabled={alerts.length === 0}
        >
          Clear Alerts ({alerts.length})
        </button>
      </div>

      {/* Alerts */}
      <div className="alerts-section">
        <h3>⚠️ Active Alerts</h3>
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <p>✓ No suspicious activity detected</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className="alert-item">
                <div className="alert-time">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
                {alert.type === 'process' && (
                  <div className="alert-content">
                    <h4>Suspicious Process Detected</h4>
                    {alert.data.map((threat, tidx) => (
                      <div key={tidx} className="threat-detail">
                        <span className="process-name">{threat.name}</span>
                        <span className="category">{threat.category}</span>
                        <span 
                          className="severity"
                          style={{ color: getThreatSeverityColor(threat.severity) }}
                        >
                          {threat.severity.toUpperCase()}
                        </span>
                        {threat.pid && <span className="pid">PID: {threat.pid}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {alert.type === 'network' && (
                  <div className="alert-content">
                    <h4>Network Activity Alert</h4>
                    <p>Unusual network pattern detected</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Information */}
      <div className="process-info">
        <h3>🔍 Process Monitoring</h3>
        <p className="info-text">
          The system monitor continuously watches for suspicious process behavior including:
        </p>
        <ul className="process-checks">
          <li>🔑 Keylogging and credential theft</li>
          <li>⛏️ Cryptocurrency mining activity</li>
          <li>🤖 Botnet command and control connections</li>
          <li>🔐 Registry and system file modifications</li>
          <li>💾 Unusual memory and CPU usage patterns</li>
          <li>🔓 Privilege escalation attempts</li>
        </ul>
      </div>

      {/* Network Monitoring */}
      <div className="network-info">
        <h3>📡 Network Monitoring</h3>
        <p className="info-text">
          Network monitoring tracks suspicious communication patterns:
        </p>
        <ul className="network-checks">
          <li>🚫 Connections to known malicious C2 servers</li>
          <li>📤 Unauthorized data exfiltration attempts</li>
          <li>🌐 DNS hijacking and redirection</li>
          <li>📊 Unusual traffic volume patterns</li>
          <li>🔗 Suspicious port connections</li>
        </ul>
      </div>

      {/* Detection Methods */}
      <div className="detection-methods">
        <h3>🛡️ Detection Methods</h3>
        <div className="methods-grid">
          <div className="method">
            <h4>Signature Detection</h4>
            <p>Identifies known malware patterns and file hashes</p>
          </div>
          <div className="method">
            <h4>Heuristic Analysis</h4>
            <p>Detects suspicious behavior and code patterns</p>
          </div>
          <div className="method">
            <h4>Behavioral Monitoring</h4>
            <p>Tracks process and system behavior for anomalies</p>
          </div>
          <div className="method">
            <h4>Real-time Protection</h4>
            <p>Continuously monitors system for new threats</p>
          </div>
        </div>
      </div>
    </div>
  );
}
