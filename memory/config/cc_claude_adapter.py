#!/usr/bin/env python3
"""
Claude Context Adapter - Bridge between Memory System and Claude AI
This adapter reads from all memory types and injects relevant context into Claude's responses
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import hashlib
import re

# Add memory root to path
MEMORY_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(MEMORY_ROOT))

class ClaudeContextAdapter:
    """
    Adapter that reads from memory system and prepares context for Claude
    """
    
    def __init__(self):
        self.memory_root = MEMORY_ROOT
        
        # Memory type paths
        self.memories = {
            'semantic': self.memory_root / 'f_semantic',
            'procedural': self.memory_root / 'e_procedural',
            'episodic': self.memory_root / 'g_episodic',
            'working': self.memory_root / 'd_working_memory' / 'active',
            'long_term': self.memory_root / 'b_long_term_memory',
            'short_term': self.memory_root / 'c_short_term_memory'
        }
        
        # Context cache
        self.context_cache = {}
        self.cache_ttl = 300  # 5 minutes
        
        # Load current project context
        self.project_context = self.load_project_context()
        
    def load_project_context(self) -> Dict:
        """Load the current project context from CLAUDE.md"""
        claude_md = self.memory_root / 'CLAUDE.md'
        if claude_md.exists():
            content = claude_md.read_text(encoding='utf-8')
            return {
                'project': 'Grand Prix Social',
                'status': 'Pre-launch development',
                'tech_stack': 'Next.js, TypeScript, Supabase, Tailwind CSS v4',
                'priority': 'MVP for user signups'
            }
        return {}
    
    def get_relevant_context(self, query: str, conversation_history: List[str] = None) -> Dict:
        """
        Get relevant context based on the current query and conversation
        """
        context = {
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'project': self.project_context,
            'semantic_knowledge': [],
            'procedural_knowledge': [],
            'episodic_memories': [],
            'working_memory': [],
            'recent_sessions': [],
            'relevant_files': []
        }
        
        # Extract keywords from query
        keywords = self.extract_keywords(query)
        
        # Search each memory type
        context['semantic_knowledge'] = self.search_semantic_memory(keywords)
        context['procedural_knowledge'] = self.search_procedural_memory(keywords)
        context['episodic_memories'] = self.search_episodic_memory(keywords, conversation_history)
        context['working_memory'] = self.get_active_working_memory()
        context['recent_sessions'] = self.get_recent_sessions()
        
        # Get relevant files based on query
        if any(term in query.lower() for term in ['file', 'code', 'component', 'function']):
            context['relevant_files'] = self.find_relevant_files(keywords)
        
        return context
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        # Common F1 and development terms
        important_terms = {
            'f1', 'racing', 'grand prix', 'driver', 'team',
            'auth', 'authentication', 'login', 'signup', 'user',
            'react', 'nextjs', 'typescript', 'supabase', 'tailwind',
            'memory', 'agent', 'context', 'semantic', 'episodic'
        }
        
        words = re.findall(r'\b\w+\b', text.lower())
        keywords = [w for w in words if w in important_terms or len(w) > 4]
        
        return list(set(keywords))
    
    def search_semantic_memory(self, keywords: List[str]) -> List[Dict]:
        """Search semantic memory for F1 and domain knowledge"""
        results = []
        semantic_dir = self.memories['semantic']
        
        # Search knowledge files
        knowledge_dir = semantic_dir / 'knowledge'
        if knowledge_dir.exists():
            for file_path in knowledge_dir.glob('*.md'):
                content = file_path.read_text(encoding='utf-8')
                relevance = self.calculate_relevance(content, keywords)
                if relevance > 0.3:
                    results.append({
                        'source': f'semantic/{file_path.name}',
                        'relevance': relevance,
                        'content': self.extract_summary(content),
                        'full_path': str(file_path)
                    })
        
        # Add F1-specific knowledge
        if any(k in ['f1', 'racing', 'grand', 'prix'] for k in keywords):
            results.append({
                'source': 'semantic/f1_knowledge',
                'relevance': 0.9,
                'content': 'F1 racing context: Building Grand Prix Social platform for F1 fans',
                'knowledge_type': 'domain'
            })
        
        return sorted(results, key=lambda x: x['relevance'], reverse=True)[:3]
    
    def search_procedural_memory(self, keywords: List[str]) -> List[Dict]:
        """Search procedural memory for how-to knowledge"""
        results = []
        procedural_dir = self.memories['procedural']
        
        # Search protocol files
        for file_path in procedural_dir.glob('*.md'):
            if file_path.name == '_placeholder.md':
                continue
            content = file_path.read_text(encoding='utf-8')
            relevance = self.calculate_relevance(content, keywords)
            if relevance > 0.3:
                results.append({
                    'source': f'procedural/{file_path.name}',
                    'relevance': relevance,
                    'procedure': self.extract_procedures(content),
                    'full_path': str(file_path)
                })
        
        return sorted(results, key=lambda x: x['relevance'], reverse=True)[:2]
    
    def search_episodic_memory(self, keywords: List[str], conversation_history: List[str] = None) -> List[Dict]:
        """Search episodic memory for past interactions"""
        results = []
        episodic_dir = self.memories['episodic']
        
        # Search session files
        sessions_dir = episodic_dir / 'sessions'
        if sessions_dir.exists():
            for file_path in sessions_dir.glob('*.md'):
                content = file_path.read_text(encoding='utf-8')
                relevance = self.calculate_relevance(content, keywords)
                if relevance > 0.2:
                    results.append({
                        'source': f'episodic/{file_path.name}',
                        'relevance': relevance,
                        'episode': self.extract_summary(content),
                        'timestamp': self.extract_timestamp(file_path.name)
                    })
        
        # Add recent conversation context
        if conversation_history:
            results.append({
                'source': 'episodic/current_conversation',
                'relevance': 1.0,
                'episode': 'Current conversation context',
                'history': conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
            })
        
        return sorted(results, key=lambda x: x['relevance'], reverse=True)[:3]
    
    def get_active_working_memory(self) -> List[Dict]:
        """Get current active working memory"""
        results = []
        working_dir = self.memories['working']
        
        # Get recent files (modified in last 24 hours)
        cutoff_time = datetime.now() - timedelta(days=1)
        
        for file_path in working_dir.glob('*.md'):
            if file_path.stat().st_mtime > cutoff_time.timestamp():
                content = file_path.read_text(encoding='utf-8')
                results.append({
                    'file': file_path.name,
                    'summary': self.extract_summary(content, max_lines=3),
                    'modified': datetime.fromtimestamp(file_path.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
                })
        
        return results[:5]  # Return top 5 most recent
    
    def get_recent_sessions(self) -> List[Dict]:
        """Get recent session information"""
        results = []
        short_term = self.memories['short_term']
        
        # Look for recent session summaries
        summary_dir = short_term / 'summary'
        if summary_dir.exists() and (summary_dir / 'summary.md').exists():
            summary_content = (summary_dir / 'summary.md').read_text(encoding='utf-8')
            results.append({
                'type': 'session_summary',
                'content': self.extract_summary(summary_content, max_lines=5)
            })
        
        return results
    
    def find_relevant_files(self, keywords: List[str]) -> List[str]:
        """Find relevant code files based on keywords"""
        relevant_files = []
        
        # Check working memory for file references
        working_dir = self.memories['working']
        for file_path in working_dir.glob('*.md'):
            content = file_path.read_text(encoding='utf-8')
            # Look for file paths in content
            file_refs = re.findall(r'[/\\][\w\-/\\]+\.\w+', content)
            for ref in file_refs:
                if any(k in ref.lower() for k in keywords):
                    relevant_files.append(ref)
        
        return list(set(relevant_files))[:5]
    
    def calculate_relevance(self, content: str, keywords: List[str]) -> float:
        """Calculate relevance score based on keyword matches"""
        if not keywords:
            return 0.0
        
        content_lower = content.lower()
        matches = sum(1 for k in keywords if k in content_lower)
        
        # Boost for exact phrase matches
        for keyword in keywords:
            if f' {keyword} ' in content_lower:
                matches += 0.5
        
        return min(1.0, matches / len(keywords))
    
    def extract_summary(self, content: str, max_lines: int = 5) -> str:
        """Extract a summary from content"""
        lines = content.split('\n')
        non_empty_lines = [l.strip() for l in lines if l.strip() and not l.startswith('#')]
        return ' '.join(non_empty_lines[:max_lines])
    
    def extract_procedures(self, content: str) -> List[str]:
        """Extract procedure steps from content"""
        procedures = []
        lines = content.split('\n')
        
        for line in lines:
            # Look for numbered steps or bullet points
            if re.match(r'^\d+\.|\*|\-', line.strip()):
                procedures.append(line.strip())
        
        return procedures[:5]
    
    def extract_timestamp(self, filename: str) -> str:
        """Extract timestamp from filename"""
        # Pattern: MM-DD_HH-MMPM
        match = re.search(r'\d{2}-\d{2}_\d{2}-\d{2}[AP]M', filename)
        return match.group() if match else 'unknown'
    
    def inject_context(self, query: str) -> str:
        """
        Main method to inject context into a query for Claude
        Returns formatted context string
        """
        context = self.get_relevant_context(query)
        
        # Format context for injection
        context_parts = []
        
        # Add project context
        if context['project']:
            context_parts.append(f"Project: {context['project'].get('project', 'Unknown')}")
            context_parts.append(f"Status: {context['project'].get('status', 'Unknown')}")
        
        # Add semantic knowledge
        if context['semantic_knowledge']:
            context_parts.append("\nRelevant Knowledge:")
            for item in context['semantic_knowledge']:
                context_parts.append(f"- {item['content'][:100]}...")
        
        # Add procedural knowledge
        if context['procedural_knowledge']:
            context_parts.append("\nRelevant Procedures:")
            for item in context['procedural_knowledge']:
                if item['procedure']:
                    context_parts.append(f"- {item['procedure'][0]}")
        
        # Add working memory
        if context['working_memory']:
            context_parts.append("\nActive Working Memory:")
            for item in context['working_memory']:
                context_parts.append(f"- {item['file']}: {item['summary'][:50]}...")
        
        # Add episodic memories
        if context['episodic_memories']:
            context_parts.append("\nRelevant Past Context:")
            for item in context['episodic_memories']:
                context_parts.append(f"- {item['episode'][:100]}...")
        
        return '\n'.join(context_parts)
    
    def save_interaction(self, query: str, response: str, context_used: Dict):
        """Save the interaction to episodic memory"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Create episodic entry
        episodic_dir = self.memories['episodic'] / 'interactions'
        episodic_dir.mkdir(parents=True, exist_ok=True)
        
        interaction_file = episodic_dir / f'interaction_{timestamp}.json'
        interaction_data = {
            'timestamp': timestamp,
            'query': query,
            'response_summary': response[:200] if len(response) > 200 else response,
            'context_used': {
                'semantic_items': len(context_used.get('semantic_knowledge', [])),
                'procedural_items': len(context_used.get('procedural_knowledge', [])),
                'episodic_items': len(context_used.get('episodic_memories', [])),
                'working_memory_items': len(context_used.get('working_memory', []))
            },
            'keywords': self.extract_keywords(query)
        }
        
        interaction_file.write_text(json.dumps(interaction_data, indent=2))
        
        return str(interaction_file)

# Global adapter instance
_adapter = None

def get_adapter() -> ClaudeContextAdapter:
    """Get or create the global adapter instance"""
    global _adapter
    if _adapter is None:
        _adapter = ClaudeContextAdapter()
    return _adapter

def inject_context_for_claude(query: str) -> str:
    """
    Main entry point for Claude to get injected context
    This is what Claude Code will call before processing queries
    """
    adapter = get_adapter()
    return adapter.inject_context(query)

def save_claude_interaction(query: str, response: str, context: Dict = None):
    """Save Claude's interaction to memory"""
    adapter = get_adapter()
    if context is None:
        context = adapter.get_relevant_context(query)
    return adapter.save_interaction(query, response, context)

if __name__ == "__main__":
    # Test the adapter
    adapter = ClaudeContextAdapter()
    
    test_queries = [
        "How do I set up authentication?",
        "What's the current status of the F1 project?",
        "Show me the memory system architecture",
        "How do agents communicate?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 50)
        context = adapter.inject_context(query)
        print(context)
        print("-" * 50)