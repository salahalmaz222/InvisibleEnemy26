const pslist = require('ps-list');
const os = require('os');
const fs = require('fs');

// Suspicious process patterns
const suspiciousProcesses = {
  'cryptominers': ['xmrig', 'cryptonight', 'stratum', 'monero', 'wanna', 'eternal'],
  'botnet_c2': ['update', 'temp', 'system32', 'service', 'rundll32', 'svchost'],
  'ransomware': ['cipher', 'vssadmin', 'bcdedit', 'wmic', 'taskkill'],
  'spyware': ['spy', 'monitor', 'track', 'keylog', 'record'],
  'backdoor': ['shell', 'reverse', 'tunnel', 'proxy', 'beacon']
};

// Suspicious registry paths
const suspiciousRegistry = [
  'HKLM\\Software\\Microsoft\\Windows\\Run',
  'HKLM\\Software\\Microsoft\\Windows\\RunOnce',
  'HKCU\\Software\\Microsoft\\Windows\\Run',
  'HKCU\\Software\\Microsoft\\Windows\\RunOnce'
];

class SystemMonitor {
  constructor() {
    this.processWhitelist = this.getSystemProcessWhitelist();
    this.monitoringActive = false;
    this.detectionCount = 0;
  }

  getSystemProcessWhitelist() {
    return [
      'svchost.exe',
      'csrss.exe',
      'wininit.exe',
      'services.exe',
      'lsass.exe',
      'spoolsv.exe',
      'explorer.exe',
      'ntoskrnl.exe',
      'dwm.exe',
      'taskmgr.exe',
      'chrome.exe',
      'firefox.exe',
      'msedge.exe',
      'code.exe',
      'visual studio'
    ];
  }

  async monitorProcesses(mainWindow) {
    if (this.monitoringActive) return;
    this.monitoringActive = true;

    const monitor = async () => {
      try {
        const processes = await pslist();
        const threats = this.analyzeProcesses(processes);

        if (threats.length > 0) {
          mainWindow.webContents.send('process-alert', {
            timestamp: new Date(),
            threats: threats,
            processCount: processes.length
          });
        }
      } catch (error) {
        console.error('Process monitoring error:', error);
      }

      // Monitor every 5 seconds
      setTimeout(monitor, 5000);
    };

    monitor();
  }

  analyzeProcesses(processes) {
    const threats = [];

    for (const process of processes) {
      const procName = process.name.toLowerCase();

      // Check against suspicious patterns
      for (const [category, patterns] of Object.entries(suspiciousProcesses)) {
        for (const pattern of patterns) {
          if (procName.includes(pattern.toLowerCase())) {
            threats.push({
              pid: process.pid,
              name: process.name,
              command: process.cmd,
              category: category,
              severity: 'high'
            });
            break;
          }
        }
      }

      // Check memory usage anomalies
      if (process.memory > 500 * 1024 * 1024) { // > 500MB
        if (!this.isLegitimateHighMemoryProcess(procName)) {
          threats.push({
            pid: process.pid,
            name: process.name,
            category: 'anomalous_memory_usage',
            memory: process.memory,
            severity: 'medium'
          });
        }
      }
    }

    return threats;
  }

  isLegitimateHighMemoryProcess(procName) {
    const legit = [
      'chrome', 'firefox', 'edge', 'visual studio', 'mysql',
      'sqlserver', 'oracle', 'mongodb', 'postgres', 'java'
    ];
    return legit.some(l => procName.includes(l.toLowerCase()));
  }
}

class NetworkMonitor {
  constructor() {
    this.suspiciousDomains = this.loadSuspiciousDomains();
    this.monitoringActive = false;
  }

  loadSuspiciousDomains() {
    // Known malicious C2 servers and domains
    return [
      'botnetc2.com',
      'malwarecommand.net',
      'ransomwarec2.ru',
      'cryptominer.pw',
      'ddos-service.xyz',
      'exploit-kit.com',
      'phishing-bank.net',
      'steal-credentials.top'
    ];
  }

  async monitorNetwork(mainWindow) {
    if (this.monitoringActive) return;
    this.monitoringActive = true;

    const monitor = async () => {
      try {
        // This would integrate with actual network monitoring
        // For now, we'll check network interfaces for unusual activity
        const interfaces = os.networkInterfaces();
        this.analyzeNetworkInterfaces(interfaces, mainWindow);
      } catch (error) {
        console.error('Network monitoring error:', error);
      }

      // Monitor every 10 seconds
      setTimeout(monitor, 10000);
    };

    monitor();
  }

  analyzeNetworkInterfaces(interfaces, mainWindow) {
    // Monitor for unusual network patterns
    // Could implement DPI, flow analysis, etc.
    for (const [name, addrs] of Object.entries(interfaces)) {
      for (const addr of addrs) {
        // Check for suspicious patterns
        if (addr.family === 'IPv4') {
          // Monitor unusual traffic patterns
          if (this.isPrivateIP(addr.address)) {
            // Analyze network behavior
          }
        }
      }
    }
  }

  isPrivateIP(ip) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./
    ];
    return privateRanges.some(range => range.test(ip));
  }
}

// Initialize monitors
const processMonitor = new SystemMonitor();
const networkMonitor = new NetworkMonitor();

function setupProcessMonitoring(mainWindow) {
  processMonitor.monitorProcesses(mainWindow);
}

function setupNetworkMonitoring(mainWindow) {
  networkMonitor.monitorNetwork(mainWindow);
}

module.exports = {
  setupProcessMonitoring,
  setupNetworkMonitoring,
  SystemMonitor,
  NetworkMonitor
};
