
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - merge_markdowns - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('merge_markdowns.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
from typing import Dict, List, Any, Optional

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
import os

def merge_markdowns(folder_path, output_file):
    """
    Merge all markdown files in the folder into a single markdown file.
    Each file's content is preceded by its filename as a heading.

    Args:
        folder_path (str): Path to the folder containing markdown files.
        output_file (str): Path to the output markdown file.
    """
    with open(output_file, 'w', encoding='utf-8') as summary_file:
        for filename in os.listdir(folder_path):
            if filename.endswith('.md') and filename != os.path.basename(output_file):
                file_path = os.path.join(folder_path, filename)
                with open(file_path, 'r', encoding='utf-8') as md_file:
                    content = md_file.read()
                    summary_file.write(f"# {filename}\n\n")
                    summary_file.write(content)
                    summary_file.write("\n\n")

if __name__ == "__main__":
    folder_path = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(folder_path, "summary.md")
    merge_markdowns(folder_path, output_file)
