# @shockproofai/shockproof-components

A comprehensive React components library for ShockProof AI applications. This library provides reusable, production-ready components with Firebase integration and TypeScript support.

## 🚀 Components

### 🤖 AI Chatbot Component
- **Streaming responses** with real-time content display
- **Multi-agent support** with agent switching
- **Performance metrics** with timing and token usage
- **Dynamic questions** with contextual suggestions
- **Firebase integration** with authentication
- **Fully customizable** UI and behavior

### 🔮 Future Components
- Data Tables & Grids
- Form Builder & Validation
- Charts & Visualizations
- Navigation & Layout
- Authentication Components

## 📦 Installation

### Git Dependency (Recommended for internal use)

```bash
npm install git+https://github.com/shockproofai/shockproof-components.git#v1.0.0
```

### Peer Dependencies

```bash
npm install firebase react react-dom
```

## 🚀 Quick Start

### AI Chatbot

```tsx
import React from 'react';
import { AIChatbot, createFirebaseProvider } from '@shockproofai/shockproof-components';
import '@shockproofai/shockproof-components/styles';

function App() {
  const provider = React.useMemo(() => {
    return createFirebaseProvider({
      chatService: yourChatService,
      agentOptions: ['askRex', 'askRexTest'],
      authRequired: true
    });
  }, []);

  const config = {
    title: "Ask Rex",
    subtitle: "AI Assistant for your domain",
    enableStreaming: true,
    enableSources: true,
    enableQuestions: true,
    showTimingInfo: true,
    theme: 'auto' as const
  };

  return (
    <div style={{ height: '100vh' }}>
      <AIChatbot provider={provider} config={config} />
    </div>
  );
}
```

## 📖 Component Documentation

### AIChatbot

The AI Chatbot component provides a complete chat interface with streaming, sources, and performance metrics.

#### Props

```tsx
interface AIChatbotProps {
  provider: ChatProvider;
  config: ChatbotConfig;
  className?: string;
  style?: React.CSSProperties;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (response: ChatResponse) => void;
  onError?: (error: Error) => void;
}
```

#### Configuration

```tsx
interface ChatbotConfig {
  // Core features
  enableStreaming?: boolean;
  streamingThreshold?: number;
  enableSources?: boolean;
  enableQuestions?: boolean;
  showTimingInfo?: boolean;
  showAgentSwitcher?: boolean;
  
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

## 🔌 Provider Setup

### Firebase Provider

```tsx
import { createFirebaseProvider } from '@shockproofai/shockproof-components';

const provider = createFirebaseProvider({
  chatService: yourChatService,    // Your existing ChatService
  agentOptions: ['askRex'],        // Available agents
  authRequired: true,              // Require authentication
  enableQuestions: true,           // Enable dynamic questions
  enableSources: true              // Enable source references
});
```

## 🎨 Import Patterns

### Full Library Import

```tsx
import { AIChatbot, createFirebaseProvider } from '@shockproofai/shockproof-components';
```

### Component-Specific Import

```tsx
import { AIChatbot } from '@shockproofai/shockproof-components/AIChatbot';
```

### Advanced Components

```tsx
import { 
  MessageBubble, 
  ChatInput, 
  TimingInfo, 
  useChatState 
} from '@shockproofai/shockproof-components';
```

## 🏗️ Architecture

### Component Structure

```
shockproof-components/
├── src/
│   ├── AIChatbot/           # Complete chatbot component
│   │   ├── AIChatbot.tsx    # Main component
│   │   ├── components/      # Sub-components
│   │   ├── hooks/           # Custom hooks
│   │   ├── providers/       # Provider implementations
│   │   └── types/           # TypeScript definitions
│   ├── shared/              # Shared utilities
│   │   ├── hooks/           # Common hooks
│   │   ├── types/           # Common types
│   │   └── utils/           # Utility functions
│   └── styles/              # Global styles
```

### Firebase Integration

- **Peer Dependencies**: Firebase managed by consuming apps
- **Shared Project**: All apps use same Firebase configuration
- **No Duplication**: Single Firebase SDK across applications
- **Flexible Authentication**: Works with existing auth setup

## 📱 App Integration

### For Each ShockProof AI App

```tsx
// Use your existing Firebase setup - no changes needed
import { chatService } from './services/ChatService';

const provider = createFirebaseProvider({
  chatService: chatService,  // Your existing service
  agentOptions: ['askRex', 'askRexTest'],
  authRequired: true
});

// Customize per app
const config = {
  title: "App-Specific Assistant",
  subtitle: "Customized for your app domain",
  welcomeMessage: "Welcome to [App Name]! How can I help?",
  placeholder: "Ask about [your domain]..."
};
```

## 🔄 Updates & Versioning

### Update Component Library

```bash
# Create new version
git tag v1.1.0
git push origin v1.1.0

# Update in apps
npm install git+https://github.com/shockproofai/shockproof-components.git#v1.1.0
```

### Version Strategy

- **Major (v2.0.0)**: Breaking changes
- **Minor (v1.1.0)**: New components or features
- **Patch (v1.0.1)**: Bug fixes and improvements

## 🏢 Monorepo Migration Ready

When consolidating to monorepo:

```json
{
  "dependencies": {
    "@shockproofai/shockproof-components": "workspace:*"
  }
}
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/shockproofai/shockproof-components.git

# Install dependencies
npm install

# Build library
npm run build

# Watch for changes
npm run dev

# Type checking
npm run type-check
```

## 📋 Roadmap

### Phase 1 (Current)
- ✅ AI Chatbot Component
- ✅ Firebase Provider
- ✅ TypeScript Support

### Phase 2 (Future)
- 📊 Data Table Component
- 📝 Form Builder Component
- 📈 Charts & Visualizations
- 🎨 Theme System

### Phase 3 (Future)
- 🧭 Navigation Components
- 🔐 Authentication Components
- 📱 Mobile Optimizations
- 🎛️ Advanced Customization

## 🤝 Contributing

For internal ShockProof AI development:

1. Create feature branch
2. Implement component with tests
3. Update documentation
4. Create pull request
5. Tag release version

## 📄 License

MIT - Internal use for ShockProof AI applications