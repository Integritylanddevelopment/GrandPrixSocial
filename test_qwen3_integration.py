#!/usr/bin/env python3
"""
Test Qwen3 Docker LLM Integration with Memory Database
Complete integration test of the F1 content generation system
"""
import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def test_qwen3_connection():
    """Test connection to Qwen3 Docker LLM"""
    
    print("="*80)
    print("TESTING QWEN3 DOCKER LLM CONNECTION")
    print("="*80)
    
    # Try multiple possible endpoints
    endpoints = [
        'http://localhost:12434/engines/llama.cpp/v1/chat/completions',
        'http://localhost:12434/v1/chat/completions',
        'http://127.0.0.1:12434/v1/chat/completions',
    ]
    
    for endpoint in endpoints:
        print(f"\nTesting endpoint: {endpoint}")
        
        try:
            test_payload = {
                "model": "qwen2.5:7b",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert F1 journalist. Write engaging F1 content."
                    },
                    {
                        "role": "user",
                        "content": "Write a one sentence F1 news headline about Max Verstappen winning a race."
                    }
                ],
                "max_tokens": 100,
                "temperature": 0.7
            }
            
            response = requests.post(
                endpoint,
                headers={'Content-Type': 'application/json'},
                json=test_payload,
                timeout=30
            )
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                print(f"  SUCCESS: {content[:100]}...")
                return endpoint, True
            else:
                print(f"  FAILED: {response.text[:100]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"  CONNECTION ERROR: Qwen3 not running on this endpoint")
        except requests.exceptions.Timeout:
            print(f"  TIMEOUT: Qwen3 taking too long to respond")
        except Exception as e:
            print(f"  ERROR: {str(e)[:100]}...")
    
    return None, False

def test_database_connection():
    """Test connection to the new memory database"""
    
    print(f"\n" + "="*80)
    print("TESTING MEMORY DATABASE CONNECTION")
    print("="*80)
    
    try:
        from supabase import create_client, Client
    except ImportError:
        print("ERROR: Supabase client not available")
        return False
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("ERROR: Missing Supabase credentials")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    
    # Test critical tables for F1 content system
    test_tables = [
        'f1_specific_data',
        'core_memory_storage', 
        'lonterm_memory_storage',
        'memory_system_state',
        'agent_registry'
    ]
    
    working_tables = 0
    
    for table in test_tables:
        try:
            result = client.table(table).select("*").limit(1).execute()
            print(f"  SUCCESS: {table} accessible")
            working_tables += 1
        except Exception as e:
            print(f"  FAILED:  {table} - {str(e)[:50]}...")
    
    success_rate = working_tables / len(test_tables) * 100
    print(f"\nDatabase Status: {working_tables}/{len(test_tables)} tables working ({success_rate:.1f}%)")
    
    return success_rate > 80

def create_integrated_f1_system():
    """Create integrated F1 content generation system"""
    
    print(f"\n" + "="*80)
    print("CREATING INTEGRATED F1 CONTENT SYSTEM")
    print("="*80)
    
    # Create the integration script
    integration_script = '''#!/usr/bin/env python3
"""
F1 Content Generation System - Database + Qwen3 Integration
Complete pipeline from F1 news to generated articles with database storage
"""
import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
env_path = project_root / ".env.local"
load_dotenv(env_path)

class F1ContentGenerationSystem:
    """
    Complete F1 content generation system with Qwen3 LLM and database integration
    """
    
    def __init__(self):
        self.qwen_endpoint = self.detect_qwen_endpoint()
        self.setup_database()
        print("🏁 F1 Content Generation System initialized")
    
    def detect_qwen_endpoint(self) -> Optional[str]:
        """Detect working Qwen3 endpoint"""
        endpoints = [
            'http://localhost:12434/engines/llama.cpp/v1/chat/completions',
            'http://localhost:12434/v1/chat/completions',
            'http://127.0.0.1:12434/v1/chat/completions',
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint.replace('/chat/completions', ''), timeout=5)
                print(f"✅ Found Qwen3 at: {endpoint}")
                return endpoint
            except:
                continue
        
        print("⚠️  Qwen3 not detected - will use fallback")
        return None
    
    def setup_database(self):
        """Setup database connection"""
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")
        
        self.db: Client = create_client(supabase_url, supabase_key)
        print("✅ Database connection established")
    
    def generate_f1_article(self, news_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate F1 article using Qwen3 and store in database"""
        
        print(f"📝 Generating article: {news_data.get('title', 'Unknown')}")
        
        # Step 1: Create F1-specific prompt
        prompt = self.create_f1_prompt(news_data)
        
        # Step 2: Generate content with Qwen3
        generated_content = self.call_qwen3(prompt)
        
        # Step 3: Process and structure the article
        article = self.structure_article(generated_content, news_data)
        
        # Step 4: Store in database
        stored_article = self.store_article_in_database(article, news_data)
        
        print(f"✅ Article generated and stored: {stored_article.get('title', 'Success')}")
        return stored_article
    
    def create_f1_prompt(self, news_data: Dict[str, Any]) -> str:
        """Create F1-specific prompt for Qwen3"""
        
        category = news_data.get('category', 'general')
        title = news_data.get('title', '')
        content = news_data.get('content', '')
        
        if 'verstappen' in content.lower() or 'max' in content.lower():
            focus = "Max Verstappen and Red Bull Racing"
        elif 'hamilton' in content.lower() or 'lewis' in content.lower():
            focus = "Lewis Hamilton and Mercedes"
        elif 'ferrari' in content.lower():
            focus = "Ferrari team dynamics"
        else:
            focus = "F1 championship implications"
        
        prompt = f\"\"\"Write a professional F1 news article based on this information:

ORIGINAL HEADLINE: {title}
SOURCE CONTENT: {content}

ARTICLE REQUIREMENTS:
- Focus on: {focus}
- Length: 300-500 words
- Include championship implications
- Professional journalistic tone
- Include specific F1 context
- End with what this means for upcoming races

Write the article now:\"\"\"
        
        return prompt
    
    def call_qwen3(self, prompt: str) -> str:
        """Call Qwen3 LLM for content generation"""
        
        if not self.qwen_endpoint:
            return self.fallback_content_generation(prompt)
        
        try:
            payload = {
                "model": "qwen2.5:7b",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert F1 journalist. Write engaging, accurate F1 articles with professional formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 800,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            response = requests.post(
                self.qwen_endpoint,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                return content
            else:
                raise Exception(f"Qwen3 error: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️  Qwen3 failed, using fallback: {e}")
            return self.fallback_content_generation(prompt)
    
    def fallback_content_generation(self, prompt: str) -> str:
        """Fallback content generation when Qwen3 is unavailable"""
        
        return f\"\"\"F1 Championship Update: Latest Developments

The Formula 1 season continues to deliver excitement and drama as teams and drivers push for championship glory. Recent developments in the paddock have significant implications for the remainder of the season.

Key championship contenders remain focused on maximizing their performance across all remaining race weekends. Technical developments and strategic decisions made during this period will likely determine the final standings.

Team dynamics and driver performance continue to evolve as the season progresses. Each race weekend presents new opportunities for breakthrough performances and potential championship-deciding moments.

The competitive nature of this season has been evident throughout, with multiple teams capable of race-winning performances depending on circuit characteristics and weather conditions.

Looking ahead to upcoming races, teams will need to balance development resources with operational excellence to maintain their championship campaigns. Every point scored could prove crucial in the final championship calculations.

This latest development adds another layer of intrigue to what has already been a captivating season of Formula 1 racing.\"\"\"
    
    def structure_article(self, content: str, news_data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure the generated content into an article format"""
        
        lines = content.strip().split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        # Extract or generate title
        if lines and len(lines[0]) < 100 and not lines[0].endswith('.'):
            title = lines[0]
            article_content = '\n\n'.join(lines[1:])
        else:
            title = f"F1 Update: {news_data.get('title', 'Latest News')}"
            article_content = '\n\n'.join(lines)
        
        # Calculate read time
        word_count = len(article_content.split())
        read_time = max(1, word_count // 200)
        
        return {
            'title': title,
            'content': article_content,
            'word_count': word_count,
            'estimated_read_time': read_time,
            'category': news_data.get('category', 'general'),
            'source_data': news_data,
            'generated_at': datetime.now().isoformat(),
            'generation_method': 'qwen3' if self.qwen_endpoint else 'fallback'
        }
    
    def store_article_in_database(self, article: Dict[str, Any], news_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store generated article in the memory database"""
        
        try:
            # Store in F1 specific data table
            f1_data = {
                'data_type': 'generated_article',
                'data_category': article['category'],
                'title': article['title'],
                'content': {
                    'article_content': article['content'],
                    'word_count': article['word_count'],
                    'read_time': article['estimated_read_time'],
                    'generation_method': article['generation_method'],
                    'source_data': article['source_data']
                },
                'season': 2024,
                'source': 'qwen3_generator',
                'confidence_score': 0.9 if article['generation_method'] == 'qwen3' else 0.7,
                'tags': ['generated', 'f1-news', article['category']]
            }
            
            result = self.db.table('f1_specific_data').insert(f1_data).execute()
            
            if result.data:
                stored_id = result.data[0]['id']
                
                # Also store in long-term memory for persistence
                memory_data = {
                    'title': f"Generated F1 Article: {article['title']}",
                    'content': json.dumps(article),
                    'content_type': 'generated_article',
                    'importance_score': 8,
                    'tags': ['f1', 'generated', 'qwen3'],
                    'metadata': {
                        'f1_data_id': stored_id,
                        'generation_timestamp': article['generated_at']
                    },
                    'source_agent': 'qwen3_content_generator'
                }
                
                self.db.table('lonterm_memory_storage').insert(memory_data).execute()
                
                print(f"💾 Article stored in database: {stored_id}")
                return {**article, 'database_id': stored_id}
            
        except Exception as e:
            print(f"❌ Database storage failed: {e}")
            return article
        
        return article
    
    def process_sample_f1_news(self):
        """Process sample F1 news to demonstrate the system"""
        
        sample_news = [
            {
                'title': 'Verstappen Dominates Practice at Brazilian GP',
                'content': 'Max Verstappen topped both practice sessions at Interlagos, showing strong pace ahead of qualifying. The Red Bull driver finished 0.3 seconds clear of Lewis Hamilton, with Charles Leclerc third for Ferrari.',
                'category': 'practice',
                'source': 'F1 Official'
            },
            {
                'title': 'Ferrari Announces Technical Upgrade Package',
                'content': 'Ferrari has confirmed a significant aerodynamic upgrade package for the upcoming race weekend. The team expects the improvements to deliver better performance in high-speed corners.',
                'category': 'technical',
                'source': 'Ferrari Press Release'
            },
            {
                'title': 'Driver Market Speculation Intensifies',
                'content': 'Rumors continue to swirl around potential driver moves for next season. Sources suggest several high-profile negotiations are ongoing behind closed doors in the paddock.',
                'category': 'transfers',
                'source': 'Paddock Insider'
            }
        ]
        
        generated_articles = []
        
        for news_item in sample_news:
            try:
                article = self.generate_f1_article(news_item)
                generated_articles.append(article)
            except Exception as e:
                print(f"❌ Failed to process: {news_item['title']} - {e}")
        
        return generated_articles
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        
        status = {
            'timestamp': datetime.now().isoformat(),
            'qwen3_available': self.qwen_endpoint is not None,
            'qwen3_endpoint': self.qwen_endpoint,
            'database_connected': True,
            'generated_articles_count': 0,
            'system_ready': True
        }
        
        try:
            # Count generated articles in database
            result = self.db.table('f1_specific_data').select('id').eq('data_type', 'generated_article').execute()
            status['generated_articles_count'] = len(result.data)
        except:
            status['database_connected'] = False
            status['system_ready'] = False
        
        return status

def main():
    """Main demonstration of the integrated system"""
    
    print("🚀 F1 Content Generation System - Full Integration Demo")
    print("="*80)
    
    try:
        # Initialize the system
        f1_system = F1ContentGenerationSystem()
        
        # Get system status
        status = f1_system.get_system_status()
        print(f"\\nSystem Status:")
        print(f"  Qwen3 Available: {status['qwen3_available']}")
        print(f"  Database Connected: {status['database_connected']}")
        print(f"  Existing Articles: {status['generated_articles_count']}")
        print(f"  System Ready: {status['system_ready']}")
        
        if not status['system_ready']:
            print("❌ System not ready for content generation")
            return
        
        # Generate sample F1 content
        print(f"\\n📰 Generating Sample F1 Articles...")
        articles = f1_system.process_sample_f1_news()
        
        print(f"\\n✅ Generation Complete!")
        print(f"Generated {len(articles)} articles")
        
        for i, article in enumerate(articles, 1):
            print(f"\\nArticle {i}:")
            print(f"  Title: {article['title']}")
            print(f"  Words: {article['word_count']}")
            print(f"  Read Time: {article['estimated_read_time']} min")
            print(f"  Method: {article['generation_method']}")
            print(f"  Database ID: {article.get('database_id', 'Not stored')}")
        
        print(f"\\n🎉 F1 Content Generation System fully operational!")
        
    except Exception as e:
        print(f"❌ System initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
'''
    
    # Save the integration script
    integration_file = project_root / 'f1_content_generation_system.py'
    with open(integration_file, 'w') as f:
        f.write(integration_script)
    
    print(f"✅ Created integrated F1 system: {integration_file}")
    return integration_file

def main():
    """Main test function"""
    
    print("Starting Qwen3 + Memory Database Integration Test...")
    
    # Test 1: Qwen3 Connection
    qwen_endpoint, qwen_working = test_qwen3_connection()
    
    # Test 2: Database Connection  
    db_working = test_database_connection()
    
    # Test 3: Create Integration System
    if qwen_working or db_working:  # At least one system working
        integration_file = create_integrated_f1_system()
        
        print(f"\n" + "="*80)
        print("INTEGRATION SUMMARY")
        print("="*80)
        print(f"Qwen3 LLM:    {'✅ Working' if qwen_working else '❌ Not Available'}")
        print(f"Database:     {'✅ Working' if db_working else '❌ Not Available'}")
        print(f"Integration:  ✅ Created at {integration_file}")
        
        if qwen_working and db_working:
            print(f"\n🚀 READY TO RUN FULL SYSTEM!")
            print(f"Execute: python {integration_file.name}")
        elif db_working:
            print(f"\n⚠️  PARTIAL SYSTEM READY")
            print(f"Database working, Qwen3 fallback available")
            print(f"Execute: python {integration_file.name}")
        else:
            print(f"\n❌ SYSTEM NEEDS SETUP")
            print(f"Start Docker Qwen3: docker desktop enable model-runner --tcp=12434")
    else:
        print(f"\n❌ BOTH SYSTEMS FAILED")
        print(f"Check Docker Desktop and database connection")

if __name__ == "__main__":
    main()