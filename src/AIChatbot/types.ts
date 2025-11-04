// AIChatbot Component Types
// This file contains all the TypeScript interfaces for the reusable chatbot component

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  sources?: ChatSource[];
  knowledgeBreakdown?: {
    knowledgeBasePercentage: number;
    externalKnowledgePercentage: number;
  };
}

export interface ChatSource {
  id: string;
  filename: string;
  path: string;
  contentType: string;
  similarity: number;
  contributionPercentage?: number; // Relative contribution to the answer (0-100)
  rank?: 'primary' | 'supporting' | 'additional'; // Importance ranking
  preview: string;
  isChunk?: boolean;
  chunkIndex?: number;
  totalChunks?: number;
  parentDocumentId?: string;
}

export interface ChatQuestion {
  id: string;
  question: string;
  topicDescription?: string;
  contextHints?: string[];
  priority: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  searchTime: number;
  totalDocuments: number;
  confidence: number;
  knowledgeBreakdown?: {
    knowledgeBasePercentage: number;
    externalKnowledgePercentage: number;
  };
  timings?: Record<string, number>;
  tokenUsage?: TokenUsage;
  streamingMetrics?: StreamingMetrics;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface StreamingMetrics {
  wasStreamed: boolean;
  chunkCount: number;
  totalContentLength: number;
  streamingThreshold: number;
  timeToFirstChunkMs?: number;
  streamingDurationMs?: number;
  bufferingReason?: 'threshold' | 'delay' | 'immediate' | 'error';
  averageChunkSize?: number;
}

export interface ChatbotConfig {
  // Core settings
  enableStreaming?: boolean;
  streamingThreshold?: number;
  enableSources?: boolean;
  enableQuestions?: boolean;
  enableTimingInfo?: boolean;
  
  // UI customization
  theme?: 'light' | 'dark' | 'auto';
  placeholder?: string;
  welcomeMessage?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  showAgentSwitcher?: boolean;
  showTimingInfo?: boolean;
  debugStreaming?: boolean;
  
  // Questions configuration
  questions?: ChatQuestion[];
  maxInitialQuestions?: number;
  fallbackQuestions?: ChatQuestion[]; // Configurable fallback questions
  
  // Behavior
  maxHistoryLength?: number;
  retryEnabled?: boolean;
  sessionPersistence?: boolean;
  
  // Agent configuration
  availableAgents?: string[];
  defaultAgent?: string;
}

export interface ChatContext {
  conversationHistory: ChatMessage[];
  topicContext?: {
    originalTopic?: string;
    topicDescription?: string;
    contextHints?: string[];
  };
  sessionId?: string;
  userId?: string;
}

// Provider interfaces
export interface ChatProvider {
  name: string;
  
  // Core messaging
  sendMessage(
    message: string, 
    context: ChatContext,
    config?: Partial<ChatbotConfig>
  ): Promise<ChatResponse>;
  
  // Streaming support
  streamMessage?(
    message: string,
    context: ChatContext,
    onChunk: (chunk: string) => void,
    onComplete?: (response: ChatResponse) => void,
    config?: Partial<ChatbotConfig>
  ): Promise<void>;
  
  // Questions support
  getQuestions?(): Promise<ChatQuestion[]>;
  
  // Agent support
  switchAgent?(agentName: string): void;
  getAvailableAgents?(): string[];
  getCurrentAgent?(): string;
}

// Component Props
export interface AIChatbotProps {
  provider: ChatProvider;
  config?: ChatbotConfig;
  
  // Event callbacks
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (response: ChatResponse) => void;
  onError?: (error: Error) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
  
  // UI customization
  className?: string;
  style?: React.CSSProperties;
  
  // Authentication context (if needed)
  user?: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

// Hook types
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
  sessionId: string | null;
  selectedAgent?: string;
  lastResponse?: ChatResponse | null;
  streamingMetrics?: {
    timeToFirstChunk?: number;
    totalStreamingTime?: number;
    chunks?: number;
    averageChunkTime?: number;
  } | null;
}

export interface ChatActions {
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  setSelectedAgent: (agent: string) => void;
  startNewSession: () => void;
}

// Provider-specific types (can be extended)
export interface FirebaseProviderConfig {
  chatService: object; // Will be typed based on existing ChatService
  agentOptions: string[];
  authRequired?: boolean;
}

export interface RestAPIProviderConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  endpoints: {
    chat: string;
    stream?: string;
    questions?: string;
  };
}

// Error types
export class ChatbotError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ChatbotError';
  }
}

export type ChatbotErrorCode = 
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'STREAMING_ERROR'
  | 'UNKNOWN_ERROR';