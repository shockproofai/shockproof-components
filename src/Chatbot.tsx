import React, { useMemo } from 'react';
import { AIChatbot } from './AIChatbot/AIChatbot';
import { ChatProvider, ChatContext, ChatResponse, ChatbotConfig as AIChatbotConfig } from './AIChatbot/types';
import { ChatService } from './services/ChatService';
import { ChatbotConfig, mergeWithDefaults } from './config';
import { ChatMessage as SDKChatMessage, RAGResponse, TopicContext } from './types';

/**
 * Firebase-based chat provider that uses the ChatService
 */
class FirebaseChatProvider implements ChatProvider {
  name = 'firebase';
  private chatService: ChatService;
  private firebaseApp: any;
  private selectedAgent: string = 'askRex';
  private maxResults: number = 5;
  private streamingThreshold: number = 300;
  private availableAgents: string[] = ['askRex'];

  constructor(chatService: ChatService, config: {
    agentName?: string;
    firebaseApp: any;
    maxResults?: number;
    streamingThreshold?: number;
    availableAgents?: string[];
  }) {
    this.chatService = chatService;
    this.firebaseApp = config.firebaseApp;
    this.availableAgents = config.availableAgents || ['askRex'];
    this.selectedAgent = config.agentName || this.availableAgents[0];
    this.maxResults = config.maxResults || 5;
    this.streamingThreshold = config.streamingThreshold || 300;
  }

  switchAgent(agentName: string): void {
    console.log(`🔄 [Chatbot] switchAgent called with: ${agentName}`);
    console.log(`🔄 [Chatbot] Available agents:`, this.availableAgents);
    
    // Validate agent is in available agents list
    if (!this.availableAgents.includes(agentName)) {
      console.warn(`❌ [Chatbot] Agent "${agentName}" not in available agents list:`, this.availableAgents);
      return;
    }

    this.selectedAgent = agentName;
    console.log(`✅ [Chatbot] Agent switched to: ${agentName}`);
    
    // Save to Firestore (fire-and-forget)
    this.saveAgentPreference(agentName);
  }

  private async saveAgentPreference(agentName: string): Promise<void> {
    try {
      const DEBUG = await this.chatService.getDebugStreamingFlag();
      if (DEBUG) {
        console.log(`🔧 [Chatbot] Saving agent preference: ${agentName}`);
      }
      
      await this.chatService.saveChatbotPreferences({ selectedAgent: agentName });
      console.log(`💾 [Chatbot] Saved agent preference to Firestore: ${agentName}`);
      
      if (DEBUG) {
        console.log(`✅ [Chatbot] Debug: Save complete`);
      }
    } catch (err) {
      console.error('❌ [Chatbot] Failed to save agent preference:', err);
    }
  }

  private async saveStreamingThresholdPreference(threshold: number): Promise<void> {
    try {
      const DEBUG = await this.chatService.getDebugStreamingFlag();
      if (DEBUG) {
        console.log(`🔧 [Chatbot] Saving streaming threshold: ${threshold}`);
      }
      
      await this.chatService.saveChatbotPreferences({ streamingThreshold: threshold });
      console.log(`💾 [Chatbot] Saved streaming threshold to Firestore: ${threshold}`);
      
      if (DEBUG) {
        console.log(`✅ [Chatbot] Debug: Save complete`);
      }
    } catch (err) {
      console.error('❌ [Chatbot] Failed to save streaming threshold:', err);
    }
  }

  getAvailableAgents(): string[] {
    return this.availableAgents;
  }

  getCurrentAgent(): string {
    return this.selectedAgent;
  }

  setStreamingThreshold(threshold: number): void {
    console.log(`🔄 [Chatbot] setStreamingThreshold called with: ${threshold}`);
    this.streamingThreshold = threshold;
    console.log(`✅ [Chatbot] Streaming threshold changed to: ${threshold}`);
    this.saveStreamingThresholdPreference(threshold);
  }


  async getChatbotConfig(): Promise<Record<string, any>> {
    try {
      console.log('[Chatbot Provider] Loading config from Firestore...');
      
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore(this.firebaseApp);
      
      const configDoc = await getDoc(doc(db, 'config', 'app'));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        console.log('[Chatbot Provider] Config loaded from Firestore:', data);
        return {
          showAgentSelector: data.showAgentSelector,
          showStreamingSelector: data.showStreamingSelector,
        };
      } else {
        console.log('[Chatbot Provider] No config/app document found in Firestore');
        return {};
      }
    } catch (error) {
      console.error('[Chatbot Provider] Error loading config:', error);
      return {};
    }
  }

  async getQuestions(): Promise<Array<{ id: string; question: string; priority: number; topicDescription?: string; contextHints?: string[] }>> {
    try {
      console.log('[Chatbot Provider] Loading questions from Firestore sources collection...');
      
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(this.firebaseApp);
      
      const sourcesSnapshot = await getDocs(collection(db, 'sources'));
      
      if (sourcesSnapshot.empty) {
        console.log('[Chatbot Provider] No documents found in sources collection');
        return [];
      }

      const allQuestions: Array<{ id: string; question: string; priority: number; topicDescription?: string; contextHints?: string[] }> = [];
      let questionId = 0;
      
      sourcesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.questions && Array.isArray(data.questions)) {
          data.questions.forEach((q: any) => {
            questionId++;
            if (typeof q === 'string') {
              allQuestions.push({ 
                id: `q${questionId}`,
                question: q,
                priority: 1
              });
            } else if (q && typeof q === 'object' && q.question) {
              allQuestions.push({
                id: `q${questionId}`,
                question: q.question,
                topicDescription: q.tooltip || q.topicDescription,
                contextHints: q.contextHints,
                priority: q.priority || 1
              });
            }
          });
        }
      });

      if (allQuestions.length === 0) {
        console.log('[Chatbot Provider] No questions found in any source documents');
        return [];
      }

      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }

      // Limit to 25 total questions (8 initial + 17 more via Show More)
      const limitedQuestions = allQuestions.slice(0, 25);
      console.log(`[Chatbot Provider] Loaded and shuffled ${allQuestions.length} questions, returning ${limitedQuestions.length}`);
      return limitedQuestions;
    } catch (error) {
      console.error('[Chatbot Provider] Error loading questions:', error);
      return [];
    }
  }

  private convertTopicContext(context?: ChatContext): TopicContext | undefined {
    if (!context?.topicContext) return undefined;
    return {
      originalTopic: context.topicContext.originalTopic,
      topicDescription: context.topicContext.topicDescription,
      contextHints: context.topicContext.contextHints,
    };
  }

  private convertMessagesToSDK(messages: ChatMessage[]): SDKChatMessage[] {
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
    }));
  }

  private convertRAGResponseToChatResponse(ragResponse: RAGResponse): ChatResponse {
    return {
      answer: ragResponse.answer,
      sources: ragResponse.sources?.map((source) => ({
        id: source.id,
        filename: source.filename,
        path: source.path,
        contentType: source.contentType,
        similarity: source.similarity,
        contributionPercentage: source.contributionPercentage,
        rank: source.rank,
        preview: source.preview,
        isChunk: source.isChunk,
        chunkIndex: source.chunkIndex,
        totalChunks: source.totalChunks,
        parentDocumentId: source.parentDocumentId,
      })) || [],
      searchTime: ragResponse.searchTime || 0,
      totalDocuments: ragResponse.totalDocuments || ragResponse.sources?.length || 0,
      confidence: ragResponse.confidence || 0.8,
      timings: ragResponse.timings,
      tokenUsage: ragResponse.tokenUsage,
      streamingMetrics: ragResponse.streamingMetrics,
    };
  }

  async sendMessage(
    message: string,
    context: ChatContext,
    config?: Partial<AIChatbotConfig>
  ): Promise<ChatResponse> {
    const topicContext = this.convertTopicContext(context);
    const conversationHistory = this.convertMessagesToSDK(context.conversationHistory);

    const ragResponse = await this.chatService.sendMessage(
      message,
      this.maxResults,
      conversationHistory,
      topicContext,
      this.selectedAgent
    );

    return this.convertRAGResponseToChatResponse(ragResponse);
  }

  async streamMessage(
    message: string,
    context: ChatContext,
    onChunk: (chunk: string) => void,
    onComplete?: (response: ChatResponse) => void,
    config?: Partial<AIChatbotConfig>
  ): Promise<void> {
    const topicContext = this.convertTopicContext(context);
    const conversationHistory = this.convertMessagesToSDK(context.conversationHistory);
    
    // Use streaming threshold from config if provided, otherwise use default
    const streamingThreshold = config?.streamingThreshold ?? this.streamingThreshold;
    
    // Save streaming threshold if it changed
    if (config?.streamingThreshold !== undefined && config.streamingThreshold !== this.streamingThreshold) {
      this.streamingThreshold = config.streamingThreshold;
      console.log(`� [Chatbot] Streaming threshold changed to: ${config.streamingThreshold}`);
      this.saveStreamingThresholdPreference(config.streamingThreshold);
    }

    await this.chatService.streamMessage(
      message,
      this.maxResults,
      conversationHistory,
      this.selectedAgent,
      onChunk,
      (ragResponse: RAGResponse) => {
        if (onComplete) {
          const chatResponse = this.convertRAGResponseToChatResponse(ragResponse);
          onComplete(chatResponse);
        }
      },
      topicContext,
      streamingThreshold
    );
  }
}

// Import ChatMessage from AIChatbot types for internal use
type ChatMessage = import('./AIChatbot/types').ChatMessage;

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
export function Chatbot(props: ChatbotConfig) {
  // Validate props
  if (props.saveSessionHistory && !props.userId) {
    throw new Error('userId is required when saveSessionHistory is true');
  }

  // Merge user config with defaults
  const config = useMemo(() => mergeWithDefaults(props), [props]);

  // Create ChatService instance
  const chatService = useMemo(() => {
    return new ChatService(config.firebaseApp, {
      useEmulators: config.useEmulators,
      projectId: config.projectId,
    });
  }, [config.firebaseApp, config.useEmulators, config.projectId]);

  // Create Firebase provider
  const provider = useMemo(() => {
    return new FirebaseChatProvider(chatService, {
      agentName: config.agentName,
      firebaseApp: config.firebaseApp,
      availableAgents: config.availableAgents,
      maxResults: config.maxResults,
      streamingThreshold: config.streamingThreshold,
    });
  }, [chatService, config.agentName, config.availableAgents, config.maxResults, config.streamingThreshold]);

  // Map our config to AIChatbot config
  const chatbotConfig: AIChatbotConfig = useMemo(() => ({
    enableStreaming: true,
    streamingThreshold: config.streamingThreshold,
    enableSources: true,
    enableQuestions: config.enableDynamicQuestions,
    enableTimingInfo: config.showTimingInfo,
    placeholder: config.placeholder,
    showAgentSwitcher: true,
    showTimingInfo: config.showTimingInfo,
    defaultAgent: config.agentName,
    maxInitialQuestions: config.maxInitialQuestions,
    title: config.title,
    subtitle: config.subtitle,
  }), [
    config.streamingThreshold,
    config.enableDynamicQuestions,
    config.showTimingInfo,
    config.placeholder,
    config.agentName,    config.maxInitialQuestions,
    config.title,
    config.subtitle,
  ]);

  // Create callbacks
  const handleMessageSent = useMemo(() => {
    return (message: string) => {
      if (config.onMessageSent) {
        config.onMessageSent(message);
      }
    };
  }, [config.onMessageSent]);

  const handleMessageReceived = useMemo(() => {
    return (response: ChatResponse) => {
      if (config.onResponseReceived) {
        config.onResponseReceived(response.answer);
      }
    };
  }, [config.onResponseReceived]);

  return (
    <AIChatbot
      provider={provider}
      config={chatbotConfig}
      onMessageSent={handleMessageSent}
      onMessageReceived={handleMessageReceived}
      className={config.className}
      style={config.style}
      userId={config.userId}
      saveSessionHistory={config.saveSessionHistory}
      loadSessionId={config.loadSessionId}
      initialMessages={config.initialMessages}
    />
  );
}

// Re-export types for convenience
export type { ChatbotConfig };
export { ChatService } from './services/ChatService';
export type { ChatServiceInterface } from './services/ChatServiceInterface';
