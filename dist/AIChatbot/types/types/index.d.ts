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
    agentName?: string;
    streamingThreshold?: number;
}
/**
 * Context source from RAG retrieval
 */
export interface ContextSource {
    id: string;
    filename: string;
    path: string;
    contentType: string;
    similarity: number;
    contributionPercentage?: number;
    rank?: 'primary' | 'supporting' | 'additional';
    preview: string;
    isChunk?: boolean;
    chunkIndex?: number;
    totalChunks?: number;
    parentDocumentId?: string;
}
/**
 * Token usage information
 */
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
/**
 * Streaming performance metrics
 */
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
/**
 * RAG response structure from backend
 */
export interface RAGResponse {
    answer: string;
    sources?: ContextSource[];
    searchTime?: number;
    totalDocuments?: number;
    confidence?: number;
    conversationContext?: string;
    model?: string;
    timings?: Record<string, number>;
    tokenUsage?: TokenUsage;
    streamingMetrics?: StreamingMetrics;
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
