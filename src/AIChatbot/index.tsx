// Main export file for AIChatbot component
// This provides a clean interface for importing the component and related utilities

// Main component
export { AIChatbot } from './AIChatbot';

// UI Components
export { MessageBubble, ChatInput, TimingInfo, DynamicQuestions } from './components';

// Provider implementations
export { BaseChatProvider, ChatProviderRegistry, providerRegistry } from './providers/ChatProvider';
export { FirebaseChatProvider, createFirebaseProvider } from './providers/FirebaseChatProvider';

// Hooks
export { useChatState } from './hooks/useChatState';

// Types
export type {
  // Core types
  ChatMessage,
  ChatResponse,
  ChatQuestion,
  ChatSource,
  ChatContext,
  ChatbotConfig,
  
  // Provider types
  ChatProvider,
  FirebaseProviderConfig,
  RestAPIProviderConfig,
  
  // Component props
  AIChatbotProps,
  
  // Hook types
  ChatState,
  ChatActions,
  
  // Error types
  ChatbotErrorCode
} from './types';

export { ChatbotError } from './types';

// Utility functions (to be added)
// export * from './utils';