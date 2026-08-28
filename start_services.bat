@echo off
title HouseOfAbdi Auto Start Services
echo ========================================================
echo Starting HouseOfAbdi Production Server and Cloudflare Tunnel
echo ========================================================

:: Change directory to project root
cd /d "D:\Abdi\PORTFOLIO-APPS"

:: Start Local Production Server on port 8080 in minimized window
echo [1/2] Launching Local Production Server on port 8080...
start "HouseOfAbdi-Production-Server" /min cmd /c "npm run prod"

:: Wait 3 seconds for port 8080 to start listening
ping 127.0.0.1 -n 4 >nul

:: Start Cloudflare Tunnel houseofabdi in minimized window
echo [2/2] Launching Cloudflare Tunnel (houseofabdi.web.id)...
start "HouseOfAbdi-Cloudflare-Tunnel" /min cmd /c "cloudflared tunnel run houseofabdi"

echo.
echo ========================================================
echo All services launched successfully!
echo Local Server: http://127.0.0.1:8080
echo Public URL:   https://houseofabdi.web.id
echo ========================================================
