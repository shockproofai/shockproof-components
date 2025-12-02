import { AIChatbotProps } from './types';
/**
 * AIChatbot - A reusable chat interface component
 *
 * This component provides a complete chat interface that can work with
 * any provider implementation (Firebase, REST API, etc.)
 */
export declare function AIChatbot({ provider, config, onMessageSent, onMessageReceived, onError, onSessionStart, onSessionEnd, className, style, user, userId, saveSessionHistory, loadSessionId, initialMessages, showNewChatButton, showHeader }: AIChatbotProps): import("react/jsx-runtime").JSX.Element;
export declare namespace AIChatbot {
    var displayName: string;
}
