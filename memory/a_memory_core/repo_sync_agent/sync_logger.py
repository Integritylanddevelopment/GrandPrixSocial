#!/usr/bin/env python3
"""
Sync Logger - Comprehensive logging and reporting system for repo sync operations
Provides structured logging, report generation, and historical tracking
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime, timedelta
import shutil

class SyncLogger:
    """
    Enterprise-grade logging system for repo sync operations
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.log_dir = os.path.join(
            project_path, "memory", "a_memory_core", 
            "repo_sync_agent", "logs"
        )
        
        # Ensure log directory exists
        os.makedirs(self.log_dir, exist_ok=True)
        
        # Log file paths
        self.pipeline_log = os.path.join(self.log_dir, "pipeline_history.json")
        self.health_log = os.path.join(self.log_dir, "health_checks.json")
        self.error_log = os.path.join(self.log_dir, "errors.json") 
        self.performance_log = os.path.join(self.log_dir, "performance.json")
        self.deployment_log = os.path.join(self.log_dir, "deployments.json")
        
        # Legacy log files (for migration)
        self.legacy_sync_reports = os.path.join(
            project_path, "memory", "a_memory_core", 
            "repo_sync_agent", "sync_reports.log"
        )
        self.legacy_sync_history = os.path.join(
            project_path, "memory", "a_memory_core", 
            "repo_sync_agent", "sync_history.json"
        )
        
        # Setup structured logging
        self._setup_structured_logging()
        
        # Migrate legacy logs if they exist
        self._migrate_legacy_logs()
    
    def _setup_structured_logging(self):
        """Setup structured logging with multiple handlers"""
        # Create logger
        self.logger = logging.getLogger('SyncLogger')
        self.logger.setLevel(logging.INFO)
        
        # Prevent duplicate handlers
        if self.logger.handlers:
            return
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # File handler for detailed logs
        file_handler = logging.FileHandler(
            os.path.join(self.log_dir, "sync_agent.log")
        )
        file_handler.setLevel(logging.DEBUG)
        
        # JSON file handler for structured data
        json_handler = logging.FileHandler(
            os.path.join(self.log_dir, "structured.log")
        )
        json_handler.setLevel(logging.INFO)
        
        # Formatters
        console_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        console_handler.setFormatter(console_format)
        file_handler.setFormatter(file_format)
        json_handler.setFormatter(file_format)
        
        # Add handlers
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(json_handler)
    
    def _migrate_legacy_logs(self):
        """Migrate legacy log files to new structured format"""
        try:
            # Migrate sync_history.json if it exists
            if os.path.exists(self.legacy_sync_history):
                with open(self.legacy_sync_history, 'r') as f:
                    legacy_data = json.load(f)
                
                # Convert to new format
                migrated_entries = []
                for entry in legacy_data:
                    migrated_entry = {
                        "timestamp": entry.get("timestamp", time.time()),
                        "type": "pipeline_execution",
                        "commit_hash": entry.get("commit_hash"),
                        "commit_message": entry.get("commit_message"),
                        "files_changed": entry.get("files_changed", 0),
                        "significance": entry.get("significance", "unknown"),
                        "deployment_status": entry.get("deployment_status", {}),
                        "migrated_from": "legacy_sync_history"
                    }
                    migrated_entries.append(migrated_entry)
                
                # Save to new pipeline log
                self._append_to_json_log(self.pipeline_log, migrated_entries)
                
                # Backup and remove legacy file
                backup_path = f"{self.legacy_sync_history}.backup"
                shutil.copy2(self.legacy_sync_history, backup_path)
                os.remove(self.legacy_sync_history)
                
                self.logger.info(f"Migrated {len(migrated_entries)} entries from legacy sync history")
            
            # Migrate sync_reports.log if it exists
            if os.path.exists(self.legacy_sync_reports):
                backup_path = f"{self.legacy_sync_reports}.backup"
                shutil.copy2(self.legacy_sync_reports, backup_path)
                # Keep the original for now as it's human-readable
                
                self.logger.info("Legacy sync reports backed up")
                
        except Exception as e:
            self.logger.error(f"Legacy log migration failed: {e}")
    
    def log_pipeline_execution(self, pipeline_result: Dict) -> None:
        """Log complete pipeline execution with all details"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "type": "pipeline_execution",
                "pipeline_success": pipeline_result.get("pipeline_success", False),
                "pipeline_duration": pipeline_result.get("pipeline_duration", 0),
                "commit_hash": pipeline_result.get("commit_hash"),
                "commit_message": pipeline_result.get("commit_message"),
                "files_changed": pipeline_result.get("files_changed", 0),
                "change_significance": pipeline_result.get("change_significance", "unknown"),
                "deployment_status": pipeline_result.get("deployment_status"),
                "deployment_url": pipeline_result.get("deployment_url"),
                "build_duration": pipeline_result.get("build_duration", 0),
                "stage": pipeline_result.get("stage"),
                "error": pipeline_result.get("error")
            }
            
            self._append_to_json_log(self.pipeline_log, [log_entry])
            
            # Also log to deployment-specific log
            if pipeline_result.get("deployment_status"):
                deployment_entry = {
                    "timestamp": time.time(),
                    "commit_hash": pipeline_result.get("commit_hash"),
                    "deployment_status": pipeline_result.get("deployment_status"),
                    "deployment_url": pipeline_result.get("deployment_url"),
                    "build_duration": pipeline_result.get("build_duration", 0),
                    "success": pipeline_result.get("pipeline_success", False)
                }
                self._append_to_json_log(self.deployment_log, [deployment_entry])
            
            # Log performance metrics
            if pipeline_result.get("pipeline_duration"):
                perf_entry = {
                    "timestamp": time.time(),
                    "type": "pipeline_performance",
                    "total_duration": pipeline_result.get("pipeline_duration", 0),
                    "build_duration": pipeline_result.get("build_duration", 0),
                    "files_changed": pipeline_result.get("files_changed", 0),
                    "success": pipeline_result.get("pipeline_success", False)
                }
                self._append_to_json_log(self.performance_log, [perf_entry])
            
            # Generate human-readable report
            self._generate_pipeline_report(pipeline_result)
            
            self.logger.info(f"Pipeline execution logged: {pipeline_result.get('commit_hash', 'unknown')}")
            
        except Exception as e:
            self.logger.error(f"Failed to log pipeline execution: {e}")
    
    def log_health_check(self, health_result: Dict) -> None:
        """Log health check results"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "type": "health_check",
                "overall_status": health_result.get("overall_status", "unknown"),
                "checks_completed": health_result.get("checks_completed", 0),
                "checks_passed": health_result.get("checks_passed", 0),
                "checks_failed": health_result.get("checks_failed", 0),
                "critical_issues": health_result.get("critical_issues", []),
                "warnings": health_result.get("warnings", []),
                "health_check_duration": health_result.get("health_check_duration", 0),
                "detailed_results": health_result.get("detailed_results", {})
            }
            
            self._append_to_json_log(self.health_log, [log_entry])
            
            self.logger.info(f"Health check logged: {health_result.get('overall_status', 'unknown')}")
            
        except Exception as e:
            self.logger.error(f"Failed to log health check: {e}")
    
    def log_error(self, error_type: str, error_message: str, context: Dict = None) -> None:
        """Log error with context"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "type": "error",
                "error_type": error_type,
                "error_message": error_message,
                "context": context or {},
                "severity": self._determine_error_severity(error_type, error_message)
            }
            
            self._append_to_json_log(self.error_log, [log_entry])
            
            self.logger.error(f"Error logged: [{error_type}] {error_message}")
            
        except Exception as e:
            self.logger.error(f"Failed to log error: {e}")
    
    def log_build_error_correction(self, correction_result: Dict) -> None:
        """Log build error correction attempts"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "type": "error_correction",
                "fixed": correction_result.get("fixed", False),
                "fixes_applied": correction_result.get("fixes_applied", 0),
                "total_errors": correction_result.get("total_errors", 0),
                "fixes_details": correction_result.get("fixes_details", []),
                "commit_result": correction_result.get("commit_result", {})
            }
            
            self._append_to_json_log(self.error_log, [log_entry])
            
            status = "successful" if correction_result.get("fixed") else "failed"
            self.logger.info(f"Error correction logged: {status}")
            
        except Exception as e:
            self.logger.error(f"Failed to log error correction: {e}")
    
    def log_vercel_monitoring(self, monitoring_result: Dict) -> None:
        """Log Vercel deployment monitoring results"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "type": "vercel_monitoring",
                "deployment_id": monitoring_result.get("deployment_id"),
                "status": monitoring_result.get("status"),
                "build_duration": monitoring_result.get("build_duration", 0),
                "url": monitoring_result.get("url"),
                "build_logs": monitoring_result.get("build_logs", [])[:10],  # First 10 logs only
                "needs_claude_fix": monitoring_result.get("needs_claude_fix", False)
            }
            
            self._append_to_json_log(self.deployment_log, [log_entry])
            
            self.logger.info(f"Vercel monitoring logged: {monitoring_result.get('status', 'unknown')}")
            
        except Exception as e:
            self.logger.error(f"Failed to log Vercel monitoring: {e}")
    
    def _append_to_json_log(self, log_file: str, entries: List[Dict]) -> None:
        """Append entries to JSON log file"""
        try:
            # Load existing data
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = []
            
            # Add new entries
            data.extend(entries)
            
            # Keep only last 500 entries to prevent file bloat
            if len(data) > 500:
                data = data[-500:]
            
            # Save back to file
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
                
        except Exception as e:
            self.logger.error(f"Failed to append to JSON log {log_file}: {e}")
    
    def _determine_error_severity(self, error_type: str, error_message: str) -> str:
        """Determine error severity based on type and message"""
        critical_keywords = ['failed', 'fatal', 'crash', 'exception', 'broken']
        warning_keywords = ['warn', 'deprecated', 'timeout', 'slow']
        
        error_text = f"{error_type} {error_message}".lower()
        
        if any(keyword in error_text for keyword in critical_keywords):
            return "critical"
        elif any(keyword in error_text for keyword in warning_keywords):
            return "warning"
        else:
            return "info"
    
    def _generate_pipeline_report(self, pipeline_result: Dict) -> None:
        """Generate human-readable pipeline report"""
        try:
            report_file = os.path.join(self.log_dir, "latest_pipeline_report.txt")
            
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
            success = pipeline_result.get("pipeline_success", False)
            
            report_content = f"""
===============================================================================
REPO SYNC AGENT - PIPELINE EXECUTION REPORT
===============================================================================
Timestamp: {timestamp}
Status: {'✅ SUCCESS' if success else '❌ FAILED'}
Duration: {pipeline_result.get('pipeline_duration', 0)}s

GIT OPERATIONS:
- Commit: {pipeline_result.get('commit_hash', 'N/A')}
- Files Changed: {pipeline_result.get('files_changed', 0)}
- Significance: {pipeline_result.get('change_significance', 'unknown').upper()}
- Message: {pipeline_result.get('commit_message', 'N/A')}

DEPLOYMENT:
- Status: {pipeline_result.get('deployment_status', 'unknown').upper()}
- Build Duration: {pipeline_result.get('build_duration', 0)}s
- URL: {pipeline_result.get('deployment_url', 'N/A')}

"""
            
            if not success:
                error = pipeline_result.get('error', 'Unknown error')
                stage = pipeline_result.get('stage', 'Unknown stage')
                report_content += f"""ERROR DETAILS:
- Stage: {stage}
- Error: {error}

"""
            
            # Performance summary
            if pipeline_result.get('build_duration', 0) > 0:
                build_speed = pipeline_result.get('files_changed', 1) / max(pipeline_result.get('build_duration', 1), 1)
                report_content += f"""PERFORMANCE:
- Build Speed: {build_speed:.2f} files/second
- Total Pipeline: {pipeline_result.get('pipeline_duration', 0)}s
- Build Only: {pipeline_result.get('build_duration', 0)}s

"""
            
            report_content += "===============================================================================\n"
            
            # Write report
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            # Also append to historical reports
            historical_file = os.path.join(self.log_dir, "pipeline_reports_history.txt")
            with open(historical_file, 'a', encoding='utf-8') as f:
                f.write(report_content + "\n")
                
        except Exception as e:
            self.logger.error(f"Failed to generate pipeline report: {e}")
    
    def get_recent_logs(self, log_type: str = "pipeline", limit: int = 10) -> List[Dict]:
        """Get recent log entries of specified type"""
        try:
            log_files = {
                "pipeline": self.pipeline_log,
                "health": self.health_log,
                "errors": self.error_log,
                "performance": self.performance_log,
                "deployments": self.deployment_log
            }
            
            log_file = log_files.get(log_type)
            if not log_file or not os.path.exists(log_file):
                return []
            
            with open(log_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Return most recent entries
            return data[-limit:] if len(data) > limit else data
            
        except Exception as e:
            self.logger.error(f"Failed to get recent logs: {e}")
            return []
    
    def generate_status_report(self) -> Dict:
        """Generate comprehensive status report from all logs"""
        try:
            report = {
                "timestamp": time.time(),
                "report_generated": time.strftime('%Y-%m-%d %H:%M:%S'),
                "summary": {},
                "recent_activity": {},
                "performance_stats": {},
                "error_analysis": {}
            }
            
            # Get recent pipeline executions
            recent_pipelines = self.get_recent_logs("pipeline", 5)
            successful_pipelines = [p for p in recent_pipelines if p.get("pipeline_success", False)]
            
            report["summary"] = {
                "total_pipelines_tracked": len(recent_pipelines),
                "successful_pipelines": len(successful_pipelines),
                "success_rate": (len(successful_pipelines) / max(len(recent_pipelines), 1)) * 100,
                "last_successful_deployment": successful_pipelines[-1].get("timestamp") if successful_pipelines else None
            }
            
            # Recent activity
            report["recent_activity"] = {
                "last_pipeline": recent_pipelines[-1] if recent_pipelines else None,
                "last_5_pipelines": recent_pipelines
            }
            
            # Performance statistics
            if recent_pipelines:
                durations = [p.get("pipeline_duration", 0) for p in recent_pipelines]
                build_durations = [p.get("build_duration", 0) for p in recent_pipelines if p.get("build_duration", 0) > 0]
                
                report["performance_stats"] = {
                    "avg_pipeline_duration": sum(durations) / len(durations) if durations else 0,
                    "avg_build_duration": sum(build_durations) / len(build_durations) if build_durations else 0,
                    "fastest_pipeline": min(durations) if durations else 0,
                    "slowest_pipeline": max(durations) if durations else 0
                }
            
            # Error analysis
            recent_errors = self.get_recent_logs("errors", 10)
            error_types = {}
            for error in recent_errors:
                error_type = error.get("error_type", "unknown")
                error_types[error_type] = error_types.get(error_type, 0) + 1
            
            report["error_analysis"] = {
                "total_errors": len(recent_errors),
                "error_types": error_types,
                "recent_errors": recent_errors[:3]  # Last 3 errors
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"Failed to generate status report: {e}")
            return {"error": f"Report generation failed: {str(e)}"}
    
    def cleanup_old_logs(self, days_to_keep: int = 30) -> Dict:
        """Clean up log files older than specified days"""
        try:
            cutoff_time = time.time() - (days_to_keep * 24 * 60 * 60)
            cleaned_files = []
            total_size_freed = 0
            
            # Clean up structured logs
            log_files = [
                self.pipeline_log,
                self.health_log, 
                self.error_log,
                self.performance_log,
                self.deployment_log
            ]
            
            for log_file in log_files:
                if not os.path.exists(log_file):
                    continue
                    
                # Read current data
                with open(log_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                original_count = len(data)
                original_size = os.path.getsize(log_file)
                
                # Filter out old entries
                filtered_data = [
                    entry for entry in data 
                    if entry.get("timestamp", 0) > cutoff_time
                ]
                
                if len(filtered_data) < original_count:
                    # Write filtered data back
                    with open(log_file, 'w', encoding='utf-8') as f:
                        json.dump(filtered_data, f, indent=2, default=str)
                    
                    new_size = os.path.getsize(log_file)
                    size_freed = original_size - new_size
                    
                    cleaned_files.append({
                        "file": os.path.basename(log_file),
                        "entries_removed": original_count - len(filtered_data),
                        "size_freed_bytes": size_freed
                    })
                    
                    total_size_freed += size_freed
            
            # Clean up text log files
            text_logs = [
                os.path.join(self.log_dir, "sync_agent.log"),
                os.path.join(self.log_dir, "structured.log"),
                os.path.join(self.log_dir, "pipeline_reports_history.txt")
            ]
            
            for text_log in text_logs:
                if os.path.exists(text_log):
                    # For text files, just truncate if too large (>10MB)
                    file_size = os.path.getsize(text_log)
                    if file_size > 10 * 1024 * 1024:  # 10MB
                        # Keep only last 1000 lines
                        with open(text_log, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                        
                        if len(lines) > 1000:
                            with open(text_log, 'w', encoding='utf-8') as f:
                                f.writelines(lines[-1000:])
                            
                            new_size = os.path.getsize(text_log)
                            size_freed = file_size - new_size
                            
                            cleaned_files.append({
                                "file": os.path.basename(text_log),
                                "lines_removed": len(lines) - 1000,
                                "size_freed_bytes": size_freed
                            })
                            
                            total_size_freed += size_freed
            
            self.logger.info(f"Log cleanup completed: {len(cleaned_files)} files cleaned, {total_size_freed} bytes freed")
            
            return {
                "success": True,
                "files_cleaned": len(cleaned_files),
                "total_size_freed_bytes": total_size_freed,
                "total_size_freed_mb": round(total_size_freed / (1024 * 1024), 2),
                "cleaned_files": cleaned_files
            }
            
        except Exception as e:
            self.logger.error(f"Log cleanup failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def export_logs(self, output_path: str, days: int = 7) -> Dict:
        """Export recent logs to specified path for external analysis"""
        try:
            cutoff_time = time.time() - (days * 24 * 60 * 60)
            export_data = {
                "export_timestamp": time.time(),
                "export_range_days": days,
                "data": {}
            }
            
            # Export each log type
            log_types = ["pipeline", "health", "errors", "performance", "deployments"]
            
            for log_type in log_types:
                logs = self.get_recent_logs(log_type, 1000)  # Get more for export
                filtered_logs = [
                    log for log in logs 
                    if log.get("timestamp", 0) > cutoff_time
                ]
                export_data["data"][log_type] = filtered_logs
            
            # Write export file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, default=str, ensure_ascii=False)
            
            total_entries = sum(len(logs) for logs in export_data["data"].values())
            
            self.logger.info(f"Logs exported to {output_path}: {total_entries} entries")
            
            return {
                "success": True,
                "export_path": output_path,
                "total_entries": total_entries,
                "log_types_exported": len(log_types),
                "file_size_bytes": os.path.getsize(output_path)
            }
            
        except Exception as e:
            self.logger.error(f"Log export failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def info(self, message: str) -> None:
        """Log info message"""
        self.logger.info(message)
    
    def error(self, message: str) -> None:
        """Log error message"""  
        self.logger.error(message)
    
    def warning(self, message: str) -> None:
        """Log warning message"""
        self.logger.warning(message)
    
    def debug(self, message: str) -> None:
        """Log debug message"""
        self.logger.debug(message)

def main():
    """Standalone testing for sync logger"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Sync Logger')
    parser.add_argument('action', choices=['status', 'cleanup', 'export'])
    parser.add_argument('--project-path', help='Project directory path')
    parser.add_argument('--output', help='Output path for export')
    parser.add_argument('--days', type=int, default=30, help='Days to keep/export')
    
    args = parser.parse_args()
    
    project_path = args.project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
    logger = SyncLogger(project_path)
    
    if args.action == 'status':
        result = logger.generate_status_report()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'cleanup':
        result = logger.cleanup_old_logs(args.days)
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'export':
        if not args.output:
            print("Error: --output required for export")
            return
        result = logger.export_logs(args.output, args.days)
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()