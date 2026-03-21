// Additional utilities for the antivirus application

const fs = require('fs');
const path = require('path');

/**
 * Threat Risk Calculator
 * Determines overall risk level based on multiple threats
 */
class ThreatRiskCalculator {
  calculateRisk(threats) {
    if (!threats || threats.length === 0) return 'safe';

    const severityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25
    };

    const totalScore = threats.reduce((sum, t) => {
      return sum + (severityScores[t.severity] || 0);
    }, 0);

    const averageScore = totalScore / threats.length;

    if (averageScore >= 75) return 'critical';
    if (averageScore >= 50) return 'high';
    if (averageScore >= 25) return 'medium';
    return 'low';
  }

  getRiskColor(level) {
    const colors = {
      critical: '#ff4444',
      high: '#ffaa44',
      medium: '#ffdd44',
      low: '#44ff44',
      safe: '#00d4ff'
    };
    return colors[level] || '#888888';
  }
}

/**
 * Scan Report Generator
 * Creates detailed reports of scan results
 */
class ScanReportGenerator {
  generateReport(scanResults) {
    const timestamp = new Date().toISOString();
    
    const report = {
      timestamp,
      summary: {
        totalFilesScanned: scanResults.totalFilesScanned,
        threatCount: scanResults.threats?.length || 0,
        cleanFiles: scanResults.totalFilesScanned - (scanResults.threats?.length || 0),
        scanDuration: this.formatDuration(scanResults.duration || 0),
        scanType: scanResults.scanType
      },
      threats: scanResults.threats || [],
      statistics: this.calculateStatistics(scanResults.threats || []),
      recommendations: this.getRecommendations(scanResults.threats || [])
    };

    return report;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  calculateStatistics(threats) {
    const stats = {
      byCategory: {},
      bySeverity: {},
      topThreats: []
    };

    // Count by category
    threats.forEach(threat => {
      threat.threats?.forEach(t => {
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
        stats.bySeverity[t.severity] = (stats.bySeverity[t.severity] || 0) + 1;
      });
    });

    // Find top threats
    const threatNames = {};
    threats.forEach(threat => {
      threat.threats?.forEach(t => {
        threatNames[t.name] = (threatNames[t.name] || 0) + 1;
      });
    });

    stats.topThreats = Object.entries(threatNames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return stats;
  }

  getRecommendations(threats) {
    const recommendations = [];
    const riskLevel = this.calculateRisk(threats);

    if (riskLevel === 'critical') {
      recommendations.push('⚠️ CRITICAL: Immediate action required. Quarantine or delete all threats.');
      recommendations.push('⚠️ CRITICAL: Consider booting in Safe Mode for additional cleaning.');
    } else if (riskLevel === 'high') {
      recommendations.push('⚠️ HIGH RISK: Quarantine detected threats immediately.');
      recommendations.push('💡 Consider running additional security scans.');
    } else if (riskLevel === 'medium') {
      recommendations.push('⏳ MEDIUM RISK: Review and quarantine detected items.');
      recommendations.push('💡 Monitor system activity closely.');
    }

    if (threats.length > 0) {
      recommendations.push('🔄 Keep virus definitions updated.');
      recommendations.push('🛡️ Enable real-time protection.');
      recommendations.push('📅 Schedule regular scans.');
    } else {
      recommendations.push('✓ System appears clean. Maintain regular scanning schedule.');
    }

    return recommendations;
  }

  calculateRisk(threats) {
    const severityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25
    };

    if (threats.length === 0) return 'safe';

    let totalScore = 0;
    threats.forEach(threat => {
      threat.threats?.forEach(t => {
        totalScore += severityScores[t.severity] || 0;
      });
    });

    const averageScore = totalScore / (threats.length * 2); // Adjust for multiple threats per file

    if (averageScore >= 75) return 'critical';
    if (averageScore >= 50) return 'high';
    if (averageScore >= 25) return 'medium';
    return 'low';
  }
}

/**
 * System Information Gatherer
 * Collects system details for reporting
 */
class SystemInfoGatherer {
  async getSystemInfo() {
    const os = require('os');

    return {
      platform: os.platform(),
      release: os.release(),
      architecture: os.arch(),
      totalMemory: this.formatBytes(os.totalmem()),
      freeMemory: this.formatBytes(os.freemem()),
      cpuCount: os.cpus().length,
      hostname: os.hostname(),
      userInfo: os.userInfo().username
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Threat Action Handler
 * Manages quarantine, delete, and restore operations
 */
class ThreatActionHandler {
  async handleThreat(action, threat, quarantineDir) {
    switch (action) {
      case 'quarantine':
        return this.quarantineThreat(threat, quarantineDir);
      case 'delete':
        return this.deleteThreat(threat);
      case 'restore':
        return this.restoreThreat(threat);
      default:
        throw new Error('Unknown action: ' + action);
    }
  }

  quarantineThreat(threat, quarantineDir) {
    try {
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }

      const fileName = path.basename(threat.filePath);
      const quarantinePath = path.join(quarantineDir, `${Date.now()}_${fileName}`);
      
      // Copy file to quarantine
      fs.copyFileSync(threat.filePath, quarantinePath);
      
      // Delete original
      fs.unlinkSync(threat.filePath);

      return {
        success: true,
        message: `Threat quarantined: ${fileName}`,
        quarantinePath
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to quarantine: ${error.message}`
      };
    }
  }

  deleteThreat(threat) {
    try {
      if (fs.existsSync(threat.filePath)) {
        fs.unlinkSync(threat.filePath);
      }

      return {
        success: true,
        message: `Threat deleted: ${threat.fileName}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete: ${error.message}`
      };
    }
  }

  restoreThreat(threat) {
    // Requires original path information from quarantine metadata
    try {
      return {
        success: false,
        message: 'Restore requires original path information from quarantine metadata'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to restore: ${error.message}`
      };
    }
  }
}

/**
 * Threat Statistics Generator
 */
class ThreatStatistics {
  calculateTrendData(scanHistory) {
    // Generate trend data from scan history
    const trends = [];
    
    if (scanHistory && scanHistory.length > 0) {
      scanHistory.forEach(scan => {
        trends.push({
          date: new Date(scan.timestamp).toLocaleDateString(),
          threats: scan.threatCount,
          filesScanned: scan.filesScanned
        });
      });
    }

    return trends;
  }

  getMostCommonThreats(scanHistory, topN = 10) {
    const threatCounts = {};

    if (scanHistory && scanHistory.length > 0) {
      scanHistory.forEach(scan => {
        scan.threats?.forEach(threat => {
          threat.threats?.forEach(t => {
            threatCounts[t.name] = (threatCounts[t.name] || 0) + 1;
          });
        });
      });
    }

    return Object.entries(threatCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name, count]) => ({ name, count }));
  }

  getSystemHealthScore(scanResults) {
    // Calculate system health on scale of 0-100
    if (!scanResults || !scanResults.threats) {
      return 100;
    }

    const threatCount = scanResults.threats.length;
    const criticalCount = scanResults.threats.filter(
      t => t.riskLevel === 'critical'
    ).length;

    // Start at 100 and subtract points for threats
    let score = 100;
    score -= (criticalCount * 30);
    score -= (threatCount * 5);

    return Math.max(0, score);
  }
}

module.exports = {
  ThreatRiskCalculator,
  ScanReportGenerator,
  SystemInfoGatherer,
  ThreatActionHandler,
  ThreatStatistics
};
