# Context Document Monitor Agent

## Overview
The Context Document Monitor Agent automatically tracks changes to the main `CLAUDE.md` context document and promotes information through the memory hierarchy for long-term preservation and searchability.

## Purpose
- **Monitors** `C:/D_Drive/ActiveProjects/GrandPrixSocial/memory/CLAUDE.md` for changes
- **Tags and indexes** content changes with semantic metadata
- **Promotes** information through the memory cycle: Short-term → Working Memory → Long-term
- **Preserves** architectural decisions and development history for future reference

## Key Features

### Change Detection
- Monitors context document every 5 minutes
- Detects section additions, modifications, and removals
- Calculates content similarity and significance levels
- Generates diff analysis for meaningful changes

### Semantic Tagging
Automatically tags content with categories:
- `agent_development` - Agent architecture and development
- `project_status` - Current project state updates  
- `technical_decisions` - Technical architecture choices
- `roadmap_updates` - Development planning changes
- `deployment_issues` - Infrastructure and deployment problems
- Content-specific tags (fantasy, schedule, news, premium, etc.)

### Memory Promotion Pipeline
1. **Immediate Processing**: High-significance changes indexed immediately
2. **Short-term Storage**: Changes stored for 7 days with full context
3. **Working Memory**: Promoted after 7 days, retained for 30 days
4. **Long-term Archive**: Permanent storage with vector indexing and search

### Significance Assessment
- **High**: Agent development, roadmap changes, architecture decisions
- **Medium**: Status updates, technical configurations  
- **Low**: Minor text updates, formatting changes

## Usage

### Command Line Interface
```bash
# Run monitoring cycle (default)
python context_document_monitor_agent.py

# Check agent status
python context_document_monitor_agent.py status

# Run monitoring cycle explicitly  
python context_document_monitor_agent.py monitor

# Process promotion queue
python context_document_monitor_agent.py promote
```

### Integration with Memory System
The agent automatically:
- Creates entries in short-term memory (`c_short_term_memory/index/`)
- Promotes to working memory (`d_working_memory/context_changes/`)
- Queues for long-term archival (`b_long_term_memory/`)
- Tags content for vector search and indexing

## Memory Cycle Integration

### Files Created
- `context_monitor_state.json` - Agent state and statistics
- `context_content_cache.json` - Previous content for diff analysis
- `promotion_queue.json` - Items queued for memory promotion
- Memory entries in respective memory bucket directories

### Retention Schedule
- **Short-term**: 7 days (immediate access)
- **Working Memory**: 30 days (active development context)
- **Long-term**: Permanent (searchable archive)

## Benefits

### Historical Preservation
- Complete record of why architectural decisions were made
- Searchable history of agent development rationale
- Version control for context and planning decisions

### Future Reference  
- 2-year lookback capability: "Why did we build this agent this way?"
- Vector search across all historical context changes
- Tagged and indexed decision history

### Automated Memory Management
- No manual promotion required
- Systematic preservation of important decisions
- Reduced cognitive load on development team

## Configuration

### Monitoring Settings
- **Monitoring Interval**: 5 minutes (300 seconds)
- **Change Detection Threshold**: 10% content change
- **Short-term Retention**: 7 days
- **Working Memory Retention**: 30 days
- **Long-term Archive**: Enabled

### Tagging Categories
Customizable semantic categories for automated content classification and future searchability.

## Status Monitoring
The agent provides comprehensive status including:
- Last monitoring check timestamp
- Number of changes detected
- Promotions completed
- Current monitoring state
- Context document availability

This agent ensures that the Grand Prix Social project maintains a complete, searchable history of its development decisions and architectural evolution.