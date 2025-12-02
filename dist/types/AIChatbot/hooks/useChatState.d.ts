import type { ChatMessage, ChatProvider, ChatState, ChatActions, ChatbotConfig, ChatResponse } from '../types';
interface UseChatStateOptions {
    provider: ChatProvider;
    config?: ChatbotConfig;
    onMessageSent?: (message: string) => void;
    onMessageReceived?: (response: ChatResponse) => void;
    onError?: (error: Error) => void;
    user?: {
        id: string;
        email?: string;
        name?: string;
    } | null;
    userId?: string;
    saveSessionHistory?: boolean;
    loadSessionId?: string;
    initialMessages?: ChatMessage[];
}
export declare function useChatState({ provider, config, onMessageSent, onMessageReceived, onError, user, userId, saveSessionHistory, loadSessionId, initialMessages }: UseChatStateOptions): ChatState & ChatActions;
export {};
