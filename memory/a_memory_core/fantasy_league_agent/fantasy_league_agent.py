"""
Fantasy League Memory Agent
Manages user preferences, team selection patterns, and fantasy insights
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FantasyLeagueAgent:
    """
    Memory agent for Fantasy Formula League
    Tracks user preferences, patterns, and provides intelligent suggestions
    """
    
    def __init__(self, memory_root: Path):
        self.memory_root = memory_root
        self.agent_path = memory_root / 'a_memory_core' / 'fantasy_league_agent'
        self.agent_path.mkdir(parents=True, exist_ok=True)
        
        # Memory storage files
        self.user_preferences_file = self.agent_path / 'user_preferences.json'
        self.team_patterns_file = self.agent_path / 'team_selection_patterns.json'
        self.performance_insights_file = self.agent_path / 'performance_insights.json'
        self.state_file = self.agent_path / 'agent_state.json'
        
        # Initialize storage
        self.user_preferences = self.load_json(self.user_preferences_file, {})
        self.team_patterns = self.load_json(self.team_patterns_file, {})
        self.performance_insights = self.load_json(self.performance_insights_file, {})
        self.state = self.load_json(self.state_file, {
            'last_updated': datetime.now().isoformat(),
            'active_users': 0,
            'total_teams_analyzed': 0
        })
        
        logger.info("Fantasy League Agent initialized")
    
    def load_json(self, file_path: Path, default: Any) -> Any:
        """Load JSON file with default fallback"""
        try:
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
        return default
    
    def save_json(self, file_path: Path, data: Any):
        """Save data to JSON file"""
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving {file_path}: {e}")
    
    def learn_user_preferences(self, user_id: str, team_picks: Dict[str, Any]):
        """Learn from user's team selection preferences"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                'favorite_drivers': {},
                'favorite_constructors': {},
                'risk_tolerance': 'medium',
                'budget_strategy': 'balanced',
                'prediction_accuracy': 0.0,
                'selection_history': []
            }
        
        user_prefs = self.user_preferences[user_id]
        
        # Track favorite drivers
        primary_driver = team_picks.get('primaryDriver')
        secondary_driver = team_picks.get('secondaryDriver')
        
        if primary_driver:
            user_prefs['favorite_drivers'][primary_driver] = \
                user_prefs['favorite_drivers'].get(primary_driver, 0) + 2
        if secondary_driver:
            user_prefs['favorite_drivers'][secondary_driver] = \
                user_prefs['favorite_drivers'].get(secondary_driver, 0) + 1
        
        # Track favorite constructors
        constructor = team_picks.get('constructor')
        if constructor:
            user_prefs['favorite_constructors'][constructor] = \
                user_prefs['favorite_constructors'].get(constructor, 0) + 1
        
        # Analyze budget strategy
        total_budget = team_picks.get('totalBudgetUsed', 0)
        if total_budget > 90000000:  # $90M+
            user_prefs['budget_strategy'] = 'aggressive'
        elif total_budget < 70000000:  # Under $70M
            user_prefs['budget_strategy'] = 'conservative'
        else:
            user_prefs['budget_strategy'] = 'balanced'
        
        # Store selection history
        user_prefs['selection_history'].append({
            'race_id': team_picks.get('raceId'),
            'timestamp': datetime.now().isoformat(),
            'budget_used': total_budget,
            'primary_driver': primary_driver,
            'constructor': constructor
        })
        
        # Keep only last 10 selections
        user_prefs['selection_history'] = user_prefs['selection_history'][-10:]
        
        self.save_json(self.user_preferences_file, self.user_preferences)
        logger.info(f"Updated preferences for user {user_id}")
    
    def analyze_team_patterns(self, user_id: str, team_picks: Dict[str, Any], score: Optional[int] = None):
        """Analyze patterns in team selections"""
        if user_id not in self.team_patterns:
            self.team_patterns[user_id] = {
                'successful_combinations': [],
                'driver_constructor_pairs': {},
                'prediction_patterns': {},
                'performance_trends': []
            }
        
        patterns = self.team_patterns[user_id]
        
        # Track driver-constructor combinations
        primary_driver = team_picks.get('primaryDriver')
        constructor = team_picks.get('constructor')
        
        if primary_driver and constructor:
            pair_key = f"{primary_driver}_{constructor}"
            if pair_key not in patterns['driver_constructor_pairs']:
                patterns['driver_constructor_pairs'][pair_key] = {
                    'selections': 0,
                    'total_score': 0,
                    'average_score': 0
                }
            
            patterns['driver_constructor_pairs'][pair_key]['selections'] += 1
            if score is not None:
                patterns['driver_constructor_pairs'][pair_key]['total_score'] += score
                patterns['driver_constructor_pairs'][pair_key]['average_score'] = \
                    patterns['driver_constructor_pairs'][pair_key]['total_score'] / \
                    patterns['driver_constructor_pairs'][pair_key]['selections']
        
        # Track prediction patterns
        predictions = {
            'willRain': team_picks.get('willRain'),
            'willSafetyCar': team_picks.get('willSafetyCar'),
            'poleSitterWins': team_picks.get('poleSitterWins'),
            'leadersFinishPoints': team_picks.get('leadersFinishPoints'),
            'moreThan2DNFs': team_picks.get('moreThan2DNFs'),
            'raceUnderScheduledLaps': team_picks.get('raceUnderScheduledLaps')
        }
        
        for prediction, value in predictions.items():
            if prediction not in patterns['prediction_patterns']:
                patterns['prediction_patterns'][prediction] = {'true': 0, 'false': 0}
            patterns['prediction_patterns'][prediction][str(value).lower()] += 1
        
        # Track performance trends
        if score is not None:
            patterns['performance_trends'].append({
                'race_id': team_picks.get('raceId'),
                'score': score,
                'timestamp': datetime.now().isoformat(),
                'budget_used': team_picks.get('totalBudgetUsed', 0)
            })
            
            # Keep only last 20 performances
            patterns['performance_trends'] = patterns['performance_trends'][-20:]
        
        self.save_json(self.team_patterns_file, self.team_patterns)
        logger.info(f"Updated team patterns for user {user_id}")
    
    def generate_recommendations(self, user_id: str, current_race: str) -> Dict[str, Any]:
        """Generate intelligent recommendations for user"""
        recommendations = {
            'suggested_drivers': [],
            'suggested_constructors': [],
            'budget_advice': '',
            'prediction_suggestions': {},
            'risk_assessment': 'medium',
            'confidence_score': 0.5
        }
        
        if user_id not in self.user_preferences:
            # New user - provide general recommendations
            recommendations['budget_advice'] = "For your first team, try a balanced approach with $80-90M budget"
            recommendations['confidence_score'] = 0.3
            return recommendations
        
        user_prefs = self.user_preferences[user_id]
        user_patterns = self.team_patterns.get(user_id, {})
        
        # Suggest drivers based on preferences
        favorite_drivers = user_prefs.get('favorite_drivers', {})
        top_drivers = sorted(favorite_drivers.items(), key=lambda x: x[1], reverse=True)[:3]
        recommendations['suggested_drivers'] = [driver for driver, _ in top_drivers]
        
        # Suggest constructors based on success patterns
        constructor_success = user_patterns.get('driver_constructor_pairs', {})
        successful_constructors = {}
        
        for pair_key, data in constructor_success.items():
            if data['selections'] >= 2 and data['average_score'] > 50:  # Good performance
                constructor = pair_key.split('_')[1]
                successful_constructors[constructor] = data['average_score']
        
        top_constructors = sorted(successful_constructors.items(), key=lambda x: x[1], reverse=True)[:2]
        recommendations['suggested_constructors'] = [constructor for constructor, _ in top_constructors]
        
        # Budget advice based on strategy
        budget_strategy = user_prefs.get('budget_strategy', 'balanced')
        if budget_strategy == 'aggressive':
            recommendations['budget_advice'] = "You tend to spend big - consider Max Verstappen or Charles Leclerc"
        elif budget_strategy == 'conservative':
            recommendations['budget_advice'] = "Your budget-conscious approach is smart - look for value picks"
        else:
            recommendations['budget_advice'] = "Your balanced strategy is working well"
        
        # Prediction suggestions based on patterns
        prediction_patterns = user_patterns.get('prediction_patterns', {})
        for prediction, pattern in prediction_patterns.items():
            total_predictions = pattern.get('true', 0) + pattern.get('false', 0)
            if total_predictions > 0:
                true_rate = pattern.get('true', 0) / total_predictions
                if true_rate > 0.7:
                    recommendations['prediction_suggestions'][prediction] = 'You often predict true - stick with your instincts'
                elif true_rate < 0.3:
                    recommendations['prediction_suggestions'][prediction] = 'You often predict false - consider your cautious approach'
        
        # Calculate confidence based on data points
        data_points = len(user_prefs.get('selection_history', []))
        recommendations['confidence_score'] = min(0.9, 0.3 + (data_points * 0.1))
        
        return recommendations
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive insights for a user"""
        if user_id not in self.user_preferences:
            return {'message': 'No data available for this user'}
        
        user_prefs = self.user_preferences[user_id]
        user_patterns = self.team_patterns.get(user_id, {})
        
        insights = {
            'profile_summary': {
                'budget_strategy': user_prefs.get('budget_strategy', 'unknown'),
                'races_participated': len(user_prefs.get('selection_history', [])),
                'prediction_accuracy': user_prefs.get('prediction_accuracy', 0.0)
            },
            'favorite_picks': {
                'drivers': user_prefs.get('favorite_drivers', {}),
                'constructors': user_prefs.get('favorite_constructors', {})
            },
            'performance_trends': user_patterns.get('performance_trends', []),
            'successful_combinations': [],
            'improvement_areas': []
        }
        
        # Analyze successful combinations
        constructor_pairs = user_patterns.get('driver_constructor_pairs', {})
        for pair_key, data in constructor_pairs.items():
            if data['selections'] >= 2 and data['average_score'] > 60:
                driver, constructor = pair_key.split('_')
                insights['successful_combinations'].append({
                    'driver': driver,
                    'constructor': constructor,
                    'average_score': data['average_score'],
                    'times_used': data['selections']
                })
        
        # Identify improvement areas
        performance_trends = user_patterns.get('performance_trends', [])
        if len(performance_trends) >= 3:
            recent_scores = [p['score'] for p in performance_trends[-3:]]
            avg_recent = sum(recent_scores) / len(recent_scores)
            
            if avg_recent < 50:
                insights['improvement_areas'].append("Consider diversifying your driver choices")
            if len(set([p['budget_used'] for p in performance_trends[-5:]])) == 1:
                insights['improvement_areas'].append("Try experimenting with different budget allocations")
        
        return insights
    
    def update_state(self):
        """Update agent state"""
        self.state.update({
            'last_updated': datetime.now().isoformat(),
            'active_users': len(self.user_preferences),
            'total_teams_analyzed': sum(len(patterns.get('performance_trends', [])) 
                                      for patterns in self.team_patterns.values())
        })
        self.save_json(self.state_file, self.state)
    
    def cleanup_old_data(self, days: int = 90):
        """Clean up data older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        cutoff_iso = cutoff_date.isoformat()
        
        # Clean up selection history
        for user_id, prefs in self.user_preferences.items():
            history = prefs.get('selection_history', [])
            prefs['selection_history'] = [
                h for h in history 
                if h.get('timestamp', '') > cutoff_iso
            ]
        
        # Clean up performance trends
        for user_id, patterns in self.team_patterns.items():
            trends = patterns.get('performance_trends', [])
            patterns['performance_trends'] = [
                t for t in trends 
                if t.get('timestamp', '') > cutoff_iso
            ]
        
        # Save cleaned data
        self.save_json(self.user_preferences_file, self.user_preferences)
        self.save_json(self.team_patterns_file, self.team_patterns)
        
        logger.info(f"Cleaned up data older than {days} days")

def main():
    """Main function for testing the agent"""
    memory_root = Path(__file__).parent.parent.parent
    agent = FantasyLeagueAgent(memory_root)
    
    # Test with sample data
    sample_picks = {
        'userId': 'test_user_123',
        'raceId': 'dutch_gp_2024',
        'primaryDriver': 'Max Verstappen',
        'secondaryDriver': 'Lando Norris',
        'constructor': 'Red Bull Racing',
        'totalBudgetUsed': 85000000,
        'willRain': False,
        'willSafetyCar': True,
        'poleSitterWins': True,
        'leadersFinishPoints': True,
        'moreThan2DNFs': False,
        'raceUnderScheduledLaps': False
    }
    
    # Learn from sample data
    agent.learn_user_preferences('test_user_123', sample_picks)
    agent.analyze_team_patterns('test_user_123', sample_picks, 78)
    
    # Generate recommendations
    recommendations = agent.generate_recommendations('test_user_123', 'italian_gp_2024')
    print("Recommendations:", json.dumps(recommendations, indent=2))
    
    # Get insights
    insights = agent.get_user_insights('test_user_123')
    print("Insights:", json.dumps(insights, indent=2))
    
    # Update state
    agent.update_state()
    
    print("Fantasy League Agent test completed successfully!")

if __name__ == "__main__":
    main()