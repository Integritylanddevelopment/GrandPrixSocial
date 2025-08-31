#!/usr/bin/env python3
"""
Claude Memory Database Interface
Handles all database operations for Claude's memory system using Supabase

This module provides high-level interfaces for:
- Storing and retrieving memories across all memory types
- Semantic search and querying
- Memory promotion and archival
- Agent coordination and state management
"""

import os
import sys
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

# Add the project root to path for imports
project_root = Path(__file__).parent.parent.parent.parent
sys.path.append(str(project_root))

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Install with: pip install supabase python-dotenv")
    sys.exit(1)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

@dataclass
class MemoryEntry:
    """Base memory entry structure"""
    content: str
    tags: List[str] = None
    metadata: Dict[str, Any] = None
    importance_score: int = 5
    agent_source: str = "system"
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.metadata is None:
            self.metadata = {}

@dataclass 
class LongTermMemory(MemoryEntry):
    """Long-term memory entry"""
    title: str = ""
    content_type: str = "markdown"
    source_file: str = None

@dataclass
class ShortTermMemory(MemoryEntry):
    """Short-term memory entry"""
    session_id: str = ""
    conversation_turn: int = 0
    role: str = "assistant"
    context_window_position: int = None
    tokens_used: int = None
    model_used: str = None
    request_id: str = None
    expires_at: datetime = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.expires_at is None:
            self.expires_at = datetime.now() + timedelta(days=7)

@dataclass
class WorkingMemory(MemoryEntry):
    """Working memory entry"""
    task_id: str = ""
    task_title: str = ""
    task_description: str = ""
    status: str = "active"
    priority: int = 5
    progress_percentage: int = 0
    context_data: Dict[str, Any] = None
    related_files: List[str] = None
    dependencies: List[str] = None
    notes: str = ""
    due_date: datetime = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.context_data is None:
            self.context_data = {}
        if self.related_files is None:
            self.related_files = []
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class ProceduralMemory(MemoryEntry):
    """Procedural memory entry"""
    procedure_name: str = ""
    category: str = ""
    description: str = ""
    steps: List[Dict[str, Any]] = None
    prerequisites: List[str] = None
    expected_outcomes: List[str] = None
    difficulty_level: int = 3
    success_rate: float = 1.0
    usage_count: int = 0
    last_used: datetime = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.steps is None:
            self.steps = []
        if self.prerequisites is None:
            self.prerequisites = []
        if self.expected_outcomes is None:
            self.expected_outcomes = []

@dataclass
class SemanticMemory(MemoryEntry):
    """Semantic memory entry"""
    concept_name: str = ""
    concept_type: str = ""
    definition: str = ""
    category: str = ""
    subcategory: str = ""
    confidence_score: float = 0.80
    source_reliability: int = 7
    related_concepts: List[str] = None
    evidence: Dict[str, Any] = None
    contradictions: List[str] = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.related_concepts is None:
            self.related_concepts = []
        if self.evidence is None:
            self.evidence = {}
        if self.contradictions is None:
            self.contradictions = []

@dataclass
class EpisodicMemory(MemoryEntry):
    """Episodic memory entry"""
    episode_id: str = ""
    episode_title: str = ""
    episode_type: str = "conversation"
    context_summary: str = ""
    key_insights: List[str] = None
    emotional_tone: str = ""
    outcome: str = ""
    lessons_learned: List[str] = None
    participants: List[str] = None
    duration_minutes: int = None
    recall_count: int = 0
    full_transcript: Dict[str, Any] = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.key_insights is None:
            self.key_insights = []
        if self.lessons_learned is None:
            self.lessons_learned = []
        if self.participants is None:
            self.participants = []
        if self.full_transcript is None:
            self.full_transcript = {}

class ClaudeMemoryDB:
    """Main database interface for Claude's memory system"""
    
    def __init__(self):
        """Initialize database connection"""
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials. Check your .env.local file.")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.tables = {
            'long_term': 'claude_long_term_memory',
            'short_term': 'claude_short_term_memory', 
            'working': 'claude_working_memory',
            'procedural': 'claude_procedural_memory',
            'semantic': 'claude_semantic_memory',
            'episodic': 'claude_episodic_memory',
            'tags': 'claude_memory_tags',
            'relationships': 'claude_memory_relationships',
            'embeddings': 'claude_memory_embeddings',
            'agent_state': 'claude_agent_state'
        }
        
        logger.info(f"🧠 Claude Memory DB initialized with Supabase at {self.supabase_url}")

    # =====================================================================
    # CORE MEMORY OPERATIONS
    # =====================================================================
    
    async def store_long_term_memory(self, memory: LongTermMemory) -> str:
        """Store a long-term memory entry"""
        try:
            data = asdict(memory)
            result = self.client.table(self.tables['long_term']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"📝 Stored long-term memory: {memory.title} (ID: {memory_id})")
                await self._update_tag_usage(memory.tags)
                return memory_id
            else:
                raise Exception(f"Failed to store long-term memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing long-term memory: {e}")
            return None

    async def store_short_term_memory(self, memory: ShortTermMemory) -> str:
        """Store a short-term memory entry"""
        try:
            data = asdict(memory)
            # Convert datetime to ISO string for Supabase
            if memory.expires_at:
                data['expires_at'] = memory.expires_at.isoformat()
            
            result = self.client.table(self.tables['short_term']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"💭 Stored short-term memory: {memory.session_id} turn {memory.conversation_turn}")
                return memory_id
            else:
                raise Exception(f"Failed to store short-term memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing short-term memory: {e}")
            return None

    async def store_working_memory(self, memory: WorkingMemory) -> str:
        """Store a working memory entry"""
        try:
            data = asdict(memory)
            # Convert datetime to ISO string if present
            if memory.due_date:
                data['due_date'] = memory.due_date.isoformat()
            
            result = self.client.table(self.tables['working']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"🎯 Stored working memory: {memory.task_title} (ID: {memory_id})")
                await self._update_tag_usage(memory.tags)
                return memory_id
            else:
                raise Exception(f"Failed to store working memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing working memory: {e}")
            return None

    async def store_procedural_memory(self, memory: ProceduralMemory) -> str:
        """Store a procedural memory entry"""
        try:
            data = asdict(memory)
            # Convert datetime to ISO string if present
            if memory.last_used:
                data['last_used'] = memory.last_used.isoformat()
            
            result = self.client.table(self.tables['procedural']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"📚 Stored procedural memory: {memory.procedure_name} (ID: {memory_id})")
                await self._update_tag_usage(memory.tags)
                return memory_id
            else:
                raise Exception(f"Failed to store procedural memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing procedural memory: {e}")
            return None

    async def store_semantic_memory(self, memory: SemanticMemory) -> str:
        """Store a semantic memory entry"""
        try:
            data = asdict(memory)
            result = self.client.table(self.tables['semantic']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"🏷️ Stored semantic memory: {memory.concept_name} (ID: {memory_id})")
                await self._update_tag_usage(memory.tags)
                return memory_id
            else:
                raise Exception(f"Failed to store semantic memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing semantic memory: {e}")
            return None

    async def store_episodic_memory(self, memory: EpisodicMemory) -> str:
        """Store an episodic memory entry"""
        try:
            data = asdict(memory)
            result = self.client.table(self.tables['episodic']).insert(data).execute()
            
            if result.data:
                memory_id = result.data[0]['id']
                logger.info(f"🎬 Stored episodic memory: {memory.episode_title} (ID: {memory_id})")
                await self._update_tag_usage(memory.tags)
                return memory_id
            else:
                raise Exception(f"Failed to store episodic memory: {result}")
                
        except Exception as e:
            logger.error(f"Error storing episodic memory: {e}")
            return None

    # =====================================================================
    # MEMORY RETRIEVAL AND SEARCH
    # =====================================================================
    
    async def search_memories(self, 
                            query: str, 
                            memory_types: List[str] = None,
                            tags: List[str] = None,
                            limit: int = 10,
                            importance_threshold: int = 3) -> List[Dict[str, Any]]:
        """Search across all memory types with various filters"""
        
        if memory_types is None:
            memory_types = ['long_term', 'working', 'procedural', 'semantic', 'episodic']
        
        results = []
        
        for memory_type in memory_types:
            if memory_type not in self.tables:
                continue
            
            table_name = self.tables[memory_type]
            
            try:
                # Build query with text search
                query_builder = self.client.table(table_name).select("*")
                
                # Add text search
                if query:
                    query_builder = query_builder.text_search('content', query)
                
                # Add tag filter
                if tags:
                    query_builder = query_builder.contains('tags', tags)
                
                # Add importance filter
                query_builder = query_builder.gte('importance_score', importance_threshold)
                
                # Order by importance and limit
                query_builder = query_builder.order('importance_score', desc=True).limit(limit)
                
                result = query_builder.execute()
                
                if result.data:
                    for item in result.data:
                        item['memory_type'] = memory_type
                        results.append(item)
                        
            except Exception as e:
                logger.error(f"Error searching {memory_type} memories: {e}")
        
        # Sort combined results by importance
        results.sort(key=lambda x: x.get('importance_score', 0), reverse=True)
        
        return results[:limit]

    async def get_recent_memories(self, 
                                memory_type: str = 'short_term', 
                                hours: int = 24, 
                                limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent memories from specified timeframe"""
        
        if memory_type not in self.tables:
            return []
        
        since = datetime.now() - timedelta(hours=hours)
        
        try:
            result = self.client.table(self.tables[memory_type]).select("*") \
                .gte('created_at', since.isoformat()) \
                .order('created_at', desc=True) \
                .limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting recent {memory_type} memories: {e}")
            return []

    async def get_memory_by_id(self, memory_type: str, memory_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific memory by ID"""
        
        if memory_type not in self.tables:
            return None
        
        try:
            result = self.client.table(self.tables[memory_type]).select("*") \
                .eq('id', memory_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting {memory_type} memory {memory_id}: {e}")
            return None

    # =====================================================================
    # MEMORY MANAGEMENT AND MAINTENANCE
    # =====================================================================
    
    async def promote_memory(self, source_type: str, source_id: str, target_type: str, 
                           additional_metadata: Dict[str, Any] = None) -> str:
        """Promote a memory from one type to another (e.g., short-term to long-term)"""
        
        # Get source memory
        source_memory = await self.get_memory_by_id(source_type, source_id)
        if not source_memory:
            logger.error(f"Source memory not found: {source_type}/{source_id}")
            return None
        
        # Create target memory data
        target_data = {
            'content': source_memory['content'],
            'tags': source_memory['tags'],
            'importance_score': source_memory.get('importance_score', 5) + 1,  # Boost importance
            'metadata': {**source_memory.get('metadata', {}), **(additional_metadata or {})},
            'agent_source': f"promoted_from_{source_type}"
        }
        
        # Add type-specific fields
        if target_type == 'long_term':
            target_data.update({
                'title': source_memory.get('task_title') or source_memory.get('concept_name') or f"Promoted from {source_type}",
                'content_type': 'promoted',
                'source_file': f"{source_type}_{source_id}"
            })
        
        try:
            result = self.client.table(self.tables[target_type]).insert(target_data).execute()
            
            if result.data:
                new_id = result.data[0]['id']
                
                # Create relationship between source and target
                await self.create_memory_relationship(
                    source_type, source_id, target_type, new_id, 
                    'promoted_to', strength=1.0, notes=f"Promoted from {source_type} to {target_type}"
                )
                
                logger.info(f"📈 Promoted memory from {source_type} to {target_type}: {new_id}")
                return new_id
            
        except Exception as e:
            logger.error(f"Error promoting memory: {e}")
            return None

    async def cleanup_expired_memories(self) -> int:
        """Clean up expired short-term memories"""
        try:
            # Use the SQL function we created
            result = self.client.rpc('cleanup_expired_memories').execute()
            deleted_count = result.data or 0
            
            if deleted_count > 0:
                logger.info(f"🧹 Cleaned up {deleted_count} expired memories")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired memories: {e}")
            return 0

    async def update_memory_importance(self, memory_type: str, memory_id: str, 
                                     new_importance: int, reason: str = "") -> bool:
        """Update the importance score of a memory"""
        
        if memory_type not in self.tables:
            return False
        
        try:
            result = self.client.table(self.tables[memory_type]) \
                .update({
                    'importance_score': new_importance,
                    'metadata': {'importance_update_reason': reason, 'importance_updated_at': datetime.now().isoformat()}
                }) \
                .eq('id', memory_id).execute()
            
            if result.data:
                logger.info(f"📊 Updated importance of {memory_type}/{memory_id} to {new_importance}: {reason}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error updating memory importance: {e}")
            return False

    # =====================================================================
    # RELATIONSHIPS AND CONNECTIONS
    # =====================================================================
    
    async def create_memory_relationship(self, source_table: str, source_id: str,
                                       target_table: str, target_id: str,
                                       relationship_type: str, strength: float = 0.5,
                                       bidirectional: bool = False, notes: str = "") -> str:
        """Create a relationship between two memories"""
        
        try:
            data = {
                'source_table': source_table,
                'source_id': source_id,
                'target_table': target_table,
                'target_id': target_id,
                'relationship_type': relationship_type,
                'strength': strength,
                'bidirectional': bidirectional,
                'notes': notes,
                'created_by': 'claude_memory_system'
            }
            
            result = self.client.table(self.tables['relationships']).insert(data).execute()
            
            if result.data:
                relationship_id = result.data[0]['id']
                logger.info(f"🔗 Created relationship: {source_table}/{source_id} --{relationship_type}--> {target_table}/{target_id}")
                return relationship_id
            
        except Exception as e:
            logger.error(f"Error creating memory relationship: {e}")
            return None

    async def get_related_memories(self, memory_type: str, memory_id: str, 
                                 relationship_types: List[str] = None) -> List[Dict[str, Any]]:
        """Get memories related to a specific memory"""
        
        try:
            query_builder = self.client.table(self.tables['relationships']).select("*") \
                .or_(f"source_table.eq.{memory_type},target_table.eq.{memory_type}") \
                .or_(f"source_id.eq.{memory_id},target_id.eq.{memory_id}")
            
            if relationship_types:
                query_builder = query_builder.in_('relationship_type', relationship_types)
            
            result = query_builder.execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting related memories: {e}")
            return []

    # =====================================================================
    # AGENT COORDINATION
    # =====================================================================
    
    async def update_agent_state(self, agent_name: str, status: str = None, 
                               current_task: str = None, metrics: Dict[str, Any] = None) -> bool:
        """Update agent state for coordination"""
        
        updates = {
            'last_heartbeat': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        if status:
            updates['status'] = status
        if current_task:
            updates['current_task'] = current_task
        if metrics:
            updates['metrics'] = metrics
        
        try:
            result = self.client.table(self.tables['agent_state']) \
                .upsert(updates, on_conflict='agent_name') \
                .eq('agent_name', agent_name).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error updating agent state for {agent_name}: {e}")
            return False

    async def get_agent_states(self) -> List[Dict[str, Any]]:
        """Get current state of all agents"""
        
        try:
            result = self.client.table(self.tables['agent_state']).select("*") \
                .order('last_heartbeat', desc=True).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error getting agent states: {e}")
            return []

    # =====================================================================
    # UTILITY METHODS
    # =====================================================================
    
    async def _update_tag_usage(self, tags: List[str]):
        """Update usage count for tags"""
        if not tags:
            return
        
        for tag in tags:
            try:
                # Try to increment existing tag
                result = self.client.table(self.tables['tags']) \
                    .update({'usage_count': 'usage_count + 1'}) \
                    .eq('tag_name', tag).execute()
                
                # If tag doesn't exist, create it
                if not result.data:
                    self.client.table(self.tables['tags']).insert({
                        'tag_name': tag,
                        'category': 'auto-generated',
                        'usage_count': 1
                    }).execute()
                    
            except Exception as e:
                logger.warning(f"Could not update tag usage for '{tag}': {e}")

    async def get_memory_stats(self) -> Dict[str, Any]:
        """Get comprehensive memory system statistics"""
        
        stats = {
            'timestamp': datetime.now().isoformat(),
            'tables': {},
            'total_memories': 0,
            'agents': {}
        }
        
        # Count memories in each table
        for memory_type, table_name in self.tables.items():
            if memory_type in ['tags', 'relationships', 'embeddings', 'agent_state']:
                continue
            
            try:
                result = self.client.table(table_name).select("id", count="exact").execute()
                count = result.count or 0
                stats['tables'][memory_type] = count
                stats['total_memories'] += count
                
            except Exception as e:
                logger.error(f"Error getting count for {table_name}: {e}")
                stats['tables'][memory_type] = 0
        
        # Get agent states
        try:
            agents = await self.get_agent_states()
            for agent in agents:
                stats['agents'][agent['agent_name']] = {
                    'status': agent['status'],
                    'last_heartbeat': agent['last_heartbeat'],
                    'current_task': agent.get('current_task'),
                    'processed_items': agent.get('processed_items', 0)
                }
        except Exception as e:
            logger.error(f"Error getting agent stats: {e}")
        
        return stats

# =====================================================================
# CONVENIENCE FUNCTIONS
# =====================================================================

async def get_claude_memory() -> ClaudeMemoryDB:
    """Get a Claude memory database instance"""
    return ClaudeMemoryDB()

async def store_claude_context(content: str, title: str = "Claude Context", 
                             tags: List[str] = None, importance: int = 7) -> str:
    """Quick function to store Claude context as long-term memory"""
    
    if tags is None:
        tags = ['claude-context', 'important']
    
    memory_db = await get_claude_memory()
    memory = LongTermMemory(
        title=title,
        content=content,
        tags=tags,
        importance_score=importance,
        content_type="claude-context",
        agent_source="claude_context_store"
    )
    
    return await memory_db.store_long_term_memory(memory)

# =====================================================================
# MAIN EXECUTION FOR TESTING
# =====================================================================

async def main():
    """Test the Claude memory database"""
    
    memory_db = ClaudeMemoryDB()
    
    # Test storing a long-term memory
    test_memory = LongTermMemory(
        title="Test Memory Entry",
        content="This is a test of the Claude memory system database integration.",
        tags=["test", "database", "claude-context"],
        importance_score=6,
        agent_source="test_script"
    )
    
    memory_id = await memory_db.store_long_term_memory(test_memory)
    print(f"✅ Stored test memory with ID: {memory_id}")
    
    # Test searching memories
    results = await memory_db.search_memories("test", limit=5)
    print(f"🔍 Found {len(results)} memories matching 'test'")
    
    # Get system stats
    stats = await memory_db.get_memory_stats()
    print(f"📊 Memory system stats: {stats}")

if __name__ == "__main__":
    asyncio.run(main())