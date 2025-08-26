
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - summary_manager - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('summary_manager.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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
"""
Summary Manager Utility for Summary Assistant Librarian
Handles summary generation, consolidation, and optimization operations.
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

@dataclass
class SummaryTemplate:
    template_id: str
    content_type: str
    summary_strategy: str
    compression_ratio: float
    key_points_count: int
    preserve_metadata: bool

class SummaryManager:
    def __init__(self, config_path: str = None):
        self.config_path = config_path or "config/summary_config.json"
        self.config = self._load_config()
        self.logger = self._setup_logging()
        self.summary_templates = self._load_summary_templates()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load summary manager configuration."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return self._default_config()
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            "summary_strategies": {
                "extractive": {"enabled": True, "weight": 0.4},
                "abstractive": {"enabled": True, "weight": 0.6},
                "hybrid": {"enabled": True, "weight": 1.0}
            },
            "compression_settings": {
                "default_ratio": 0.3,
                "min_ratio": 0.1,
                "max_ratio": 0.8,
                "adaptive_compression": True
            },
            "quality_thresholds": {
                "minimum_summary_length": 50,
                "maximum_summary_length": 2000,
                "key_points_min": 3,
                "key_points_max": 15
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for summary manager."""
        logger = logging.getLogger("SummaryManager")
        logger.setLevel(logging.INFO)
        return logger
    
    def _load_summary_templates(self) -> Dict[str, SummaryTemplate]:
        """Load summary templates for different content types."""
        return {
            "conversation": SummaryTemplate(
                template_id="conv_001",
                content_type="conversation",
                summary_strategy="hybrid",
                compression_ratio=0.3,
                key_points_count=5,
                preserve_metadata=True
            ),
            "technical": SummaryTemplate(
                template_id="tech_001", 
                content_type="technical",
                summary_strategy="extractive",
                compression_ratio=0.4,
                key_points_count=8,
                preserve_metadata=True
            ),
            "narrative": SummaryTemplate(
                template_id="narr_001",
                content_type="narrative", 
                summary_strategy="abstractive",
                compression_ratio=0.2,
                key_points_count=4,
                preserve_metadata=False
            )
        }
    
    def generate_summary(self, content: str, content_type: str = "conversation") -> Dict[str, Any]:
        """Generate summary for given content."""
        try:
            template = self.summary_templates.get(content_type, self.summary_templates["conversation"])
            
            summary_result = {
                "original_length": len(content),
                "summary": self._create_summary(content, template),
                "key_points": self._extract_key_points(content, template.key_points_count),
                "compression_ratio": template.compression_ratio,
                "summary_strategy": template.summary_strategy,
                "metadata": self._extract_metadata(content) if template.preserve_metadata else {},
                "quality_score": self._calculate_quality_score(content),
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p")
            }
            
            summary_result["summary_length"] = len(summary_result["summary"])
            summary_result["actual_compression"] = summary_result["summary_length"] / summary_result["original_length"]
            
            return summary_result
            
        except Exception as e:
            self.logger.error(f"Summary generation failed: {str(e)}")
            return {"error": str(e)}
    
    def _create_summary(self, content: str, template: SummaryTemplate) -> str:
        """Create summary using specified strategy."""
        if template.summary_strategy == "extractive":
            return self._extractive_summary(content, template.compression_ratio)
        elif template.summary_strategy == "abstractive":
            return self._abstractive_summary(content, template.compression_ratio)
        else:  # hybrid
            return self._hybrid_summary(content, template.compression_ratio)
    
    def _extractive_summary(self, content: str, ratio: float) -> str:
        """Generate extractive summary by selecting key sentences."""
        sentences = content.split('.')
        sentence_count = max(1, int(len(sentences) * ratio))
        
        # Simple sentence scoring based on length and position
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) > 10:
                score = len(sentence) * (1.0 - i / len(sentences) * 0.3)
                scored_sentences.append((score, sentence.strip()))
        
        # Select top sentences
        scored_sentences.sort(reverse=True)
        selected = [sent[1] for sent in scored_sentences[:sentence_count]]
        
        return '. '.join(selected) + '.'
    
    def _abstractive_summary(self, content: str, ratio: float) -> str:
        """Generate abstractive summary (simplified approach)."""
        # This would typically use AI/NLP models
        # For now, implementing a simplified version
        key_phrases = self._extract_key_phrases(content)
        target_length = int(len(content) * ratio)
        
        summary = f"Summary covering: {', '.join(key_phrases[:5])}. "
        summary += self._extractive_summary(content, ratio * 0.8)
        
        return summary[:target_length] if len(summary) > target_length else summary
    
    def _hybrid_summary(self, content: str, ratio: float) -> str:
        """Generate hybrid summary combining extractive and abstractive approaches."""
        extractive_part = self._extractive_summary(content, ratio * 0.7)
        key_phrases = self._extract_key_phrases(content)
        
        hybrid_summary = f"Key topics: {', '.join(key_phrases[:3])}. {extractive_part}"
        target_length = int(len(content) * ratio)
        
        return hybrid_summary[:target_length] if len(hybrid_summary) > target_length else hybrid_summary
    
    def _extract_key_points(self, content: str, count: int) -> List[str]:
        """Extract key points from content."""
        sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 20]
        
        # Score sentences based on various factors
        scored_sentences = []
        for sentence in sentences:
            score = len(sentence) * 0.5
            # Boost score for sentences with question marks or exclamation points
            if '?' in sentence or '!' in sentence:
                score *= 1.2
            # Boost score for sentences with numbers or technical terms
            if any(char.isdigit() for char in sentence):
                score *= 1.1
            
            scored_sentences.append((score, sentence))
        
        scored_sentences.sort(reverse=True)
        return [sent[1] for sent in scored_sentences[:count]]
    
    def _extract_key_phrases(self, content: str) -> List[str]:
        """Extract key phrases from content."""
        words = content.lower().split()
        word_freq = {}
        
        # Count word frequencies (excluding common words)
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'}
        
        for word in words:
            word = word.strip('.,!?;:"()[]{}').lower()
            if len(word) > 3 and word not in common_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Return top frequent words as key phrases
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word[0] for word in sorted_words[:10]]
    
    def _extract_metadata(self, content: str) -> Dict[str, Any]:
        """Extract metadata from content."""
        return {
            "word_count": len(content.split()),
            "character_count": len(content),
            "sentence_count": len([s for s in content.split('.') if s.strip()]),
            "has_questions": '?' in content,
            "has_code": 'def ' in content or 'class ' in content or '{' in content,
            "estimated_reading_time_minutes": len(content.split()) / 200  # Average reading speed
        }
    
    def _calculate_quality_score(self, content: str) -> float:
        """Calculate quality score for content."""
        score = 0.5  # Base score
        
        # Length factor
        length = len(content)
        if 100 <= length <= 5000:
            score += 0.2
        elif length > 5000:
            score += 0.1
        
        # Structure factor
        if '.' in content and len(content.split('.')) > 2:
            score += 0.1
        
        # Content diversity factor
        unique_words = len(set(content.lower().split()))
        total_words = len(content.split())
        if total_words > 0:
            diversity = unique_words / total_words
            score += diversity * 0.2
        
        return min(1.0, max(0.0, score))
    
    def consolidate_summaries(self, summaries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Consolidate multiple summaries into a master summary."""
        if not summaries:
            return {"error": "No summaries provided"}
        
        try:
            combined_content = " ".join([s.get("summary", "") for s in summaries])
            combined_key_points = []
            
            for summary in summaries:
                combined_key_points.extend(summary.get("key_points", []))
            
            # Remove duplicates and limit key points
            unique_key_points = list(dict.fromkeys(combined_key_points))[:10]
            
            consolidated = {
                "master_summary": self._create_summary(combined_content, self.summary_templates["conversation"]),
                "consolidated_key_points": unique_key_points,
                "source_count": len(summaries),
                "total_original_length": sum([s.get("original_length", 0) for s in summaries]),
                "average_quality_score": sum([s.get("quality_score", 0) for s in summaries]) / len(summaries),
                "consolidation_timestamp": datetime.now().strftime("%m-%d_%I-%M%p")
            }
            
            return consolidated
            
        except Exception as e:
            self.logger.error(f"Summary consolidation failed: {str(e)}")
            return {"error": str(e)}
    
    def optimize_summary(self, summary_data: Dict[str, Any], target_length: int = None) -> Dict[str, Any]:
        """Optimize summary for better quality and target length."""
        try:
            current_summary = summary_data.get("summary", "")
            if not current_summary:
                return {"error": "No summary to optimize"}
            
            if target_length and len(current_summary) > target_length:
                # Truncate while preserving sentence boundaries
                sentences = current_summary.split('.')
                optimized = ""
                for sentence in sentences:
                    if len(optimized + sentence + '.') <= target_length:
                        optimized += sentence + '.'
                    else:
                        break
                summary_data["summary"] = optimized.strip()
            
            # Enhance key points
            if "key_points" in summary_data:
                enhanced_points = []
                for point in summary_data["key_points"]:
                    if len(point.strip()) > 10:  # Only keep substantial points
                        enhanced_points.append(point.strip())
                summary_data["key_points"] = enhanced_points[:8]  # Limit to 8 points
            
            summary_data["optimization_timestamp"] = datetime.now().strftime("%m-%d_%I-%M%p")
            summary_data["optimized"] = True
            
            return summary_data
            
        except Exception as e:
            self.logger.error(f"Summary optimization failed: {str(e)}")
            return {"error": str(e)}
