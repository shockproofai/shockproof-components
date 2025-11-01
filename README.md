# @shockproofai/ai-chatbot-component

A reusable AI Chatbot React component for ShockProof AI applications with Firebase backend support.

## Features

- 🚀 **Streaming responses** with real-time content display
- 🔧 **Configurable UI** with themes and customization options
- 📊 **Performance metrics** with detailed timing and token usage
- 🤖 **Multi-agent support** with agent switching capability
- ❓ **Dynamic questions** with contextual suggestions
- 🔒 **Firebase integration** with authentication support
- 📱 **Responsive design** with mobile-friendly interface
- ⚡ **TypeScript support** with full type safety

## Installation

### Option 1: Git Dependency (Recommended for internal use)

```bash
npm install git+https://github.com/shockproofai/ai-chatbot-component.git#v1.0.0
```

### Option 2: GitHub Packages

```bash
npm install @shockproofai/ai-chatbot-component
```

## Peer Dependencies

Make sure you have these installed in your app:

```bash
npm install firebase react react-dom
```

## Quick Start

```tsx
import React from 'react';
import { AIChatbot, createFirebaseProvider } from '@shockproofai/ai-chatbot-component';
import { chatService } from './services/ChatService'; // Your Firebase chat service

function App() {
  // Create Firebase provider
  const provider = React.useMemo(() => {
    return createFirebaseProvider({
      chatService: chatService,
      agentOptions: ['askRex', 'askRexTest'],
      authRequired: true
    });
  }, []);

  // Component configuration
  const config = {
    title: "Ask Rex",
    subtitle: "Ask questions about commercial lending and credit analysis",
    enableStreaming: true,
    streamingThreshold: 300,
    enableSources: true,
    enableQuestions: true,
    showTimingInfo: true,
    showAgentSwitcher: true,
    theme: 'auto' as const,
    placeholder: 'Ask a question...',
    welcomeMessage: 'How can I help you today?'
  };

  return (
    <div style={{ height: '100vh' }}>
      <AIChatbot
        provider={provider}
        config={config}
        onMessageSent={(message) => console.log('Sent:', message)}
        onMessageReceived={(response) => console.log('Received:', response)}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

## Configuration Options

```tsx
interface ChatbotConfig {
  // Core settings
  enableStreaming?: boolean;        // Enable real-time streaming
  streamingThreshold?: number;      // Min chars before streaming starts
  enableSources?: boolean;          // Show source references
  enableQuestions?: boolean;        // Show suggested questions
  showTimingInfo?: boolean;         // Show performance metrics
  showAgentSwitcher?: boolean;      // Show agent selection
  
  // UI customization
  theme?: 'light' | 'dark' | 'auto';
  title?: string;
  subtitle?: string;
  placeholder?: string;
  welcomeMessage?: string;
  
  // Questions
  questions?: ChatQuestion[];
  maxInitialQuestions?: number;
  
  // Behavior
  maxHistoryLength?: number;
  retryEnabled?: boolean;
  debugStreaming?: boolean;
}
```

## Provider Setup

### Firebase Provider

```tsx
import { createFirebaseProvider } from '@shockproofai/ai-chatbot-component';

const provider = createFirebaseProvider({
  chatService: yourChatService,     // Your Firebase chat service instance
  agentOptions: ['askRex'],         // Available AI agents
  authRequired: true,               // Require Firebase auth
  enableQuestions: true,            // Enable question suggestions
  enableSources: true,              // Enable source references
  streamingThreshold: 300           // Default streaming threshold
});
```

## Styling

Import the CSS file in your app:

```tsx
import '@shockproofai/ai-chatbot-component/styles';
```

## Advanced Usage

### Custom Message Handling

```tsx
<AIChatbot
  provider={provider}
  config={config}
  onMessageSent={(message) => {
    // Track message analytics
    analytics.track('message_sent', { message });
  }}
  onMessageReceived={(response) => {
    // Process response
    console.log('Tokens used:', response.tokenUsage);
    console.log('Response time:', response.timings);
  }}
  onError={(error) => {
    // Handle errors
    errorReporting.captureException(error);
  }}
/>
```

### Custom Styling

```tsx
<AIChatbot
  className="my-custom-chatbot"
  style={{ borderRadius: '12px' }}
  provider={provider}
  config={config}
/>
```

## Firebase Setup Requirements

Your Firebase project needs:

1. **Firebase Functions** for chat processing
2. **Firestore** for conversation storage
3. **Firebase Auth** for user authentication
4. **ChatService** implementation (see examples)

## Version Tags

Use specific version tags for stability:

```bash
# Latest stable
npm install git+https://github.com/shockproofai/ai-chatbot-component.git#v1.0.0

# Development
npm install git+https://github.com/shockproofai/ai-chatbot-component.git#main
```

## Development

```bash
# Clone the repo
git clone https://github.com/shockproofai/ai-chatbot-component.git

# Install dependencies
npm install

# Build the component
npm run build

# Watch for changes
npm run dev
```

## License

MIT - Internal use for ShockProof AI applications