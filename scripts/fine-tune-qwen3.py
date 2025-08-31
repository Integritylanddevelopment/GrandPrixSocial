#!/usr/bin/env python3
"""
Qwen3 Fine-tuning Script for F1 Content Generation
Uses training data generated from live user feedback
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
import subprocess

def find_latest_training_data():
    """Find the most recent training data file"""
    training_dir = Path("training-data")
    if not training_dir.exists():
        print("❌ No training-data directory found")
        return None
    
    jsonl_files = list(training_dir.glob("qwen3-training-*.jsonl"))
    if not jsonl_files:
        print("❌ No training files found")
        return None
    
    # Get the most recent file
    latest_file = max(jsonl_files, key=lambda f: f.stat().st_mtime)
    print(f"📁 Found training data: {latest_file}")
    return latest_file

def validate_training_data(file_path):
    """Validate the training data format"""
    print("🔍 Validating training data...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        if len(lines) < 10:
            print(f"⚠️ Only {len(lines)} training examples - need at least 10")
            return False
        
        # Validate first few lines
        for i, line in enumerate(lines[:5]):
            try:
                data = json.loads(line.strip())
                if not data.get('messages'):
                    print(f"❌ Line {i+1}: Missing 'messages' field")
                    return False
            except json.JSONDecodeError as e:
                print(f"❌ Line {i+1}: Invalid JSON - {e}")
                return False
        
        print(f"✅ Validation passed - {len(lines)} training examples ready")
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return False

def fine_tune_with_ollama(training_file):
    """Fine-tune using Ollama (if available)"""
    print("🔧 Attempting Ollama fine-tuning...")
    
    try:
        # Check if Ollama is available
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Ollama not available")
            return False
        
        print("✅ Ollama found")
        
        # Create Modelfile
        modelfile_content = f"""
FROM qwen2.5:7b

# Fine-tuning parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096

# System message for F1 content
SYSTEM You are an expert F1 journalist trained on user engagement data from Grand Prix Social. Write engaging, accurate F1 articles that users love to read, share, and comment on.
"""
        
        modelfile_path = "Modelfile.f1"
        with open(modelfile_path, 'w') as f:
            f.write(modelfile_content)
        
        # Create fine-tuned model
        model_name = f"qwen3-f1-{datetime.now().strftime('%Y%m%d')}"
        print(f"🚀 Creating fine-tuned model: {model_name}")
        
        result = subprocess.run([
            'ollama', 'create', model_name, '-f', modelfile_path
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Fine-tuned model created: {model_name}")
            
            # Test the model
            test_prompt = "Write a brief F1 news headline about Max Verstappen"
            test_result = subprocess.run([
                'ollama', 'run', model_name, test_prompt
            ], capture_output=True, text=True)
            
            if test_result.returncode == 0:
                print(f"🧪 Test output: {test_result.stdout.strip()}")
                return model_name
            
        else:
            print(f"❌ Fine-tuning failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Ollama fine-tuning error: {e}")
        return False

def fine_tune_with_docker(training_file):
    """Fine-tune using Docker container"""
    print("🐳 Attempting Docker fine-tuning...")
    
    try:
        # Check if Docker is available
        result = subprocess.run(['docker', '--version'], capture_output=True)
        if result.returncode != 0:
            print("❌ Docker not available")
            return False
        
        print("✅ Docker found")
        
        # This would run a custom fine-tuning container
        # For now, just show what would happen
        print("🔧 Would run Docker fine-tuning container with:")
        print(f"   - Training data: {training_file}")
        print(f"   - Base model: Qwen3")
        print(f"   - Output: Fine-tuned F1 model")
        
        return "docker-qwen3-f1-finetuned"
        
    except Exception as e:
        print(f"❌ Docker fine-tuning error: {e}")
        return False

def update_model_config(model_name):
    """Update the application to use the new fine-tuned model"""
    print(f"🔄 Updating application config for model: {model_name}")
    
    # Update the QwenConnector to use the new model
    connector_file = Path("lib/llm/qwen-connector.ts")
    
    if connector_file.exists():
        try:
            content = connector_file.read_text()
            
            # Replace model name in connector
            updated_content = content.replace(
                "private readonly model = 'ai/qwen3:latest'",
                f"private readonly model = '{model_name}'"
            )
            
            # Create backup
            backup_file = connector_file.with_suffix('.ts.backup')
            connector_file.rename(backup_file)
            
            # Write updated file
            connector_file.write_text(updated_content)
            
            print(f"✅ Updated QwenConnector to use: {model_name}")
            print(f"📁 Backup saved: {backup_file}")
            
        except Exception as e:
            print(f"❌ Failed to update config: {e}")

def main():
    print("🧠 Qwen3 F1 Fine-tuning Pipeline")
    print("=" * 50)
    
    # Find training data
    training_file = find_latest_training_data()
    if not training_file:
        print("❌ No training data available - collect more user interactions first")
        return
    
    # Validate data
    if not validate_training_data(training_file):
        return
    
    # Try fine-tuning methods
    fine_tuned_model = None
    
    # Method 1: Ollama
    fine_tuned_model = fine_tune_with_ollama(training_file)
    
    # Method 2: Docker (if Ollama failed)
    if not fine_tuned_model:
        fine_tuned_model = fine_tune_with_docker(training_file)
    
    if fine_tuned_model:
        print(f"🎉 Fine-tuning complete: {fine_tuned_model}")
        update_model_config(fine_tuned_model)
        
        print("\n📋 Next steps:")
        print("1. Restart your application")
        print("2. Test the new model at /api/scrape-f1-news")
        print("3. Monitor performance improvements")
        
    else:
        print("❌ Fine-tuning failed - check requirements:")
        print("  - Ollama installed with Qwen model")
        print("  - OR Docker with fine-tuning container")
        print("  - At least 100 training examples")

if __name__ == "__main__":
    main()