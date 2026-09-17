@echo off
setlocal

set "ROOT=%~dp0"
set "NPM_CMD=npm.cmd"
where npm.cmd >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
  ) else (
    echo [ERROR] npm not found. Install Node.js LTS first.
    pause
    exit /b 1
  )
)

if not exist "%ROOT%server\.env" (
  copy /Y "%ROOT%server\.env.example" "%ROOT%server\.env" >nul
)
if not exist "%ROOT%client\.env" (
  copy /Y "%ROOT%client\.env.example" "%ROOT%client\.env" >nul
)

echo Starting Glowify unified platform...

start "Glowify API" cmd /k "cd /d \"%ROOT%server\" && \"%NPM_CMD%\" run dev"
start "Glowify Web" cmd /k "cd /d \"%ROOT%client\" && \"%NPM_CMD%\" run dev"

echo.
echo Open these URLs after startup:
echo - Website:  http://localhost:5173
echo - Admin:    http://localhost:5173/admin
echo - API:      http://localhost:5000/api/health
pause
