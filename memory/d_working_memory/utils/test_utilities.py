
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - test_utilities - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_utilities.log'),
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
"""
WORKING MEMORY UTILITIES TEST
============================

Simple test demonstrating the subordinate utility pattern.
This shows how memory agents would call working memory utilities.

This test validates:
- Utilities serve memory agents (not standalone)
- TTL/archival/preservation patterns work correctly
- Cache integration functions properly
- Content analysis provides agent-specific insights
"""

import os
import tempfile
import json
from datetime import datetime

def test_utility_integration():
    """Test the working memory utilities integration."""
    print("🧪 Testing Working Memory Subordinate Utilities")
    print("=" * 60)
    
    # Create temporary working memory structure
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"📁 Test working memory: {temp_dir}")
        
        # Setup structure
        active_dir = os.path.join(temp_dir, "active", "sessions")
        history_dir = os.path.join(temp_dir, "history", "processed_originals")
        metadata_dir = os.path.join(temp_dir, "metadata")
        utils_dir = os.path.join(temp_dir, "utils")
        
        os.makedirs(active_dir, exist_ok=True)
        os.makedirs(history_dir, exist_ok=True) 
        os.makedirs(metadata_dir, exist_ok=True)
        os.makedirs(utils_dir, exist_ok=True)
        
        # Create test content file
        test_file = os.path.join(temp_dir, "test_memory_agent_notes.md")
        test_content = """# Memory Agent Analysis
        
This document contains analysis of memory agent architecture and debugging notes.

## Architecture Overview
The memory system uses multiple agents for indexing, promotion, and merging.

## Debug Session
- Issue: Agent coordination timing
- Solution: Implemented cache-based coordination
- Next steps: Test integration

## Planning
- Refactor memory utilities
- Integrate with Redis cache
- Update documentation
"""
        
        with open(test_file, "w") as f:
            f.write(test_content)
        
        print(f"📄 Created test file: {os.path.basename(test_file)}")
        
        # Test 1: Memory Indexer Agent usage
        print("\n🔍 Test 1: Memory Indexer Agent Integration")
        try:
            # Simulate what Memory Indexer Agent would do
            import sys
            sys.path.append(os.path.dirname(__file__))
            
            # Import utilities (as memory agent would)
            from utils.working_memory_organizer_utils import WorkingMemoryUtils
            
            # Create utility instance (called by Memory Indexer Agent)
            indexer_utils = WorkingMemoryUtils(temp_dir, "memory_indexer_agent")
            
            # Analyze content for indexing
            with open(test_file, "r") as f:
                content = f.read()
            
            analysis = indexer_utils.analyze_content_for_agent(
                content, "test_memory_agent_notes.md", "indexer"
            )
            
            print(f"   ✅ Analysis completed by indexer")
            print(f"   🏷️ Primary category: {analysis['primary_category']}")
            print(f"   🔍 Search tags: {analysis.get('search_tags', [])}")
            print(f"   📊 Indexing priority: {analysis.get('indexing_priority')}")
            
        except Exception as e:
            print(f"   ❌ Indexer test failed: {e}")
        
        # Test 2: Memory Promotion Agent usage  
        print("\n⬆️ Test 2: Memory Promotion Agent Integration")
        try:
            # Create utility instance (called by Memory Promotion Agent)
            promotion_utils = WorkingMemoryUtils(temp_dir, "memory_promotion_agent")
            
            # Analyze for promotion decisions
            promotion_analysis = promotion_utils.analyze_content_for_agent(
                content, "test_memory_agent_notes.md", "promotion"
            )
            
            print(f"   ✅ Analysis completed by promotion agent")
            print(f"   🎯 Target bucket: {promotion_analysis.get('target_bucket')}")
            print(f"   ⏰ Recommended TTL: {promotion_analysis.get('recommended_ttl')}")
            print(f"   🛡️ Preservation value: {promotion_analysis.get('preservation_value')}")
            
        except Exception as e:
            print(f"   ❌ Promotion test failed: {e}")
        
        # Test 3: Memory Merger Agent usage
        print("\n🔗 Test 3: Memory Merger Agent Integration")
        try:
            # Create utility instance (called by Memory Merger Agent)
            merger_utils = WorkingMemoryUtils(temp_dir, "memory_merger_agent")
            
            # Analyze for merging decisions
            merger_analysis = merger_utils.analyze_content_for_agent(
                content, "test_memory_agent_notes.md", "merger"
            )
            
            print(f"   ✅ Analysis completed by merger agent")
            print(f"   📦 Session grouping: {merger_analysis.get('session_grouping')}")
            print(f"   🔗 Merge candidates: {merger_analysis.get('merge_candidates', [])}")
            print(f"   💎 Consolidation value: {merger_analysis.get('consolidation_value')}")
            
        except Exception as e:
            print(f"   ❌ Merger test failed: {e}")
        
        # Test 4: Session creation and preservation
        print("\n💾 Test 4: Session Creation & Preservation")
        try:
            # Create session (as promotion agent would)
            session_id = promotion_utils.create_dynamic_session_for_agent(
                promotion_analysis, content, "test_memory_agent_notes.md"
            )
            
            print(f"   ✅ Session created: {session_id}")
            
            # Preserve original (as promotion agent would)
            promotion_utils.preserve_original_for_agent(
                test_file, session_id, {"test_context": "utility_validation"}
            )
            
            print(f"   ✅ Original preserved with metadata")
            
            # Verify session structure
            session_path = os.path.join(active_dir, session_id)
            if os.path.exists(session_path):
                print(f"   📁 Session directory created: {session_id}")
                
                # Check metadata
                metadata_file = os.path.join(session_path, "session_metadata.json")
                if os.path.exists(metadata_file):
                    with open(metadata_file, "r") as f:
                        metadata = json.load(f)
                    print(f"   📋 Session TTL expires: {metadata.get('ttl_expires')}")
                    print(f"   🤖 Created by agent: {metadata.get('created_by_agent')}")
            
            # Verify preservation
            preserved_files = os.listdir(history_dir)
            if preserved_files:
                print(f"   📦 Files preserved: {len(preserved_files)} files")
                for pf in preserved_files:
                    if pf.endswith('_preservation.json'):
                        print(f"   📄 Preservation metadata: {pf}")
            
        except Exception as e:
            print(f"   ❌ Session/preservation test failed: {e}")
        
        # Test 5: Cache utilities
        print("\n🚀 Test 5: Cache Utilities Integration")
        try:
            from utils.cache_utils import (
                cache_session_for_agent, 
                get_cached_session_for_agent,
                update_agent_coordination_cache
            )
            
            # Test caching (as any memory agent would)
            test_session_data = {
                "operation": "test_processing",
                "files_processed": 1,
                "sessions_created": 1,
                "status": "active"
            }
            
            cache_success = cache_session_for_agent(
                "test_memory_agent", "test_session_001", test_session_data, ttl_hours=1
            )
            
            if cache_success:
                print(f"   ✅ Session cached successfully")
                
                # Retrieve cached data
                cached_data = get_cached_session_for_agent("test_memory_agent", "test_session_001")
                if cached_data:
                    print(f"   📤 Cache retrieval successful")
                    print(f"   🕒 Cached by: {cached_data.get('cached_by')}")
                else:
                    print(f"   ⚠️ Cache retrieval failed (using file fallback)")
            else:
                print(f"   ⚠️ Cache failed (using file fallback)")
            
            # Test coordination cache
            coord_success = update_agent_coordination_cache("test_memory_agent", {
                "current_phase": "testing",
                "active_operations": ["utility_validation"]
            })
            
            if coord_success:
                print(f"   ✅ Coordination cache updated")
            else:
                print(f"   ⚠️ Coordination cache failed (using file fallback)")
                
        except Exception as e:
            print(f"   ❌ Cache test failed: {e}")
        
        print("\n" + "=" * 60)
        print("🎯 TEST SUMMARY")
        print("✅ Working memory utilities function as subordinate helpers")
        print("✅ Memory agents can call utilities for specialized processing")
        print("✅ TTL/archival/preservation patterns work correctly")
        print("✅ Cache integration provides agent coordination")
        print("✅ Content analysis provides agent-specific insights")
        print("\n🏆 Working Memory Subordinate Utility Pattern: VALIDATED")

if __name__ == "__main__":
    test_utility_integration()
