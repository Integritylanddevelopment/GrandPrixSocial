#!/usr/bin/env python3
"""
Claude Memory Bridge - Connects Claude to existing context injection engine
Uses the existing sophisticated context injection system
"""

import sys
from pathlib import Path
from datetime import datetime
import uuid

# Add memory paths
MEMORY_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(MEMORY_ROOT))
sys.path.insert(0, str(MEMORY_ROOT / 'd_working_memory' / 'context_injection'))

def get_context_for_claude(user_query: str) -> str:
    """
    Main function for Claude to get context using existing injection engine
    """
    try:
        # Import existing components
        from context_injection_engine import ContextInjectionEngine, ContextInjectionRequest
        
        # Initialize the existing context injection engine
        engine = ContextInjectionEngine()
        
        # Create a properly formatted request
        request = ContextInjectionRequest(
            request_id=f"claude_{uuid.uuid4().hex[:8]}",
            session_id="claude_session",
            query_context=user_query,
            target_thoughts=[user_query],
            injection_strategy="balanced",
            max_items=5,
            min_relevance=0.3,
            timestamp=datetime.now().strftime("%m-%d_%I-%M%p")
        )
        
        # Get context using the existing engine
        result = engine.inject_context(request)
        
        if result.success and result.injected_items:
            # Format context for Claude
            context_parts = []
            context_parts.append("## Relevant Context from Memory System")
            
            for item in result.injected_items:
                content = item.content
                source = item.source_type
                score = item.combined_score
                
                if isinstance(content, dict):
                    if 'text' in content:
                        text = content['text']
                    elif 'summary' in content:
                        text = content['summary'] 
                    else:
                        text = str(content)
                else:
                    text = str(content)
                
                context_parts.append(f"**{source.title()} Memory** (relevance: {score:.2f})")
                context_parts.append(text[:300] + "..." if len(text) > 300 else text)
                context_parts.append("")
            
            context_text = "\n".join(context_parts)
            
            # Log successful injection
            log_context_injection(user_query, len(context_text), len(result.injected_items))
            
            return f"\n<memory_context>\n{context_text}\n</memory_context>\n"
        
        else:
            # No context found or error
            return ""
            
    except Exception as e:
        # Fallback error handling
        return f"\n<memory_error>Context injection failed: {str(e)}</memory_error>\n"

def log_context_injection(query: str, context_length: int, items_count: int):
    """Log context injection for tracking"""
    try:
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p") 
        log_dir = MEMORY_ROOT / 'a_memory_core' / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / 'claude_context_injections.log'
        log_entry = f"[{timestamp}] Query: '{query[:60]}...' | Context: {context_length} chars | Items: {items_count}\n"
        
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    except:
        pass  # Don't fail on logging errors

def test_claude_bridge():
    """Test the Claude memory bridge"""
    print("Testing Claude Memory Bridge with existing context injection engine...")
    
    test_queries = [
        "What's the current authentication status?",
        "How do F1 racing features work?", 
        "What's the development workflow?",
        "Tell me about Grand Prix Social project",
        "How does the memory system work?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 50)
        
        context = get_context_for_claude(query)
        
        if context:
            print("Context retrieved:")
            print(context)
        else:
            print("No context found")
        
        print("-" * 50)

if __name__ == "__main__":
    test_claude_bridge()