// AIChatbot Component Exports
export { AIChatbot } from './AIChatbot';
export { createFirebaseProvider } from './providers/FirebaseChatProvider';

// Hooks
export { useChatState } from './hooks/useChatState';

// Components (for advanced customization)
export { 
  MessageBubble, 
  ChatInput, 
  TimingInfo, 
  DynamicQuestions,
  FALLBACK_QUESTIONS // Export default fallback questions for customization
} from './components';

// Types
export type { 
  ChatbotConfig,
  ChatMessage,
  ChatResponse,
  ChatQuestion,
  ChatContext,
  TokenUsage,
  StreamingMetrics
} from './types';

// Provider base class
export { BaseChatProvider } from './providers/ChatProvider';