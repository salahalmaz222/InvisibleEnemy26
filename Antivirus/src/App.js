import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Quarantine from './pages/Quarantine';
import Settings from './pages/Settings';
import SystemMonitor from './pages/SystemMonitor';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [threatCount, setThreatCount] = useState(0);
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    // Load initial data
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Check for threats in quarantine
      const quarantineStatus = await window.electronAPI.getQuarantineStatus();
      setThreatCount(quarantineStatus.count);
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-header">
            <h1>🛡️ Advanced Antivirus</h1>
            <p className="version">v1.0.0</p>
          </div>
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">Dashboard</Link></li>
            <li><Link to="/scanner" className="nav-link">Scanner</Link></li>
            <li><Link to="/system-monitor" className="nav-link">Monitor</Link></li>
            <li><Link to="/quarantine" className="nav-link">
              Quarantine {threatCount > 0 && <span className="badge">{threatCount}</span>}
            </Link></li>
            <li><Link to="/settings" className="nav-link">Settings</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard 
                isScanning={isScanning}
                threatCount={threatCount}
                lastScan={lastScan}
                onLoadStatus={loadSystemStatus}
              />} 
            />
            <Route 
              path="/scanner" 
              element={<Scanner 
                isScanning={isScanning}
                setIsScanning={setIsScanning}
                setThreatCount={setThreatCount}
                setLastScan={setLastScan}
                onLoadStatus={loadSystemStatus}
              />} 
            />
            <Route path="/system-monitor" element={<SystemMonitor />} />
            <Route 
              path="/quarantine" 
              element={<Quarantine 
                threatCount={threatCount}
                onLoadStatus={loadSystemStatus}
              />} 
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
