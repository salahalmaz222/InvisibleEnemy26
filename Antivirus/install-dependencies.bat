@echo off
REM Advanced Antivirus - npm Installation Script
REM This script helps install all dependencies for the Advanced Antivirus application

cls
color 0A
title Advanced Antivirus - Installation Script

echo.
echo ============================================
echo  Advanced Antivirus - Setup
echo ============================================
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking npm version...
npm --version
echo.

echo [2/4] Cleaning up old installations...
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
echo.

echo [3/4] Installing dependencies...
echo This may take 5-10 minutes. Please wait...
echo.
npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ERROR: npm install failed!
    echo Try these solutions:
    echo - Ensure you have internet connection
    echo - Delete node_modules folder and try again
    echo - Run: npm cache clean --force
    pause
    exit /b 1
)

echo.
echo [4/4] Verifying installation...
if exist node_modules\react (
    echo ✓ React installed
) else (
    color 0C
    echo ✗ React not found!
    pause
    exit /b 1
)

if exist node_modules\electron (
    echo ✓ Electron installed
) else (
    color 0C
    echo ✗ Electron not found!
    pause
    exit /b 1
)

echo.
color 0A
echo ============================================
echo  Installation Complete!
echo ============================================
echo.
echo To run the application:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo.
pause
