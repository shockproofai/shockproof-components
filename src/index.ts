// ShockProof Components Library
// Main exports for all reusable components

// === AI Chatbot Component ===
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
  ChatbotConfig,
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