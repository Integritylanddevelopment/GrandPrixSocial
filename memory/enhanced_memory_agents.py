#!/usr/bin/env python3
"""
Enhanced Memory Agents with Full Cognitive Processing
Populates semantic, procedural, and episodic memories based on content analysis
"""

import json
import os
import sys
import time
import threading
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import hashlib

# Add memory root to path
MEMORY_ROOT = Path(__file__).parent
sys.path.insert(0, str(MEMORY_ROOT))

# Import the Claude adapter
from config.cc_claude_adapter import ClaudeContextAdapter, save_claude_interaction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%m-%d_%I-%M%p',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(MEMORY_ROOT / 'enhanced_memory_system.log')
    ]
)

logger = logging.getLogger('EnhancedMemory')

class ContentAnalyzer:
    """Analyzes content to determine memory type and extracts knowledge"""
    
    def __init__(self):
        self.patterns = {
            'semantic': {
                'f1_racing': r'\b(f1|formula\s*1|grand\s*prix|racing|driver|team|circuit|lap|qualifying)\b',
                'technical': r'\b(react|nextjs|typescript|javascript|component|function|api|database)\b',
                'architecture': r'\b(system|architecture|design|pattern|structure|module|service)\b'
            },
            'procedural': {
                'howto': r'\b(how\s+to|steps?\s+to|procedure|protocol|guide|tutorial|implement)\b',
                'commands': r'\b(run|execute|install|deploy|build|test|debug)\b',
                'workflow': r'\b(workflow|process|pipeline|sequence|order|first|then|finally)\b'
            },
            'episodic': {
                'temporal': r'\b(yesterday|today|last\s+week|recently|earlier|before|after)\b',
                'session': r'\b(session|conversation|discussed|mentioned|said|asked|responded)\b',
                'personal': r'\b(i|we|you|my|our|your)\b'
            }
        }
    
    def analyze(self, content: str, filename: str = '') -> Dict:
        """Analyze content and return memory classification"""
        content_lower = content.lower()
        filename_lower = filename.lower()
        
        scores = {
            'semantic': 0,
            'procedural': 0,
            'episodic': 0
        }
        
        # Check patterns
        for memory_type, patterns in self.patterns.items():
            for category, pattern in patterns.items():
                matches = len(re.findall(pattern, content_lower, re.IGNORECASE))
                scores[memory_type] += matches
        
        # Filename hints
        if 'procedure' in filename_lower or 'protocol' in filename_lower:
            scores['procedural'] += 10
        if 'session' in filename_lower or 'chat' in filename_lower:
            scores['episodic'] += 10
        if 'knowledge' in filename_lower or 'reference' in filename_lower:
            scores['semantic'] += 10
        
        # Determine primary type
        primary_type = max(scores, key=scores.get)
        
        # Extract knowledge based on type
        extracted = self.extract_knowledge(content, primary_type)
        
        return {
            'primary_type': primary_type,
            'scores': scores,
            'extracted_knowledge': extracted,
            'confidence': scores[primary_type] / max(sum(scores.values()), 1)
        }
    
    def extract_knowledge(self, content: str, memory_type: str) -> Dict:
        """Extract specific knowledge based on memory type"""
        if memory_type == 'semantic':
            return self.extract_semantic_knowledge(content)
        elif memory_type == 'procedural':
            return self.extract_procedural_knowledge(content)
        elif memory_type == 'episodic':
            return self.extract_episodic_knowledge(content)
        return {}
    
    def extract_semantic_knowledge(self, content: str) -> Dict:
        """Extract facts and concepts"""
        knowledge = {
            'concepts': [],
            'facts': [],
            'definitions': [],
            'relationships': []
        }
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            
            # Definitions (lines with "is" or "are")
            if ' is ' in line or ' are ' in line:
                knowledge['definitions'].append(line)
            
            # Facts (lines starting with numbers or bullets)
            if re.match(r'^[\d\-\*]', line):
                knowledge['facts'].append(line)
            
            # Concepts (headers)
            if line.startswith('#'):
                concept = line.strip('#').strip()
                if concept:
                    knowledge['concepts'].append(concept)
        
        return knowledge
    
    def extract_procedural_knowledge(self, content: str) -> Dict:
        """Extract steps and procedures"""
        knowledge = {
            'steps': [],
            'prerequisites': [],
            'commands': [],
            'outcomes': []
        }
        
        lines = content.split('\n')
        in_steps = False
        
        for line in lines:
            line = line.strip()
            
            # Steps (numbered items)
            if re.match(r'^\d+\.', line):
                knowledge['steps'].append(line)
                in_steps = True
            elif in_steps and line and not line.startswith('#'):
                # Continuation of step
                if knowledge['steps']:
                    knowledge['steps'][-1] += ' ' + line
            else:
                in_steps = False
            
            # Commands (backtick blocks or lines starting with $)
            if '`' in line or line.startswith('$'):
                command = re.findall(r'`([^`]+)`', line)
                if command:
                    knowledge['commands'].extend(command)
                elif line.startswith('$'):
                    knowledge['commands'].append(line[1:].strip())
            
            # Prerequisites (lines with "require", "need", "must")
            if any(word in line.lower() for word in ['require', 'need', 'must', 'prerequisite']):
                knowledge['prerequisites'].append(line)
        
        return knowledge
    
    def extract_episodic_knowledge(self, content: str) -> Dict:
        """Extract events and interactions"""
        knowledge = {
            'events': [],
            'interactions': [],
            'timestamps': [],
            'participants': []
        }
        
        # Extract timestamps
        timestamps = re.findall(r'\d{4}-\d{2}-\d{2}|\d{2}-\d{2}_\d{2}-\d{2}[AP]M', content)
        knowledge['timestamps'] = list(set(timestamps))
        
        # Extract interactions (Q&A patterns)
        qa_pattern = r'(?:Q:|Question:|A:|Answer:|User:|Assistant:)(.+?)(?=Q:|Question:|A:|Answer:|User:|Assistant:|$)'
        interactions = re.findall(qa_pattern, content, re.DOTALL | re.MULTILINE)
        knowledge['interactions'] = [i.strip() for i in interactions[:5]]
        
        # Extract events (past tense verbs)
        past_tense = re.findall(r'\b\w+ed\b', content)
        knowledge['events'] = list(set(past_tense[:10]))
        
        return knowledge

class EnhancedMemoryRouter:
    """Routes content to appropriate memory types with knowledge extraction"""
    
    def __init__(self):
        self.memory_root = MEMORY_ROOT
        self.analyzer = ContentAnalyzer()
        self.logger = logging.getLogger('MemoryRouter')
        
        # Create memory directories
        self.ensure_memory_structure()
    
    def ensure_memory_structure(self):
        """Ensure all memory directories exist"""
        dirs = [
            'f_semantic/knowledge',
            'f_semantic/concepts',
            'f_semantic/facts',
            'e_procedural/protocols',
            'e_procedural/guides',
            'e_procedural/workflows',
            'g_episodic/sessions',
            'g_episodic/interactions',
            'g_episodic/events'
        ]
        
        for dir_path in dirs:
            (self.memory_root / dir_path).mkdir(parents=True, exist_ok=True)
    
    def route_content(self, file_path: Path) -> Dict:
        """Route content to appropriate memory with extraction"""
        content = file_path.read_text(encoding='utf-8')
        filename = file_path.name
        
        # Analyze content
        analysis = self.analyzer.analyze(content, filename)
        
        # Route based on primary type
        memory_type = analysis['primary_type']
        knowledge = analysis['extracted_knowledge']
        
        self.logger.info(f"Routing {filename} to {memory_type} memory (confidence: {analysis['confidence']:.2f})")
        
        # Save to appropriate memory
        if memory_type == 'semantic':
            result = self.save_to_semantic(filename, content, knowledge)
        elif memory_type == 'procedural':
            result = self.save_to_procedural(filename, content, knowledge)
        elif memory_type == 'episodic':
            result = self.save_to_episodic(filename, content, knowledge)
        else:
            result = {'status': 'unknown_type'}
        
        # Create routing record
        self.create_routing_record(file_path, analysis, result)
        
        return result
    
    def save_to_semantic(self, filename: str, content: str, knowledge: Dict) -> Dict:
        """Save to semantic memory with structured knowledge"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Save concepts
        if knowledge.get('concepts'):
            concepts_file = self.memory_root / 'f_semantic' / 'concepts' / f'{filename.replace(".md", "")}_concepts_{timestamp}.json'
            concepts_file.write_text(json.dumps({
                'source': filename,
                'timestamp': timestamp,
                'concepts': knowledge['concepts'],
                'concept_map': self.build_concept_map(knowledge['concepts'])
            }, indent=2))
        
        # Save facts
        if knowledge.get('facts'):
            facts_file = self.memory_root / 'f_semantic' / 'facts' / f'{filename.replace(".md", "")}_facts_{timestamp}.md'
            facts_content = f"# Facts from {filename}\n*Extracted: {timestamp}*\n\n"
            for fact in knowledge['facts']:
                facts_content += f"- {fact}\n"
            facts_file.write_text(facts_content)
        
        # Save full knowledge
        knowledge_file = self.memory_root / 'f_semantic' / 'knowledge' / f'{filename.replace(".md", "")}_knowledge_{timestamp}.md'
        knowledge_file.write_text(content)
        
        return {
            'status': 'saved_to_semantic',
            'concepts': len(knowledge.get('concepts', [])),
            'facts': len(knowledge.get('facts', [])),
            'location': str(knowledge_file)
        }
    
    def save_to_procedural(self, filename: str, content: str, knowledge: Dict) -> Dict:
        """Save to procedural memory with structured steps"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Create structured procedure
        procedure = {
            'source': filename,
            'timestamp': timestamp,
            'steps': knowledge.get('steps', []),
            'prerequisites': knowledge.get('prerequisites', []),
            'commands': knowledge.get('commands', []),
            'outcomes': knowledge.get('outcomes', [])
        }
        
        # Save as protocol
        protocol_file = self.memory_root / 'e_procedural' / 'protocols' / f'{filename.replace(".md", "")}_protocol_{timestamp}.json'
        protocol_file.write_text(json.dumps(procedure, indent=2))
        
        # Save as guide (markdown)
        if knowledge.get('steps'):
            guide_file = self.memory_root / 'e_procedural' / 'guides' / f'{filename.replace(".md", "")}_guide_{timestamp}.md'
            guide_content = f"# Procedure: {filename}\n*Created: {timestamp}*\n\n"
            
            if knowledge.get('prerequisites'):
                guide_content += "## Prerequisites\n"
                for prereq in knowledge['prerequisites']:
                    guide_content += f"- {prereq}\n"
                guide_content += "\n"
            
            guide_content += "## Steps\n"
            for step in knowledge['steps']:
                guide_content += f"{step}\n"
            
            if knowledge.get('commands'):
                guide_content += "\n## Commands\n```bash\n"
                for cmd in knowledge['commands']:
                    guide_content += f"{cmd}\n"
                guide_content += "```\n"
            
            guide_file.write_text(guide_content)
        
        return {
            'status': 'saved_to_procedural',
            'steps': len(knowledge.get('steps', [])),
            'commands': len(knowledge.get('commands', [])),
            'location': str(protocol_file)
        }
    
    def save_to_episodic(self, filename: str, content: str, knowledge: Dict) -> Dict:
        """Save to episodic memory with temporal context"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Create episode record
        episode = {
            'source': filename,
            'timestamp': timestamp,
            'events': knowledge.get('events', []),
            'interactions': knowledge.get('interactions', []),
            'temporal_markers': knowledge.get('timestamps', []),
            'participants': knowledge.get('participants', [])
        }
        
        # Save as session
        session_file = self.memory_root / 'g_episodic' / 'sessions' / f'{filename.replace(".md", "")}_session_{timestamp}.json'
        session_file.write_text(json.dumps(episode, indent=2))
        
        # Save interactions separately if present
        if knowledge.get('interactions'):
            interaction_file = self.memory_root / 'g_episodic' / 'interactions' / f'{filename.replace(".md", "")}_interactions_{timestamp}.md'
            interaction_content = f"# Interactions from {filename}\n*Recorded: {timestamp}*\n\n"
            for interaction in knowledge['interactions']:
                interaction_content += f"- {interaction}\n\n"
            interaction_file.write_text(interaction_content)
        
        return {
            'status': 'saved_to_episodic',
            'events': len(knowledge.get('events', [])),
            'interactions': len(knowledge.get('interactions', [])),
            'location': str(session_file)
        }
    
    def build_concept_map(self, concepts: List[str]) -> Dict:
        """Build relationships between concepts"""
        concept_map = {}
        for concept in concepts:
            related = [c for c in concepts if c != concept and (
                c.lower() in concept.lower() or concept.lower() in c.lower()
            )]
            concept_map[concept] = related
        return concept_map
    
    def create_routing_record(self, file_path: Path, analysis: Dict, result: Dict):
        """Create a record of the routing decision"""
        record_file = self.memory_root / 'a_memory_core' / 'routing_log.json'
        
        if record_file.exists():
            with open(record_file, 'r') as f:
                log = json.load(f)
        else:
            log = {'routes': []}
        
        log['routes'].append({
            'timestamp': datetime.now().strftime("%m-%d_%I-%M%p"),
            'file': str(file_path),
            'analysis': analysis,
            'result': result
        })
        
        # Keep only last 100 routes
        log['routes'] = log['routes'][-100:]
        
        record_file.write_text(json.dumps(log, indent=2))

class CognitiveMemorySystem:
    """Complete cognitive memory system with all agents working together"""
    
    def __init__(self):
        self.router = EnhancedMemoryRouter()
        self.adapter = ClaudeContextAdapter()
        self.logger = logger
        self.running = False
        self.threads = []
    
    def start(self):
        """Start the cognitive memory system"""
        self.running = True
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=self.monitor_working_memory, daemon=True)
        monitor_thread.start()
        self.threads.append(monitor_thread)
        
        # Start context injection thread
        context_thread = threading.Thread(target=self.context_injection_loop, daemon=True)
        context_thread.start()
        self.threads.append(context_thread)
        
        self.logger.info("Cognitive Memory System started")
    
    def stop(self):
        """Stop the cognitive memory system"""
        self.running = False
        for thread in self.threads:
            thread.join(timeout=5)
        self.logger.info("Cognitive Memory System stopped")
    
    def monitor_working_memory(self):
        """Monitor working memory for new content to process"""
        working_dir = MEMORY_ROOT / 'd_working_memory' / 'active'
        processed = set()
        
        while self.running:
            try:
                for file_path in working_dir.glob('*.md'):
                    if file_path not in processed:
                        self.logger.info(f"Processing new file: {file_path.name}")
                        result = self.router.route_content(file_path)
                        self.logger.info(f"Routing result: {result}")
                        processed.add(file_path)
                
                time.sleep(5)  # Check every 5 seconds
            except Exception as e:
                self.logger.error(f"Error in monitoring: {e}")
    
    def context_injection_loop(self):
        """Continuously prepare context for injection"""
        while self.running:
            try:
                # This would be called by Claude Code before responses
                # For now, we just update the cache
                test_query = "What's the current status?"
                context = self.adapter.get_relevant_context(test_query)
                
                # Log context availability
                self.logger.debug(f"Context ready: {len(context.get('working_memory', []))} working items")
                
                time.sleep(10)  # Update every 10 seconds
            except Exception as e:
                self.logger.error(f"Error in context injection: {e}")

def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("COGNITIVE MEMORY SYSTEM - Full Integration")
    print("="*60 + "\n")
    
    system = CognitiveMemorySystem()
    
    try:
        system.start()
        
        print("✅ Cognitive Memory System Active!")
        print("-" * 40)
        print("System is now:")
        print("  • Analyzing content for memory type")
        print("  • Extracting knowledge structures")
        print("  • Populating semantic/procedural/episodic memories")
        print("  • Preparing context for Claude injection")
        print("\nPress Ctrl+C to stop\n")
        
        # Keep running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        system.stop()
        print("System stopped")

if __name__ == "__main__":
    main()