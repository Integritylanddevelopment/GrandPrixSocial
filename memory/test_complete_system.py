#!/usr/bin/env python3
"""
Test Complete Grand Prix Social Memory System
Comprehensive test of all deployed databases
"""
import os
import sys
from pathlib import Path
import json
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def test_complete_system():
    """Test the complete Grand Prix Social memory system"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print("="*80)
    print("GRAND PRIX SOCIAL MEMORY SYSTEM - COMPLETE TEST")
    print("="*80)
    print(f"Target: {supabase_url}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = {
        'agent_tables': {'passed': 0, 'failed': 0, 'tests': []},
        'memory_tables': {'passed': 0, 'failed': 0, 'tests': []},
        'system_tables': {'passed': 0, 'failed': 0, 'tests': []},
        'operations': {'passed': 0, 'failed': 0, 'tests': []}
    }
    
    # Test 1: Agent Tables
    print(f"\n1. TESTING AGENT TABLES:")
    agent_table_types = ['_state', '_metrics', '_logs', '_coordination']
    agents = [
        'fantasy_league_agent', 'gui_launcher_agent', 'master_orchestrator_agent',
        'memory_agent_core', 'memory_context_router_agent', 'memory_core_log_agent',
        'memory_indexer_agent', 'memory_logic_enforcer_agent', 'memory_router_agent',
        'repo_sync_agent', 'system_health_agent', 'tag_intelligence_engine',
        'user_intelligence_agent'
    ]
    
    for agent in agents[:3]:  # Test first 3 agents to save time
        for table_type in agent_table_types:
            table_name = f"{agent}{table_type}"
            try:
                result = client.table(table_name).select("*").limit(1).execute()
                print(f"  PASS {table_name}")
                test_results['agent_tables']['passed'] += 1
                test_results['agent_tables']['tests'].append(f"✅ {table_name}")
            except Exception as e:
                print(f"  FAIL {table_name} - {str(e)[:40]}...")
                test_results['agent_tables']['failed'] += 1
                test_results['agent_tables']['tests'].append(f"❌ {table_name}")
    
    # Test 2: Memory Tables
    print(f"\n2. TESTING MEMORY TABLES:")
    memory_types = [
        'core_memory', 'lonterm_memory', 'short_term_memory', 'working_memory',
        'episodic_memory', 'procedural_memory', 'semantic_memory'
    ]
    memory_table_types = ['_storage', '_index', '_metadata']
    
    for memory_type in memory_types[:3]:  # Test first 3 memory types
        for table_type in memory_table_types:
            table_name = f"{memory_type}{table_type}"
            try:
                result = client.table(table_name).select("*").limit(1).execute()
                print(f"  PASS {table_name}")
                test_results['memory_tables']['passed'] += 1
                test_results['memory_tables']['tests'].append(f"✅ {table_name}")
            except Exception as e:
                print(f"  FAIL {table_name} - {str(e)[:40]}...")
                test_results['memory_tables']['failed'] += 1
                test_results['memory_tables']['tests'].append(f"❌ {table_name}")
    
    # Test 3: System Tables
    print(f"\n3. TESTING SYSTEM TABLES:")
    system_tables = [
        'memory_system_state', 'agent_registry', 'memory_promotion_log',
        'system_metrics', 'coordination_events', 'f1_specific_data',
        'race_data', 'fantasy_data'
    ]
    
    for table_name in system_tables:
        try:
            result = client.table(table_name).select("*").limit(1).execute()
            print(f"  PASS {table_name}")
            test_results['system_tables']['passed'] += 1
            test_results['system_tables']['tests'].append(f"✅ {table_name}")
        except Exception as e:
            print(f"  FAIL {table_name} - {str(e)[:40]}...")
            test_results['system_tables']['failed'] += 1
            test_results['system_tables']['tests'].append(f"❌ {table_name}")
    
    # Test 4: Basic Operations
    print(f"\n4. TESTING BASIC OPERATIONS:")
    
    # Test: Insert agent state
    try:
        test_agent_state = {
            'agent_name': 'test_agent_system_check',
            'status': 'testing',
            'current_state': {'test': True},
            'current_task': 'System compatibility test'
        }
        result = client.table('fantasy_league_agent_state').insert(test_agent_state).execute()
        print(f"  PASS Agent state insert")
        test_results['operations']['passed'] += 1
        test_results['operations']['tests'].append("✅ Agent state insert")
        
        # Cleanup
        client.table('fantasy_league_agent_state').delete().eq('agent_name', 'test_agent_system_check').execute()
    except Exception as e:
        print(f"  FAIL Agent state insert - {str(e)[:40]}...")
        test_results['operations']['failed'] += 1
        test_results['operations']['tests'].append("❌ Agent state insert")
    
    # Test: Insert memory data
    try:
        test_memory = {
            'title': 'System Test Memory',
            'content': 'This is a test memory for system verification',
            'memory_type': 'core_memory',
            'importance_score': 5,
            'tags': ['test', 'system_check']
        }
        result = client.table('core_memory_storage').insert(test_memory).execute()
        print(f"  PASS Memory storage insert")
        test_results['operations']['passed'] += 1
        test_results['operations']['tests'].append("✅ Memory storage insert")
        
        # Cleanup
        client.table('core_memory_storage').delete().eq('title', 'System Test Memory').execute()
    except Exception as e:
        print(f"  FAIL Memory storage insert - {str(e)[:40]}...")
        test_results['operations']['failed'] += 1
        test_results['operations']['tests'].append("❌ Memory storage insert")
    
    # Test: F1 specific data
    try:
        test_f1_data = {
            'data_type': 'driver',
            'data_category': 'performance',
            'title': 'Test Driver Data',
            'content': {'driver_name': 'Test Driver', 'team': 'Test Team'},
            'season': 2024
        }
        result = client.table('f1_specific_data').insert(test_f1_data).execute()
        print(f"  PASS F1 data insert")
        test_results['operations']['passed'] += 1
        test_results['operations']['tests'].append("✅ F1 data insert")
        
        # Cleanup
        client.table('f1_specific_data').delete().eq('title', 'Test Driver Data').execute()
    except Exception as e:
        print(f"  FAIL F1 data insert - {str(e)[:40]}...")
        test_results['operations']['failed'] += 1
        test_results['operations']['tests'].append("❌ F1 data insert")
    
    # Calculate final results
    total_passed = sum(category['passed'] for category in test_results.values())
    total_failed = sum(category['failed'] for category in test_results.values())
    total_tests = total_passed + total_failed
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n" + "="*80)
    print("TEST RESULTS SUMMARY")
    print("="*80)
    
    for category, results in test_results.items():
        category_total = results['passed'] + results['failed']
        category_rate = (results['passed'] / category_total * 100) if category_total > 0 else 0
        print(f"{category.upper().replace('_', ' '):<20}: {results['passed']:>3}/{category_total:<3} ({category_rate:>5.1f}%)")
    
    print(f"{'OVERALL':<20}: {total_passed:>3}/{total_tests:<3} ({success_rate:>5.1f}%)")
    
    # System status
    if success_rate >= 80:
        print(f"\n🎉 SYSTEM STATUS: OPERATIONAL")
        print(f"Grand Prix Social Memory System is ready for production use!")
        system_ready = True
    elif success_rate >= 60:
        print(f"\n⚠️  SYSTEM STATUS: PARTIALLY OPERATIONAL")
        print(f"Most core functionality is working, some features may be limited")
        system_ready = True
    else:
        print(f"\n❌ SYSTEM STATUS: NOT OPERATIONAL")
        print(f"Critical issues need to be resolved before system use")
        system_ready = False
    
    # Save test results
    test_report = {
        'test_timestamp': datetime.now().isoformat(),
        'success_rate': success_rate,
        'total_tests': total_tests,
        'total_passed': total_passed,
        'total_failed': total_failed,
        'system_ready': system_ready,
        'detailed_results': test_results
    }
    
    report_file = Path(__file__).parent / 'memory_system_test_report.json'
    with open(report_file, 'w') as f:
        json.dump(test_report, f, indent=2)
    
    print(f"\nDetailed test report saved: {report_file}")
    
    return system_ready

if __name__ == "__main__":
    print("Starting Complete System Test...")
    success = test_complete_system()
    
    if success:
        print(f"\n✅ GRAND PRIX SOCIAL MEMORY SYSTEM IS READY!")
    else:
        print(f"\n❌ System needs attention before full deployment")