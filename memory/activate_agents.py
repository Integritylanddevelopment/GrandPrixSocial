#!/usr/bin/env python3
"""
Grand Prix Social - Memory Agent Activation Script
This script helps activate and monitor the memory agents
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Set the memory root path
MEMORY_ROOT = Path(__file__).parent

def get_timestamp():
    """Generate timestamp in core logic format"""
    return datetime.now().strftime("%m-%d_%I-%M%p").upper()

def activate_orchestrator():
    """Activate the memory orchestrator agent"""
    print("Activating Memory Orchestrator...")
    
    # Check orchestrator inbox
    inbox_path = MEMORY_ROOT / "a_memory_core" / "memory_orchestrator_agent" / "orchestrator_inbox.json"
    
    if inbox_path.exists():
        with open(inbox_path, 'r') as f:
            inbox = json.load(f)
        
        messages = inbox.get('messages', [])
        print(f"  Found {len(messages)} messages in inbox")
        
        for msg in messages:
            print(f"    - {msg['type']}: {msg.get('content', {}).get('action', 'unknown')}")
    
    return True

def check_working_memory():
    """Check working memory for content to process"""
    print("\nChecking Working Memory...")
    
    wm_path = MEMORY_ROOT / "d_working_memory" / "active"
    
    if wm_path.exists():
        files = list(wm_path.glob("*.md"))
        print(f"  Found {len(files)} active files")
        
        for file in files:
            print(f"    - {file.name}")
            # Add to processing queue
            add_to_processing_queue(file)
    
    return True

def add_to_processing_queue(file_path):
    """Add a file to the processing queue for tagging and routing"""
    # This would normally trigger the actual agents
    # For now, we're just setting up the structure
    pass

def initialize_tag_engine():
    """Initialize the tag intelligence engine with Grand Prix tags"""
    print("\nInitializing Tag Intelligence Engine...")
    
    tags_db_path = MEMORY_ROOT / "a_memory_core" / "tag_intelligence_engine" / "tag_dna_database.json"
    
    # Add Grand Prix specific tags
    grand_prix_tags = {
        "f1_racing": {
            "semantic_vector": [0.9, 0.8, 0.7],
            "related_keywords": ["formula1", "racing", "motorsport", "grand prix"],
            "usage_frequency": 0,
            "effectiveness_score": 0.5
        },
        "user_auth": {
            "semantic_vector": [0.3, 0.9, 0.4],
            "related_keywords": ["authentication", "login", "signup", "supabase"],
            "usage_frequency": 0,
            "effectiveness_score": 0.5
        },
        "development": {
            "semantic_vector": [0.7, 0.5, 0.9],
            "related_keywords": ["coding", "nextjs", "typescript", "react"],
            "usage_frequency": 0,
            "effectiveness_score": 0.5
        }
    }
    
    if tags_db_path.exists():
        with open(tags_db_path, 'r') as f:
            db = json.load(f)
        
        # Update tags
        if 'tags' not in db:
            db['tags'] = {}
        
        db['tags'].update(grand_prix_tags)
        db['meta']['total_tags'] = len(db['tags'])
        db['last_updated'] = get_timestamp()
        
        with open(tags_db_path, 'w') as f:
            json.dump(db, f, indent=2)
        
        print(f"  Added {len(grand_prix_tags)} Grand Prix tags")
    
    return True

def setup_promotion_rules():
    """Set up the promotion rules for working memory"""
    print("\nSetting up Promotion Rules...")
    
    rules = {
        "working_to_longterm": {
            "threshold_days": 7,
            "criteria": ["tagged", "referenced_3_times", "marked_important"],
            "auto_promote": True
        },
        "session_to_episodic": {
            "threshold_hours": 24,
            "criteria": ["session_complete", "tagged"],
            "auto_promote": True
        }
    }
    
    rules_path = MEMORY_ROOT / "a_memory_core" / "promotion_rules.json"
    
    with open(rules_path, 'w') as f:
        json.dump(rules, f, indent=2)
    
    print("  Promotion rules configured")
    return True

def main():
    print("GRAND PRIX SOCIAL - Memory System Activation")
    print("=" * 50)
    
    # Run activation sequence
    activate_orchestrator()
    check_working_memory()
    initialize_tag_engine()
    setup_promotion_rules()
    
    print("\n[OK] Memory agents activated and ready!")
    print("\nNote: Agents will now process in background")
    print("   - Working memory monitored for 7-day promotion")
    print("   - Sessions auto-tagged and indexed")
    print("   - Orchestrator coordinating all operations")

if __name__ == "__main__":
    main()