# 🧠 MEMORY INDEXING AGENTS INVENTORY - SUPABASE INTEGRATION

*All indexing agents understand they will be creating indexes in Supabase database*

## 🏷️ SEMANTIC & TAGGING AGENTS

### 1. **Tag Intelligence Engine Agent**
- **Location**: `memory/a_memory_core/tag_intelligence_engine/tag_intelligence_engine.py`
- **Purpose**: AI-powered semantic tagging with machine learning
- **Supabase Tables**: `semantic_tags`, `tag_relationships`, `tag_dna_fingerprints`
- **Capabilities**:
  - DNA fingerprinting of content
  - Tag relationship mapping
  - Continuous learning optimization
  - Vector similarity calculations

### 2. **Memory Indexer Agent** 
- **Location**: `memory/a_memory_core/memory_indexer_agent/memory_indexer_agent.py`
- **Purpose**: Full-text search indexing across all memory buckets
- **Supabase Tables**: `memory_index`, `search_terms`, `content_vectors`
- **Capabilities**:
  - AI-powered full-text search
  - Cross-memory bucket indexing
  - Semantic search integration
  - Performance monitoring

### 3. **Semantic Tagging System** (NEW - F1 Focus)
- **Location**: `lib/semantic-tagging/semantic-tagging-system.ts`
- **Purpose**: F1-specific semantic analysis and entity recognition
- **Supabase Tables**: `f1_entities`, `semantic_profiles`, `content_relationships`
- **Capabilities**:
  - Named Entity Recognition (drivers, teams, circuits)
  - Sentiment analysis with F1 context
  - Topic modeling and classification
  - Vector embeddings (300-dimensional)

### 4. **Semantic Agent Orchestrator** (NEW - Multi-Domain)
- **Location**: `lib/semantic-tagging/semantic-agent-orchestrator.ts` 
- **Purpose**: Coordinates specialized semantic agents across domains
- **Supabase Tables**: `agent_processing_queue`, `cross_references`, `similarity_scores`
- **Specialized Sub-Agents**:
  - **News Agent**: Articles and breaking news
  - **Image Agent**: Visual content analysis
  - **User Content Agent**: Comments and posts
  - **Fantasy Agent**: Fantasy league data
  - **Social Agent**: Social media content
  - **Cross-Domain Agent**: Relationship mapping

## 🔍 INDEXING & SEARCH AGENTS

### 5. **Short-Term Memory Index Agent**
- **Location**: `memory/c_short_term_memory/Index/scripts/`
- **Purpose**: Indexes recent conversations and sessions
- **Supabase Tables**: `short_term_index`, `session_metadata`, `conversation_threads`
- **Components**:
  - **Search Interface**: `utils/search_interface.py`
  - **Embedding Manager**: `utils/embedding_manager.py` 
  - **Agent Coordinator**: `utils/agent_coordinator.py`

### 6. **Working Memory Processor Agent**
- **Location**: `memory/d_working_memory/working_memory_processor.py`
- **Purpose**: Indexes active development sessions and context
- **Supabase Tables**: `working_memory`, `active_sessions`, `development_context`
- **Capabilities**:
  - Real-time context indexing
  - Development session tracking
  - Code context preservation

### 7. **Memory Context Router Agent**
- **Location**: `memory/a_memory_core/memory_context_router_agent/memory_context_router_agent.py`
- **Purpose**: Routes content to appropriate memory buckets with indexing
- **Supabase Tables**: `memory_routing`, `context_classifications`, `bucket_assignments`

## 🗄️ CONTENT-SPECIFIC INDEXING AGENTS

### 8. **F1 Image Scraper & Indexer** (NEW)
- **Location**: `lib/news-pipeline/f1-image-scraper.ts`
- **Purpose**: Scrapes and indexes F1 images with metadata tagging
- **Supabase Tables**: `f1_images`, `image_metadata`, `visual_tags`, `f1_relevance_scores`
- **Capabilities**:
  - Multi-source image extraction
  - F1 relevance scoring (0-100)
  - Visual content tagging
  - Metadata preservation

### 9. **News Pipeline Indexer** 
- **Location**: `lib/news-pipeline/complete-news-system.ts`
- **Purpose**: Indexes F1 news articles with AI processing
- **Supabase Tables**: `f1_articles`, `news_sources`, `article_categories`, `content_analysis`

### 10. **User Intelligence Agent**
- **Location**: `memory/a_memory_core/user_intelligence_agent/user_intelligence_agent.py`
- **Purpose**: Indexes user behavior and preference patterns
- **Supabase Tables**: `user_profiles`, `behavior_patterns`, `preference_vectors`, `interaction_history`

## 🔄 COORDINATION & ORCHESTRATION AGENTS

### 11. **Memory Orchestrator Agent**
- **Location**: `memory/a_memory_core/memory_orchestrator_agent/`
- **Purpose**: Coordinates all memory operations and indexing
- **Supabase Tables**: `orchestration_logs`, `agent_coordination`, `memory_operations`

### 12. **Master Orchestrator Agent** 
- **Location**: `memory/a_memory_core/master_orchestrator_agent/master_orchestrator_agent.py`
- **Purpose**: High-level coordination of all memory agents
- **Supabase Tables**: `master_operations`, `agent_health`, `system_metrics`

### 13. **Memory Agent Router**
- **Location**: `memory/a_memory_core/memory_agent_router_agent/memory_agent_router_agent.py`
- **Purpose**: Routes requests between memory agents with indexing
- **Supabase Tables**: `routing_logs`, `agent_communication`, `request_traces`

## 📊 ANALYTICS & MONITORING AGENTS

### 14. **System Health Agent**
- **Location**: `memory/a_memory_core/system_health_agent/system_health_agent.py`
- **Purpose**: Monitors indexing performance and system health
- **Supabase Tables**: `system_health`, `performance_metrics`, `error_logs`

### 15. **Memory Logic Enforcer Agent**
- **Location**: `memory/a_memory_core/memory_logic_enforcer_agent/memory_logic_enforcer_agent.py`
- **Purpose**: Enforces indexing rules and data integrity
- **Supabase Tables**: `logic_violations`, `enforcement_actions`, `rule_compliance`

## 🎯 DOMAIN-SPECIFIC INDEXING

### 16. **Fantasy League Agent** 
- **Location**: `memory/a_memory_core/fantasy_league_agent/fantasy_league_agent.py`
- **Purpose**: Indexes fantasy league data and user strategies
- **Supabase Tables**: `fantasy_teams`, `player_selections`, `strategy_patterns`, `performance_analytics`

### 17. **GUI Launcher Agent**
- **Location**: `memory/a_memory_core/gui_launcher_agent/gui_launcher_agent.py` 
- **Purpose**: Indexes UI interactions and user interface patterns
- **Supabase Tables**: `ui_interactions`, `interface_patterns`, `user_workflows`

## 🚀 SUPABASE INTEGRATION ARCHITECTURE

### **Primary Index Tables**:
```sql
-- Core semantic indexing
CREATE TABLE semantic_profiles (
  id UUID PRIMARY KEY,
  content_id TEXT,
  content_type TEXT,
  entities JSONB,
  topics JSONB,
  sentiment JSONB,
  relationships JSONB,
  embedding VECTOR(300),
  confidence FLOAT,
  created_at TIMESTAMP
);

-- Cross-content relationships  
CREATE TABLE content_relationships (
  id UUID PRIMARY KEY,
  source_content_id TEXT,
  target_content_id TEXT,
  relationship_type TEXT,
  similarity_score FLOAT,
  shared_entities JSONB,
  created_at TIMESTAMP
);

-- F1-specific entities
CREATE TABLE f1_entities (
  id UUID PRIMARY KEY,
  entity_text TEXT,
  entity_category TEXT,
  entity_type TEXT,
  confidence FLOAT,
  metadata JSONB,
  created_at TIMESTAMP
);

-- Full-text search index
CREATE TABLE memory_index (
  id UUID PRIMARY KEY,
  content_id TEXT,
  content_type TEXT,
  indexed_content TSVECTOR,
  metadata JSONB,
  bucket_type TEXT,
  created_at TIMESTAMP
);
```

### **Vector Search Integration**:
All agents will use Supabase's `pgvector` extension for:
- Semantic similarity searches
- Content clustering
- Related content discovery
- User preference matching

### **Real-Time Indexing**:
- Agents trigger on database changes via Supabase Edge Functions
- Immediate indexing of new content
- Batch processing for large operations
- Incremental updates for efficiency

## 🔧 AGENT COORDINATION PROTOCOL

1. **Content Ingestion**: New content triggers indexing agents
2. **Parallel Processing**: Multiple agents analyze different aspects
3. **Index Creation**: Agents write to respective Supabase tables  
4. **Cross-Reference**: Agents create relationships between content
5. **Vector Storage**: Embeddings stored in pgvector format
6. **Search Optimization**: Indexes optimized for query performance

All agents operate with **full awareness** that their indexes, embeddings, and semantic data will be stored in **Supabase** for real-time access across the Grand Prix Social application.