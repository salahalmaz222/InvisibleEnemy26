const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Check if running in development
const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

let isDev;
try {
  isDev = require('electron-is-dev');
} catch (e) {
  isDev = isDevelopment;
}

// Create a simple storage class as electron-store replacement
class Store {
  constructor() {
    this.path = path.join(app.getPath('userData'), 'store.json');
    this.data = {};
    this.load();
  }
  
  load() {
    try {
      if (fs.existsSync(this.path)) {
        const data = fs.readFileSync(this.path, 'utf8');
        this.data = JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading store:', e);
    }
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, value) {
    this.data[key] = value;
    this.save();
  }
  
  save() {
    try {
      const dir = path.dirname(this.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Error saving store:', e);
    }
  }
}

const { scanDirectory, scanFile, getQuarantineStatus } = require('./detection-engine');
const { setupNetworkMonitoring, setupProcessMonitoring } = require('./system-monitor');

const store = new Store();
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: process.platform === 'win32' ? path.join(__dirname, 'assets', 'icon.png') : undefined
  });

  const startUrl = isDev
    ? (process.env.REACT_PORT ? `http://localhost:${process.env.REACT_PORT}` : 'http://localhost:3000')
    : `file://${path.join(__dirname, '../build/index.html')}`;

  // Add a small delay before loading to ensure server is ready
  const loadWithRetry = (url, retries = 5) => {
    mainWindow.loadURL(url).catch(e => {
      if (retries > 0) {
        setTimeout(() => loadWithRetry(url, retries - 1), 1000);
      } else {
        console.error('Failed to load:', url, e);
      }
    });
  };

  if (isDev) {
    loadWithRetry(startUrl);
  } else {
    mainWindow.loadURL(startUrl);
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  createWindow();
  setupMenu();
  setupIPCHandlers();
  setupMonitoring();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const setupMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Run Quick Scan',
          click: () => mainWindow.webContents.send('run-quick-scan')
        },
        {
          label: 'Run Full Scan',
          click: () => mainWindow.webContents.send('run-full-scan')
        },
        {
          label: 'Update Database',
          click: () => mainWindow.webContents.send('update-database')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Advanced Antivirus',
              message: 'Advanced Antivirus v1.0.0',
              detail: 'Comprehensive malware detection and removal system for your PC'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const setupIPCHandlers = () => {
  // Scan operations
  ipcMain.handle('scan-directory', async (event, dirPath) => {
    try {
      return await scanDirectory(dirPath);
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('scan-file', async (event, filePath) => {
    try {
      return await scanFile(filePath);
    } catch (error) {
      return { error: error.message };
    }
  });

  // Quick scan (system directories)
  ipcMain.handle('quick-scan', async () => {
    try {
      const systemDirs = [
        path.join(os.homedir(), 'AppData', 'Local', 'Temp'),
        path.join(os.homedir(), 'Downloads'),
        'C:\\Windows\\Temp'
      ];

      let totalThreats = [];
      for (const dir of systemDirs) {
        if (fs.existsSync(dir)) {
          const result = await scanDirectory(dir);
          totalThreats = totalThreats.concat(result.threats || []);
        }
      }

      return {
        success: true,
        totalFilesScanned: 0,
        threatsFound: totalThreats.length,
        threats: totalThreats,
        scanType: 'quick'
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Full scan
  ipcMain.handle('full-scan', async () => {
    try {
      const drives = ['C:\\'];
      let totalThreats = [];
      let filesScanned = 0;

      for (const drive of drives) {
        if (fs.existsSync(drive)) {
          const result = await scanDirectory(drive);
          totalThreats = totalThreats.concat(result.threats || []);
          filesScanned += result.filesScanned || 0;
        }
      }

      return {
        success: true,
        totalFilesScanned: filesScanned,
        threatsFound: totalThreats.length,
        threats: totalThreats,
        scanType: 'full'
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Quarantine operations
  ipcMain.handle('quarantine-threat', async (event, filePath) => {
    try {
      const quarantineDir = path.join(app.getPath('userData'), 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }

      const fileName = path.basename(filePath);
      const quarantinePath = path.join(quarantineDir, `${Date.now()}_${fileName}`);
      
      fs.copyFileSync(filePath, quarantinePath);
      fs.unlinkSync(filePath);

      return { success: true, quarantinePath };
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('restore-threat', async (event, quarantinePath, originalPath) => {
    try {
      fs.copyFileSync(quarantinePath, originalPath);
      fs.unlinkSync(quarantinePath);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('delete-threat', async (event, filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('get-quarantine-status', async () => {
    try {
      const quarantineDir = path.join(app.getPath('userData'), 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        return { files: [], count: 0 };
      }

      const files = fs.readdirSync(quarantineDir).map(file => ({
        name: file,
        path: path.join(quarantineDir, file),
        size: fs.statSync(path.join(quarantineDir, file)).size
      }));

      return { files, count: files.length };
    } catch (error) {
      return { error: error.message };
    }
  });

  // Settings
  ipcMain.handle('get-settings', async () => {
    return store.store;
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    store.set(settings);
    return { success: true };
  });
};

const setupMonitoring = () => {
  setupProcessMonitoring(mainWindow);
  setupNetworkMonitoring(mainWindow);
};
