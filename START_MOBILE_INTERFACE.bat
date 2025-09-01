@echo off
echo ========================================================
echo   📱 MOBILE DEV AGENT INTERFACE
echo   Connect to your dev agent from your phone!
echo ========================================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [1] Checking system requirements...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python is available
echo.

echo [2] Installing required packages...
pip install flask flask-cors >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Package installation had issues, continuing anyway...
) else (
    echo ✅ Flask packages ready
)
echo.

echo [3] Starting local AI container...
docker start claude-qwen3-local 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting fresh container...
    docker run --rm -d --name claude-qwen3-local -p 11434:11434 -v ollama-models:/root/.ollama claude-qwen3-integrated:latest
    echo Waiting for AI to be ready...
    timeout /t 10 /nobreak >nul
)

echo ✅ Local AI container started
echo.

echo [4] Testing local AI connection...
curl -s http://localhost:11434/api/tags --connect-timeout 5 --max-time 10 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Local AI is responding
) else (
    echo ⚠️  Local AI not ready yet, may take a moment
)
echo.

echo [5] Getting your network information...
echo.
echo 📱 MOBILE ACCESS INSTRUCTIONS:
echo ===============================
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    set ip=%%a
    call echo Your local IP: http://%%ip:8889/health
)
echo.
echo On your phone:
echo 1. Connect to the same WiFi network as this computer
echo 2. Open a web browser on your phone
echo 3. Visit: http://[YOUR_IP]:8888
echo    (Replace [YOUR_IP] with your computer's IP shown above)
echo.
echo The mobile interface will auto-detect and connect to your dev agent!
echo.

echo [6] Starting mobile API server...
echo Server will be available at http://localhost:8889
echo Mobile interface will be served at http://localhost:8888
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 STARTING MOBILE INTERFACE SYSTEM...
echo ======================================
echo.

REM Start API server in background
start "Dev Agent API" /MIN python mobile_interface\dev_agent_api_server.py

REM Wait a moment for API to start
timeout /t 3 /nobreak >nul

REM Start simple HTTP server for the HTML interface
echo Starting mobile interface server...
cd mobile_interface
start "Mobile Interface" /MIN python -m http.server 8888

echo.
echo ✅ MOBILE INTERFACE SYSTEM RUNNING!
echo ===================================
echo.
echo 🌐 API Server: http://localhost:8889
echo 📱 Mobile Interface: http://localhost:8888
echo 🤖 Local AI: http://localhost:11434
echo.
echo 📱 ON YOUR PHONE:
echo Open browser and go to: http://[YOUR_COMPUTER_IP]:8888
echo.
echo The interface should automatically connect to your dev agent.
echo You can chat with your AI, get code analysis, and development help!
echo.
echo Installing QR code dependencies...
pip install qrcode[pil] pillow >nul 2>&1

echo.
echo 📱 Showing QR code for easy phone access...
echo.

REM Show QR code popup
start "QR Code" python mobile_interface\qr_code_generator.py

REM Wait a moment then open browser
timeout /t 3 /nobreak >nul
start http://localhost:8888/phone_dev_agent.html

echo.
echo ✅ SYSTEM FULLY READY!
echo ======================
echo.
echo 📱 QR Code: Popup window opened - scan with your phone
echo 🖥️  Browser: Interface opened for testing
echo 🌐 Mobile URL: Check QR code popup for your specific URL
echo.
echo 🔄 System is running in background...
echo Close this window to stop the mobile interface system
echo.
pause