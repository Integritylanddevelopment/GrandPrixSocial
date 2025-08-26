
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

# Auto-generated comprehensive error handling
import traceback
import logging

def handle_error(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            logging.error(traceback.format_exc())
            return None
    return wrapper
#!/usr/bin/env python3
"""
merge_logs.py

Searches for duplicate or overlapping logs in /memory/ and /logs/.
Merges them to ensure a clean, non-redundant set of files.

Strategy:
  1. Compute a hash of each file's content.
  2. If two files share the same hash, they are duplicates.
  3. Merge them by appending unique lines from the second into the first, 
     or skip merging if they are byte-for-byte duplicates.
  4. (Optional) remove the duplicate file or rename it.

Note: This simple script merges exact duplicates only (exact same content).
      For partial or content-based merges, you'd need more advanced logic.
"""

import os
import hashlib
import shutil
import json
from datetime import datetime

MEMORY_DIR = os.path.join("..", "memory")
LOGS_DIR = os.path.join("..", "logs")

def file_md5(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest(), buf.decode('utf-8', errors='replace')

def merge_file_contents(original, new_content):
    """
    If the original doesn't contain new_content lines, append them.
    This ensures we preserve all unique lines.
    """
    original_lines = original.splitlines()
    new_lines = new_content.splitlines()
    merged = list(original_lines)  # copy

    # Only append lines that are not already in the original
    for line in new_lines:
        if line not in original_lines:
            merged.append(line)
    return "\n".join(merged)

# Helper function to get file content
def read_file_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        return file.read()

# Helper function to write merged log
def write_merged_log(folder_path, merged_content):
    merged_log_path = os.path.join(folder_path, "merged_log.md")
    if not os.path.exists(merged_log_path):
        print(f"[INFO] Creating merged_log.md at {merged_log_path}")
    with open(merged_log_path, 'w', encoding='utf-8') as merged_file:
        merged_file.write(merged_content)

# Helper function to write merge source tracker
def write_merge_source_tracker(folder_path, merge_sources):
    merged_json_path = os.path.join(folder_path, "merged_log.json")
    if not os.path.exists(merged_json_path):
        print(f"[INFO] Creating merged_log.json at {merged_json_path}")
    with open(merged_json_path, 'w', encoding='utf-8') as merged_json_file:
        json.dump(merge_sources, merged_json_file, indent=4)

# Helper function to write deduplication index
def write_dedup_index(folder_path, removed_files):
    dedup_index_path = os.path.join(folder_path, "dedup_index.json")
    if not os.path.exists(dedup_index_path):
        print(f"[INFO] Creating dedup_index.json at {dedup_index_path}")
    with open(dedup_index_path, 'w', encoding='utf-8') as dedup_file:
        json.dump({"removed": removed_files}, dedup_file, indent=4)

# Helper function to update manifest
def update_manifest(folder_path, merged_count):
    manifest_path = os.path.join(folder_path, "manifest.json")
    if not os.path.exists(manifest_path):
        print(f"[INFO] Creating manifest.json at {manifest_path}")
    last_updated = datetime.now().strftime("%m/%d - %I:%M%p")
    manifest = {
        "folder": "merged",
        "last_updated": last_updated,
        "merged_entries": merged_count,
        "log_files": ["merged_log.md", "merged_log.json", "dedup_index.json"],
        "formats": ["md", "json"]
    }
    with open(manifest_path, 'w', encoding='utf-8') as manifest_file:
        json.dump(manifest, manifest_file, indent=4)

# Main function to process folder
def process_folder(folder_path):
    files = [f for f in os.listdir(folder_path) if f.endswith(('.md', '.txt', '.json'))]
    merged_content = []
    removed_files = []
    merge_sources = []
    seen_content = set()

    for filename in files:
        filepath = os.path.join(folder_path, filename)
        content = read_file_content(filepath)
        if content in seen_content:
            removed_files.append(filename)
            os.remove(filepath)
        else:
            seen_content.add(content)
            merged_content.append(f"# {filename}\n{content}\n")
            merge_sources.append({"file": filename, "timestamp": datetime.now().strftime("%m/%d - %I:%M%p")})

    # Write outputs
    write_merged_log(folder_path, "\n".join(merged_content))
    write_merge_source_tracker(folder_path, merge_sources)
    write_dedup_index(folder_path, removed_files)
    update_manifest(folder_path, len(merged_content))

def main():
    total_merged = 0
    # Merge in memory folder
    merged = process_folder(MEMORY_DIR)
    total_merged += merged

    # Merge in logs folder
    merged = process_folder(LOGS_DIR)
    total_merged += merged

    if total_merged == 0:
        print("[OK] No duplicates found or no merges were performed.")
    else:
        print(f"[DONE] Total merges or deletions: {total_merged}")

if __name__ == "__main__":
    main()
