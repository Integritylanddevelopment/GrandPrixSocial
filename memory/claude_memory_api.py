#!/usr/bin/env python3
"""
Claude Memory API - Main FastAPI application for Claude Enterprise Memory System
Provides RESTful endpoints for memory operations, health checks, and system status
"""

import os
import sys
import json
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

# FastAPI and dependencies
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Add memory system to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Claude memory components
from cloud_memory_database_system import CloudMemoryDatabase
from claude_enterprise_memory_system import ClaudeEnterpriseMemorySystem
from claude_tag_intelligence_engine import ClaudeTagIntelligenceEngine
from claude_memory_logic_enforcer import ClaudeMemoryLogicEnforcer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("claude_memory_api")

# Initialize FastAPI app
app = FastAPI(
    title="Claude Enterprise Memory System API",
    description="RESTful API for Claude's enterprise memory system with advanced cognitive processing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class MemoryItem(BaseModel):
    content: str
    memory_type: str = "working"
    priority: int = Field(default=5, ge=1, le=10)
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class MemoryQuery(BaseModel):
    query: str
    memory_types: List[str] = ["working", "episodic", "semantic", "procedural"]
    limit: int = Field(default=10, ge=1, le=100)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)

class MemoryUpdate(BaseModel):
    item_id: str
    updates: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    components: Dict[str, str]

# Global memory system instances
cloud_memory: Optional[CloudMemoryDatabase] = None
enterprise_memory: Optional[ClaudeEnterpriseMemorySystem] = None  
tag_engine: Optional[ClaudeTagIntelligenceEngine] = None
logic_enforcer: Optional[ClaudeMemoryLogicEnforcer] = None

async def get_memory_systems():
    """Dependency to ensure memory systems are initialized"""
    global cloud_memory, enterprise_memory, tag_engine, logic_enforcer
    
    if not cloud_memory:
        cloud_memory = CloudMemoryDatabase()
    
    if not enterprise_memory:
        enterprise_memory = ClaudeEnterpriseMemorySystem()
    
    if not tag_engine:
        tag_engine = ClaudeTagIntelligenceEngine()
    
    if not logic_enforcer:
        logic_enforcer = ClaudeMemoryLogicEnforcer()
    
    return {
        "cloud_memory": cloud_memory,
        "enterprise_memory": enterprise_memory,
        "tag_engine": tag_engine,
        "logic_enforcer": logic_enforcer
    }

@app.on_event("startup")
async def startup_event():
    """Initialize memory systems on startup"""
    logger.info("🚀 Starting Claude Enterprise Memory System API")
    
    try:
        # Initialize all memory systems
        await get_memory_systems()
        logger.info("✅ Memory systems initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize memory systems: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Claude Enterprise Memory System API")

# Health and Status Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    try:
        systems = await get_memory_systems()
        
        # Test each component
        component_status = {}
        
        # Test cloud memory
        try:
            test_result = await systems["cloud_memory"].test_connection()
            component_status["cloud_memory"] = "healthy" if test_result else "degraded"
        except Exception:
            component_status["cloud_memory"] = "unhealthy"
        
        # Test enterprise memory
        try:
            component_status["enterprise_memory"] = "healthy" if systems["enterprise_memory"] else "unhealthy"
        except Exception:
            component_status["enterprise_memory"] = "unhealthy"
        
        # Test tag engine
        try:
            component_status["tag_engine"] = "healthy" if systems["tag_engine"] else "unhealthy"
        except Exception:
            component_status["tag_engine"] = "unhealthy"
        
        # Test logic enforcer
        try:
            component_status["logic_enforcer"] = "healthy" if systems["logic_enforcer"] else "unhealthy"
        except Exception:
            component_status["logic_enforcer"] = "unhealthy"
        
        # Determine overall status
        unhealthy_count = sum(1 for status in component_status.values() if status == "unhealthy")
        
        if unhealthy_count == 0:
            overall_status = "healthy"
        elif unhealthy_count < len(component_status) / 2:
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        return HealthResponse(
            status=overall_status,
            timestamp=datetime.now().isoformat(),
            version="1.0.0",
            components=component_status
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/status")
async def system_status():
    """Detailed system status and metrics"""
    try:
        systems = await get_memory_systems()
        
        status = {
            "timestamp": datetime.now().isoformat(),
            "uptime": time.time(),
            "memory_stats": {},
            "performance_metrics": {},
            "storage_info": {}
        }
        
        # Get memory statistics
        if systems["cloud_memory"]:
            try:
                memory_stats = await systems["cloud_memory"].get_memory_statistics()
                status["memory_stats"] = memory_stats
            except Exception as e:
                status["memory_stats"] = {"error": str(e)}
        
        # Get performance metrics
        try:
            # Add performance metrics here
            status["performance_metrics"] = {
                "avg_response_time": 0.1,
                "total_requests": 0,
                "active_connections": 1
            }
        except Exception as e:
            status["performance_metrics"] = {"error": str(e)}
        
        return status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

# Memory Operations Endpoints
@app.post("/memory/store")
async def store_memory(
    item: MemoryItem,
    background_tasks: BackgroundTasks,
    systems: Dict = Depends(get_memory_systems)
):
    """Store a new memory item"""
    try:
        # Generate semantic tags
        enhanced_tags = item.tags.copy()
        if systems["tag_engine"]:
            semantic_tags = await systems["tag_engine"].generate_claude_semantic_tags(
                item.content, item.memory_type
            )
            enhanced_tags.extend(semantic_tags.get("primary_tags", []))
        
        # Store in cloud memory
        result = await systems["cloud_memory"].store_memory_item(
            content=item.content,
            memory_type=item.memory_type,
            priority=item.priority,
            tags=enhanced_tags,
            metadata=item.metadata
        )
        
        # Background processing
        background_tasks.add_task(
            process_memory_item_background,
            result["item_id"],
            systems
        )
        
        return {
            "success": True,
            "item_id": result["item_id"],
            "message": "Memory item stored successfully",
            "enhanced_tags": enhanced_tags
        }
        
    except Exception as e:
        logger.error(f"Failed to store memory: {e}")
        raise HTTPException(status_code=500, detail=f"Storage failed: {str(e)}")

@app.get("/memory/retrieve")
async def retrieve_memory(
    query: str,
    memory_types: str = "working,episodic,semantic,procedural",
    limit: int = 10,
    systems: Dict = Depends(get_memory_systems)
):
    """Retrieve memory items based on query"""
    try:
        memory_type_list = [t.strip() for t in memory_types.split(",")]
        
        results = await systems["cloud_memory"].retrieve_memory_items(
            query=query,
            memory_types=memory_type_list,
            limit=limit
        )
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve memory: {e}")
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

@app.post("/memory/query")
async def query_memory(
    query: MemoryQuery,
    systems: Dict = Depends(get_memory_systems)
):
    """Advanced memory query with similarity search"""
    try:
        results = await systems["cloud_memory"].semantic_search(
            query=query.query,
            memory_types=query.memory_types,
            limit=query.limit,
            similarity_threshold=query.similarity_threshold
        )
        
        return {
            "success": True,
            "query": query.query,
            "results": results,
            "count": len(results),
            "parameters": query.dict()
        }
        
    except Exception as e:
        logger.error(f"Failed to query memory: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.put("/memory/update")
async def update_memory(
    update: MemoryUpdate,
    systems: Dict = Depends(get_memory_systems)
):
    """Update an existing memory item"""
    try:
        result = await systems["cloud_memory"].update_memory_item(
            update.item_id,
            update.updates
        )
        
        return {
            "success": True,
            "item_id": update.item_id,
            "message": "Memory item updated successfully",
            "updated_fields": list(update.updates.keys())
        }
        
    except Exception as e:
        logger.error(f"Failed to update memory: {e}")
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.delete("/memory/{item_id}")
async def delete_memory(
    item_id: str,
    systems: Dict = Depends(get_memory_systems)
):
    """Delete a memory item"""
    try:
        result = await systems["cloud_memory"].delete_memory_item(item_id)
        
        return {
            "success": True,
            "item_id": item_id,
            "message": "Memory item deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to delete memory: {e}")
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

# Tag and Intelligence Endpoints
@app.get("/tags/generate")
async def generate_tags(
    content: str,
    memory_type: str = "working",
    systems: Dict = Depends(get_memory_systems)
):
    """Generate semantic tags for content"""
    try:
        if not systems["tag_engine"]:
            raise HTTPException(status_code=503, detail="Tag engine not available")
        
        tags = await systems["tag_engine"].generate_claude_semantic_tags(
            content, memory_type
        )
        
        return {
            "success": True,
            "content_preview": content[:100] + "..." if len(content) > 100 else content,
            "tags": tags
        }
        
    except Exception as e:
        logger.error(f"Failed to generate tags: {e}")
        raise HTTPException(status_code=500, detail=f"Tag generation failed: {str(e)}")

# Logic and Quality Endpoints  
@app.post("/memory/validate")
async def validate_memory(
    systems: Dict = Depends(get_memory_systems)
):
    """Run memory validation and quality checks"""
    try:
        if not systems["logic_enforcer"]:
            raise HTTPException(status_code=503, detail="Logic enforcer not available")
        
        validation_result = await systems["logic_enforcer"].run_comprehensive_memory_scan()
        
        return {
            "success": True,
            "validation_result": validation_result
        }
        
    except Exception as e:
        logger.error(f"Failed to validate memory: {e}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

# Background Tasks
async def process_memory_item_background(item_id: str, systems: Dict):
    """Background processing for newly stored memory items"""
    try:
        # Run quality checks
        if systems["logic_enforcer"]:
            await systems["logic_enforcer"].validate_memory_item(item_id)
        
        # Update tag effectiveness
        if systems["tag_engine"]:
            await systems["tag_engine"].update_tag_effectiveness(item_id)
        
        logger.info(f"Background processing completed for item: {item_id}")
        
    except Exception as e:
        logger.error(f"Background processing failed for item {item_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "claude_memory_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )