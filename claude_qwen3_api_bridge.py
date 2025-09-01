#!/usr/bin/env python3
"""
Claude Code ↔ Qwen3 API Bridge
Translates Anthropic API requests to Qwen3 format for local Claude Code processing
"""

import json
import requests
from flask import Flask, request, Response, jsonify
import uuid
import time
import os
from datetime import datetime

app = Flask(__name__)

# Configuration - Dynamic port detection
QWEN3_ENDPOINT = os.environ.get('QWEN3_ENDPOINT', "http://localhost:12434/v1/chat/completions")
QWEN3_MODEL = os.environ.get('QWEN3_MODEL', "qwen2.5:latest")
BRIDGE_PORT = int(os.environ.get('BRIDGE_PORT', 11434))

print(f"Claude Code <-> Qwen3 API Bridge Starting...")
print(f"Bridging: Claude Code -> localhost:{BRIDGE_PORT} -> Qwen3 {QWEN3_ENDPOINT}")
print(f"Model mapping: Claude models -> {QWEN3_MODEL}")
print("Ready for Claude Code local processing!")

# Model name mappings (Claude Code → Qwen3)
MODEL_MAPPING = {
    "claude-3-5-sonnet-20241022": QWEN3_MODEL,
    "claude-3-sonnet-20240229": QWEN3_MODEL,
    "claude-3-opus-20240229": QWEN3_MODEL,
    "claude-3-haiku-20240307": QWEN3_MODEL,
    "claude-sonnet-4-20250514": QWEN3_MODEL,
    # Add any other Claude model names that might be used
}

@app.before_request
def log_request():
    """Log all incoming requests for debugging"""
    print(f"Incoming request: {request.method} {request.path}")
    print(f"Headers: {dict(request.headers)}")

# Catch-all route to see what Claude Code is trying to hit
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    if request.path == '/v1/messages':
        return anthropic_messages_endpoint()
    print(f"Catch-all: {request.method} /{path}")
    print(f"Headers: {dict(request.headers)}")
    return jsonify({"error": "Endpoint not found", "tried_path": f"/{path}"}), 404

@app.route('/v1/messages', methods=['POST'])
def anthropic_messages_endpoint():
    """Handle Anthropic Messages API format"""
    try:
        data = request.get_json()
        
        # Convert Anthropic messages format to OpenAI chat format
        openai_request = convert_anthropic_to_openai(data)
        
        # Send to local Qwen3
        response = requests.post(
            QWEN3_ENDPOINT,
            json=openai_request,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        if response.status_code == 200:
            openai_response = response.json()
            # Convert OpenAI response back to Anthropic format
            anthropic_response = convert_openai_to_anthropic(openai_response, data)
            return jsonify(anthropic_response)
        else:
            return Response(
                json.dumps({"error": {"type": "api_error", "message": f"Qwen3 API error: {response.text}"}}),
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
    """Handle OpenAI Chat Completions format (fallback)"""
    try:
        data = request.get_json()
        
        # Map model name if needed
        if data.get('model') in MODEL_MAPPING:
            data['model'] = MODEL_MAPPING[data['model']]
        else:
            data['model'] = QWEN3_MODEL
        
        # Send to local Qwen3
        response = requests.post(
            QWEN3_ENDPOINT,
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        return Response(
            response.content,
            status=response.status_code,
            mimetype='application/json'
        )
        
    except Exception as e:
        print(f"Bridge error: {e}")
        return Response(
            json.dumps({"error": {"type": "internal_error", "message": str(e)}}),
            status=500,
            mimetype='application/json'
        )

def convert_anthropic_to_openai(anthropic_request):
    """Convert Anthropic Messages API format to OpenAI Chat Completions format"""
    
    # Extract messages from Anthropic format
    messages = anthropic_request.get('messages', [])
    
    # Convert Anthropic messages to OpenAI format
    openai_messages = []
    
    # Add system message if present
    if 'system' in anthropic_request:
        openai_messages.append({
            "role": "system",
            "content": anthropic_request['system']
        })
    
    # Convert user/assistant messages
    for msg in messages:
        role = msg.get('role')
        content = msg.get('content')
        
        # Handle content that might be a list (multimodal) or string
        if isinstance(content, list):
            # For now, just extract text content
            text_content = ""
            for item in content:
                if item.get('type') == 'text':
                    text_content += item.get('text', '')
            content = text_content
        
        openai_messages.append({
            "role": role,
            "content": content
        })
    
    # Build OpenAI request
    openai_request = {
        "model": MODEL_MAPPING.get(anthropic_request.get('model', ''), QWEN3_MODEL),
        "messages": openai_messages,
        "max_tokens": anthropic_request.get('max_tokens', 1000),
        "temperature": anthropic_request.get('temperature', 0.7),
        "top_p": anthropic_request.get('top_p', 1.0),
        "stream": anthropic_request.get('stream', False)
    }
    
    return openai_request

def convert_openai_to_anthropic(openai_response, original_request):
    """Convert OpenAI Chat Completions response to Anthropic Messages format"""
    
    try:
        choice = openai_response.get('choices', [{}])[0]
        message = choice.get('message', {})
        content = message.get('content', '')
        
        # Build Anthropic response format
        anthropic_response = {
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
            "stop_reason": "end_turn" if choice.get('finish_reason') == 'stop' else choice.get('finish_reason'),
            "stop_sequence": None,
            "usage": {
                "input_tokens": openai_response.get('usage', {}).get('prompt_tokens', 0),
                "output_tokens": openai_response.get('usage', {}).get('completion_tokens', 0)
            }
        }
        
        return anthropic_response
        
    except Exception as e:
        print(f"Response conversion error: {e}")
        # Fallback response
        return {
            "id": f"msg_{uuid.uuid4().hex[:24]}",
            "type": "message", 
            "role": "assistant",
            "content": [{"type": "text", "text": "Bridge conversion error"}],
            "model": original_request.get('model', 'claude-3-5-sonnet-20241022'),
            "stop_reason": "error",
            "usage": {"input_tokens": 0, "output_tokens": 0}
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test connection to Qwen3
        test_request = {
            "model": QWEN3_MODEL,
            "messages": [{"role": "user", "content": "test"}],
            "max_tokens": 5
        }
        
        response = requests.post(
            QWEN3_ENDPOINT,
            json=test_request,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            return jsonify({
                "status": "healthy",
                "qwen3_endpoint": QWEN3_ENDPOINT,
                "qwen3_model": QWEN3_MODEL,
                "bridge_port": BRIDGE_PORT,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "unhealthy",
                "error": f"Qwen3 connection failed: {response.status_code}"
            }), 500
            
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(
        host='localhost',
        port=BRIDGE_PORT,
        debug=True,
        threaded=True
    )