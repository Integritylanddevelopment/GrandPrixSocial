#!/usr/bin/env python3
"""
Build Error Corrector - Automated error detection and fixing for CI/CD pipeline
Analyzes build logs and applies common fixes for Next.js, TypeScript, and React errors
"""

import os
import re
import json
import logging
import subprocess
from typing import Dict, List, Tuple, Optional
from pathlib import Path

class BuildErrorCorrector:
    """
    Intelligent build error analyzer and auto-corrector
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.logger = logging.getLogger('BuildErrorCorrector')
        
        # Common error patterns and their fixes
        self.error_patterns = self._initialize_error_patterns()
        
        # File patterns for different types of fixes
        self.file_patterns = {
            'typescript': ['**/*.ts', '**/*.tsx'],
            'javascript': ['**/*.js', '**/*.jsx'],
            'config': ['**/*.json', '**/*.config.js', '**/*.config.ts'],
            'styles': ['**/*.css', '**/*.scss', '**/*.module.css']
        }
    
    def _initialize_error_patterns(self) -> Dict:
        """Initialize common error patterns and their automatic fixes"""
        return {
            'typescript_errors': [
                {
                    'pattern': r"Cannot find module '([^']+)' or its corresponding type declarations",
                    'fix_type': 'missing_import',
                    'description': 'Missing module import'
                },
                {
                    'pattern': r"Property '([^']+)' does not exist on type '([^']+)'",
                    'fix_type': 'property_error',
                    'description': 'Missing property or type mismatch'
                },
                {
                    'pattern': r"Argument of type '([^']+)' is not assignable to parameter of type '([^']+)'",
                    'fix_type': 'type_mismatch',
                    'description': 'Type assignment error'
                },
                {
                    'pattern': r"Object is possibly 'undefined'",
                    'fix_type': 'undefined_check',
                    'description': 'Undefined object access'
                }
            ],
            'react_errors': [
                {
                    'pattern': r"React Hook .* is called conditionally",
                    'fix_type': 'hook_conditional',
                    'description': 'Conditional hook usage'
                },
                {
                    'pattern': r"React Hook .* has a missing dependency: '([^']+)'",
                    'fix_type': 'hook_dependency',
                    'description': 'Missing hook dependency'
                },
                {
                    'pattern': r"'([^']+)' is not defined",
                    'fix_type': 'undefined_variable',
                    'description': 'Undefined variable or import'
                }
            ],
            'nextjs_errors': [
                {
                    'pattern': r"Module not found: Can't resolve '([^']+)'",
                    'fix_type': 'module_resolution',
                    'description': 'Module resolution error'
                },
                {
                    'pattern': r"Cannot resolve dependency '([^']+)'",
                    'fix_type': 'dependency_missing',
                    'description': 'Missing dependency'
                }
            ],
            'syntax_errors': [
                {
                    'pattern': r"Unexpected token '([^']+)'",
                    'fix_type': 'syntax_error',
                    'description': 'Syntax error'
                },
                {
                    'pattern': r"Expected .* but found .*",
                    'fix_type': 'syntax_expected',
                    'description': 'Syntax expectation error'
                }
            ]
        }
    
    def auto_correct_build_errors(self, build_logs: List[str]) -> Dict:
        """
        Analyze build logs and attempt automatic error correction
        Returns: Result of correction attempts
        """
        self.logger.info("🔧 Starting automatic error correction")
        
        try:
            # Parse errors from build logs
            parsed_errors = self._parse_build_errors(build_logs)
            
            if not parsed_errors:
                return {
                    "fixed": False,
                    "reason": "No correctable errors found in build logs",
                    "errors_found": 0
                }
            
            self.logger.info(f"Found {len(parsed_errors)} correctable errors")
            
            # Attempt fixes for each error
            fixes_applied = []
            successful_fixes = 0
            
            for error in parsed_errors:
                fix_result = self._apply_error_fix(error)
                fixes_applied.append(fix_result)
                
                if fix_result.get("success"):
                    successful_fixes += 1
            
            # If we fixed any errors, commit the changes
            if successful_fixes > 0:
                commit_result = self._commit_auto_fixes(fixes_applied, successful_fixes)
                
                return {
                    "fixed": True,
                    "fixes_applied": successful_fixes,
                    "total_errors": len(parsed_errors),
                    "commit_result": commit_result,
                    "fixes_details": fixes_applied
                }
            else:
                return {
                    "fixed": False,
                    "reason": "No fixes could be automatically applied",
                    "errors_found": len(parsed_errors),
                    "fixes_details": fixes_applied
                }
                
        except Exception as e:
            self.logger.error(f"Auto-correction failed: {e}")
            return {
                "fixed": False,
                "reason": f"Auto-correction failed: {str(e)}",
                "error": str(e)
            }
    
    def _parse_build_errors(self, build_logs: List[str]) -> List[Dict]:
        """Parse build logs to extract correctable errors"""
        errors = []
        
        for log_entry in build_logs:
            # Extract file path and error details
            file_match = re.search(r'([^\s]+\.(ts|tsx|js|jsx)):(\d+):(\d+)', log_entry)
            
            if file_match:
                file_path = file_match.group(1)
                line_number = int(file_match.group(3))
                column_number = int(file_match.group(4))
                
                # Check against error patterns
                for category, patterns in self.error_patterns.items():
                    for pattern_info in patterns:
                        if re.search(pattern_info['pattern'], log_entry):
                            errors.append({
                                'file_path': file_path,
                                'line_number': line_number,
                                'column_number': column_number,
                                'category': category,
                                'fix_type': pattern_info['fix_type'],
                                'description': pattern_info['description'],
                                'original_log': log_entry,
                                'pattern_match': re.search(pattern_info['pattern'], log_entry)
                            })
                            break
        
        return errors
    
    def _apply_error_fix(self, error: Dict) -> Dict:
        """Apply automatic fix for a specific error"""
        fix_type = error.get('fix_type')
        file_path = os.path.join(self.project_path, error.get('file_path', ''))
        
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "error_type": fix_type,
                    "reason": f"File not found: {file_path}",
                    "file_path": file_path
                }
            
            # Apply specific fix based on error type
            if fix_type == 'missing_import':
                return self._fix_missing_import(error, file_path)
            elif fix_type == 'undefined_check':
                return self._fix_undefined_check(error, file_path)
            elif fix_type == 'hook_dependency':
                return self._fix_hook_dependency(error, file_path)
            elif fix_type == 'type_mismatch':
                return self._fix_type_mismatch(error, file_path)
            elif fix_type == 'undefined_variable':
                return self._fix_undefined_variable(error, file_path)
            else:
                return {
                    "success": False,
                    "error_type": fix_type,
                    "reason": f"No auto-fix available for {fix_type}",
                    "file_path": file_path
                }
                
        except Exception as e:
            self.logger.error(f"Fix application failed for {fix_type}: {e}")
            return {
                "success": False,
                "error_type": fix_type,
                "reason": f"Fix failed: {str(e)}",
                "file_path": file_path
            }
    
    def _fix_missing_import(self, error: Dict, file_path: str) -> Dict:
        """Fix missing import errors by adding common imports"""
        try:
            pattern_match = error.get('pattern_match')
            if not pattern_match:
                return {"success": False, "reason": "No pattern match found"}
            
            missing_module = pattern_match.group(1)
            
            # Common import fixes
            import_fixes = {
                'react': "import React from 'react';",
                '@/': "// Add appropriate import for local module",
                'next/': "// Add Next.js import",
                'uuid': "import { v4 as uuidv4 } from 'uuid';",
                'classnames': "import classNames from 'classnames';"
            }
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add import if we know how to fix it
            for module_pattern, import_statement in import_fixes.items():
                if module_pattern in missing_module:
                    # Add import at the top after existing imports
                    lines = content.split('\n')
                    
                    # Find where to insert import
                    insert_index = 0
                    for i, line in enumerate(lines):
                        if line.strip().startswith('import ') or line.strip().startswith('from '):
                            insert_index = i + 1
                        elif line.strip() and not line.strip().startswith('//'):
                            break
                    
                    # Insert import
                    lines.insert(insert_index, import_statement)
                    
                    # Write back to file
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(lines))
                    
                    return {
                        "success": True,
                        "error_type": "missing_import",
                        "fix_applied": f"Added import: {import_statement}",
                        "file_path": file_path
                    }
            
            return {"success": False, "reason": f"No known fix for module: {missing_module}"}
            
        except Exception as e:
            return {"success": False, "reason": f"Import fix failed: {str(e)}"}
    
    def _fix_undefined_check(self, error: Dict, file_path: str) -> Dict:
        """Fix 'Object is possibly undefined' errors by adding null checks"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            line_number = error.get('line_number', 1)
            if line_number <= len(lines):
                line = lines[line_number - 1]
                
                # Look for object access patterns and add optional chaining
                if '.' in line and '?.' not in line:
                    # Add optional chaining where appropriate
                    fixed_line = re.sub(r'(\w+)\.(\w+)', r'\1?.\2', line)
                    
                    if fixed_line != line:
                        lines[line_number - 1] = fixed_line
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.writelines(lines)
                        
                        return {
                            "success": True,
                            "error_type": "undefined_check",
                            "fix_applied": "Added optional chaining (?.) operator",
                            "file_path": file_path,
                            "line_number": line_number
                        }
            
            return {"success": False, "reason": "Could not apply undefined check fix"}
            
        except Exception as e:
            return {"success": False, "reason": f"Undefined check fix failed: {str(e)}"}
    
    def _fix_hook_dependency(self, error: Dict, file_path: str) -> Dict:
        """Fix React hook dependency warnings"""
        try:
            pattern_match = error.get('pattern_match')
            if not pattern_match:
                return {"success": False, "reason": "No pattern match found"}
            
            missing_dep = pattern_match.group(1)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find useEffect with missing dependency
            useEffect_pattern = r'useEffect\s*\([^,]+,\s*\[([^\]]*)\]\s*\)'
            matches = re.finditer(useEffect_pattern, content)
            
            for match in matches:
                deps = match.group(1).strip()
                
                # Add missing dependency
                if missing_dep not in deps:
                    if deps:
                        new_deps = f"{deps}, {missing_dep}"
                    else:
                        new_deps = missing_dep
                    
                    new_effect = match.group(0).replace(f'[{deps}]', f'[{new_deps}]')
                    content = content.replace(match.group(0), new_effect)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    return {
                        "success": True,
                        "error_type": "hook_dependency",
                        "fix_applied": f"Added missing dependency: {missing_dep}",
                        "file_path": file_path
                    }
            
            return {"success": False, "reason": "Could not locate useEffect to fix"}
            
        except Exception as e:
            return {"success": False, "reason": f"Hook dependency fix failed: {str(e)}"}
    
    def _fix_type_mismatch(self, error: Dict, file_path: str) -> Dict:
        """Fix common type mismatch errors"""
        try:
            # This is complex and would require sophisticated type analysis
            # For now, we'll just log that we found it but can't auto-fix
            return {
                "success": False,
                "error_type": "type_mismatch",
                "reason": "Type mismatch requires manual intervention",
                "file_path": file_path,
                "suggestion": "Review type definitions and ensure proper type casting"
            }
            
        except Exception as e:
            return {"success": False, "reason": f"Type mismatch fix failed: {str(e)}"}
    
    def _fix_undefined_variable(self, error: Dict, file_path: str) -> Dict:
        """Fix undefined variable errors by adding common variable definitions"""
        try:
            pattern_match = error.get('pattern_match')
            if not pattern_match:
                return {"success": False, "reason": "No pattern match found"}
            
            undefined_var = pattern_match.group(1)
            
            # Common undefined variable fixes
            var_fixes = {
                'process': "// Add process type declaration or use typeof window !== 'undefined'",
                'window': "if (typeof window !== 'undefined') { /* use window here */ }",
                'document': "if (typeof document !== 'undefined') { /* use document here */ }",
                'localStorage': "if (typeof localStorage !== 'undefined') { /* use localStorage here */ }"
            }
            
            if undefined_var in var_fixes:
                # This would require more sophisticated code analysis to implement properly
                return {
                    "success": False,
                    "error_type": "undefined_variable", 
                    "reason": "Undefined variable requires manual fix",
                    "suggestion": var_fixes[undefined_var],
                    "file_path": file_path
                }
            
            return {"success": False, "reason": f"No known fix for undefined variable: {undefined_var}"}
            
        except Exception as e:
            return {"success": False, "reason": f"Undefined variable fix failed: {str(e)}"}
    
    def _commit_auto_fixes(self, fixes_applied: List[Dict], successful_fixes: int) -> Dict:
        """Commit automatically applied fixes"""
        try:
            os.chdir(self.project_path)
            
            # Stage the fixed files
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Create commit message
            commit_message = f"Auto-fix: Resolve {successful_fixes} build errors\n\n"
            
            for fix in fixes_applied:
                if fix.get("success"):
                    fix_applied = fix.get("fix_applied", "Unknown fix")
                    file_path = fix.get("file_path", "Unknown file")
                    commit_message += f"- {fix_applied} in {os.path.basename(file_path)}\n"
            
            commit_message += "\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
            
            # Commit the fixes
            result = subprocess.run([
                'git', 'commit', '-m', commit_message
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.logger.info(f"✅ Auto-fixes committed successfully")
                
                return {
                    "success": True,
                    "commit_hash": self._get_latest_commit_hash(),
                    "message": commit_message
                }
            else:
                return {
                    "success": False,
                    "error": f"Commit failed: {result.stderr}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Commit failed: {str(e)}"
            }
    
    def _get_latest_commit_hash(self) -> str:
        """Get the hash of the latest commit"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()[:8]
            return "unknown"
        except Exception:
            return "unknown"
    
    def analyze_build_errors(self, build_logs: List[str]) -> Dict:
        """
        Analyze build errors without applying fixes
        Returns: Detailed error analysis
        """
        try:
            parsed_errors = self._parse_build_errors(build_logs)
            
            # Categorize errors
            error_categories = {}
            for error in parsed_errors:
                category = error.get('category', 'unknown')
                if category not in error_categories:
                    error_categories[category] = []
                error_categories[category].append(error)
            
            # Determine fixability
            auto_fixable = 0
            manual_fixes_needed = 0
            
            for error in parsed_errors:
                fix_type = error.get('fix_type')
                if fix_type in ['missing_import', 'undefined_check', 'hook_dependency']:
                    auto_fixable += 1
                else:
                    manual_fixes_needed += 1
            
            return {
                "total_errors": len(parsed_errors),
                "auto_fixable": auto_fixable,
                "manual_fixes_needed": manual_fixes_needed,
                "error_categories": {k: len(v) for k, v in error_categories.items()},
                "detailed_errors": parsed_errors[:10],  # Return first 10 for analysis
                "analysis_complete": True
            }
            
        except Exception as e:
            return {
                "analysis_complete": False,
                "error": f"Error analysis failed: {str(e)}"
            }

def main():
    """Standalone testing for error corrector"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Build Error Corrector')
    parser.add_argument('action', choices=['analyze', 'fix'])
    parser.add_argument('--logs-file', help='Path to build logs file')
    parser.add_argument('--project-path', help='Project directory path')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    project_path = args.project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
    corrector = BuildErrorCorrector(project_path)
    
    # Load build logs
    if args.logs_file and os.path.exists(args.logs_file):
        with open(args.logs_file, 'r') as f:
            build_logs = f.readlines()
    else:
        build_logs = [
            "src/components/Example.tsx:15:5 - error TS2339: Property 'name' does not exist on type 'User'.",
            "src/utils/helper.js:22:10 - error: 'React' is not defined.",
            "src/hooks/useData.ts:8:3 - React Hook useEffect has a missing dependency: 'userId'"
        ]
    
    if args.action == 'analyze':
        result = corrector.analyze_build_errors(build_logs)
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'fix':
        result = corrector.auto_correct_build_errors(build_logs)
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()