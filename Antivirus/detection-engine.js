const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MalwareDatabase, HeuristicRules, ScanConfig } = require('./malware-db');

class MalwareDetectionEngine {
  constructor() {
    this.detectionLog = [];
    this.scanProgress = 0;
    this.totalFiles = 0;
  }

  // Calculate file hash (MD5)
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  // Signature-based detection
  checkSignatures(filePath, fileContent) {
    const fileName = path.basename(filePath).toLowerCase();
    const fileExt = path.extname(filePath).toLowerCase();
    const threats = [];

    // Check all malware categories
    for (const category in MalwareDatabase) {
      const malwareList = MalwareDatabase[category];

      if (Array.isArray(malwareList)) {
        for (const malware of malwareList) {
          // Check signatures in filename
          if (malware.signatures) {
            for (const sig of malware.signatures) {
              if (fileName.includes(sig.toLowerCase())) {
                threats.push({
                  type: 'signature_match',
                  name: malware.name,
                  category: category,
                  signature: sig,
                  severity: this.getSeverity(category)
                });
              }
            }
          }

          // Check file extensions
          if (malware.extensions && malware.extensions.includes(fileExt)) {
            threats.push({
              type: 'extension_match',
              name: malware.name,
              category: category,
              extension: fileExt,
              severity: this.getSeverity(category)
            });
          }

          // Check file hash
          if (malware.hashes) {
            const fileHash = this.getFileHash(filePath);
            if (fileHash && malware.hashes.includes(fileHash)) {
              threats.push({
                type: 'hash_match',
                name: malware.name,
                category: category,
                hash: fileHash,
                severity: this.getSeverity(category)
              });
            }
          }
        }
      }
    }

    return threats;
  }

  // Heuristic-based detection
  checkHeuristics(filePath, fileContent) {
    const fileName = path.basename(filePath).toLowerCase();
    const fileExt = path.extname(filePath).toLowerCase();
    const threats = [];

    // Check for disguised executables
    for (const disguise of HeuristicRules.fileProperties.disguisedExecutables) {
      if (disguise.trueName.test(fileExt) && disguise.fakeName.test(fileName)) {
        threats.push({
          type: 'heuristic_disguised',
          name: 'Disguised Executable',
          category: 'suspicious',
          severity: 'high'
        });
      }
    }

    // Check for suspicious patterns in file content
    if (fileContent) {
      const content = fileContent.toString('utf8', 0, Math.min(fileContent.length, 100000));

      // Check for obfuscated code
      const obfuscationPatterns = [
        /eval\s*\(/gi,
        /unescape\s*\(/gi,
        /atob\s*\(/gi,
        /String\.fromCharCode/gi,
        /String\.fromCodePoint/gi
      ];

      for (const pattern of obfuscationPatterns) {
        if (pattern.test(content)) {
          threats.push({
            type: 'heuristic_obfuscation',
            name: 'Obfuscated Code Detected',
            category: 'suspicious',
            severity: 'medium'
          });
          break;
        }
      }

      // Check for suspicious API calls
      const suspiciousAPIs = [
        /CreateRemoteThread/gi,
        /VirtualAllocEx/gi,
        /WriteProcessMemory/gi,
        /SetWindowsHookEx/gi,
        /RegSetValueEx/gi,
        /InternetOpenUrl/gi
      ];

      let apiCount = 0;
      for (const api of suspiciousAPIs) {
        if (api.test(content)) apiCount++;
      }

      if (apiCount >= 3) {
        threats.push({
          type: 'heuristic_api_calls',
          name: 'Suspicious API Calls Pattern',
          category: 'suspicious',
          severity: 'high'
        });
      }
    }

    return threats;
  }

  // Get severity level
  getSeverity(category) {
    const severityMap = {
      ransomware: 'critical',
      trojan: 'high',
      worm: 'critical',
      virus: 'critical',
      rootkit: 'critical',
      spyware: 'high',
      backdoor: 'critical',
      botnet: 'high',
      keylogger: 'high',
      cryptojacking: 'medium',
      adware: 'medium',
      pup: 'low'
    };
    return severityMap[category] || 'medium';
  }

  // Scan a single file
  scanFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      
      // Skip very large files
      if (stats.size > 100 * 1024 * 1024) {
        return null;
      }

      let threats = [];

      // Read file content for deeper analysis
      let fileContent = null;
      try {
        if (stats.size < 1 * 1024 * 1024) { // Only read files < 1MB
          fileContent = fs.readFileSync(filePath);
        }
      } catch (error) {
        // File might be locked or unreadable
      }

      // Run signature-based detection
      const sigThreats = this.checkSignatures(filePath, fileContent);
      threats = threats.concat(sigThreats);

      // Run heuristic detection
      const heurThreats = this.checkHeuristics(filePath, fileContent);
      threats = threats.concat(heurThreats);

      if (threats.length > 0) {
        return {
          filePath,
          fileName: path.basename(filePath),
          fileSize: stats.size,
          lastModified: stats.mtime,
          threats: threats,
          riskLevel: threats[0].severity,
          fileHash: this.getFileHash(filePath)
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Scan a directory recursively
  async scanDirectory(dirPath, maxDepth = 10, currentDepth = 0) {
    const results = {
      filesScanned: 0,
      threats: [],
      errors: []
    };

    if (currentDepth >= maxDepth || !fs.existsSync(dirPath)) {
      return results;
    }

    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);

        try {
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            // Skip system and protected directories
            const dirName = path.basename(filePath).toLowerCase();
            if (!this.shouldSkipDirectory(dirName)) {
              const subResults = await this.scanDirectory(filePath, maxDepth, currentDepth + 1);
              results.filesScanned += subResults.filesScanned;
              results.threats = results.threats.concat(subResults.threats);
              results.errors = results.errors.concat(subResults.errors);
            }
          } else {
            // Scan file
            const threat = this.scanFile(filePath);
            if (threat) {
              results.threats.push(threat);
            }
            results.filesScanned++;

            // Limit files scanned per batch to avoid hanging
            if (results.filesScanned % ScanConfig.fileCheckInterval === 0) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }
        } catch (error) {
          results.errors.push({ file: filePath, error: error.message });
        }

        // Safety limit
        if (results.filesScanned >= ScanConfig.maxFilesPerScan) {
          break;
        }
      }
    } catch (error) {
      results.errors.push({ directory: dirPath, error: error.message });
    }

    return results;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'system volume information',
      '$recycle.bin',
      'pagefile',
      'hiberfil',
      'node_modules',
      '.git',
      '.vscode',
      '$shadow',
      'temp'
    ];

    return skipDirs.some(skip => dirName.includes(skip));
  }
}

// Export scan functions
const engine = new MalwareDetectionEngine();

async function scanDirectory(dirPath) {
  return await engine.scanDirectory(dirPath);
}

function scanFile(filePath) {
  return engine.scanFile(filePath);
}

function getQuarantineStatus() {
  // Will be implemented in main process
  return { files: [], count: 0 };
}

module.exports = {
  scanDirectory,
  scanFile,
  getQuarantineStatus,
  MalwareDetectionEngine
};
