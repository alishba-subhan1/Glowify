@echo off
setlocal

echo Stopping Glowify dev servers...

taskkill /FI "WINDOWTITLE eq Glowify API" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Glowify Web" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Glowify Client" /T /F >nul 2>nul

echo.
echo [OK] Stop command sent for Glowify API and Web windows.
echo If any server is still running, close that terminal manually.
pause
