import { ChatbotConfig } from './ChatbotConfig';

/**
 * Default configuration values for the Chatbot component
 */
export const defaultChatbotConfig: Partial<ChatbotConfig> = {
  useEmulators: false,
  agentName: 'askRex',
  availableAgents: ['askRex'],
  maxResults: 5,
  streamingThreshold: 300,
  enableDynamicQuestions: true,  maxInitialQuestions: 8,
  showTimingInfo: false,
  placeholder: 'Ask me anything about the course...',
};

/**
 * Merge user config with defaults
 */
export function mergeWithDefaults(userConfig: ChatbotConfig): Required<Omit<ChatbotConfig, 'topicContext' | 'onMessageSent' | 'onResponseReceived' | 'className' | 'style' | 'title' | 'subtitle' | 'userId' | 'saveSessionHistory' | 'loadSessionId' | 'initialMessages' | 'showNewChatButton' | 'showHeader'>> & Pick<ChatbotConfig, 'topicContext' | 'onMessageSent' | 'onResponseReceived' | 'className' | 'style' | 'title' | 'subtitle' | 'userId' | 'saveSessionHistory' | 'loadSessionId' | 'initialMessages' | 'showNewChatButton' | 'showHeader'> {
  return {
    ...defaultChatbotConfig,
    ...userConfig,
    // Ensure firebaseApp is always from user config (required)
    firebaseApp: userConfig.firebaseApp,
    // Provide defaults for optional fields
    useEmulators: userConfig.useEmulators ?? defaultChatbotConfig.useEmulators!,
    projectId: userConfig.projectId ?? userConfig.firebaseApp.options.projectId ?? 'shockproof-dev',
    agentName: userConfig.agentName ?? defaultChatbotConfig.agentName!,
    availableAgents: userConfig.availableAgents ?? defaultChatbotConfig.availableAgents!,
    maxResults: userConfig.maxResults ?? defaultChatbotConfig.maxResults!,
    streamingThreshold: userConfig.streamingThreshold ?? defaultChatbotConfig.streamingThreshold!,
    enableDynamicQuestions: userConfig.enableDynamicQuestions ?? defaultChatbotConfig.enableDynamicQuestions!,    maxInitialQuestions: userConfig.maxInitialQuestions ?? defaultChatbotConfig.maxInitialQuestions!,
    showTimingInfo: userConfig.showTimingInfo ?? defaultChatbotConfig.showTimingInfo!,
    placeholder: userConfig.placeholder ?? defaultChatbotConfig.placeholder!,
  };
}
