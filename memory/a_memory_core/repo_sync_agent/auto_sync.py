#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from memory_integration import GrandPrixSyncAgent
import json

def main():
    agent = GrandPrixSyncAgent()
    result = agent.auto_sync_with_memory()
    print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()
