# 🤖 Claude Dev Chat Interface

A local development tool for chatting directly with Claude from your machine.

## Features

- **Direct Claude API Integration**: Chat with Claude using your own API key
- **Voice Input**: Click the microphone to speak your messages (Chrome/Edge)
- **Real-time Conversations**: Instant responses with typing indicators  
- **Chat History**: Automatically saves and loads your conversation history
- **Mobile Responsive**: Works great on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Quick navigation and controls
- **Secure**: API key stored locally in your browser

## Quick Start

1. **Open the Interface**
   ```bash
   # Navigate to the file and open in your browser
   cd C:\D_Drive\ActiveProjects\GrandPrixSocial\dev-tools
   # Then open claude-chat.html in your browser
   ```

2. **Get Your API Key**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Create an account and get your API key
   - The interface will prompt you for it on first use

3. **Start Chatting!**
   - Type your message and press Enter
   - Use Shift+Enter for new lines
   - Click 🎤 for voice input
   - Chat history is automatically saved

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line
- `Ctrl/Cmd + K` - Focus message input
- `Ctrl/Cmd + Shift + C` - Clear chat history

## Voice Features

- **Voice Input**: Click the microphone button to speak your message
- **Auto-transcription**: Speech is converted to text automatically
- **Visual Feedback**: Button pulses red while recording

## API Configuration

The interface connects directly to Anthropic's Claude API. Your API key is stored securely in your browser's local storage.

### Cost Notes
- Claude API usage is paid per token
- Typical conversation costs a few cents
- Monitor your usage in the Anthropic Console

## Development Features

Perfect for:
- ✅ Quick questions while coding
- ✅ Code reviews and explanations  
- ✅ Debugging help
- ✅ Architecture discussions
- ✅ Documentation writing
- ✅ Testing ideas

## Security

- API key stored locally in browser only
- No data sent to external servers except Anthropic
- Chat history stored locally
- Clear history anytime with Ctrl+Shift+C

## Troubleshooting

**API Connection Issues:**
- Check your API key in Anthropic Console
- Ensure you have available credits
- Check browser console for error details

**Voice Not Working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check system microphone settings

**Chat Not Loading:**
- Clear browser cache and local storage
- Refresh the page
- Check browser console for errors

## Advanced Usage

### Custom Model
Edit the JavaScript to use different Claude models:
```javascript
model: 'claude-3-haiku-20240307'  // Faster, cheaper
model: 'claude-3-sonnet-20240229' // Balanced (default)
model: 'claude-3-opus-20240229'   // Most capable
```

### Longer Conversations
Increase max_tokens for longer responses:
```javascript
max_tokens: 2000  // Longer responses
```

### System Messages
Add system context by modifying the messages array in `callClaudeAPI()`.

## File Structure

```
dev-tools/
├── claude-chat.html     # Main chat interface
├── README.md           # This file
└── (future tools)      # More dev tools coming soon
```

Enjoy your direct line to Claude for all your development needs! 🚀