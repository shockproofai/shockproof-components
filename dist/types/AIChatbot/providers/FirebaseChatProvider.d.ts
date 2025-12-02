import { BaseChatProvider } from './ChatProvider';
import type { ChatResponse, ChatContext, ChatbotConfig, ChatQuestion, FirebaseProviderConfig } from '../types';
/**
 * Firebase implementation of ChatProvider
 * Integrates with existing Firebase ChatService
 */
export declare class FirebaseChatProvider extends BaseChatProvider {
    name: string;
    private chatService;
    private availableAgents;
    private currentAgent;
    private authRequired;
    constructor(config: FirebaseProviderConfig);
    /**
     * Initialize Firebase provider
     */
    initialize(): Promise<void>;
    /**
     * Send message using Firebase Functions
     */
    sendMessage(message: string, context: ChatContext, config?: Partial<ChatbotConfig>): Promise<ChatResponse>;
    /**
     * Stream message using Firebase Functions
     */
    streamMessage(message: string, context: ChatContext, onChunk: (chunk: string) => void, onComplete?: (response: ChatResponse) => void, config?: Partial<ChatbotConfig>): Promise<void>;
    /**
     * Switch between available agents
     */
    switchAgent(agentName: string): void;
    /**
     * Get available agents
     */
    getAvailableAgents(): string[];
    /**
     * Get current agent
     */
    getCurrentAgent(): string;
    /**
     * Format Firebase response to match our interface
     */
    private formatResponse;
    /**
     * Get questions from Firestore sources collection
     * Randomly selects questions from documents
     */
    getQuestions(): Promise<ChatQuestion[]>;
    /**
     * Get chatbot configuration from Firestore config/app document
     */
    getChatbotConfig(): Promise<Record<string, any>>;
    /**
     * Check if user is authenticated (if required)
     */
    private checkAuth;
}
/**
 * Factory function for creating Firebase provider
 */
export declare function createFirebaseProvider(config: FirebaseProviderConfig): FirebaseChatProvider;
