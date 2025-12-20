import * as react_jsx_runtime from 'react/jsx-runtime';
import { FirebaseApp } from 'firebase/app';
import { Unsubscribe } from 'firebase/firestore';
import React$1 from 'react';
import { User } from 'firebase/auth';

/**
 * Configuration for the Chatbot component
 */
interface ChatbotConfig$1 {
    /**
     * Firebase app instance (required)
     */
    firebaseApp: FirebaseApp;
    /**
     * Whether to use Firebase emulators (optional, default: false)
     */
    useEmulators?: boolean;
    /**
     * Firebase project ID (optional, inferred from firebaseApp if not provided)
     */
    projectId?: string;
    /**
     * Agent to use for chat responses (optional, default: first agent in availableAgents or 'askRex')
     */
    agentName?: string;
    /**
     * List of available agent names from Firestore agents collection (optional, default: ['askRex'])
     * These should match the document IDs in your Firestore 'agents' collection
     */
    availableAgents?: string[];
    /**
     * Maximum number of context documents to retrieve (optional, default: 5)
     */
    maxResults?: number;
    /**
     * Minimum characters before streaming begins (optional, default: 300)
     * Set to 0 to always stream, set high (e.g., 10000) to effectively disable
     */
    streamingThreshold?: number;
    /**
     * Enable dynamic questions feature (optional, default: true)
     */
    enableDynamicQuestions?: boolean;
    /**
     * Maximum number of questions to show initially (optional, default: 8)
     * Additional questions can be revealed with "Show More" button
     */
    maxInitialQuestions?: number;
    /**
     * Show timing information for debugging (optional, default: false)
     */
    showTimingInfo?: boolean;
    /**
     * Title for the chatbot header (optional)
     */
    title?: string;
    /**
     * Subtitle for the chatbot header (optional)
     */
    subtitle?: string;
    /**
     * Custom placeholder text for input (optional)
     */
    placeholder?: string;
    /**
     * Initial topic context (optional)
     */
    topicContext?: {
        originalTopic?: string;
        topicDescription?: string;
        contextHints?: string[];
    };
    /**
     * Callback when a message is sent (optional)
     */
    onMessageSent?: (message: string) => void;
    /**
     * Callback when a response is received (optional)
     */
    onResponseReceived?: (response: string) => void;
    /**
     * Custom CSS class name for the root element (optional)
     */
    className?: string;
    /**
     * Custom styles for the chatbot container (optional)
     */
    style?: React.CSSProperties;
    /**
     * User ID for saving chat history (optional)
     * Required if saveSessionHistory is true
     */
    userId?: string;
    /**
     * Whether to save chat session history to Firestore (optional, default: false)
     * If true, userId must be provided
     */
    saveSessionHistory?: boolean;
    /**
     * Session ID to load an existing chat session (optional)
     * If provided, the component will load messages from this session
     */
    loadSessionId?: string;
    /**
     * Initial messages to display (optional)
     * Used when loading an existing session
     */
    initialMessages?: Array<{
        id: string;
        content: string;
        role: 'user' | 'assistant';
        timestamp: Date;
    }>;
    /**
     * Whether to show the "New Chat" button in the header (optional, default: true)
     * Set to false when managing chat sessions externally
     */
    showNewChatButton?: boolean;
    /**
     * Whether to show the title header bar (optional, default: true)
     * Set to false to hide the header and maximize chat area
     */
    showHeader?: boolean;
    /**
     * UI layout variant (optional, default: 'default')
     * 'rex': Centered minimalist layout (Rex/Gemini-like)
     * 'default': Standard left-aligned layout
     */
    uiVariant?: 'default' | 'rex';
    /**
     * Hide "Show More Questions" button (optional, default: false)
     * Set to true for cleaner UI with fixed number of questions
     */
    hideShowMoreButton?: boolean;
    /**
     * Welcome greeting to show when chat is empty (optional)
     * Example: "Hello, John" - shown in the 'rex' variant
     */
    welcomeGreeting?: string;
}

/**
 * Consolidated type definitions for the Chatbot SDK
 * These types are used across the chatbot service and components
 */
/**
 * Chat message structure
 */
interface ChatMessage$1 {
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
interface ChatSession {
    docId?: string;
    title: string;
    messages: ChatMessage$1[];
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}
/**
 * Context source from RAG retrieval
 */
interface ContextSource {
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
interface TokenUsage$1 {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
/**
 * Streaming performance metrics
 */
interface StreamingMetrics$1 {
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
interface RAGResponse {
    answer: string;
    sources?: ContextSource[];
    searchTime?: number;
    totalDocuments?: number;
    confidence?: number;
    conversationContext?: string;
    model?: string;
    timings?: Record<string, number>;
    tokenUsage?: TokenUsage$1;
    streamingMetrics?: StreamingMetrics$1;
}

/**
 * Topic context for providing additional context to the chatbot
 */
interface TopicContext {
    originalTopic?: string;
    topicDescription?: string;
    contextHints?: string[];
}
/**
 * Abstract interface for chat service implementations
 * This allows for different backends or testing implementations
 */
interface ChatServiceInterface {
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
    streamMessage(query: string, maxResults: number, conversationHistory: ChatMessage$1[], selectedAgent: string, onChunk: (chunk: string) => void, onDone?: (final: RAGResponse) => void, topicContext?: TopicContext, streamingThreshold?: number): Promise<void>;
    /**
     * Send a message and get the complete response (non-streaming)
     * @param query - User's question or message
     * @param maxResults - Maximum number of context documents to retrieve
     * @param conversationHistory - Previous messages in the conversation
     * @param topicContext - Optional topic context for better responses
     * @param selectedAgent - Agent name from Firestore agents collection
     */
    sendMessage(query: string, maxResults?: number, conversationHistory?: ChatMessage$1[], topicContext?: TopicContext, selectedAgent?: string): Promise<RAGResponse>;
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
    subscribeToChatSession(sessionId: string, callback: (session: ChatSession) => void): Unsubscribe;
    /**
     * Subscribe to all chat sessions for a user
     * @param userId - ID of the user
     * @param callback - Function called when sessions update
     * @returns Unsubscribe function to stop listening
     */
    subscribeToUserChatSessions(userId: string, callback: (sessions: ChatSession[]) => void): Unsubscribe;
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

/**
 * Firebase-based implementation of ChatService
 * Provides RAG chatbot functionality with streaming support and conversation management
 */
declare class ChatService implements ChatServiceInterface {
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
    streamMessage(query: string, maxResults: number, conversationHistory: ChatMessage$1[], selectedAgent: string, onChunk: (chunk: string) => void, onDone?: (final: RAGResponse) => void, topicContext?: TopicContext, streamingThreshold?: number): Promise<void>;
    /**
     * Send a query to the RAG chatbot with full conversation context
     */
    sendMessage(query: string, maxResults?: number, conversationHistory?: ChatMessage$1[], topicContext?: TopicContext, selectedAgent?: string): Promise<RAGResponse>;
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

/**
 * Chatbot - Black box chatbot component with Firebase backend
 *
 * This is a complete, batteries-included chatbot component that requires
 * only a Firebase app instance to work. It wraps the AIChatbot UI component
 * with a Firebase-based provider and service layer.
 *
 * @example
 * ```tsx
 * import { initializeApp } from 'firebase/app';
 * import { Chatbot } from 'shockproof-components';
 *
 * const firebaseApp = initializeApp({ ... });
 *
 * function MyApp() {
 *   return (
 *     <Chatbot
 *       firebaseApp={firebaseApp}
 *       agentName="askRex"
 *       enableDynamicQuestions={true}
 *     />
 *   );
 * }
 * ```
 */
declare function Chatbot(props: ChatbotConfig$1): react_jsx_runtime.JSX.Element;

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isLoading?: boolean;
    sources?: ChatSource[];
    knowledgeBreakdown?: {
        knowledgeBasePercentage: number;
        externalKnowledgePercentage: number;
    };
}
interface ChatSource {
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
interface ChatQuestion {
    id: string;
    question: string;
    topicDescription?: string;
    contextHints?: string[];
    priority: number;
}
interface ChatResponse {
    answer: string;
    sources: ChatSource[];
    searchTime: number;
    totalDocuments: number;
    confidence: number;
    knowledgeBreakdown?: {
        knowledgeBasePercentage: number;
        externalKnowledgePercentage: number;
    };
    timings?: Record<string, number>;
    tokenUsage?: TokenUsage;
    streamingMetrics?: StreamingMetrics;
}
interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
interface StreamingMetrics {
    wasStreamed: boolean;
    chunkCount: number;
    totalContentLength: number;
    streamingThreshold: number;
    timeToFirstChunkMs?: number;
    streamingDurationMs?: number;
    bufferingReason?: 'threshold' | 'delay' | 'immediate' | 'error';
    averageChunkSize?: number;
}
interface ChatbotConfig {
    enableStreaming?: boolean;
    streamingThreshold?: number;
    enableSources?: boolean;
    enableQuestions?: boolean;
    enableTimingInfo?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    placeholder?: string;
    welcomeMessage?: string;
    compact?: boolean;
    title?: string;
    subtitle?: string;
    showAgentSwitcher?: boolean;
    showAgentSelector?: boolean;
    showStreamingSelector?: boolean;
    showTimingInfo?: boolean;
    debugStreaming?: boolean;
    uiVariant?: 'default' | 'rex';
    hideShowMoreButton?: boolean;
    welcomeGreeting?: string;
    questions?: ChatQuestion[];
    maxInitialQuestions?: number;
    fallbackQuestions?: ChatQuestion[];
    maxHistoryLength?: number;
    retryEnabled?: boolean;
    sessionPersistence?: boolean;
    availableAgents?: string[];
    defaultAgent?: string;
}
interface ChatContext {
    conversationHistory: ChatMessage[];
    topicContext?: {
        originalTopic?: string;
        topicDescription?: string;
        contextHints?: string[];
    };
    sessionId?: string;
    userId?: string;
}
interface ChatProvider {
    name: string;
    sendMessage(message: string, context: ChatContext, config?: Partial<ChatbotConfig>): Promise<ChatResponse>;
    streamMessage?(message: string, context: ChatContext, onChunk: (chunk: string) => void, onComplete?: (response: ChatResponse) => void, config?: Partial<ChatbotConfig>): Promise<void>;
    getQuestions?(): Promise<ChatQuestion[]>;
    getChatbotConfig?(): Promise<Record<string, any>>;
    switchAgent?(agentName: string): void;
    getAvailableAgents?(): string[];
    getCurrentAgent?(): string;
    setStreamingThreshold?(threshold: number): void;
}
interface AIChatbotProps {
    provider: ChatProvider;
    config?: ChatbotConfig;
    onMessageSent?: (message: string) => void;
    onMessageReceived?: (response: ChatResponse) => void;
    onError?: (error: Error) => void;
    onSessionStart?: (sessionId: string) => void;
    onSessionEnd?: (sessionId: string) => void;
    className?: string;
    style?: React.CSSProperties;
    formClassName?: string;
    containerClassName?: string;
    textareaClassName?: string;
    buttonClassName?: string;
    user?: {
        id: string;
        email?: string;
        name?: string;
    } | null;
    userId?: string;
    saveSessionHistory?: boolean;
    loadSessionId?: string;
    initialMessages?: ChatMessage[];
    showNewChatButton?: boolean;
    showHeader?: boolean;
}
interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isStreaming: boolean;
    streamingMessage: string;
    error: string | null;
    sessionId: string | null;
    selectedAgent?: string;
    lastResponse?: ChatResponse | null;
    streamingMetrics?: {
        timeToFirstChunk?: number;
        totalStreamingTime?: number;
        chunks?: number;
        averageChunkTime?: number;
    } | null;
}
interface ChatActions {
    sendMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
    retryLastMessage: () => Promise<void>;
    setSelectedAgent: (agent: string) => void;
    updateStreamingThreshold: (threshold: number) => void;
    startNewSession: () => void;
}
interface FirebaseProviderConfig {
    chatService: object;
    agentOptions: string[];
    authRequired?: boolean;
}

/**
 * AIChatbot - A reusable chat interface component
 *
 * This component provides a complete chat interface that can work with
 * any provider implementation (Firebase, REST API, etc.)
 */
declare function AIChatbot({ provider, config, onMessageSent, onMessageReceived, onError, onSessionStart, onSessionEnd, className, style, user, userId, saveSessionHistory, loadSessionId, initialMessages, showNewChatButton, showHeader, formClassName, containerClassName, textareaClassName, buttonClassName }: AIChatbotProps): react_jsx_runtime.JSX.Element;
declare namespace AIChatbot {
    var displayName: string;
}

/**
 * Abstract base class for chat providers
 * Provides common functionality and enforces the provider contract
 */
declare abstract class BaseChatProvider implements ChatProvider {
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
 * Firebase implementation of ChatProvider
 * Integrates with existing Firebase ChatService
 */
declare class FirebaseChatProvider extends BaseChatProvider {
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
declare function createFirebaseProvider(config: FirebaseProviderConfig): FirebaseChatProvider;

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
declare function useChatState({ provider, config, onMessageSent, onMessageReceived, onError, user, userId, saveSessionHistory, loadSessionId, initialMessages }: UseChatStateOptions): ChatState & ChatActions;

interface MessageBubbleProps {
    message: ChatMessage;
    streamingContent?: string;
    debugStreaming?: boolean;
}
declare const MessageBubble: React$1.FC<MessageBubbleProps>;

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    uiVariant?: 'default' | 'rex';
    formClassName?: string;
    containerClassName?: string;
    textareaClassName?: string;
    buttonClassName?: string;
}
declare const ChatInput: React$1.FC<ChatInputProps>;

interface TimingInfoProps {
    timings?: Record<string, number>;
    agentName?: string;
    actualTotalTime?: number;
    tokenUsage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    cumulativeTokenUsage?: {
        totalInputTokens: number;
        totalOutputTokens: number;
        totalTokens: number;
        responseCount: number;
    };
    streamingMetrics?: {
        wasStreamed: boolean;
        chunkCount: number;
        totalContentLength: number;
        streamingThreshold: number;
        timeToFirstChunkMs?: number;
        streamingDurationMs?: number;
        bufferingReason?: 'threshold' | 'delay' | 'immediate' | 'error';
        averageChunkSize?: number;
    };
    response?: ChatResponse;
    className?: string;
}
declare const TimingInfo: React$1.FC<TimingInfoProps>;

interface DynamicQuestionsProps {
    onQuestionClick: (question: string, questionData?: {
        topicDescription?: string;
        contextHints?: string[];
    }) => void;
    isLoading: boolean;
    questions?: ChatQuestion[];
    maxInitialQuestions?: number;
    fallbackQuestions?: ChatQuestion[];
    hideShowMoreButton?: boolean;
    uiVariant?: 'default' | 'rex';
}

declare const DynamicQuestions: React$1.FC<DynamicQuestionsProps>;

/**
 * Configuration for the Auth component
 */
interface AuthConfig {
    /**
     * Firebase app instance
     */
    firebaseApp: FirebaseApp;
    /**
     * Auto sign-in anonymously on mount (silent, no UI)
     * Useful for apps that need authentication for Firestore rules
     * but don't require user identity
     * @default false
     */
    autoSignInAnonymously?: boolean;
    /**
     * Enable Google OAuth sign-in button
     * @default true
     */
    enableGoogle?: boolean;
    /**
     * Enable passwordless email link sign-in
     * @default false
     */
    enableEmailLink?: boolean;
    /**
     * Custom heading text for the auth UI
     * @default "Welcome to Shockproof AI"
     */
    heading?: string;
    /**
     * Custom tagline text shown below the heading
     * @default "Your intelligent AI assistant platform"
     */
    tagline?: string;
    /**
     * Custom badge text shown at the bottom of the auth card
     * @default "Secure, passwordless authentication"
     */
    badgeText?: string;
    /**
     * Custom success message shown after email link is sent
     * @default "We've sent a magic link to {email}"
     */
    emailLinkSuccessMessage?: string;
    /**
     * Custom instruction text shown in the email sent success screen
     * @default "Click the link in the email to sign in. The link will expire in 60 minutes."
     */
    emailLinkSuccessInstructions?: string;
    /**
     * Optional callback to handle email sending for passwordless login
     * If not provided, Firebase's built-in sendSignInLinkToEmail will be used
     *
     * @param email - The email address to send the sign-in link to
     * @returns Promise that resolves when email is sent
     */
    onSendEmailLink?: (email: string) => Promise<void>;
    /**
     * Callback when email link is successfully sent
     * Useful for showing success notifications in the parent app
     *
     * @param email - The email address the link was sent to
     */
    onEmailLinkSent?: (email: string) => void;
    /**
     * Callback when there's an error sending the email link
     * Useful for showing error notifications in the parent app
     *
     * @param error - The error that occurred
     */
    onEmailLinkError?: (error: Error) => void;
    /**
     * URL to redirect to after email link is clicked
     * @default window.location.href
     */
    emailLinkActionURL?: string;
    /**
     * Whether to handle the sign-in link in the same app
     * @default true
     */
    emailLinkHandleCodeInApp?: boolean;
}
/**
 * Auth context value
 */
interface AuthContextType {
    /**
     * Current authenticated user (null if not authenticated)
     */
    user: User | null;
    /**
     * Loading state for auth operations
     */
    loading: boolean;
    /**
     * Error message if auth operation failed
     */
    error: string | null;
    /**
     * Whether user is authenticated
     */
    isAuthenticated: boolean;
    /**
     * Sign in anonymously
     */
    signInAnonymously: () => Promise<void>;
    /**
     * Sign in with Google OAuth
     */
    signInWithGoogle: () => Promise<void>;
    /**
     * Sign out current user
     */
    signOut: () => Promise<void>;
    /**
     * Send email link for passwordless sign-in
     */
    sendEmailLink: (email: string) => Promise<void>;
    /**
     * Complete email link sign-in after user clicks link
     */
    completeEmailLinkSignIn: (email: string) => Promise<void>;
    /**
     * Check if current URL is a sign-in link
     */
    isEmailLinkSignIn: () => boolean;
}
/**
 * Props for AuthProvider
 */
interface AuthProviderProps extends AuthConfig {
    children: React.ReactNode;
}

interface AuthProps extends AuthConfig {
    children: React$1.ReactNode;
}
/**
 * Auth component - wrapper that handles authentication
 *
 * Provides inline authentication gate:
 * - Shows auth UI when not authenticated
 * - Reveals children when authenticated
 * - Supports auto anonymous sign-in
 * - Supports Google OAuth
 *
 * @example
 * ```tsx
 * // Auto sign-in anonymously (silent)
 * <Auth firebaseApp={firebaseApp} autoSignInAnonymously={true}>
 *   <YourApp />
 * </Auth>
 *
 * // Show Google sign-in
 * <Auth firebaseApp={firebaseApp} enableGoogle={true}>
 *   <YourApp />
 * </Auth>
 * ```
 */
declare const Auth: React$1.FC<AuthProps>;

declare const AuthProvider: React$1.FC<AuthProviderProps>;

interface AuthUIProps {
    enableGoogle?: boolean;
    enableEmailLink?: boolean;
    heading?: string;
    tagline?: string;
    badgeText?: string;
    /** Custom success message shown after email link is sent. Use {email} as placeholder for the email address */
    emailLinkSuccessMessage?: string;
    /** Custom instruction text shown in the email sent success screen */
    emailLinkSuccessInstructions?: string;
    /** Custom className for the outer container (removes default min-h-screen and gradient if provided) */
    containerClassName?: string;
    /** Custom className for the auth card */
    cardClassName?: string;
    /** Whether to show the Shockproof AI footer branding */
    showFooter?: boolean;
    /** Theme variant - affects default styling if no custom classes provided */
    variant?: 'light' | 'dark';
}
declare const AuthUI: React$1.FC<AuthUIProps>;

/**
 * Hook to access Auth context
 * Must be used within AuthProvider
 */
declare const useAuth: () => AuthContextType;

export { AIChatbot, Auth, AuthProvider, AuthUI, BaseChatProvider, ChatInput, ChatService, Chatbot, DynamicQuestions, MessageBubble, TimingInfo, createFirebaseProvider, useAuth, useChatState };
export type { ChatbotConfig as AIChatbotConfig, AuthConfig, AuthContextType, ChatContext, ChatMessage, ChatQuestion, ChatResponse, ChatServiceInterface, ChatbotConfig$1 as ChatbotConfig, StreamingMetrics, TokenUsage };
