#!/usr/bin/env python3
"""
QR Code Generator for Mobile Dev Agent Interface
Shows QR code popup that you can scan with your phone to instantly connect
"""

import os
import sys
import socket
import tkinter as tk
from tkinter import messagebox
import qrcode
from PIL import Image, ImageTk
import threading
import time

class QRCodeGenerator:
    """Generate and display QR code for mobile interface access"""
    
    def __init__(self):
        self.root = None
        self.qr_window = None
        self.local_ip = self.get_local_ip()
        self.mobile_url = f"http://{self.local_ip}:8888/phone_dev_agent.html"
        
    def get_local_ip(self):
        """Get the local IP address of this machine"""
        try:
            # Connect to a remote address to determine local IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                return local_ip
        except Exception:
            # Fallback method
            try:
                hostname = socket.gethostname()
                local_ip = socket.gethostbyname(hostname)
                return local_ip
            except Exception:
                return "localhost"
    
    def generate_qr_code(self):
        """Generate QR code for the mobile URL"""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            
            qr.add_data(self.mobile_url)
            qr.make(fit=True)
            
            # Create QR code image with colors
            qr_img = qr.make_image(fill_color="#89b4fa", back_color="#1e1e2e")
            
            # Resize for display
            qr_img = qr_img.resize((300, 300), Image.Resampling.NEAREST)
            
            return qr_img
            
        except Exception as e:
            print(f"Error generating QR code: {e}")
            return None
    
    def create_qr_popup(self):
        """Create popup window with QR code"""
        try:
            # Create main window
            self.root = tk.Tk()
            self.root.title("📱 Mobile Dev Agent - QR Code")
            self.root.geometry("400x500")
            self.root.configure(bg="#1e1e2e")
            self.root.resizable(False, False)
            
            # Center window on screen
            self.center_window()
            
            # Make window always on top
            self.root.attributes("-topmost", True)
            
            # Header
            header_frame = tk.Frame(self.root, bg="#89b4fa", height=60)
            header_frame.pack(fill="x", padx=10, pady=10)
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(
                header_frame, 
                text="📱 Scan to Connect",
                font=("Segoe UI", 16, "bold"),
                bg="#89b4fa",
                fg="#1e1e2e"
            )
            header_label.pack(expand=True)
            
            # Generate and display QR code
            qr_img = self.generate_qr_code()
            if qr_img:
                # Convert PIL image to tkinter format
                self.qr_photo = ImageTk.PhotoImage(qr_img)
                
                qr_label = tk.Label(
                    self.root,
                    image=self.qr_photo,
                    bg="#1e1e2e"
                )
                qr_label.pack(pady=20)
            else:
                error_label = tk.Label(
                    self.root,
                    text="❌ Failed to generate QR code",
                    font=("Segoe UI", 12),
                    bg="#1e1e2e",
                    fg="#f38ba8"
                )
                error_label.pack(pady=50)
            
            # URL display
            url_frame = tk.Frame(self.root, bg="#313244", relief="raised", bd=1)
            url_frame.pack(fill="x", padx=20, pady=10)
            
            tk.Label(
                url_frame,
                text="Mobile URL:",
                font=("Segoe UI", 10, "bold"),
                bg="#313244",
                fg="#cdd6f4"
            ).pack(pady=(10, 5))
            
            url_text = tk.Text(
                url_frame,
                height=2,
                wrap=tk.WORD,
                font=("Consolas", 9),
                bg="#45475a",
                fg="#74c7ec",
                relief="flat",
                padx=10,
                pady=5
            )
            url_text.pack(fill="x", padx=10, pady=(0, 10))
            url_text.insert("1.0", self.mobile_url)
            url_text.config(state=tk.DISABLED)
            
            # Instructions
            instructions = [
                "1. Make sure your phone is on the same WiFi",
                "2. Open camera app or QR scanner",
                "3. Scan the QR code above",
                "4. Tap the link to open mobile interface"
            ]
            
            inst_frame = tk.Frame(self.root, bg="#1e1e2e")
            inst_frame.pack(fill="x", padx=20, pady=10)
            
            for i, instruction in enumerate(instructions, 1):
                inst_label = tk.Label(
                    inst_frame,
                    text=instruction,
                    font=("Segoe UI", 9),
                    bg="#1e1e2e",
                    fg="#bac2de",
                    anchor="w"
                )
                inst_label.pack(fill="x", pady=2)
            
            # Buttons
            button_frame = tk.Frame(self.root, bg="#1e1e2e")
            button_frame.pack(fill="x", padx=20, pady=10)
            
            copy_button = tk.Button(
                button_frame,
                text="📋 Copy URL",
                font=("Segoe UI", 10),
                bg="#74c7ec",
                fg="#1e1e2e",
                relief="flat",
                padx=20,
                command=self.copy_url
            )
            copy_button.pack(side="left", padx=(0, 10))
            
            close_button = tk.Button(
                button_frame,
                text="❌ Close",
                font=("Segoe UI", 10),
                bg="#f38ba8",
                fg="#1e1e2e",
                relief="flat",
                padx=20,
                command=self.close_popup
            )
            close_button.pack(side="right")
            
            # Auto-close timer (optional)
            self.start_auto_close_timer()
            
            return True
            
        except Exception as e:
            print(f"Error creating QR popup: {e}")
            return False
    
    def center_window(self):
        """Center the window on screen"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")
    
    def copy_url(self):
        """Copy URL to clipboard"""
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(self.mobile_url)
            messagebox.showinfo("Copied!", "URL copied to clipboard!")
        except Exception as e:
            print(f"Error copying URL: {e}")
    
    def close_popup(self):
        """Close the popup window"""
        if self.root:
            self.root.quit()
            self.root.destroy()
    
    def start_auto_close_timer(self):
        """Start timer to auto-close after 2 minutes"""
        def auto_close():
            time.sleep(120)  # 2 minutes
            if self.root and self.root.winfo_exists():
                self.root.after(0, self.close_popup)
        
        timer_thread = threading.Thread(target=auto_close, daemon=True)
        timer_thread.start()
    
    def show_qr_code(self):
        """Main method to show QR code popup"""
        print(f"📱 Generating QR code for: {self.mobile_url}")
        
        if self.create_qr_popup():
            try:
                self.root.mainloop()
            except KeyboardInterrupt:
                self.close_popup()
        else:
            print("❌ Failed to create QR code popup")

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import qrcode
        from PIL import Image, ImageTk
        return True
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("Installing required packages...")
        
        try:
            import subprocess
            import sys
            
            packages = ["qrcode[pil]", "pillow"]
            for package in packages:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            
            print("✅ Dependencies installed successfully")
            return True
            
        except Exception as install_error:
            print(f"❌ Failed to install dependencies: {install_error}")
            print("Please run: pip install qrcode[pil] pillow")
            return False

def main():
    """Main entry point"""
    print("📱 QR Code Generator for Mobile Dev Agent Interface")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        input("Press Enter to exit...")
        return
    
    # Create and show QR code
    qr_gen = QRCodeGenerator()
    
    print(f"🌐 Local IP detected: {qr_gen.local_ip}")
    print(f"📱 Mobile URL: {qr_gen.mobile_url}")
    print("🔄 Opening QR code popup...")
    
    qr_gen.show_qr_code()
    
    print("👋 QR code popup closed")

if __name__ == "__main__":
    main()