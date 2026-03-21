import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ isScanning, threatCount, lastScan, onLoadStatus }) {
  const [protectionStatus, setProtectionStatus] = useState({
    realTimeProtection: true,
    lastUpdate: new Date().toLocaleDateString(),
    virusDefinitions: '2024.01.15'
  });

  const [scanStats, setScanStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    protectionTime: '0 days'
  });

  const [threatHistory, setThreatHistory] = useState([
    { date: 'Mon', threats: 0 },
    { date: 'Tue', threats: 2 },
    { date: 'Wed', threats: 1 },
    { date: 'Thu', threats: 0 },
    { date: 'Fri', threats: 3 },
    { date: 'Sat', threats: 1 },
    { date: 'Sun', threats: 0 }
  ]);

  const [threatBreakdown, setThreatBreakdown] = useState({
    ransomware: 0,
    trojan: 2,
    spyware: 1,
    adware: 3,
    other: 1
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load stats from settings
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.scanStats) {
        setScanStats(settings.scanStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const chartData = {
    labels: threatHistory.map(h => h.date),
    datasets: [
      {
        label: 'Threats Detected',
        data: threatHistory.map(h => h.threats),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const doughnutData = {
    labels: ['Trojans', 'Adware', 'Ransomware', 'Spyware', 'Other'],
    datasets: [
      {
        data: [
          threatBreakdown.trojan,
          threatBreakdown.adware,
          threatBreakdown.ransomware,
          threatBreakdown.spyware,
          threatBreakdown.other
        ],
        backgroundColor: [
          '#ff6b6b',
          '#ffd93d',
          '#ff4757',
          '#a29bfe',
          '#fd79a8'
        ],
        borderColor: '#1a1f2e'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#b0bec5' }
      }
    },
    scales: {
      y: {
        ticks: { color: '#888' },
        grid: { color: '#2d3748' }
      },
      x: {
        ticks: { color: '#888' },
        grid: { color: '#2d3748' }
      }
    }
  };

  return (
    <div className="dashboard">
      <h1>Protection Dashboard</h1>

      {/* Protection Status Cards */}
      <div className="status-cards">
        <div className="status-card protection">
          <div className="card-header">
            <span className="icon">🛡️</span>
            <h3>Protection Status</h3>
          </div>
          <div className="card-body">
            <p className={`status ${protectionStatus.realTimeProtection ? 'active' : 'inactive'}`}>
              {protectionStatus.realTimeProtection ? '✓ Active' : '✗ Inactive'}
            </p>
            <p className="detail">Real-Time Protection</p>
            <p className="small">Last Update: {protectionStatus.lastUpdate}</p>
          </div>
        </div>

        <div className="status-card threats">
          <div className="card-header">
            <span className="icon">⚠️</span>
            <h3>Threats Detected</h3>
          </div>
          <div className="card-body">
            <p className="big-number">{threatCount}</p>
            <p className="detail">In Quarantine</p>
            <p className="small">This Session</p>
          </div>
        </div>

        <div className="status-card secure">
          <div className="card-header">
            <span className="icon">✓</span>
            <h3>System Status</h3>
          </div>
          <div className="card-body">
            <p className="status secure">SECURE</p>
            <p className="detail">No Active Threats</p>
            <p className="small">Last Scan: {lastScan || 'Never'}</p>
          </div>
        </div>

        <div className="status-card virus-defs">
          <div className="card-header">
            <span className="icon">📦</span>
            <h3>Virus Definitions</h3>
          </div>
          <div className="card-body">
            <p className="detail">Version {protectionStatus.virusDefinitions}</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '100%' }}></div>
            </div>
            <p className="small">Up to Date</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Threat Detection History (7 Days)</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h3>Threat Breakdown</h3>
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stat-box">
          <h4>Total Scans</h4>
          <p className="stat-value">{scanStats.totalScans}</p>
        </div>
        <div className="stat-box">
          <h4>Threats Blocked</h4>
          <p className="stat-value">{scanStats.threatsBlocked}</p>
        </div>
        <div className="stat-box">
          <h4>Protection Time</h4>
          <p className="stat-value">{scanStats.protectionTime}</p>
        </div>
        <div className="stat-box">
          <h4>System Health</h4>
          <p className="stat-value">100%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-log">
          {threatCount > 0 ? (
            <>
              <div className="activity-item warning">
                <span className="time">Today</span>
                <span className="message">{threatCount} threats detected and quarantined</span>
              </div>
              <div className="activity-item info">
                <span className="time">Yesterday</span>
                <span className="message">Automatic signature update completed</span>
              </div>
            </>
          ) : (
            <div className="activity-item success">
              <span className="time">Today</span>
              <span className="message">System is clean and protected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
