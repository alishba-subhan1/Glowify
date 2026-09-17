@echo off
setlocal

set "ROOT=%~dp0"
set "NPM_CMD=npm"

where npm >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
  ) else (
    echo [ERROR] npm not found. Install Node.js LTS and try again.
    pause
    exit /b 1
  )
)

echo Installing server dependencies...
cd /d "%ROOT%server"
call "%NPM_CMD%" install
if errorlevel 1 goto :failed

echo Installing client dependencies...
cd /d "%ROOT%client"
call "%NPM_CMD%" install
if errorlevel 1 goto :failed

echo.
echo [OK] Server and web dependencies installed successfully.
pause
exit /b 0

:failed
echo.
echo [ERROR] Dependency installation failed. Check the output above.
pause
exit /b 1
