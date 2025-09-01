@echo off
echo ================================================
echo   📱 MOBILE DEV AGENT - QR CODE GENERATOR
echo ================================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo Installing QR code dependencies...
pip install qrcode[pil] pillow >nul 2>&1

echo.
echo 🔄 Generating QR code for mobile access...
echo.

python mobile_interface\qr_code_generator.py

echo.
echo QR code popup closed.
pause