
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - specstory_copy - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('specstory_copy.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
from typing import Dict, List, Any, Optional
import logging

# Auto-generated performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper
#!/usr/bin/env python3
"""
SpecStory Copy Agent with Timestamp Conversion

Finds the .specstory/history folder and copies all .md files to long-term memory.
Automatically watches for new files, copies them, and converts timestamps to CommandCore standard.
"""

import os
import shutil
import time
import re
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

def find_specstory_history():
    """Find the .specstory/history folder by searching upward from script location."""
    current_path = Path(__file__).absolute()
    
    # Search upward from current script location
    for parent in current_path.parents:
        specstory_history = parent / ".specstory" / "history"
        if specstory_history.exists() and specstory_history.is_dir():
            return specstory_history
    
    return None

def convert_timestamp_to_commandcore(filename):
    """Convert SpecStory timestamp format to CommandCore standard format."""
    # SpecStory format: 2025-06-21_19-29-tell-me-if-it's-working-or-not.md
    # CommandCore format: 06-21_07-29PM-tell-me-if-it's-working-or-not.md
    
    # Match SpecStory timestamp pattern: YYYY-MM-DD_HH-MM-
    pattern = r'^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(.+)$'
    match = re.match(pattern, filename)
    
    if match:
        year, month, day, hour, minute, rest = match.groups()
        
        # Convert 24-hour to 12-hour format
        hour_int = int(hour)
        if hour_int == 0:
            hour_12 = "12"
            ampm = "AM"
        elif hour_int < 12:
            hour_12 = f"{hour_int:02d}"
            ampm = "AM"
        elif hour_int == 12:
            hour_12 = "12"
            ampm = "PM"
        else:
            hour_12 = f"{hour_int - 12:02d}"
            ampm = "PM"
        
        # Create CommandCore format: MM-DD_HH-MMAM/PM-rest
        commandcore_filename = f"{month}-{day}_{hour_12}-{minute}{ampm}-{rest}"
        return commandcore_filename
    
    # If no match, return original filename
    return filename

def copy_file(source_path, destination_dir):
    """Copy a single file to the destination directory with timestamp conversion."""
    # Convert filename to CommandCore standard
    original_name = source_path.name
    converted_name = convert_timestamp_to_commandcore(original_name)
    dest_path = destination_dir / converted_name
    
    # Only copy if file doesn't exist or source is newer
    if not dest_path.exists() or source_path.stat().st_mtime > dest_path.stat().st_mtime:
        shutil.copy2(source_path, dest_path)
        if original_name != converted_name:
            print(f"✅ Copied & converted: {original_name} → {converted_name}")
        else:
            print(f"✅ Copied: {converted_name}")
        return True
    return False

class SpecStoryWatcher(FileSystemEventHandler):
    """Watches for new .md files in SpecStory history and copies them."""
    
    def __init__(self, destination_dir):
        self.destination_dir = Path(destination_dir)
        
    def on_created(self, event):
        """Handle new file creation."""
        if not event.is_directory and event.src_path.endswith('.md'):
            source_path = Path(event.src_path)
            if copy_file(source_path, self.destination_dir):
                print(f"🔄 Auto-copied new file: {source_path.name}")
    
    def on_modified(self, event):
        """Handle file modifications."""
        if not event.is_directory and event.src_path.endswith('.md'):
            source_path = Path(event.src_path)
            if copy_file(source_path, self.destination_dir):
                print(f"🔄 Auto-copied modified file: {source_path.name}")

def copy_existing_files(source_dir, destination_dir):
    """Copy all existing .md files on startup."""
    copied_count = 0
    for file_path in source_dir.glob("*.md"):
        if copy_file(file_path, destination_dir):
            copied_count += 1
    return copied_count

def main():
    # Find source directory (.specstory/history)
    source_dir = find_specstory_history()
    if not source_dir:
        print("❌ Could not find .specstory/history folder")
        return
    
    # Set destination directory (long-term memory)
    script_location = Path(__file__).parent
    destination_dir = script_location.parent / "full_chat_logs"
    
    # Ensure destination exists
    destination_dir.mkdir(exist_ok=True)
    
    print(f"📁 Source: {source_dir}")
    print(f"📁 Destination: {destination_dir}")
    
    # Copy existing files first
    copied_count = copy_existing_files(source_dir, destination_dir)
    print(f"📂 Copied {copied_count} existing files")
    
    # Start watching for new files
    print(f"👁️ Starting file watcher on: {source_dir}")
    print("Press Ctrl+C to stop watching...")
    
    event_handler = SpecStoryWatcher(destination_dir)
    observer = Observer()
    observer.schedule(event_handler, str(source_dir), recursive=False)
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️ Stopping file watcher...")
        observer.stop()
    
    observer.join()
    print("✅ File watcher stopped")

if __name__ == "__main__":
    main()
