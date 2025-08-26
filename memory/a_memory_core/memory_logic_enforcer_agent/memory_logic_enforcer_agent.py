
# Auto-generated performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper
import os
import re
import sys
import json
import time
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import hashlib

class MemoryLogicEnforcerAgent:
    """
    CommandCore Memory Logic Enforcer Agent
    
    Primary enforcement agent for the comprehensive CommandCore Memory System.
    Validates compliance with core logic rules, AI tagging standards, timestamp formats,
    agent autonomy requirements, and all system governance protocols.
    
    Authority Level: ABSOLUTE
    Version: 2.0 (aligned with Core Logic v2.0)
    """
    
    def __init__(self):
        # Core paths and configuration
        self.core_logic_path = os.path.join(os.path.dirname(__file__), "core_logic.md")
        self.memory_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        self.memory_core = os.path.join(self.memory_root, "memory", "a_memory_core")
        
        # Logging and violation tracking
        self.violations_log = os.path.join(os.path.dirname(__file__), "violation_log.json")
        self.timestamp_violations_log = os.path.join(self.memory_root, "timestamp_violations.log")
        self.agent_interactions_log = os.path.join(self.memory_root, "agent_interactions.log")
        
        # Global timestamp format (from Core Logic v2.0)
        self.mandatory_timestamp_format = "%m-%d_%I-%M%p"
        self.prohibited_timestamp_formats = [
            r"%Y-%m-%d %H:%M:%S",
            r"%Y-%m-%d",
            r"%Y%m%d",
            r"%H:%M:%S",
            r"%m/%d",
            r"datetime\.now\(\)\.isoformat\(\)"
        ]
        
        # Protected classifications (from Core Logic v2.0)
        self.protected_tags = [
            "#neverdelete", "#corelogic", "#builderintent", 
            "#systemcritical", "#aitagged"
        ]
        
        self.protected_directories = [
            "a_memory_core",
            "memory_logic_enforcer_agent",
            "tag_intelligence_engine.py"
        ]
        
        # Forbidden operations and patterns
        self.forbidden_deletion_patterns = [
            r"os\.remove\(",
            r"os\.unlink\(",
            r"shutil\.rmtree\(",
            r"pathlib\.Path\(.*\)\.unlink\(",
            r"\.delete\(\)",
            r"rm\s+-",
            r"del\s+",
            r"TTL|expire|lifetime|decay",
            r"auto_clean|cleanup|purge"
        ]
        
        # Agent autonomy requirements
        self.prohibited_manual_triggers = [
            r"input\(",
            r"raw_input\(",
            r"click\.prompt\(",
            r"tkinter\.",
            r"GUI.*button",
            r"manual.*trigger"
        ]
        
        # AI Tagging requirements
        self.required_ai_tag_components = [
            "structured_tags",
            "semantic_tags", 
            "tag_dna",
            "effectiveness_score"
        ]
        
        # State tracking
        self.state = {
            "last_enforcement_run": None,
            "violations_detected": 0,
            "files_scanned": 0,
            "agents_validated": 0,
            "core_logic_hash": None,
            "enforcement_level": "ABSOLUTE"
        }
        
        # Setup logging
        self.setup_logging()
          # Initialize directories
        os.makedirs(os.path.dirname(self.violations_log), exist_ok=True)
        os.makedirs(os.path.dirname(self.timestamp_violations_log), exist_ok=True)
    
    def setup_logging(self):
        """Setup comprehensive logging for enforcement activities."""
        log_format = '%(asctime)s - [ENFORCER] - %(levelname)s - %(message)s'
        date_format = self.mandatory_timestamp_format.replace('_', ' ').replace('%I-%M%p', '%I:%M%p')
        
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            datefmt=date_format,
            handlers=[
                logging.FileHandler(self.agent_interactions_log, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger('MemoryLogicEnforcer')
        self.logger.info("Logic Enforcer Agent initialized - Authority Level: ABSOLUTE")
    
    def get_current_timestamp(self) -> str:
        """Generate timestamp using mandatory format."""
        return datetime.now().strftime(self.mandatory_timestamp_format)
    
    def validate_core_logic_integrity(self) -> List[str]:
        """Validate the integrity and authority of the core logic document."""
        violations = []
        
        if not os.path.exists(self.core_logic_path):
            violations.append("CRITICAL: Core logic document missing from expected location")
            return violations
        
        try:
            with open(self.core_logic_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for required headers and authority markers
            required_markers = [
                "COMMANDCORE OS - CORE LOGIC & SYSTEM GOVERNANCE",
                "Authority Level:** ABSOLUTE",
                "Builder:** Stephen Alexander",
                "DO NOT DELETE OR AUTO-EDIT WITHOUT BUILDER AUTHORIZATION"
            ]
            
            for marker in required_markers:
                if marker not in content:
                    violations.append(f"Core logic missing required authority marker: {marker}")
            
            # Verify core sections exist
            required_sections = [
                "I. FOUNDATIONAL PRINCIPLES",
                "II. MEMORY ARCHITECTURE & RETENTION POLICIES", 
                "III. AI TAGGING SYSTEM REQUIREMENTS",
                "IV. TIMESTAMP STANDARDS",
                "XI. ENFORCEMENT & VIOLATION PROTOCOLS"
            ]
            
            for section in required_sections:
                if section not in content:
                    violations.append(f"Core logic missing required section: {section}")
            
            # Calculate and store content hash for change detection
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            if self.state.get("core_logic_hash") != content_hash:
                self.state["core_logic_hash"] = content_hash
                self.logger.info(f"Core logic content hash updated: {content_hash[:16]}...")
            
        except Exception as e:
            violations.append(f"Error reading core logic document: {str(e)}")
        
        return violations
    
    def validate_timestamp_compliance(self, file_path: str) -> List[str]:
        """Validate file uses mandatory timestamp format."""
        violations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for prohibited timestamp formats
            for pattern in self.prohibited_timestamp_formats:
                if re.search(pattern, content):
                    violations.append(f"Prohibited timestamp format found in {file_path}: {pattern}")
            
            # Check for datetime.now() calls without proper format
            datetime_calls = re.findall(r'datetime\.now\(\)\.strftime\(["\']([^"\']+)["\']\)', content)
            for format_str in datetime_calls:
                if format_str != self.mandatory_timestamp_format:
                    violations.append(f"Non-compliant timestamp format in {file_path}: {format_str}")
            
        except Exception as e:
            self.logger.warning(f"Could not validate timestamps in {file_path}: {str(e)}")
        
        return violations
    
    def validate_ai_tagging_compliance(self, file_path: str) -> List[str]:
        """Validate AI tagging system compliance."""
        violations = []
        
        # Skip validation for non-memory files
        if not any(mem_type in file_path for mem_type in ['memory', 'agent']):
            return violations
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for AI tagging infrastructure usage
            if 'tag' in file_path.lower() or 'memory_' in os.path.basename(file_path):
                # Verify TagIntelligenceEngine integration
                if 'TagIntelligenceEngine' not in content and 'tag_intelligence' not in content:
                    violations.append(f"Memory agent missing AI tagging integration: {file_path}")
                
                # Check for required tag components in JSON files
                if file_path.endswith('.json'):
                    try:
                        data = json.loads(content)
                        if isinstance(data, dict) and 'tags' in data:
                            if not any(comp in str(data) for comp in self.required_ai_tag_components):
                                violations.append(f"JSON file missing AI tag components: {file_path}")
                    except json.JSONDecodeError:
                        pass  # Skip malformed JSON
            
        except Exception as e:
            self.logger.warning(f"Could not validate AI tagging in {file_path}: {str(e)}")
        
        return violations
    
    def validate_agent_autonomy(self, file_path: str) -> List[str]:
        """Validate agent autonomy requirements."""
        violations = []
        
        if not file_path.endswith('.py'):
            return violations
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for prohibited manual triggers
            for pattern in self.prohibited_manual_triggers:
                if re.search(pattern, content, re.IGNORECASE):
                    violations.append(f"Manual trigger detected in {file_path}: {pattern}")
            
            # Check for hardcoded credentials
            credential_patterns = [
                r'api_key\s*=\s*["\'][^"\']+["\']',
                r'password\s*=\s*["\'][^"\']+["\']',
                r'secret\s*=\s*["\'][^"\']+["\']'
            ]
            
            for pattern in credential_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    violations.append(f"Hardcoded credential detected in {file_path}")
            
        except Exception as e:
            self.logger.warning(f"Could not validate autonomy in {file_path}: {str(e)}")
        
        return violations    
    def validate_memory_protection(self, file_path: str) -> List[str]:
        """Validate memory protection and retention policies."""
        violations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for forbidden deletion patterns
            for pattern in self.forbidden_deletion_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    violations.append(f"Forbidden deletion operation in {file_path}: {match.group()}")
            
            # Validate protected tags are not being removed
            for tag in self.protected_tags:
                remove_patterns = [
                    rf'remove.*{re.escape(tag)}',
                    rf'delete.*{re.escape(tag)}',
                    rf'{re.escape(tag)}.*=.*null',
                    rf'{re.escape(tag)}.*=.*""'
                ]
                
                for pattern in remove_patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        violations.append(f"Protected tag removal detected in {file_path}: {tag}")
            
        except Exception as e:
            self.logger.warning(f"Could not validate memory protection in {file_path}: {str(e)}")
        
        return violations
    
    def validate_schema_management(self, file_path: str) -> List[str]:
        """Validate schema management protocol compliance."""
        violations = []
        
        if 'schema' not in file_path.lower():
            return violations
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for continuous execution patterns
            continuous_patterns = [
                r'while\s+True:',
                r'time\.sleep\([0-5]\)',  # Very short sleep intervals
                r'\.sleep\(1\)',
                r'every.*second'
            ]
            
            for pattern in continuous_patterns:
                if re.search(pattern, content):
                    violations.append(f"Schema updater continuous execution detected in {file_path}")
            
            # Check for proper path determination
            if 'os.path.abspath' not in content and 'schema' in os.path.basename(file_path):
                violations.append(f"Schema script missing proper path determination: {file_path}")
            
        except Exception as e:
            self.logger.warning(f"Could not validate schema management in {file_path}: {str(e)}")
        
        return violations
    
    def scan_file_comprehensive(self, file_path: str) -> List[str]:
        """Perform comprehensive validation of a single file."""
        all_violations = []
        
        # Run all validation checks
        all_violations.extend(self.validate_timestamp_compliance(file_path))
        all_violations.extend(self.validate_ai_tagging_compliance(file_path))
        all_violations.extend(self.validate_agent_autonomy(file_path))
        all_violations.extend(self.validate_memory_protection(file_path))
        all_violations.extend(self.validate_schema_management(file_path))
        
        return all_violations
    
    def scan_memory_system(self) -> Dict[str, List[str]]:
        """Scan the entire memory system for compliance violations."""
        self.logger.info("Starting comprehensive memory system scan...")
        
        scan_results = {
            "core_logic_violations": [],
            "file_violations": {},
            "summary": {
                "files_scanned": 0,
                "violations_found": 0,
                "protected_files_validated": 0
            }
        }        # First, validate core logic integrity
        scan_results["core_logic_violations"] = self.validate_core_logic_integrity()
        
        # Scan all relevant files - limit to memory directories only
        excluded_dirs = {".venv", "__pycache__", "env", "venv", ".git", "node_modules"}
        
        # Only scan memory-related directories to avoid timeout
        memory_scan_paths = [
            os.path.join(self.memory_root, "memory"),
            os.path.join(self.memory_root, "memory_agents")
        ]
        
        for scan_path in memory_scan_paths:
            if not os.path.exists(scan_path):
                continue
                
            for root, dirs, files in os.walk(scan_path):
                # Filter out excluded directories
                dirs[:] = [d for d in dirs if d not in excluded_dirs]
                
                for file in files:
                    if file.endswith(('.py', '.json', '.md')):
                        file_path = os.path.join(root, file)
                    
                    try:
                        violations = self.scan_file_comprehensive(file_path)
                        if violations:
                            scan_results["file_violations"][file_path] = violations
                            scan_results["summary"]["violations_found"] += len(violations)
                        
                        scan_results["summary"]["files_scanned"] += 1
                        
                        # Track protected files
                        if any(protected in file_path for protected in self.protected_directories):
                            scan_results["summary"]["protected_files_validated"] += 1
                            
                    except Exception as e:
                        self.logger.error(f"Error scanning {file_path}: {str(e)}")
        
        self.logger.info(f"Scan complete: {scan_results['summary']['files_scanned']} files scanned, "
                        f"{scan_results['summary']['violations_found']} violations found")
        
        return scan_results
    
    def log_violation(self, violation_type: str, details: str, file_path: str = None):
        """Log a violation with full context."""
        violation_entry = {
            "timestamp": self.get_current_timestamp(),
            "type": violation_type,
            "details": details,
            "file_path": file_path,
            "severity": "HIGH" if "CRITICAL" in details else "MEDIUM",
            "enforcer_version": "2.0"
        }
        
        # Load existing violations
        violations_data = []
        if os.path.exists(self.violations_log):
            try:
                with open(self.violations_log, 'r', encoding='utf-8') as f:
                    violations_data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                violations_data = []
        
        # Add new violation
        violations_data.append(violation_entry)
        
        # Save updated violations
        with open(self.violations_log, 'w', encoding='utf-8') as f:
            json.dump(violations_data, f, indent=2, ensure_ascii=False)
        
        # Also log to main interaction log
        self.logger.warning(f"VIOLATION [{violation_type}]: {details}")
    
    def attempt_auto_correction(self, violation: str, file_path: str) -> bool:
        """Attempt automatic correction of violations where safe."""
        corrected = False
        
        try:
            # Auto-correct timestamp format violations
            if "timestamp format" in violation.lower() and file_path.endswith('.py'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace common timestamp format violations
                corrections = {
                    r'datetime\.now\(\)\.strftime\(["\']%Y-%m-%d %H:%M:%S["\']\)': 
                        f'datetime.now().strftime("{self.mandatory_timestamp_format}")',
                    r'datetime\.now\(\)\.strftime\(["\']%m/%d - %I:%M%p["\']\)':
                        f'datetime.now().strftime("{self.mandatory_timestamp_format}")'
                }
                
                original_content = content
                for pattern, replacement in corrections.items():
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    # Create backup before modification
                    backup_path = f"{file_path}.backup_{self.get_current_timestamp()}"
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(original_content)
                    
                    # Apply correction
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    self.logger.info(f"Auto-corrected timestamp format in {file_path}")
                    corrected = True
            
        except Exception as e:
            self.logger.error(f"Auto-correction failed for {file_path}: {str(e)}")
        
        return corrected    
    def enforce_system_wide_compliance(self) -> Dict[str, Any]:
        """Execute comprehensive system-wide enforcement."""
        self.logger.info("=== STARTING SYSTEM-WIDE COMPLIANCE ENFORCEMENT ===")
        
        # Update state
        self.state["last_enforcement_run"] = self.get_current_timestamp()
        self.state["files_scanned"] = 0
        self.state["violations_detected"] = 0
        
        # Perform comprehensive scan
        scan_results = self.scan_memory_system()
        
        # Process results and attempt corrections
        enforcement_summary = {
            "scan_timestamp": self.get_current_timestamp(),
            "core_logic_status": "VALID" if not scan_results["core_logic_violations"] else "VIOLATIONS_DETECTED",
            "files_scanned": scan_results["summary"]["files_scanned"],
            "violations_found": scan_results["summary"]["violations_found"],
            "auto_corrections_attempted": 0,
            "auto_corrections_successful": 0,
            "critical_violations": [],
            "enforcement_actions": []
        }
        
        # Handle core logic violations (critical)
        for violation in scan_results["core_logic_violations"]:
            self.log_violation("CORE_LOGIC_INTEGRITY", violation)
            enforcement_summary["critical_violations"].append(violation)
            self.logger.critical(f"CORE LOGIC VIOLATION: {violation}")
        
        # Handle file violations
        for file_path, violations in scan_results["file_violations"].items():
            for violation in violations:
                self.log_violation("FILE_COMPLIANCE", violation, file_path)
                
                # Attempt auto-correction for non-critical violations
                if "timestamp format" in violation.lower():
                    enforcement_summary["auto_corrections_attempted"] += 1
                    if self.attempt_auto_correction(violation, file_path):
                        enforcement_summary["auto_corrections_successful"] += 1
                        enforcement_summary["enforcement_actions"].append(f"Auto-corrected: {violation}")
                
                # Flag critical violations
                if any(term in violation.lower() for term in ["deletion", "protected", "critical"]):
                    enforcement_summary["critical_violations"].append(f"{file_path}: {violation}")
        
        # Update state with results
        self.state["files_scanned"] = enforcement_summary["files_scanned"]
        self.state["violations_detected"] = enforcement_summary["violations_found"]
        
        # Save state
        self.save_state()
        
        # Generate enforcement report
        self.generate_enforcement_report(enforcement_summary)
        
        self.logger.info("=== ENFORCEMENT COMPLETE ===")
        return enforcement_summary
    
    def validate_agent_action(self, agent_name: str, action: str, context: Dict[str, Any] = None) -> Tuple[bool, List[str]]:
        """Validate an agent action against core logic rules."""
        violations = []
        
        # Check for prohibited operations
        for pattern in self.forbidden_deletion_patterns:
            if re.search(pattern, action, re.IGNORECASE):
                violations.append(f"Agent {agent_name} attempted forbidden deletion: {action}")
        
        # Check for protected tag modifications
        if context and "tags" in str(context):
            for tag in self.protected_tags:
                if tag in str(context) and "remove" in action.lower():
                    violations.append(f"Agent {agent_name} attempted to remove protected tag: {tag}")
        
        # Check for timestamp format compliance
        if "timestamp" in action.lower() or "strftime" in action:
            if self.mandatory_timestamp_format not in action:
                violations.append(f"Agent {agent_name} using non-compliant timestamp format")
        
        # Log validation attempt
        self.logger.info(f"Validated action for {agent_name}: {action[:50]}...")
        
        if violations:
            for violation in violations:
                self.log_violation("AGENT_ACTION_VIOLATION", violation)
        
        return len(violations) == 0, violations
    
    def block_agent_action(self, agent_name: str, action: str, violations: List[str]):
        """Block an agent action and log the enforcement."""
        self.logger.warning(f"BLOCKING ACTION from {agent_name}: {action}")
        
        enforcement_entry = {
            "timestamp": self.get_current_timestamp(),
            "action": "BLOCK_AGENT_ACTION",
            "agent": agent_name,
            "blocked_action": action,
            "violations": violations,
            "enforcer_authority": "ABSOLUTE"
        }
        
        # Log to agent interactions
        with open(self.agent_interactions_log, 'a', encoding='utf-8') as f:
            f.write(f"\n[{self.get_current_timestamp()}] ENFORCEMENT ACTION: {json.dumps(enforcement_entry, indent=2)}\n")
        
        raise PermissionError(f"Action blocked by Logic Enforcer. Violations: {'; '.join(violations)}")
    
    def generate_enforcement_report(self, summary: Dict[str, Any]):
        """Generate a detailed enforcement report."""
        report_path = os.path.join(os.path.dirname(__file__), f"enforcement_report_{self.get_current_timestamp()}.md")
        
        report_content = f"""# COMMANDCORE MEMORY SYSTEM - ENFORCEMENT REPORT

**Report Generated:** {summary['scan_timestamp']}  
**Enforcer Version:** 2.0  
**Authority Level:** ABSOLUTE  
**Core Logic Version:** 2.0

---

## ENFORCEMENT SUMMARY

- **Files Scanned:** {summary['files_scanned']}
- **Violations Found:** {summary['violations_found']}
- **Core Logic Status:** {summary['core_logic_status']}
- **Auto-Corrections Attempted:** {summary['auto_corrections_attempted']}
- **Auto-Corrections Successful:** {summary['auto_corrections_successful']}

---

## CRITICAL VIOLATIONS

"""
        
        if summary['critical_violations']:
            for violation in summary['critical_violations']:
                report_content += f"- ❌ **CRITICAL:** {violation}\n"
        else:
            report_content += "[OK] No critical violations detected.\n"
        
        report_content += f"""

---

## ENFORCEMENT ACTIONS TAKEN

"""
        
        if summary['enforcement_actions']:
            for action in summary['enforcement_actions']:
                report_content += f"- [FIXED] {action}\n"
        else:
            report_content += "No automatic enforcement actions were required.\n"
        
        report_content += f"""

---

## RECOMMENDATIONS

- Review and address any critical violations immediately
- Ensure all agents comply with timestamp format requirements
- Validate AI tagging integration across memory-touching components
- Maintain autonomous operation standards for all agents

---

**Report Authority:** Stephen Alexander (System Builder)  
**Next Enforcement Scan:** {datetime.now().strftime(self.mandatory_timestamp_format)}  
**Tags:** #corelogic #enforcement #systemaudit #builderintent

"""
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        self.logger.info(f"Enforcement report generated: {report_path}")
    
    def save_state(self):
        """Save current agent state."""
        state_file = os.path.join(os.path.dirname(__file__), "memory_logic_enforcer_agent_state.json")
        
        with open(state_file, 'w', encoding='utf-8') as f:
            json.dump({
                "agent_name": "memory_logic_enforcer_agent",
                "version": "2.0",
                "state": "active",
                "last_run": self.state["last_enforcement_run"],
                "violations_detected": self.state["violations_detected"],
                "files_scanned": self.state["files_scanned"],
                "agents_validated": self.state["agents_validated"],
                "core_logic_hash": self.state["core_logic_hash"],
                "enforcement_level": self.state["enforcement_level"],
                "compliance_status": "ENFORCING" if self.state["violations_detected"] > 0 else "COMPLIANT"
            }, f, indent=2)
    
    def run_enforcement_cycle(self):
        """Run a complete enforcement cycle."""
        try:
            return self.enforce_system_wide_compliance()
        except Exception as e:
            self.logger.error(f"Enforcement cycle failed: {str(e)}")
            raise
    
    def start_monitoring(self, interval_minutes: int = 60):
        """Start continuous monitoring mode."""
        self.logger.info(f"Starting continuous monitoring (interval: {interval_minutes} minutes)")
        
        while True:
            try:
                self.run_enforcement_cycle()
                time.sleep(interval_minutes * 60)
            except KeyboardInterrupt:
                self.logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                self.logger.error(f"Monitoring error: {str(e)}")
                time.sleep(60)  # Wait 1 minute before retrying


# Main execution
if __name__ == "__main__":
    enforcer = MemoryLogicEnforcerAgent()
    
    # Run enforcement based on command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "monitor":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
            enforcer.start_monitoring(interval)
        elif sys.argv[1] == "validate":
            if len(sys.argv) > 3:
                agent_name, action = sys.argv[2], sys.argv[3]
                is_valid, violations = enforcer.validate_agent_action(agent_name, action)
                if not is_valid:
                    enforcer.block_agent_action(agent_name, action, violations)
                else:
                    print(f"Action validated for {agent_name}")
            else:
                print("Usage: python memory_logic_enforcer_agent.py validate <agent_name> <action>")
        else:
            print("Usage: python memory_logic_enforcer_agent.py [monitor|validate] [args...]")
    else:
        # Default: run single enforcement cycle
        results = enforcer.run_enforcement_cycle()
        print(f"\nEnforcement complete. Scanned {results['files_scanned']} files, "
              f"found {results['violations_found']} violations.")
        sys.exit(0)
