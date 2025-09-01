#!/usr/bin/env python3
"""
Dev Agent Mobile API Server
Provides REST API for mobile interface to communicate with local dev agent
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent))
sys.path.append(str(Path(__file__).parent.parent / "memory"))

# Import our dev agent components
try:
    from memory.a_memory_core.local_dev_agent.local_dev_agent import LocalDevAgent
    from memory.commandcore_integration import CommandCoreIntegration
    from memory.enterprise_agent_factory import EnterpriseAgentFactory
    LOCAL_AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Local agents not available: {e}")
    LOCAL_AGENTS_AVAILABLE = False

class DevAgentAPIServer:
    """API Server for mobile interface communication"""
    
    def __init__(self, port=8889):
        self.port = port
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for mobile access
        
        # Initialize agent components
        self.local_dev_agent = None
        self.commandcore_integration = None
        self.agent_factory = None
        
        if LOCAL_AGENTS_AVAILABLE:
            self.initialize_agents()
        
        # Setup logging
        self.setup_logging()
        
        # Setup routes
        self.setup_routes()
        
        self.logger.info(f"🚀 Dev Agent API Server initialized on port {port}")
    
    def setup_logging(self):
        """Setup logging for API server"""
        log_dir = Path(__file__).parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / "dev_agent_api.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - DevAgentAPI - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("DevAgentAPIServer")
    
    def initialize_agents(self):
        """Initialize dev agent components"""
        try:
            self.local_dev_agent = LocalDevAgent()
            self.commandcore_integration = CommandCoreIntegration()
            self.agent_factory = EnterpriseAgentFactory()
            self.logger.info("✅ Agent components initialized")
        except Exception as e:
            self.logger.error(f"❌ Agent initialization failed: {e}")
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'agents_available': LOCAL_AGENTS_AVAILABLE,
                'components': {
                    'local_dev_agent': self.local_dev_agent is not None,
                    'commandcore_integration': self.commandcore_integration is not None,
                    'agent_factory': self.agent_factory is not None
                }
            })
        
        @self.app.route('/chat', methods=['POST'])
        def chat():
            """Main chat endpoint for mobile interface"""
            try:
                data = request.get_json()
                message = data.get('message', '').strip()
                context = data.get('context', 'mobile')
                
                if not message:
                    return jsonify({'error': 'Message is required'}), 400
                
                self.logger.info(f"📱 Mobile chat: {message[:50]}...")
                
                # Route message to appropriate agent
                response = self.process_message(message, context)
                
                return jsonify({
                    'response': response,
                    'timestamp': datetime.now().isoformat(),
                    'context': context
                })
                
            except Exception as e:
                self.logger.error(f"❌ Chat error: {e}")
                return jsonify({
                    'error': str(e),
                    'response': 'Sorry, I encountered an error processing your request.'
                }), 500
        
        @self.app.route('/analyze', methods=['POST'])
        def analyze_codebase():
            """Codebase analysis endpoint"""
            try:
                if not self.local_dev_agent:
                    return jsonify({'error': 'Local dev agent not available'}), 503
                
                analysis = self.local_dev_agent.analyze_grand_prix_codebase()
                
                return jsonify({
                    'analysis': analysis,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                self.logger.error(f"❌ Analysis error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/suggest', methods=['POST'])
        def get_suggestions():
            """Development suggestions endpoint"""
            try:
                if not self.local_dev_agent:
                    return jsonify({'error': 'Local dev agent not available'}), 503
                
                data = request.get_json() or {}
                context = data.get('context', 'General development suggestions')
                
                suggestions = self.local_dev_agent.get_development_suggestions(context)
                
                return jsonify({
                    'suggestions': suggestions,
                    'context': context,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                self.logger.error(f"❌ Suggestions error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/help', methods=['POST'])
        def get_task_help():
            """Task assistance endpoint"""
            try:
                if not self.local_dev_agent:
                    return jsonify({'error': 'Local dev agent not available'}), 503
                
                data = request.get_json()
                task = data.get('task', '').strip()
                
                if not task:
                    return jsonify({'error': 'Task description is required'}), 400
                
                help_response = self.local_dev_agent.help_with_task(task)
                
                return jsonify({
                    'help': help_response,
                    'task': task,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                self.logger.error(f"❌ Help error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/status', methods=['GET'])
        def system_status():
            """Comprehensive system status"""
            try:
                status = {
                    'api_server': 'running',
                    'timestamp': datetime.now().isoformat()
                }
                
                if self.local_dev_agent:
                    status['local_dev_agent'] = self.local_dev_agent.get_system_status()
                
                if self.commandcore_integration:
                    status['commandcore'] = self.commandcore_integration.get_integration_status()
                
                if self.agent_factory:
                    status['agent_factory'] = self.agent_factory.get_factory_status()
                
                return jsonify(status)
                
            except Exception as e:
                self.logger.error(f"❌ Status error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/memory/sync', methods=['POST'])
        def sync_memory():
            """Memory synchronization endpoint"""
            try:
                if not self.commandcore_integration:
                    return jsonify({'error': 'CommandCore integration not available'}), 503
                
                data = request.get_json()
                content = data.get('content', '').strip()
                memory_type = data.get('memory_type', 'development_notes')
                metadata = data.get('metadata', {})
                
                if not content:
                    return jsonify({'error': 'Content is required'}), 400
                
                thought_id = self.commandcore_integration.sync_memory_to_commandcore(
                    content, memory_type, metadata
                )
                
                return jsonify({
                    'thought_id': thought_id,
                    'memory_type': memory_type,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                self.logger.error(f"❌ Memory sync error: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/memory/query', methods=['POST'])
        def query_memory():
            """Memory query endpoint"""
            try:
                if not self.commandcore_integration:
                    return jsonify({'error': 'CommandCore integration not available'}), 503
                
                data = request.get_json()
                query = data.get('query', '').strip()
                memory_types = data.get('memory_types', [])
                max_results = data.get('max_results', 5)
                
                if not query:
                    return jsonify({'error': 'Query is required'}), 400
                
                results = self.commandcore_integration.query_commandcore_memory(
                    query, memory_types, max_results
                )
                
                return jsonify({
                    'results': results,
                    'query': query,
                    'count': len(results),
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                self.logger.error(f"❌ Memory query error: {e}")
                return jsonify({'error': str(e)}), 500
    
    def process_message(self, message: str, context: str) -> str:
        """Process incoming message and route to appropriate handler"""
        message_lower = message.lower()
        
        try:
            # Route based on message content
            if any(keyword in message_lower for keyword in ['analyze', 'analysis', 'code']):
                if self.local_dev_agent:
                    return f"**Codebase Analysis:**\n\n{self.local_dev_agent.analyze_grand_prix_codebase()}"
                else:
                    return "Local dev agent not available for analysis."
            
            elif any(keyword in message_lower for keyword in ['suggest', 'recommendation', 'improve']):
                if self.local_dev_agent:
                    return self.local_dev_agent.get_development_suggestions(message)
                else:
                    return "Local dev agent not available for suggestions."
            
            elif any(keyword in message_lower for keyword in ['help', 'assist', 'how to']):
                if self.local_dev_agent:
                    return self.local_dev_agent.help_with_task(message)
                else:
                    return "Local dev agent not available for task assistance."
            
            elif any(keyword in message_lower for keyword in ['status', 'health', 'system']):
                status_info = []
                if self.local_dev_agent:
                    status = self.local_dev_agent.get_system_status()
                    status_info.append(f"**Dev Agent Status:**")
                    status_info.append(f"- Local AI: {status.get('local_inference', 'unknown')}")
                    status_info.append(f"- CommandCore: {status.get('commandcore_integration', 'unknown')}")
                    status_info.append(f"- Capabilities: {', '.join(status.get('capabilities', []))}")
                
                return "\n".join(status_info) if status_info else "System status unavailable."
            
            else:
                # Default to AI query
                if self.local_dev_agent:
                    return self.local_dev_agent.query_local_model(message, context)
                else:
                    return "I'm currently offline. Local dev agent is not available."
        
        except Exception as e:
            self.logger.error(f"❌ Message processing error: {e}")
            return f"I encountered an error: {str(e)}"
    
    def run(self, debug=False):
        """Run the API server"""
        self.logger.info(f"🌐 Starting API server on port {self.port}")
        self.app.run(host='0.0.0.0', port=self.port, debug=debug)

def main():
    """Main entry point"""
    print("📱 Dev Agent Mobile API Server")
    print("Provides REST API for mobile interface")
    print("=" * 50)
    
    server = DevAgentAPIServer(port=8889)
    
    try:
        server.run(debug=False)
    except KeyboardInterrupt:
        print("\n👋 API Server shutting down...")

if __name__ == "__main__":
    main()