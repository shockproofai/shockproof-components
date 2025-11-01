// Base ChatProvider interface and abstract implementation
import type { 
  ChatProvider, 
  ChatMessage, 
  ChatResponse, 
  ChatQuestion, 
  ChatContext, 
  ChatbotConfig
} from '../types';
import { ChatbotError } from '../types';

/**
 * Abstract base class for chat providers
 * Provides common functionality and enforces the provider contract
 */
export abstract class BaseChatProvider implements ChatProvider {
  abstract name: string;
  
  protected config: Partial<ChatbotConfig>;
  protected isInitialized = false;
  
  constructor(config: Partial<ChatbotConfig> = {}) {
    this.config = {
      enableStreaming: true,
      streamingThreshold: 300,
      enableSources: true,
      enableQuestions: true,
      maxHistoryLength: 10,
      retryEnabled: true,
      ...config
    };
  }
  
  /**
   * Initialize the provider (override if needed)
   */
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }
  
  /**
   * Send a message and get response
   */
  abstract sendMessage(
    message: string, 
    context: ChatContext,
    config?: Partial<ChatbotConfig>
  ): Promise<ChatResponse>;
  
  /**
   * Stream a message response (optional implementation)
   */
  async streamMessage?(
    message: string,
    context: ChatContext,
    onChunk: (chunk: string) => void,
    onComplete?: (response: ChatResponse) => void,
    config?: Partial<ChatbotConfig>
  ): Promise<void>;
  
  /**
   * Get suggested questions (optional implementation)
   */
  async getQuestions?(): Promise<ChatQuestion[]>;
  
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
  protected validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new ChatbotError(
        'Message cannot be empty',
        'VALIDATION_ERROR'
      );
    }
    
    if (message.length > 10000) {
      throw new ChatbotError(
        'Message too long (max 10,000 characters)',
        'VALIDATION_ERROR'
      );
    }
  }
  
  /**
   * Prepare conversation context
   */
  protected prepareContext(context: ChatContext, config?: Partial<ChatbotConfig>): ChatContext {
    const mergedConfig = { ...this.config, ...config };
    const maxHistory = mergedConfig.maxHistoryLength || 10;
    
    return {
      ...context,
      conversationHistory: context.conversationHistory.slice(-maxHistory)
    };
  }
  
  /**
   * Handle provider errors consistently
   */
  protected handleError(error: unknown, operation: string): never {
    console.error(`[${this.name}Provider] Error in ${operation}:`, error);
    
    if (error instanceof ChatbotError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ChatbotError(
        `Provider error: ${error.message}`,
        'PROVIDER_ERROR',
        error
      );
    }
    
    throw new ChatbotError(
      `Unknown error in ${operation}`,
      'UNKNOWN_ERROR',
      error
    );
  }
  
  /**
   * Get provider configuration
   */
  getConfig(): Partial<ChatbotConfig> {
    return { ...this.config };
  }
  
  /**
   * Update provider configuration
   */
  updateConfig(newConfig: Partial<ChatbotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Factory function to create providers
 */
export type ChatProviderFactory<T = unknown> = (config: T) => ChatProvider;

/**
 * Provider registry for managing multiple providers
 */
export class ChatProviderRegistry {
  private providers: Map<string, ChatProviderFactory> = new Map();
  
  register<T>(name: string, factory: ChatProviderFactory<T>): void {
    this.providers.set(name, factory);
  }
  
  create<T>(name: string, config: T): ChatProvider {
    const factory = this.providers.get(name);
    if (!factory) {
      throw new ChatbotError(
        `Provider '${name}' not found`,
        'PROVIDER_ERROR'
      );
    }
    
    return factory(config);
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Global provider registry instance
export const providerRegistry = new ChatProviderRegistry();