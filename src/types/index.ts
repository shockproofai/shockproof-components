/**
 * Consolidated type definitions for the Chatbot SDK
 * These types are used across the chatbot service and components
 */

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  sources?: string[];
}

/**
 * Chat session structure for persistence
 */
export interface ChatSession {
  docId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/**
 * Topic context for providing additional context to the chatbot
 */
export interface TopicContext {
  originalTopic?: string;
  topicDescription?: string;
  contextHints?: string[];
}

/**
 * RAG query structure sent to backend
 */
export interface RAGQuery {
  query: string;
  maxResults: number;
  includeContext?: boolean;
  conversationHistory?: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp?: Date;
  }>;
  topicContext?: TopicContext;
  agentName?: 'askRex' | 'askRexTest';
  streamingThreshold?: number;
}

/**
 * Context source from RAG retrieval
 */
export interface ContextSource {
  title: string;
  content: string;
  similarity?: number;
  metadata?: Record<string, any>;
}

/**
 * RAG response structure from backend
 */
export interface RAGResponse {
  answer: string;
  sources?: ContextSource[];
  conversationContext?: string;
  model?: string;
  timingMs?: number;
}

/**
 * Configuration for dynamic questions
 */
export interface DynamicQuestionsConfig {
  enabled: boolean;
  maxQuestions?: number;
  refreshOnNewMessage?: boolean;
}

/**
 * Timing information for debugging
 */
export interface TimingInfo {
  functionCall?: number;
  totalLatency?: number;
  streamingStarted?: number;
  streamingCompleted?: number;
}
