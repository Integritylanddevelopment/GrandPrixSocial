#!/usr/bin/env python3
"""
Grand Prix Social - User Intelligence Agent
Processes user behavioral data and creates personalized experiences
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

class UserIntelligenceAgent:
    """
    Processes user behavior data and maintains user profiles
    for personalized F1 fan experiences
    """
    
    def __init__(self, memory_root: Path):
        self.memory_root = memory_root
        self.semantic_path = memory_root / "f_semantic"
        self.episodic_path = memory_root / "g_episodic"
        
        # Ensure directories exist
        self.semantic_path.mkdir(exist_ok=True)
        self.episodic_path.mkdir(exist_ok=True)
        
        # User profiles storage
        self.user_profiles_path = self.semantic_path / "user_profiles"
        self.user_profiles_path.mkdir(exist_ok=True)
    
    def process_user_behavior(self, behavior_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming user behavior data
        """
        user_id = behavior_data.get('userId')
        if not user_id:
            return {"status": "error", "message": "Missing user ID"}
        
        # Load or create user profile
        profile = self.get_user_profile(user_id)
        
        # Extract behavioral patterns
        patterns = self.extract_behavior_patterns(behavior_data)
        
        # Update profile with new patterns
        profile = self.update_user_profile(profile, patterns)
        
        # Save updated profile
        self.save_user_profile(user_id, profile)
        
        # Create episodic memory if significant
        if self.is_significant_behavior(behavior_data):
            self.create_episodic_memory(user_id, behavior_data)
        
        # Update recommendation vectors
        self.update_recommendation_vectors(user_id, profile)
        
        return {
            "status": "processed",
            "user_id": user_id,
            "patterns_detected": len(patterns),
            "profile_updated": True
        }
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Load user profile from semantic memory
        """
        profile_path = self.user_profiles_path / f"{user_id}_profile.json"
        
        if profile_path.exists():
            with open(profile_path, 'r') as f:
                return json.load(f)
        
        # Create new profile
        return {
            "user_id": user_id,
            "created_at": self.get_timestamp(),
            "f1_preferences": {
                "favorite_teams": [],
                "favorite_drivers": [],
                "content_interests": []
            },
            "behavior_patterns": {
                "page_preferences": {},
                "engagement_style": "unknown",
                "activity_level": "low"
            },
            "personalization": {
                "consent_given": False,
                "recommendations_enabled": False,
                "privacy_level": "high"
            },
            "last_updated": self.get_timestamp()
        }
    
    def extract_behavior_patterns(self, behavior_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract meaningful patterns from behavior data
        """
        patterns = []
        
        # Page navigation patterns
        if 'page_views' in behavior_data:
            for page_view in behavior_data['page_views']:
                page = page_view.get('page', '')
                time_spent = page_view.get('time_spent', 0)
                
                patterns.append({
                    "type": "page_preference",
                    "page": page,
                    "engagement_level": self.calculate_engagement_level(time_spent),
                    "timestamp": self.get_timestamp()
                })
        
        # F1 team/driver preferences
        if 'click_patterns' in behavior_data:
            for click in behavior_data['click_patterns']:
                f1_entity = self.extract_f1_entity(click)
                if f1_entity:
                    patterns.append({
                        "type": "f1_preference",
                        "entity_type": f1_entity["type"],  # "team" or "driver"
                        "entity_name": f1_entity["name"],
                        "interaction_type": "click",
                        "timestamp": self.get_timestamp()
                    })
        
        # Content consumption patterns
        if 'content_interactions' in behavior_data:
            for interaction in behavior_data['content_interactions']:
                patterns.append({
                    "type": "content_preference",
                    "content_type": interaction.get('type'),
                    "engagement_duration": interaction.get('duration', 0),
                    "interaction_type": interaction.get('action'),
                    "timestamp": self.get_timestamp()
                })
        
        return patterns
    
    def update_user_profile(self, profile: Dict[str, Any], patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Update user profile with new behavioral patterns
        """
        for pattern in patterns:
            pattern_type = pattern.get('type')
            
            if pattern_type == "page_preference":
                page = pattern.get('page')
                engagement = pattern.get('engagement_level', 0)
                
                if page not in profile['behavior_patterns']['page_preferences']:
                    profile['behavior_patterns']['page_preferences'][page] = {
                        "visits": 0,
                        "avg_engagement": 0,
                        "last_visit": pattern.get('timestamp')
                    }
                
                page_data = profile['behavior_patterns']['page_preferences'][page]
                page_data['visits'] += 1
                page_data['avg_engagement'] = (page_data['avg_engagement'] + engagement) / 2
                page_data['last_visit'] = pattern.get('timestamp')
            
            elif pattern_type == "f1_preference":
                entity_type = pattern.get('entity_type')
                entity_name = pattern.get('entity_name')
                
                if entity_type == "team":
                    if entity_name not in profile['f1_preferences']['favorite_teams']:
                        profile['f1_preferences']['favorite_teams'].append(entity_name)
                elif entity_type == "driver":
                    if entity_name not in profile['f1_preferences']['favorite_drivers']:
                        profile['f1_preferences']['favorite_drivers'].append(entity_name)
            
            elif pattern_type == "content_preference":
                content_type = pattern.get('content_type')
                if content_type and content_type not in profile['f1_preferences']['content_interests']:
                    profile['f1_preferences']['content_interests'].append(content_type)
        
        # Update activity level based on recent patterns
        profile['behavior_patterns']['activity_level'] = self.calculate_activity_level(patterns)
        profile['last_updated'] = self.get_timestamp()
        
        return profile
    
    def save_user_profile(self, user_id: str, profile: Dict[str, Any]) -> None:
        """
        Save user profile to semantic memory
        """
        profile_path = self.user_profiles_path / f"{user_id}_profile.json"
        
        with open(profile_path, 'w') as f:
            json.dump(profile, f, indent=2)
    
    def create_episodic_memory(self, user_id: str, behavior_data: Dict[str, Any]) -> None:
        """
        Create episodic memory for significant user events
        """
        episodic_dir = self.episodic_path / "user_sessions" / user_id
        episodic_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = self.get_timestamp()
        memory_file = episodic_dir / f"significant_event_{timestamp}.json"
        
        episodic_data = {
            "user_id": user_id,
            "timestamp": timestamp,
            "event_type": "significant_behavior",
            "raw_data": behavior_data,
            "significance_score": self.calculate_significance_score(behavior_data),
            "tags": ["#type:episodic", "#user:behavior", "#significance:high"]
        }
        
        with open(memory_file, 'w') as f:
            json.dump(episodic_data, f, indent=2)
    
    def get_personalized_recommendations(self, user_id: str) -> Dict[str, Any]:
        """
        Generate personalized recommendations for user
        """
        profile = self.get_user_profile(user_id)
        
        # Check consent
        if not profile['personalization']['consent_given']:
            return self.get_default_recommendations()
        
        recommendations = {
            "content": self.get_content_recommendations(profile),
            "social_connections": self.get_social_recommendations(profile),
            "interface_adaptations": self.get_interface_adaptations(profile),
            "explanations": {}
        }
        
        # Add explanations for transparency
        recommendations["explanations"] = self.generate_recommendation_explanations(profile, recommendations)
        
        return recommendations
    
    def get_content_recommendations(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate content recommendations based on user preferences
        """
        recommendations = []
        
        # Recommend content about favorite teams
        for team in profile['f1_preferences']['favorite_teams']:
            recommendations.append({
                "type": "team_news",
                "team": team,
                "reason": f"Based on your interest in {team}"
            })
        
        # Recommend content about favorite drivers
        for driver in profile['f1_preferences']['favorite_drivers']:
            recommendations.append({
                "type": "driver_updates",
                "driver": driver,
                "reason": f"Following {driver}'s performance"
            })
        
        return recommendations
    
    def get_social_recommendations(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate social connection recommendations
        """
        recommendations = []
        
        # Find users with similar team preferences
        similar_users = self.find_similar_users(profile)
        
        for similar_user in similar_users[:5]:  # Limit to top 5
            recommendations.append({
                "type": "similar_fan",
                "user_id": similar_user["user_id"],
                "similarity_score": similar_user["score"],
                "reason": "Shares similar F1 team preferences"
            })
        
        return recommendations
    
    # Helper methods
    def get_timestamp(self) -> str:
        """Generate timestamp in core logic format"""
        return datetime.now().strftime("%m-%d_%I-%M%p").upper()
    
    def calculate_engagement_level(self, time_spent: int) -> float:
        """Calculate engagement level from time spent"""
        if time_spent < 30:
            return 0.2
        elif time_spent < 120:
            return 0.5
        elif time_spent < 300:
            return 0.8
        else:
            return 1.0
    
    def extract_f1_entity(self, click_text: str) -> Optional[Dict[str, str]]:
        """Extract F1 team or driver from click text"""
        # F1 teams
        teams = ["ferrari", "mclaren", "red_bull", "mercedes", "aston_martin", 
                "alpine", "williams", "alphatauri", "alfa_romeo", "haas"]
        
        # F1 drivers (current season)
        drivers = ["verstappen", "leclerc", "hamilton", "russell", "norris", 
                  "piastri", "alonso", "stroll", "sainz", "perez"]
        
        click_lower = click_text.lower()
        
        for team in teams:
            if team in click_lower:
                return {"type": "team", "name": team}
        
        for driver in drivers:
            if driver in click_lower:
                return {"type": "driver", "name": driver}
        
        return None
    
    def calculate_activity_level(self, patterns: List[Dict[str, Any]]) -> str:
        """Calculate user activity level"""
        if len(patterns) > 20:
            return "high"
        elif len(patterns) > 5:
            return "medium"
        else:
            return "low"
    
    def is_significant_behavior(self, behavior_data: Dict[str, Any]) -> bool:
        """Determine if behavior is significant enough for episodic memory"""
        # Significant events: first post, joining fantasy league, etc.
        return (
            behavior_data.get('event_type') in ['first_post', 'fantasy_join', 'milestone'] or
            behavior_data.get('session_duration', 0) > 1800  # 30+ minutes
        )
    
    def calculate_significance_score(self, behavior_data: Dict[str, Any]) -> float:
        """Calculate significance score for episodic memory"""
        score = 0.5
        
        if behavior_data.get('event_type') == 'first_post':
            score = 0.9
        elif behavior_data.get('session_duration', 0) > 1800:
            score = 0.7
        
        return score
    
    def find_similar_users(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find users with similar preferences"""
        # This would implement similarity algorithms
        # For now, return empty list
        return []
    
    def get_default_recommendations(self) -> Dict[str, Any]:
        """Get default recommendations when personalization is disabled"""
        return {
            "content": [{"type": "trending", "reason": "Popular with all users"}],
            "social_connections": [],
            "interface_adaptations": {},
            "explanations": {"note": "Personalization disabled by user preference"}
        }
    
    def get_interface_adaptations(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interface adaptations"""
        adaptations = {}
        
        # Theme based on favorite team
        if profile['f1_preferences']['favorite_teams']:
            team = profile['f1_preferences']['favorite_teams'][0]
            adaptations['theme_accent'] = self.get_team_color(team)
        
        # Navigation based on page preferences
        most_used_pages = sorted(
            profile['behavior_patterns']['page_preferences'].items(),
            key=lambda x: x[1]['visits'],
            reverse=True
        )
        
        if most_used_pages:
            adaptations['priority_navigation'] = [page[0] for page in most_used_pages[:3]]
        
        return adaptations
    
    def get_team_color(self, team: str) -> str:
        """Get team color for theming"""
        team_colors = {
            "ferrari": "#DC143C",
            "mclaren": "#FF8700",
            "red_bull": "#0600EF",
            "mercedes": "#00D2BE",
            "aston_martin": "#006F62"
        }
        return team_colors.get(team, "#6366f1")
    
    def generate_recommendation_explanations(self, profile: Dict[str, Any], recommendations: Dict[str, Any]) -> Dict[str, Any]:
        """Generate explanations for recommendations"""
        return {
            "content": "Based on your F1 team and driver preferences",
            "social": "Users with similar interests to yours",
            "interface": "Customized based on your usage patterns"
        }


# Example usage
if __name__ == "__main__":
    memory_root = Path(__file__).parent.parent.parent
    agent = UserIntelligenceAgent(memory_root)
    
    # Example behavior data
    sample_behavior = {
        "userId": "user_123",
        "sessionId": "sess_456",
        "page_views": [
            {"page": "/cafe", "time_spent": 120, "interactions": 8},
            {"page": "/paddock-talk", "time_spent": 340, "scroll_depth": 85}
        ],
        "click_patterns": ["news_article_verstappen", "ferrari_team_page"],
        "timestamp": agent.get_timestamp()
    }
    
    result = agent.process_user_behavior(sample_behavior)
    print(f"Processed user behavior: {result}")
    
    # Get recommendations
    recommendations = agent.get_personalized_recommendations("user_123")
    print(f"Recommendations: {json.dumps(recommendations, indent=2)}")