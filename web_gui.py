#!/usr/bin/env python3
"""
Mobile Web GUI for Claude + Qwen3 Container
Simple interface for phone access to local Claude processing
"""

from flask import Flask, render_template, request, jsonify, Response
import requests
import json
import time
from datetime import datetime
import threading
import queue
import uuid

app = Flask(__name__)

# Configuration
CLAUDE_API_URL = "http://localhost:11434"
GUI_PORT = 8080

# Chat session storage
chat_sessions = {}
active_sessions = set()

@app.route('/')
def mobile_gui():
    """Main mobile GUI page"""
    return render_template('mobile_chat.html')

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Handle chat requests from mobile GUI"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        # Initialize session if new
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                'messages': [],
                'created': datetime.now().isoformat(),
                'last_activity': datetime.now().isoformat()
            }
        
        # Add user message to session
        chat_sessions[session_id]['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Send to Claude via API bridge
        claude_request = {
            "model": "claude-3-5-sonnet-20241022",
            "messages": [
                {"role": "user", "content": message}
            ],
            "max_tokens": 1000
        }
        
        # Call local Claude API
        response = requests.post(
            f"{CLAUDE_API_URL}/v1/chat/completions",
            json=claude_request,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if response.status_code == 200:
            claude_response = response.json()
            assistant_message = claude_response.get('choices', [{}])[0].get('message', {}).get('content', 'No response')
            
            # Add assistant response to session
            chat_sessions[session_id]['messages'].append({
                'role': 'assistant', 
                'content': assistant_message,
                'timestamp': datetime.now().isoformat()
            })
            
            # Update session activity
            chat_sessions[session_id]['last_activity'] = datetime.now().isoformat()
            
            return jsonify({
                'success': True,
                'response': assistant_message,
                'session_id': session_id,
                'message_count': len(chat_sessions[session_id]['messages'])
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Claude API error: {response.status_code}",
                'details': response.text
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all chat sessions"""
    return jsonify({
        'sessions': [
            {
                'id': session_id,
                'created': session_data['created'],
                'last_activity': session_data['last_activity'],
                'message_count': len(session_data['messages'])
            }
            for session_id, session_data in chat_sessions.items()
        ]
    })

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get specific session history"""
    if session_id in chat_sessions:
        return jsonify({
            'success': True,
            'session': chat_sessions[session_id]
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Session not found'
        }), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check for mobile GUI"""
    try:
        # Check if Claude API bridge is accessible
        claude_health = requests.get(f"{CLAUDE_API_URL}/health", timeout=5)
        claude_status = claude_health.status_code == 200
        
        return jsonify({
            'status': 'healthy' if claude_status else 'degraded',
            'claude_api': claude_status,
            'active_sessions': len(chat_sessions),
            'gui_port': GUI_PORT,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get usage statistics"""
    total_messages = sum(len(session['messages']) for session in chat_sessions.values())
    
    return jsonify({
        'total_sessions': len(chat_sessions),
        'total_messages': total_messages,
        'active_sessions': len([s for s in chat_sessions.values() 
                              if (datetime.now() - datetime.fromisoformat(s['last_activity'].replace('Z', '+00:00').replace('+00:00', ''))).seconds < 3600]),
        'uptime': time.time() - start_time,
        'timestamp': datetime.now().isoformat()
    })

# Store start time for uptime calculation
start_time = time.time()

if __name__ == '__main__':
    print(f"Mobile Web GUI starting on port {GUI_PORT}")
    print(f"Access from phone: http://YOUR_IP:{GUI_PORT}")
    print(f"Claude API Bridge: {CLAUDE_API_URL}")
    print("Ready for mobile Claude Code access!")
    
    app.run(
        host='0.0.0.0',  # Allow access from any device on network
        port=GUI_PORT,
        debug=False,
        threaded=True
    )