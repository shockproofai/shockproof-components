import { FirebaseApp } from 'firebase/app';
import { Unsubscribe } from 'firebase/firestore';
import { ChatServiceInterface, TopicContext } from './ChatServiceInterface';
import { ChatMessage, ChatSession, RAGResponse } from '../types';
/**
 * Firebase-based implementation of ChatService
 * Provides RAG chatbot functionality with streaming support and conversation management
 */
export declare class ChatService implements ChatServiceInterface {
    private db;
    private functions;
    private projectId;
    private useEmulators;
    constructor(firebaseApp: FirebaseApp, options?: {
        useEmulators?: boolean;
        projectId?: string;
    });
    /**
     * Read debug streaming flag from Firestore config/app document
     */
    getDebugStreamingFlag(): Promise<boolean>;
    /**
     * Stream Firestore RAG chatbot response with conditional streaming
     * @param streamingThreshold - Minimum characters before streaming begins (default: 300)
     *                            Set to 0 to always stream, set high (e.g., 10000) to effectively disable
     */
    streamMessage(query: string, maxResults: number, conversationHistory: ChatMessage[], selectedAgent: string, onChunk: (chunk: string) => void, onDone?: (final: RAGResponse) => void, topicContext?: TopicContext, streamingThreshold?: number): Promise<void>;
    /**
     * Send a query to the RAG chatbot with full conversation context
     */
    sendMessage(query: string, maxResults?: number, conversationHistory?: ChatMessage[], topicContext?: TopicContext, selectedAgent?: string): Promise<RAGResponse>;
    /**
     * Send message using Firestore RAG implementation
     */
    private sendFirestoreMessage;
    /**
     * Create a new chat session
     */
    createChatSession(userId: string, title?: string): Promise<string>;
    /**
     * Subscribe to chat session updates
     */
    subscribeToChatSession(sessionId: string, callback: (session: ChatSession) => void): Unsubscribe;
    /**
     * Get user's chat sessions
     */
    subscribeToUserChatSessions(userId: string, callback: (sessions: ChatSession[]) => void): Unsubscribe;
    /**
     * Update chat session title
     */
    updateSessionTitle(sessionId: string, title: string): Promise<void>;
    /**
     * Generate a smart title for a chat session based on the first message
     */
    generateSessionTitle(firstMessage: string): string;
    /**
     * Get chatbot preferences from Firestore config/app
     */
    getChatbotPreferences(): Promise<{
        selectedAgent?: string;
        streamingThreshold?: number;
    }>;
    /**
     * Save chatbot preferences to Firestore config/app
     */
    saveChatbotPreferences(preferences: {
        selectedAgent?: string;
        streamingThreshold?: number;
    }): Promise<void>;
}
