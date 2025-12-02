import { ChatbotConfig } from './ChatbotConfig';
/**
 * Default configuration values for the Chatbot component
 */
export declare const defaultChatbotConfig: Partial<ChatbotConfig>;
/**
 * Merge user config with defaults
 */
export declare function mergeWithDefaults(userConfig: ChatbotConfig): Required<Omit<ChatbotConfig, 'topicContext' | 'onMessageSent' | 'onResponseReceived' | 'className' | 'style' | 'title' | 'subtitle' | 'userId' | 'saveSessionHistory' | 'loadSessionId' | 'initialMessages' | 'showNewChatButton' | 'showHeader'>> & Pick<ChatbotConfig, 'topicContext' | 'onMessageSent' | 'onResponseReceived' | 'className' | 'style' | 'title' | 'subtitle' | 'userId' | 'saveSessionHistory' | 'loadSessionId' | 'initialMessages' | 'showNewChatButton' | 'showHeader'>;
