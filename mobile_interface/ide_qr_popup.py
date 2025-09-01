#!/usr/bin/env python3
"""
IDE QR Code Integration
Quick QR code popup for IDE integration - can be called from VS Code tasks, etc.
"""

import sys
import os
import socket
import subprocess
from pathlib import Path

def get_local_ip():
    """Get local IP address"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return "localhost"

def check_services():
    """Check if mobile interface services are running"""
    import requests
    
    try:
        # Check API server
        response = requests.get("http://localhost:8889/health", timeout=2)
        api_running = response.status_code == 200
    except:
        api_running = False
    
    try:
        # Check web server  
        response = requests.get("http://localhost:8888", timeout=2)
        web_running = response.status_code == 200
    except:
        web_running = False
    
    return api_running, web_running

def start_services_if_needed():
    """Start mobile interface services if not running"""
    api_running, web_running = check_services()
    
    if not api_running or not web_running:
        print("🚀 Starting mobile interface services...")
        
        # Start the full mobile interface system
        project_root = Path(__file__).parent.parent
        startup_script = project_root / "START_MOBILE_INTERFACE.bat"
        
        if startup_script.exists():
            subprocess.Popen([str(startup_script)], shell=True)
            print("✅ Mobile interface startup initiated")
            return True
        else:
            print("❌ Startup script not found")
            return False
    else:
        print("✅ Services already running")
        return True

def show_qr_popup():
    """Show QR code popup"""
    try:
        # Import and run QR generator
        from qr_code_generator import QRCodeGenerator
        
        qr_gen = QRCodeGenerator()
        qr_gen.show_qr_code()
        
    except ImportError:
        print("❌ QR code generator not available")
        print("Installing dependencies...")
        
        subprocess.run([sys.executable, "-m", "pip", "install", "qrcode[pil]", "pillow"])
        
        # Try again
        try:
            from qr_code_generator import QRCodeGenerator
            qr_gen = QRCodeGenerator()
            qr_gen.show_qr_code()
        except Exception as e:
            print(f"❌ Failed to show QR code: {e}")

def main():
    """Main entry point for IDE integration"""
    print("📱 IDE QR Code Integration")
    
    # Check if services are running, start if needed
    if not start_services_if_needed():
        print("❌ Failed to start services")
        input("Press Enter to exit...")
        return
    
    # Show QR code
    show_qr_popup()

if __name__ == "__main__":
    main()