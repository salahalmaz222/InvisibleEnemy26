# Advanced Antivirus - npm Installation Script (PowerShell)
# This script helps install all dependencies for the Advanced Antivirus application

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Advanced Antivirus - Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Check if npm is installed
$npmCheck = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/4] Checking npm version..." -ForegroundColor Yellow
npm --version
Write-Host ""

Write-Host "[2/4] Cleaning up old installations..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing old node_modules..."
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..."
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}
Write-Host ""

Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes. Please wait..." -ForegroundColor Cyan
Write-Host ""
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Write-Host "Try these solutions:" -ForegroundColor Yellow
    Write-Host "- Ensure you have internet connection" -ForegroundColor Yellow
    Write-Host "- Delete node_modules folder and try again" -ForegroundColor Yellow
    Write-Host "- Run: npm cache clean --force" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/4] Verifying installation..." -ForegroundColor Yellow

$reactInstalled = Test-Path "node_modules\react"
$electronInstalled = Test-Path "node_modules\electron"

if ($reactInstalled) {
    Write-Host "✓ React installed" -ForegroundColor Green
} else {
    Write-Host "✗ React not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if ($electronInstalled) {
    Write-Host "✓ Electron installed" -ForegroundColor Green
} else {
    Write-Host "✗ Electron not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To build for production:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
