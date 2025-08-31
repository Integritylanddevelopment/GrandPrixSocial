#!/usr/bin/env python3
"""
Claude Code <-> Ollama API Bridge for Docker Container
Integrated Claude + Qwen3 processing in single container
"""

import json
import requests
from flask import Flask, request, Response, jsonify
import uuid
import time
from datetime import datetime
import threading

app = Flask(__name__)

# Configuration for container environment
OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
OLLAMA_CHAT_ENDPOINT = "http://localhost:11434/api/chat"
QWEN_MODEL = "qwen2.5:7b"
BRIDGE_PORT = 11434

# Model name mappings
MODEL_MAPPING = {
    "claude-3-5-sonnet-20241022": QWEN_MODEL,
    "claude-3-sonnet-20240229": QWEN_MODEL,
    "claude-3-opus-20240229": QWEN_MODEL,
    "claude-3-haiku-20240307": QWEN_MODEL,
    "claude-sonnet-4-20250514": QWEN_MODEL,
}

@app.route('/v1/messages', methods=['POST'])
def anthropic_messages_endpoint():
    """Handle Anthropic Messages API format"""
    try:
        data = request.get_json()
        
        # Convert to Ollama chat format
        ollama_request = convert_anthropic_to_ollama_chat(data)
        
        # Send to Ollama
        response = requests.post(
            OLLAMA_CHAT_ENDPOINT,
            json=ollama_request,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        if response.status_code == 200:
            ollama_response = response.json()
            # Convert back to Anthropic format
            anthropic_response = convert_ollama_to_anthropic(ollama_response, data)
            return jsonify(anthropic_response)
        else:
            return Response(
                json.dumps({"error": {"type": "api_error", "message": f"Ollama API error: {response.text}"}}),
                status=500,
                mimetype='application/json'
            )
            
    except Exception as e:
        print(f"Bridge error: {e}")
        return Response(
            json.dumps({"error": {"type": "internal_error", "message": str(e)}}),
            status=500,
            mimetype='application/json'
        )

@app.route('/v1/chat/completions', methods=['POST'])
def openai_chat_endpoint():
    """Handle OpenAI Chat Completions format"""
    try:
        data = request.get_json()
        
        # Convert OpenAI to Ollama format
        ollama_request = convert_openai_to_ollama(data)
        
        # Send to Ollama
        response = requests.post(
            OLLAMA_CHAT_ENDPOINT,
            json=ollama_request,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        if response.status_code == 200:
            ollama_response = response.json()
            # Convert back to OpenAI format
            openai_response = convert_ollama_to_openai(ollama_response, data)
            return jsonify(openai_response)
        else:
            return Response(
                json.dumps({"error": {"type": "api_error", "message": f"Ollama API error: {response.text}"}}),
                status=500,
                mimetype='application/json'
            )
            
    except Exception as e:
        print(f"Bridge error: {e}")
        return Response(
            json.dumps({"error": {"type": "internal_error", "message": str(e)}}),
            status=500,
            mimetype='application/json'
        )

def convert_anthropic_to_ollama_chat(anthropic_request):
    """Convert Anthropic Messages API to Ollama chat format"""
    
    messages = anthropic_request.get('messages', [])
    
    # Convert messages
    ollama_messages = []
    
    # Add system message if present
    if 'system' in anthropic_request:
        ollama_messages.append({
            "role": "system",
            "content": anthropic_request['system']
        })
    
    # Convert user/assistant messages
    for msg in messages:
        role = msg.get('role')
        content = msg.get('content')
        
        # Handle content that might be a list or string
        if isinstance(content, list):
            text_content = ""
            for item in content:
                if item.get('type') == 'text':
                    text_content += item.get('text', '')
            content = text_content
        
        ollama_messages.append({
            "role": role,
            "content": content
        })
    
    return {
        "model": QWEN_MODEL,
        "messages": ollama_messages,
        "stream": False
    }

def convert_openai_to_ollama(openai_request):
    """Convert OpenAI format to Ollama format"""
    
    return {
        "model": QWEN_MODEL,
        "messages": openai_request.get('messages', []),
        "stream": False
    }

def convert_ollama_to_anthropic(ollama_response, original_request):
    """Convert Ollama response to Anthropic Messages format"""
    
    try:
        content = ollama_response.get('message', {}).get('content', '')
        
        return {
            "id": f"msg_{uuid.uuid4().hex[:24]}",
            "type": "message",
            "role": "assistant", 
            "content": [
                {
                    "type": "text",
                    "text": content
                }
            ],
            "model": original_request.get('model', 'claude-3-5-sonnet-20241022'),
            "stop_reason": "end_turn",
            "stop_sequence": None,
            "usage": {
                "input_tokens": ollama_response.get('prompt_eval_count', 0),
                "output_tokens": ollama_response.get('eval_count', 0)
            }
        }
        
    except Exception as e:
        print(f"Response conversion error: {e}")
        return {
            "id": f"msg_{uuid.uuid4().hex[:24]}",
            "type": "message",
            "role": "assistant",
            "content": [{"type": "text", "text": "Bridge conversion error"}],
            "model": original_request.get('model', 'claude-3-5-sonnet-20241022'),
            "stop_reason": "error",
            "usage": {"input_tokens": 0, "output_tokens": 0}
        }

def convert_ollama_to_openai(ollama_response, original_request):
    """Convert Ollama response to OpenAI format"""
    
    try:
        content = ollama_response.get('message', {}).get('content', '')
        
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:24]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": original_request.get('model', 'gpt-3.5-turbo'),
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": content
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": ollama_response.get('prompt_eval_count', 0),
                "completion_tokens": ollama_response.get('eval_count', 0),
                "total_tokens": ollama_response.get('prompt_eval_count', 0) + ollama_response.get('eval_count', 0)
            }
        }
        
    except Exception as e:
        print(f"Response conversion error: {e}")
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:24]}",
            "object": "chat.completion", 
            "created": int(time.time()),
            "model": original_request.get('model', 'gpt-3.5-turbo'),
            "choices": [{"index": 0, "message": {"role": "assistant", "content": "Bridge conversion error"}, "finish_reason": "error"}],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test connection to Ollama
        response = requests.get('http://localhost:11434/api/version', timeout=5)
        
        if response.status_code == 200:
            return jsonify({
                "status": "healthy",
                "ollama_endpoint": OLLAMA_CHAT_ENDPOINT,
                "qwen_model": QWEN_MODEL,
                "bridge_port": BRIDGE_PORT,
                "container_mode": True,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "unhealthy",
                "error": f"Ollama connection failed: {response.status_code}"
            }), 500
            
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/claude', methods=['POST'])
def claude_endpoint():
    """Special Claude Code endpoint for container"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        # Direct Ollama generate call for simple prompts
        ollama_request = {
            "model": QWEN_MODEL,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(
            OLLAMA_ENDPOINT,
            json=ollama_request,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        if response.status_code == 200:
            ollama_response = response.json()
            return jsonify({
                "response": ollama_response.get('response', ''),
                "model": QWEN_MODEL,
                "created": int(time.time())
            })
        else:
            return Response(
                json.dumps({"error": f"Ollama error: {response.text}"}),
                status=500,
                mimetype='application/json'
            )
            
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}),
            status=500,
            mimetype='application/json'
        )

if __name__ == '__main__':
    print("Claude + Qwen3 Integrated Bridge Starting...")
    print(f"Container Mode: Ollama + API Bridge on port {BRIDGE_PORT}")
    print(f"Model: {QWEN_MODEL}")
    print("Ready for local Claude Code processing!")
    
    # Run on all interfaces for container access
    app.run(
        host='0.0.0.0',
        port=BRIDGE_PORT,
        debug=False,
        threaded=True
    )