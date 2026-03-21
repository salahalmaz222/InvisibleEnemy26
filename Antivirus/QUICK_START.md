# Quick Start Guide - Advanced Antivirus Desktop Application

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run in Development Mode
```bash
npm run dev
```

This will:
- Start React development server on http://localhost:3000
- Launch Electron window automatically after React is ready
- Enable hot reloading for development

### Step 3: Start Using
- The app will open with the Dashboard
- Navigate using the sidebar menu
- Try "Quick Scan" to test the scanner

---

## 📋 Key Features Quick Reference

### Dashboard
- **Protection Status**: Shows if real-time protection is active
- **Threat Count**: Number of items in quarantine
- **System Status**: Overall security health
- **Charts**: 7-day threat history and breakdown by type

### Scanner
Three scan options:
1. **⚡ Quick Scan** - Scans critical areas (2-5 min)
2. **🔍 Full Scan** - Complete system scan (20-60 min)
3. **📁 Custom Scan** - Scan specific path

Results show:
- Files scanned
- Threats found with details
- Quarantine or Delete options

### Quarantine Manager
- View all isolated threats
- Bulk select/delete/restore
- File size and date information
- Safe storage preventing execution

### System Monitor
- Real-time process monitoring
- Network activity alerts
- Suspicious activity detection
- Detection method information

### Settings
- Enable/disable protection features
- Schedule automatic scans
- Whitelist trusted folders
- Configure database updates
- View about and malware types

---

## 🛠️ Build for Production

### Create Windows Installer/Portable
```bash
npm run build
```

This will:
- Build React app for production
- Package with Electron
- Create Windows installers in `dist/` folder
- Generate both NSIS installer and portable .exe

### Output Files
- `Advanced Antivirus Setup 1.0.0.exe` - NSIS installer
- `Advanced Antivirus 1.0.0.exe` - Portable version

---

## 🔍 Testing the Detection Engine

### Test Malware Detection
1. Open Scanner page
2. Click "Quick Scan" or "Full Scan"
3. Monitor progress
4. View detected threats (if any)

### The detection engine will find:
- Known malware signatures
- Suspicious file extensions
- Heuristic pattern matches
- Obfuscated code
- Dangerous API calls

### Test Quarantine
1. After scan completes, view threats
2. Click "Quarantine" on any threat
3. Go to Quarantine page
4. See the isolated threat in the list
5. Click "Delete" to permanently remove

---

## 📊 Understanding the Dashboard

### Status Cards
- **Protection Status**: Real-time protection indicator
- **Threats Detected**: Count of quarantined items
- **System Status**: Clean/Secure indicator
- **Virus Definitions**: Database version and update status

### Charts
- **Threat History**: Daily threat detection over 7 days
- **Threat Breakdown**: Pie chart by threat type

### Stats
- **Total Scans**: Cumulative number of scans performed
- **Threats Blocked**: Total detected threats count
- **Protection Time**: How long antivirus has been active
- **System Health**: Overall security score

---

## 🛡️ Malware Types Detected

The application includes detection for 12 major malware categories:

| Type | Examples | Risk Level |
|------|----------|-----------|
| Ransomware | WannaCry, Petya | 🔴 Critical |
| Trojans | Zeus, Emotet | 🔴 High |
| Worms | Stuxnet, MyDoom | 🔴 Critical |
| Viruses | File infectors | 🔴 Critical |
| Spyware | Keyloggers | 🟠 High |
| Rootkits | Alureon, Conficker | 🔴 Critical |
| Botnet | Mirai, ZeroAccess | 🟠 High |
| Cryptojacking | XMRig, Miners | 🟡 Medium |
| Adware | PUPs | 🟡 Medium |
| Backdoors | Shells, WebShells | 🔴 Critical |
| Fileless | PowerShell exploits | 🟠 High |
| Heuristic | Unknown threats | 🟡 Medium |

---

## 📁 Project Structure

```
antivirus/
├── src/
│   ├── App.js              - Main React component
│   ├── pages/              - Page components
│   │   ├── Dashboard.js    - Main dashboard
│   │   ├── Scanner.js      - Scanning interface
│   │   ├── Quarantine.js   - Quarantine manager
│   │   ├── SystemMonitor.js - Real-time monitoring
│   │   └── Settings.js     - Configuration
│   └── index.js            - React entry point
├── main.js                 - Electron main process
├── preload.js              - IPC bridge
├── detection-engine.js     - Malware detection logic
├── system-monitor.js       - Process/network monitoring
├── malware-db.js           - Threat database (7000+ signatures)
├── package.json            - Dependencies
└── README.md               - Full documentation
```

---

## 🔧 Common Tasks

### Clear Quarantine
1. Go to Quarantine page
2. Click "Select All"
3. Click "Delete Selected"
4. Confirm deletion

### Update Database
In Settings page, database updates run automatically based on configured frequency.

### Exclude a Folder
1. Go to Settings
2. Add path to "Exclude Paths" textarea
3. Click "Save Settings"

### Schedule Daily Scans
1. Go to Settings
2. Enable "Automatic Scans"
3. Set time using time picker
4. Save Settings

---

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Scan Takes Too Long
- Full scans on large systems can take 30+ minutes
- Use Quick Scan for faster results
- Add large directories to exclusions

### High CPU Usage During Scan
- This is normal, CPU is actively scanning files
- Reduce scan frequency if needed
- Run full scans during off-hours

### Quarantine Not Updating
- Refresh the page (Ctrl+R)
- Ensure scan completed successfully
- Check filesystem permissions

---

## 📞 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review Settings page for configuration help
3. Check System Monitor for detailed threat information

---

**Happy scanning! Your system is in good hands.** 🛡️✨
