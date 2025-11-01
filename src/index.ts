// Main exports
export { AIChatbot } from './AIChatbot';
export { createFirebaseProvider } from './providers/FirebaseChatProvider';

// Type exports
export type { 
  ChatbotConfig,
  ChatMessage,
  ChatResponse,
  ChatQuestion,
  ChatContext,
  TokenUsage,
  StreamingMetrics
} from './types';

// Advanced exports for customization
export { useChatState } from './hooks/useChatState';
export { 
  MessageBubble, 
  ChatInput, 
  TimingInfo, 
  DynamicQuestions 
} from './components';

// Provider base class for custom implementations
export { BaseChatProvider } from './providers/ChatProvider';