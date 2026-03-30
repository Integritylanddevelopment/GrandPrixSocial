#!/usr/bin/env python3
"""Simple Memory Router Agent - Fixed Version"""
import os
import sys
import time
import logging
from datetime import datetime

class MemoryRouterAgent:
    """Simple memory router agent"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        
        self.running = True
        self.logger.info("Memory Router Agent initialized")
    
    def run(self):
        """Main agent loop"""
        self.logger.info("Starting Memory Router Agent")
        
        while self.running:
            try:
                # Simple routing cycle
                self.logger.debug("Running routing cycle")
                time.sleep(30)
                
            except KeyboardInterrupt:
                self.logger.info("Agent stopped by user")
                break
            except Exception as e:
                self.logger.error(f"Error in agent loop: {e}")
                time.sleep(5)
    
    def stop(self):
        """Stop the agent"""
        self.running = False
        self.logger.info("Memory Router Agent stopped")

if __name__ == "__main__":
    agent = MemoryRouterAgent()
    try:
        agent.run()
    except KeyboardInterrupt:
        agent.stop()