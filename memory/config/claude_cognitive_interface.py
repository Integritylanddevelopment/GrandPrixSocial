#!/usr/bin/env python3
"""
Claude Cognitive Interface - Direct connection to memory system
This is what Claude Code should call to get context injection
"""

import sys
from pathlib import Path

# Add memory root to path
MEMORY_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(MEMORY_ROOT))
sys.path.insert(0, str(MEMORY_ROOT / 'a_memory_core' / 'memory_context_router_agent'))

def get_context_for_claude(user_query: str) -> str:
    """
    Main function for Claude to get relevant context
    Returns formatted context string for injection
    """
    try:
        from memory_context_router_agent import MemoryContextRouterAgent
        
        # Initialize router
        router = MemoryContextRouterAgent(str(MEMORY_ROOT))
        
        # Get context
        context = router.prepare_context_for_injection(user_query)
        
        # Format for Claude
        if context:
            return f"\n<context>\n{context}\n</context>\n"
        else:
            return ""
            
    except Exception as e:
        return f"\n<context_error>Failed to retrieve context: {e}</context_error>\n"

def save_interaction(user_query: str, claude_response: str):
    """Save Claude interaction to episodic memory"""
    try:
        from datetime import datetime
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        episodic_dir = MEMORY_ROOT / 'g_episodic' / 'interactions'
        episodic_dir.mkdir(parents=True, exist_ok=True)
        
        interaction_file = episodic_dir / f'claude_interaction_{timestamp}.md'
        content = f"""# Claude Interaction
*Timestamp: {timestamp}*

## User Query
{user_query}

## Claude Response Summary
{claude_response[:500]}{'...' if len(claude_response) > 500 else ''}

## Full Response Length
{len(claude_response)} characters
"""
        interaction_file.write_text(content)
        return str(interaction_file)
        
    except Exception as e:
        return f"Failed to save interaction: {e}"

# Example usage for Claude Code integration
if __name__ == "__main__":
    # Test the interface
    test_query = "What's the current status of the Grand Prix Social project?"
    context = get_context_for_claude(test_query)
    print("Context retrieved:")
    print(context)
