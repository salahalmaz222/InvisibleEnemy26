# 🛠️ Advanced Antivirus - Installation & Build Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** 14.x or higher (download from nodejs.org)
- **npm** 6.x or higher (comes with Node.js)
- **Git** (optional, for version control)
- **Windows** 10 or later

### Verify Installation
```bash
node --version      # Should show v14.0.0 or higher
npm --version       # Should show 6.0.0 or higher
```

---

## 📥 Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd d:\Antivirus
```

### Step 2: Install Dependencies
```bash
npm install
```

This will:
- Download all required packages from npm registry
- Install React, Electron, Chart.js, and other dependencies
- Create `node_modules/` folder
- Generate `package-lock.json`

**Estimated time**: 2-5 minutes depending on internet speed

### Step 3: Verify Installation
```bash
npm list --depth=0
```

This should show all major dependencies installed successfully.

---

## 🚀 Running the Application

### Development Mode

#### Option 1: With Hot Reload (Recommended)
```bash
npm run dev
```

This will:
1. Start React development server on http://localhost:3000
2. Wait for React server to be ready
3. Launch Electron window
4. Enable hot reloading for both React and Electron code
5. Open DevTools for debugging

**First run takes 30-60 seconds while React compiles**

#### Option 2: Manual Start
```bash
# Terminal 1 - Start React
npm run react-start

# Terminal 2 - Wait a moment, then start Electron
# After React is ready (localhost:3000), open another terminal
electron .
```

### Production Mode
```bash
npm start
```

This runs the pre-built production version.

---

## 🏗️ Building for Distribution

### Option 1: Full Build (Recommended for Distribution)
```bash
npm run build
```

This will:
1. Build React app for production
2. Optimize and minify all assets
3. Create `build/` folder with bundled files
4. Package everything with Electron
5. Generate Windows installers in `dist/` folder

**Output Files**:
- `Advanced Antivirus Setup 1.0.0.exe` (NSIS Installer)
- `Advanced Antivirus 1.0.0.exe` (Portable)
- `Advanced Antivirus 1.0.0.exe.blockmap`

**Time required**: 2-3 minutes

### Option 2: Development Build
```bash
npm run electron-build
```

Faster build without full optimization (for testing purposes).

---

## 📋 Project Structure After Installation

```
d:\Antivirus/
├── node_modules/           (created after npm install)
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── pages/
│   └── index.js
├── main.js
├── package.json
├── package-lock.json
├── README.md
└── [other files...]
```

After building:
```
d:\Antivirus/
├── build/                  (React production build)
│   ├── index.html
│   ├── static/
│   └── [assets]
├── dist/                   (Packaged executables)
│   ├── Advanced Antivirus Setup 1.0.0.exe
│   └── Advanced Antivirus 1.0.0.exe
└── [source files...]
```

---

## ⚙️ Configuration

### Package.json Configuration

The `package.json` includes build configuration:

```json
{
  "build": {
    "appId": "com.antivirus.app",
    "productName": "Advanced Antivirus",
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### Customize Build

To change output:
1. Edit `package.json` build section
2. Change product name, version, etc.
3. Modify Windows target (nsis, portable, etc.)
4. Run `npm run build` again

---

## 🔍 Testing the Application

### Test Quick Scan
1. Run the application (`npm run dev`)
2. Click "Scanner" in sidebar
3. Click "Start Quick Scan"
4. Monitor progress
5. View results when complete

### Test Full Scan
1. Click "Scanner" > "Start Full Scan"
2. This scans the entire C: drive
3. May take 20-60 minutes depending on drive size
4. Safe to stop at any time

### Test Quarantine
1. Run a quick scan
2. If threats found, click "Quarantine"
3. Go to "Quarantine" page
4. See quarantined files
5. Test delete and restore options

### Test Settings
1. Click "Settings"
2. Toggle "Real-Time Protection"
3. Enable/disable features
4. Save settings
5. Verify changes persist after reload

### Test Dashboard
1. Check "Dashboard" for status
2. Verify charts display correctly
3. Check statistics update after scans
4. View activity log

---

## 🔧 Troubleshooting

### Issue: "npm install" fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2**: Delete node_modules and try again
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Solution 3**: Check internet connection and try from admin terminal

---

### Issue: Port 3000 already in use

**Solution**: Kill process on port 3000
```bash
# PowerShell (as Administrator)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or use different port:
```bash
set PORT=3001 && npm run react-start
```

---

### Issue: Electron window won't open

**Solution 1**: Verify React server is running
- Check that http://localhost:3000 loads in browser
- If not, React build failed
- Check console for error messages

**Solution 2**: Run React and Electron separately
```bash
# Terminal 1
npm run react-start

# Terminal 2 (after React ready)
electron .
```

---

### Issue: DevTools won't open

**Solution**: Electron may have started before React
1. Close all windows
2. Kill all node processes
3. Run `npm run dev` again

---

### Issue: Build fails

**Solution 1**: Clear build directories
```bash
rmdir /s /q build
rmdir /s /q dist
npm run build
```

**Solution 2**: Ensure all files are present
```bash
npm list
```

---

## 📊 Performance Tips

### Faster Development
- Use `npm run dev` (hot reload is faster than rebuilding)
- Keep DevTools closed to reduce memory usage
- Disable full system scans during testing
- Use Quick Scan instead

### Faster Builds
- Close other applications to free RAM
- Disable antivirus during build (temporarily)
- Ensure fast SSD for build output
- Use `npm run electron-build` for quick test builds

### Faster Scans
- Use Quick Scan for testing (2-5 min vs 30+ min)
- Add large folders to exclusions
- Run scans during off-hours

---

## 🔐 Security Considerations

### Development
- DevTools expose internals
- Only run in secure environments
- Don't commit sensitive data to git

### Production Build
- All code is bundled and obfuscated
- External dependencies are included
- Safe for distribution

### Installation
- NSIS installer includes digital signature option
- Portable version is self-contained
- No admin rights required for portable version
- NSIS installer needs admin for system-wide installation

---

## 📦 Distribution Options

### Option 1: NSIS Installer
- Professional installer experience
- Optional admin rights
- Add to Start menu
- Create uninstaller
- Users see installation wizard

### Option 2: Portable Executable
- Single EXE file
- No installation needed
- No system modifications
- Works from USB drive
- Larger file size (single executable)

### Option 3: ZIP Archive
Create your own distribution:
```bash
# After npm run build
7z a Advanced-Antivirus-Portable.7z dist\*.exe
```

---

## 🔄 Update Process

### For Development
1. Update files in `src/` or `main.js`
2. Changes auto-reload in development
3. For major changes, restart `npm run dev`

### For Production
1. Update version in `package.json`
2. Update version in main.js
3. Build: `npm run build`
4. New installers in `dist/` folder
5. Distribute new version

---

## 📝 Environment Variables

Optional environment variables:

```bash
# Set port for React dev server
set PORT=3001

# Set node environment
set NODE_ENV=production

# Set Electron dev tools
set ELECTRON_ENABLE_LOGGING=true
```

---

## ✅ Installation Checklist

- [ ] Node.js v14+ installed
- [ ] npm v6+ installed
- [ ] Project cloned/extracted
- [ ] `cd` to project directory
- [ ] Ran `npm install`
- [ ] All dependencies installed
- [ ] `npm run dev` successful
- [ ] Electron window opens
- [ ] React interface loads
- [ ] Dashboard displays correctly
- [ ] Scanner page functional
- [ ] All pages accessible

---

## 🎓 Next Steps

After successful installation:

1. **Explore the Code**
   - Read main.js for Electron setup
   - Check src/pages/ for React components
   - Review detection-engine.js for malware logic

2. **Test Features**
   - Run quick scan
   - Test quarantine
   - Check monitoring
   - Explore settings

3. **Customize**
   - Modify malware database
   - Add new detection patterns
   - Adjust UI colors/styling
   - Change app branding

4. **Build & Distribute**
   - Create production build
   - Test installer
   - Deploy to users

---

## 📞 Support Resources

### Documentation Files
- `README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `PROJECT_SUMMARY.md` - Project overview
- `FILE_LISTING.md` - File descriptions

### Code Comments
- Each file has descriptive comments
- Classes have docstrings
- Functions are well-documented
- See inline help throughout code

### Terminal Output
- Errors appear in console
- React compilation messages shown
- Electron console accessible via DevTools

---

## 🎉 Success!

Once you see the Electron window open with the React interface loading, you have successfully:
- ✅ Installed all dependencies
- ✅ Started the development environment
- ✅ Launched the antivirus application
- ✅ Ready to scan for threats!

**Happy scanning!** 🛡️✨

---

**Advanced Antivirus v1.0.0** - Ready to build and deploy
