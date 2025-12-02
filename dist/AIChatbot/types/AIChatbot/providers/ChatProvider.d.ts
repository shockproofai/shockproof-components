import type { ChatProvider, ChatResponse, ChatQuestion, ChatContext, ChatbotConfig } from '../types';
/**
 * Abstract base class for chat providers
 * Provides common functionality and enforces the provider contract
 */
export declare abstract class BaseChatProvider implements ChatProvider {
    abstract name: string;
    protected config: Partial<ChatbotConfig>;
    protected isInitialized: boolean;
    constructor(config?: Partial<ChatbotConfig>);
    /**
     * Initialize the provider (override if needed)
     */
    initialize(): Promise<void>;
    /**
     * Send a message and get response
     */
    abstract sendMessage(message: string, context: ChatContext, config?: Partial<ChatbotConfig>): Promise<ChatResponse>;
    /**
     * Stream a message response (optional implementation)
     */
    streamMessage?(message: string, context: ChatContext, onChunk: (chunk: string) => void, onComplete?: (response: ChatResponse) => void, config?: Partial<ChatbotConfig>): Promise<void>;
    /**
     * Get suggested questions (optional implementation)
     */
    getQuestions?(): Promise<ChatQuestion[]>;
    /**
     * Switch agent (optional implementation)
     */
    switchAgent?(agentName: string): void;
    /**
     * Get available agents (optional implementation)
     */
    getAvailableAgents?(): string[];
    /**
     * Validate message before sending
     */
    protected validateMessage(message: string): void;
    /**
     * Prepare conversation context
     */
    protected prepareContext(context: ChatContext, config?: Partial<ChatbotConfig>): ChatContext;
    /**
     * Handle provider errors consistently
     */
    protected handleError(error: unknown, operation: string): never;
    /**
     * Get provider configuration
     */
    getConfig(): Partial<ChatbotConfig>;
    /**
     * Update provider configuration
     */
    updateConfig(newConfig: Partial<ChatbotConfig>): void;
}
/**
 * Factory function to create providers
 */
export type ChatProviderFactory<T = unknown> = (config: T) => ChatProvider;
/**
 * Provider registry for managing multiple providers
 */
export declare class ChatProviderRegistry {
    private providers;
    register<T>(name: string, factory: ChatProviderFactory<T>): void;
    create<T>(name: string, config: T): ChatProvider;
    getAvailableProviders(): string[];
}
export declare const providerRegistry: ChatProviderRegistry;
