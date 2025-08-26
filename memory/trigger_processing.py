#!/usr/bin/env python3
"""
Trigger memory processing for specific files
"""

import json
from datetime import datetime
from pathlib import Path

def add_to_orchestrator_inbox(message):
    """Add a message to the orchestrator inbox"""
    inbox_path = Path(__file__).parent / 'a_memory_core' / 'memory_orchestrator_agent' / 'orchestrator_inbox.json'
    
    # Load current inbox
    if inbox_path.exists():
        with open(inbox_path, 'r') as f:
            inbox = json.load(f)
    else:
        inbox = {'messages': []}
    
    # Add message
    inbox['messages'].append(message)
    
    # Save inbox
    with open(inbox_path, 'w') as f:
        json.dump(inbox, f, indent=2)
    
    print(f"Added message to orchestrator inbox: {message['type']}")

def main():
    # Create message for new content
    message = {
        'type': 'content_created',
        'timestamp': datetime.now().strftime("%m-%d_%I-%M%p"),
        'content': {
            'action': 'process_new_file',
            'file_path': 'd_working_memory/active/test_memory_promotion.md',
            'tags': ['test', 'f1_racing', 'development'],
            'priority': 'high'
        }
    }
    
    add_to_orchestrator_inbox(message)
    
    # Also trigger tagging
    tag_message = {
        'type': 'tagging_request',
        'timestamp': datetime.now().strftime("%m-%d_%I-%M%p"),
        'content': {
            'action': 'auto_tag',
            'file_path': 'd_working_memory/active/test_memory_promotion.md',
            'suggested_tags': ['f1_racing', 'user_auth', 'development']
        }
    }
    
    add_to_orchestrator_inbox(tag_message)
    
    print("\nMessages added to orchestrator inbox")
    print("The memory agents should process these within 5 seconds")

if __name__ == "__main__":
    main()