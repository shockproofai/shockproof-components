import { Unsubscribe } from 'firebase/firestore';
import { ChatMessage, ChatSession, RAGResponse } from '../types';

/**
 * Topic context for providing additional context to the chatbot
 */
export interface TopicContext {
  originalTopic?: string;
  topicDescription?: string;
  contextHints?: string[];
}

/**
 * Abstract interface for chat service implementations
 * This allows for different backends or testing implementations
 */
export interface ChatServiceInterface {
  /**
   * Stream a message with conditional streaming based on response length
   * @param query - User's question or message
   * @param maxResults - Maximum number of context documents to retrieve
   * @param conversationHistory - Previous messages in the conversation
   * @param selectedAgent - Agent name from Firestore agents collection
   * @param onChunk - Callback for each streamed chunk
   * @param onDone - Callback when streaming is complete
   * @param topicContext - Optional topic context for better responses
   * @param streamingThreshold - Minimum characters before streaming begins (default: 300)
   */
  streamMessage(
    query: string,
    maxResults: number,
    conversationHistory: ChatMessage[],
    selectedAgent: string,
    onChunk: (chunk: string) => void,
    onDone?: (final: RAGResponse) => void,
    topicContext?: TopicContext,
    streamingThreshold?: number
  ): Promise<void>;

  /**
   * Send a message and get the complete response (non-streaming)
   * @param query - User's question or message
   * @param maxResults - Maximum number of context documents to retrieve
   * @param conversationHistory - Previous messages in the conversation
   * @param topicContext - Optional topic context for better responses
   * @param selectedAgent - Agent name from Firestore agents collection
   */
  sendMessage(
    query: string,
    maxResults?: number,
    conversationHistory?: ChatMessage[],
    topicContext?: TopicContext,
    selectedAgent?: string
  ): Promise<RAGResponse>;

  /**
   * Create a new chat session
   * @param userId - ID of the user creating the session
   * @param title - Optional title for the session
   * @returns The ID of the created session
   */
  createChatSession(userId: string, title?: string): Promise<string>;

  /**
   * Subscribe to updates for a specific chat session
   * @param sessionId - ID of the session to subscribe to
   * @param callback - Function called when session updates
   * @returns Unsubscribe function to stop listening
   */
  subscribeToChatSession(
    sessionId: string,
    callback: (session: ChatSession) => void
  ): Unsubscribe;

  /**
   * Subscribe to all chat sessions for a user
   * @param userId - ID of the user
   * @param callback - Function called when sessions update
   * @returns Unsubscribe function to stop listening
   */
  subscribeToUserChatSessions(
    userId: string,
    callback: (sessions: ChatSession[]) => void
  ): Unsubscribe;

  /**
   * Update the title of a chat session
   * @param sessionId - ID of the session
   * @param title - New title
   */
  updateSessionTitle(sessionId: string, title: string): Promise<void>;

  /**
   * Generate a smart title from a message
   * @param firstMessage - The first message in the chat
   * @returns A shortened, readable title
   */
  generateSessionTitle(firstMessage: string): string;
}
