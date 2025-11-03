// ShockProof Components Library
// Main exports for all reusable components

// === Black Box Chatbot Component (v2.0) ===
export { Chatbot } from './Chatbot';
export type { ChatbotConfig } from './Chatbot';
export { ChatService } from './services';
export type { ChatServiceInterface } from './services';

// === AI Chatbot Component (Legacy/Advanced) ===
export {
  AIChatbot,
  createFirebaseProvider,
  useChatState,
  MessageBubble,
  ChatInput,
  TimingInfo,
  DynamicQuestions,
  BaseChatProvider
} from './AIChatbot';

export type {
  ChatbotConfig as AIChatbotConfig,
  ChatMessage,
  ChatResponse,
  ChatQuestion,
  ChatContext,
  TokenUsage,
  StreamingMetrics
} from './AIChatbot';

// === Future Components ===
// export { DataTable } from './DataTable';
// export { FormBuilder } from './FormBuilder';
// export { Charts } from './Charts';

// === Shared Utilities ===
// export { useLocalStorage, useDebounce } from './shared/hooks';
// export type { BaseComponentProps } from './shared/types';