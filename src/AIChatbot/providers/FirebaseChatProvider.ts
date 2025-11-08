// Firebase Chat Provider Implementation
import { BaseChatProvider } from './ChatProvider';
import type { 
  ChatResponse, 
  ChatContext, 
  ChatbotConfig, 
  ChatQuestion,
  FirebaseProviderConfig 
} from '../types';
import { ChatbotError } from '../types';

// Temporary interface for existing ChatService - will be replaced during integration
interface ExistingChatService {
  sendMessage: (
    message: string,
    maxResults: number,
    conversationHistory: unknown[],
    topicContext: unknown,
    agent: string
  ) => Promise<unknown>;
  
  streamFirestoreMessage: (
    message: string,
    maxResults: number,
    conversationHistory: unknown[],
    agent: string,
    onChunk: (chunk: string) => void,
    onComplete: (response: unknown) => void,
    topicContext: unknown,
    streamingThreshold: number
  ) => Promise<void>;
}

/**
 * Firebase implementation of ChatProvider
 * Integrates with existing Firebase ChatService
 */
export class FirebaseChatProvider extends BaseChatProvider {
  name = 'firebase';
  
  private chatService: ExistingChatService;
  private availableAgents: string[];
  private currentAgent: string;
  private authRequired: boolean;
  
  constructor(config: FirebaseProviderConfig) {
    super();
    
    this.chatService = config.chatService as ExistingChatService;
    this.availableAgents = config.agentOptions || ['askRex'];
    this.currentAgent = this.availableAgents[0];
    this.authRequired = config.authRequired ?? true;
  }
  
  /**
   * Initialize Firebase provider
   */
  async initialize(): Promise<void> {
    if (!this.chatService) {
      throw new ChatbotError(
        'ChatService not provided',
        'PROVIDER_ERROR'
      );
    }
    
    await super.initialize();
  }
  
  /**
   * Send message using Firebase Functions
   */
  async sendMessage(
    message: string, 
    context: ChatContext,
    config?: Partial<ChatbotConfig>
  ): Promise<ChatResponse> {
    this.validateMessage(message);
    
    try {
      const preparedContext = this.prepareContext(context, config);
      
      // Use existing ChatService.sendMessage method
      const response = await this.chatService.sendMessage(
        message,
        5, // maxResults - could be configurable
        preparedContext.conversationHistory,
        preparedContext.topicContext,
        this.currentAgent
      );
      
      return this.formatResponse(response);
      
    } catch (error) {
      this.handleError(error, 'sendMessage');
    }
  }
  
  /**
   * Stream message using Firebase Functions
   */
  async streamMessage(
    message: string,
    context: ChatContext,
    onChunk: (chunk: string) => void,
    onComplete?: (response: ChatResponse) => void,
    config?: Partial<ChatbotConfig>
  ): Promise<void> {
    this.validateMessage(message);
    
    try {
      const preparedContext = this.prepareContext(context, config);
      const mergedConfig = { ...this.config, ...config };
      
      // Use existing ChatService.streamFirestoreMessage method
      await this.chatService.streamFirestoreMessage(
        message,
        5, // maxResults
        preparedContext.conversationHistory,
        this.currentAgent,
        onChunk,
        (response: unknown) => {
          if (onComplete) {
            onComplete(this.formatResponse(response));
          }
        },
        preparedContext.topicContext,
        mergedConfig.streamingThreshold || 300
      );
      
    } catch (error) {
      this.handleError(error, 'streamMessage');
    }
  }
  
  /**
   * Switch between available agents
   */
  switchAgent(agentName: string): void {
    if (!this.availableAgents.includes(agentName)) {
      throw new ChatbotError(
        `Agent '${agentName}' not available. Available agents: ${this.availableAgents.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }
    
    this.currentAgent = agentName;
  }
  
  /**
   * Get available agents
   */
  getAvailableAgents(): string[] {
    return [...this.availableAgents];
  }
  
  /**
   * Get current agent
   */
  getCurrentAgent(): string {
    return this.currentAgent;
  }
  
  /**
   * Format Firebase response to match our interface
   */
  private formatResponse(firebaseResponse: unknown): ChatResponse {
    const response = firebaseResponse as Record<string, unknown>;
    return {
      answer: (response.answer as string) || '',
      sources: (response.sources as ChatResponse['sources']) || [],
      searchTime: (response.searchTime as number) || 0,
      totalDocuments: (response.totalDocuments as number) || 0,
      confidence: (response.confidence as number) || 0,
      knowledgeBreakdown: response.knowledgeBreakdown as ChatResponse['knowledgeBreakdown'],
      timings: response.timings as Record<string, number>,
      tokenUsage: response.tokenUsage as ChatResponse['tokenUsage'],
      streamingMetrics: response.streamingMetrics as ChatResponse['streamingMetrics']
    };
  }
  
  /**
   * Get questions from Firestore sources collection
   * Randomly selects questions from documents
   */
  async getQuestions(): Promise<ChatQuestion[]> {
    try {
      // Import Firebase dynamically to avoid bundling issues
      const { collection, getDocs, getFirestore } = await import('firebase/firestore');
      
      const db = getFirestore();
      const sourcesRef = collection(db, 'sources');
      const snapshot = await getDocs(sourcesRef);
      
      const allQuestions: ChatQuestion[] = [];
      let questionId = 1;
      
      // Extract questions from each document
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Check if document has questions array
        if (data.questions && Array.isArray(data.questions)) {
          data.questions.forEach((q: any) => {
            // Support both string and object formats
            const questionText = typeof q === 'string' ? q : q.question || q.text;
            
            if (questionText) {
              allQuestions.push({
                id: `q-${questionId++}`,
                question: questionText,
                // Don't include topicDescription - we don't want categories
                contextHints: q.contextHints || [],
                priority: q.priority || 1,
              });
            }
          });
        }
      });
      
      // Randomly shuffle questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      
      // Return random selection (configurable, default to 25)
      const maxQuestions = this.config.maxInitialQuestions || 25;
      return shuffled.slice(0, maxQuestions);
    } catch (error) {
      console.error('Error fetching questions from Firestore:', error);
      // Return empty array to fall back to FALLBACK_QUESTIONS
      return [];
    }
  }

  /**
   * Get chatbot configuration from Firestore config/app document
   */
  async getChatbotConfig(): Promise<Record<string, any>> {
    try {
      // Import Firebase dynamically to avoid bundling issues
      const { doc, getDoc, getFirestore } = await import('firebase/firestore');
      
      const db = getFirestore();
      const configRef = doc(db, 'config', 'app');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        return configSnap.data();
      }
      
      return {};
    } catch (error) {
      console.error('Error fetching chatbot config from Firestore:', error);
      return {};
    }
  }

  /**
   * Check if user is authenticated (if required)
   */
  private checkAuth(): void {
    if (this.authRequired) {
      // This would check Firebase Auth state
      // Will be implemented during integration
    }
  }
}

/**
 * Factory function for creating Firebase provider
 */
export function createFirebaseProvider(config: FirebaseProviderConfig): FirebaseChatProvider {
  return new FirebaseChatProvider(config);
}