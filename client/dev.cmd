@echo off
cd /d "%~dp0"
where npm.cmd >nul 2>nul
if %errorlevel% equ 0 (
  npm.cmd run dev
  exit /b %errorlevel%
)
if exist "C:\Program Files\nodejs\npm.cmd" (
  "C:\Program Files\nodejs\npm.cmd" run dev
  exit /b %errorlevel%
)
echo [ERROR] npm.cmd not found. Install Node.js LTS from https://nodejs.org
pause
exit /b 1
