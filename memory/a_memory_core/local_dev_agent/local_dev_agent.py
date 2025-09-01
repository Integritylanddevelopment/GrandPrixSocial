#!/usr/bin/env python3
"""
Local Development Agent - CommandCore Integration
Bridges CommandCore OS sophisticated agents with local Qwen3 inference for Grand Prix Social development
"""

import os
import sys
import json
import asyncio
import logging
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add CommandCore project to Python path
COMMANDCORE_PATH = Path("C:\\D_Drive\\ActiveProjects\\CommandCore_Project")
sys.path.insert(0, str(COMMANDCORE_PATH))

# Add current memory core to path
MEMORY_CORE_PATH = Path(__file__).parent.parent
sys.path.insert(0, str(MEMORY_CORE_PATH))

# Import CommandCore components
try:
    from memory.a_memory_core.master_orchestrator_agent.master_orchestrator_agent import MasterOrchestrator
    from memory.d_working_memory.cognitive_workspace.cognitive_engine import CognitiveWorkspace
    COMMANDCORE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"CommandCore components not available: {e}")
    COMMANDCORE_AVAILABLE = False

class LocalDevAgent:
    """
    Local Development Agent
    
    Combines CommandCore's enterprise agent system with local Qwen3 inference
    to provide sophisticated development assistance for Grand Prix Social.
    """
    
    def __init__(self):
        self.agent_dir = Path(__file__).parent
        self.agent_dir.mkdir(exist_ok=True)
        
        # Local inference configuration
        self.local_api_url = "http://localhost:11434"
        self.model_name = "qwen2.5:7b"
        
        # Agent state
        self.state = {
            'status': 'initializing',
            'sessions': {},
            'commandcore_status': 'unknown',
            'local_inference_status': 'unknown'
        }
        
        # Initialize logging
        self.setup_logging()
        
        # Initialize CommandCore integration
        self.commandcore_orchestrator = None
        self.cognitive_workspace = None
        
        if COMMANDCORE_AVAILABLE:
            self.initialize_commandcore()
        
        # Test local inference
        self.test_local_inference()
        
        self.logger.info("🔧 Local Dev Agent initialized")
    
    def setup_logging(self):
        """Setup logging system"""
        log_file = self.agent_dir / "local_dev_agent.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - LocalDevAgent - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("LocalDevAgent")
    
    def initialize_commandcore(self):
        """Initialize CommandCore components"""
        try:
            # Initialize cognitive workspace for thought management
            self.cognitive_workspace = CognitiveWorkspace()
            self.state['commandcore_status'] = 'available'
            self.logger.info("✅ CommandCore cognitive workspace initialized")
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize CommandCore: {e}")
            self.state['commandcore_status'] = 'failed'
    
    def test_local_inference(self):
        """Test if local Qwen3 inference is available"""
        try:
            response = requests.get(f"{self.local_api_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                qwen_available = any('qwen' in model.get('name', '').lower() for model in models)
                
                if qwen_available:
                    self.state['local_inference_status'] = 'available'
                    self.logger.info("✅ Local Qwen3 inference available")
                else:
                    self.state['local_inference_status'] = 'no_qwen_model'
                    self.logger.warning("⚠️  Local inference available but no Qwen model found")
            else:
                self.state['local_inference_status'] = 'service_error'
        except Exception as e:
            self.state['local_inference_status'] = 'unavailable'
            self.logger.warning(f"⚠️  Local inference not available: {e}")
    
    def query_local_model(self, prompt: str, context: str = None) -> str:
        """Query the local Qwen3 model"""
        if self.state['local_inference_status'] != 'available':
            return "Local inference not available"
        
        # Enhance prompt with context from cognitive workspace
        enhanced_prompt = self.enhance_prompt_with_context(prompt, context)
        
        try:
            payload = {
                "model": self.model_name,
                "prompt": enhanced_prompt,
                "stream": False
            }
            
            self.logger.info(f"🧠 Querying local model: {prompt[:50]}...")
            response = requests.post(
                f"{self.local_api_url}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get('response', 'No response')
                
                # Store interaction in cognitive workspace
                if self.cognitive_workspace:
                    self.store_interaction(prompt, answer)
                
                return answer
            else:
                return f"Error: {response.status_code} - {response.text}"
                
        except Exception as e:
            self.logger.error(f"❌ Local model query failed: {e}")
            return f"Query failed: {str(e)}"
    
    def enhance_prompt_with_context(self, prompt: str, context: str = None) -> str:
        """Enhance prompt with relevant context from memory systems"""
        enhanced = prompt
        
        if context:
            enhanced = f"Context: {context}\n\nQuery: {prompt}"
        
        # Add cognitive context if available
        if self.cognitive_workspace:
            try:
                relevant_context = self.cognitive_workspace.get_context_for_injection(
                    query=prompt, 
                    max_items=3
                )
                
                if relevant_context:
                    context_text = "\n".join([
                        f"- {ctx['content']}" for ctx in relevant_context
                    ])
                    enhanced = f"Relevant Context:\n{context_text}\n\nQuery: {prompt}"
                    
            except Exception as e:
                self.logger.warning(f"Failed to get cognitive context: {e}")
        
        return enhanced
    
    def store_interaction(self, prompt: str, response: str):
        """Store interaction in cognitive workspace"""
        if not self.cognitive_workspace:
            return
        
        try:
            # Store the question as a thought
            question_id = self.cognitive_workspace.add_thought(
                content=prompt,
                thought_type='question',
                priority=0.7,
                agent_id='local_dev_agent',
                tags=['user_query', 'development']
            )
            
            # Store the answer as a conclusion thought
            answer_id = self.cognitive_workspace.add_thought(
                content=response,
                thought_type='conclusion', 
                priority=0.8,
                agent_id='local_dev_agent',
                parent_thought_id=question_id,
                tags=['ai_response', 'development']
            )
            
            # Create reasoning chain
            chain_id = self.cognitive_workspace.create_reasoning_chain(
                root_thought_id=question_id,
                agent_id='local_dev_agent',
                chain_type='linear'
            )
            
            self.cognitive_workspace.extend_reasoning_chain(chain_id, answer_id)
            
        except Exception as e:
            self.logger.warning(f"Failed to store interaction in cognitive workspace: {e}")
    
    def analyze_grand_prix_codebase(self) -> str:
        """Analyze Grand Prix Social codebase for development insights"""
        gps_path = Path("C:\\D_Drive\\ActiveProjects\\GrandPrixSocial")
        
        analysis = {
            'project_structure': {},
            'key_files': [],
            'technologies': [],
            'memory_system': {}
        }
        
        try:
            # Analyze project structure
            if gps_path.exists():
                analysis['project_structure'] = {
                    'components': len(list((gps_path / "components").rglob("*.tsx"))) if (gps_path / "components").exists() else 0,
                    'pages': len(list((gps_path / "app").rglob("*.tsx"))) if (gps_path / "app").exists() else 0,
                    'memory_agents': len(list((gps_path / "memory").rglob("*agent*.py"))) if (gps_path / "memory").exists() else 0
                }
                
                # Check for key files
                key_files = ['package.json', 'next.config.js', 'tailwind.config.js']
                analysis['key_files'] = [f for f in key_files if (gps_path / f).exists()]
                
                # Memory system analysis
                memory_path = gps_path / "memory"
                if memory_path.exists():
                    analysis['memory_system'] = {
                        'core_agents': len(list((memory_path / "a_memory_core").rglob("*agent*.py"))),
                        'memory_types': [d.name for d in memory_path.iterdir() if d.is_dir() and d.name.startswith(('b_', 'c_', 'd_', 'e_', 'f_', 'g_'))]
                    }
        
        except Exception as e:
            self.logger.error(f"Codebase analysis failed: {e}")
            return f"Analysis failed: {str(e)}"
        
        return json.dumps(analysis, indent=2)
    
    def get_development_suggestions(self, context: str = None) -> str:
        """Get AI-powered development suggestions"""
        analysis = self.analyze_grand_prix_codebase()
        
        prompt = f"""
        You are a senior full-stack developer analyzing the Grand Prix Social project.
        
        Project Analysis:
        {analysis}
        
        Context: {context or "General development suggestions"}
        
        Provide specific, actionable development recommendations including:
        1. Code architecture improvements
        2. Performance optimizations  
        3. Feature implementations
        4. Memory system enhancements
        5. Integration opportunities with CommandCore agents
        
        Focus on practical, implementable suggestions.
        """
        
        return self.query_local_model(prompt)
    
    def help_with_task(self, task_description: str) -> str:
        """Get AI assistance for a specific development task"""
        codebase_context = self.analyze_grand_prix_codebase()
        
        prompt = f"""
        You are an expert development assistant working on Grand Prix Social.
        
        Current Codebase Context:
        {codebase_context}
        
        Task: {task_description}
        
        Provide step-by-step guidance including:
        1. Files to examine/create/modify
        2. Code implementation approach
        3. Testing considerations
        4. Integration points
        5. Potential issues and solutions
        
        Be specific with file paths and code examples where helpful.
        """
        
        return self.query_local_model(prompt)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        status = {
            'agent_status': self.state['status'],
            'local_inference': self.state['local_inference_status'],
            'commandcore_integration': self.state['commandcore_status'],
            'capabilities': []
        }
        
        # Determine available capabilities
        if self.state['local_inference_status'] == 'available':
            status['capabilities'].append('local_ai_queries')
            status['capabilities'].append('development_assistance')
            status['capabilities'].append('code_analysis')
        
        if self.state['commandcore_status'] == 'available':
            status['capabilities'].append('cognitive_workspace')
            status['capabilities'].append('memory_management')
            status['capabilities'].append('thought_chains')
        
        # Cognitive workspace stats
        if self.cognitive_workspace:
            metrics = self.cognitive_workspace.get_performance_metrics()
            status['cognitive_workspace'] = {
                'total_thoughts': metrics.get('total_thoughts', 0),
                'reasoning_chains': metrics.get('total_reasoning_chains', 0),
                'cache_hit_rate': metrics.get('cache_hit_rate', 0)
            }
        
        return status

def main():
    """Main entry point for standalone operation"""
    print("🔧 Grand Prix Social - Local Development Agent")
    print("Powered by CommandCore OS + Local Qwen3 Inference")
    print("=" * 60)
    
    agent = LocalDevAgent()
    
    # Interactive mode
    print("\nAgent Status:")
    status = agent.get_system_status()
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    print("\nEntering interactive mode. Type 'exit' to quit, 'status' for system status.")
    print("Available commands:")
    print("  - analyze: Analyze Grand Prix Social codebase")
    print("  - suggest: Get development suggestions")  
    print("  - help <task>: Get help with specific task")
    print("  - query <question>: Ask AI a question")
    
    while True:
        try:
            user_input = input("\n> ").strip()
            
            if user_input.lower() == 'exit':
                break
            elif user_input.lower() == 'status':
                print(json.dumps(agent.get_system_status(), indent=2))
            elif user_input.lower() == 'analyze':
                print("Analyzing codebase...")
                result = agent.analyze_grand_prix_codebase()
                print(result)
            elif user_input.lower() == 'suggest':
                print("Generating development suggestions...")
                result = agent.get_development_suggestions()
                print(result)
            elif user_input.lower().startswith('help '):
                task = user_input[5:]
                print(f"Getting help for: {task}")
                result = agent.help_with_task(task)
                print(result)
            elif user_input.lower().startswith('query '):
                question = user_input[6:]
                print("Querying local AI...")
                result = agent.query_local_model(question)
                print(result)
            else:
                print("Unknown command. Type 'exit' to quit.")
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n👋 Local Dev Agent shutting down...")

if __name__ == "__main__":
    main()