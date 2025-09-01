@echo off
echo Starting simple mobile access...

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

REM Start services quickly
start /MIN python mobile_interface\dev_agent_api_server.py
timeout /t 2 /nobreak >nul
start /MIN python -m http.server 8888 --directory mobile_interface

REM Show the direct link
echo.
echo ===================================
echo   📱 PHONE ACCESS READY!
echo ===================================
echo.
echo Click this link from your phone:
echo.
echo http://localhost:8888/phone_dev_agent.html
echo.
echo Or if remote desktop from phone, just click here:
start http://localhost:8888/phone_dev_agent.html
echo.
echo ✅ Interface opened!
pause