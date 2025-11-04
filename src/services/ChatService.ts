import { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, setDoc, query, orderBy, onSnapshot, Unsubscribe, getDoc, Firestore } from 'firebase/firestore';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { ChatServiceInterface, TopicContext } from './ChatServiceInterface';
import { ChatMessage, ChatSession, RAGQuery, RAGResponse } from '../types';

/**
 * Firebase-based implementation of ChatService
 * Provides RAG chatbot functionality with streaming support and conversation management
 */
export class ChatService implements ChatServiceInterface {
  private db: Firestore;
  private functions: Functions;
  private projectId: string;
  private useEmulators: boolean;

  constructor(firebaseApp: FirebaseApp, options?: {
    useEmulators?: boolean;
    projectId?: string;
  }) {
    this.db = getFirestore(firebaseApp);
    this.functions = getFunctions(firebaseApp);
    this.projectId = options?.projectId || firebaseApp.options.projectId || 'shockproof-dev';
    this.useEmulators = options?.useEmulators || false;
  }

  /**
   * Read debug streaming flag from Firestore config/app document
   */
  async getDebugStreamingFlag(): Promise<boolean> {
    try {
      const appConfigRef = doc(this.db, 'config/app');
      const appConfigSnap = await getDoc(appConfigRef);
      
      if (appConfigSnap.exists()) {
        const data = appConfigSnap.data();
        return typeof data.debugStreaming === 'boolean' ? data.debugStreaming : false;
      }
      return false;
    } catch (error) {
      console.warn('Failed to read debug streaming config, defaulting to false:', error);
      return false;
    }
  }

  /**
   * Stream Firestore RAG chatbot response with conditional streaming
   * @param streamingThreshold - Minimum characters before streaming begins (default: 300)
   *                            Set to 0 to always stream, set high (e.g., 10000) to effectively disable
   */
  async streamMessage(
    query: string,
    maxResults: number,
    conversationHistory: ChatMessage[],
    selectedAgent: string,
    onChunk: (chunk: string) => void,
    onDone?: (final: RAGResponse) => void,
    topicContext?: TopicContext,
    streamingThreshold: number = 300
  ): Promise<void> {
    // Read debug flag early
    const DEBUG = await this.getDebugStreamingFlag();

    // Use HTTP endpoint for true streaming support
    const functionUrl = this.useEmulators 
      ? 'http://localhost:9200/firestoreRagChatQueryStream'
      : `https://us-central1-${this.projectId}.cloudfunctions.net/firestoreRagChatQueryStream`;

    if (DEBUG) {
      console.log('🌐 Using function URL:', functionUrl, '(emulators:', this.useEmulators, ', projectId:', this.projectId, ')');
    }

    const ragQuery = {
      query,
      maxResults,
      includeContext: true,
      conversationHistory: conversationHistory.slice(-10).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : undefined,
      })),
      topicContext,
      agentName: selectedAgent,
      streamingThreshold,
    };

    if (DEBUG) {
      console.log('🚀 Sending streaming Firestore RAG query:', {
        query: query.substring(0, 50) + '...',
        historyLength: ragQuery.conversationHistory?.length || 0,
        topicContext: ragQuery.topicContext,
        agentName: selectedAgent,
      });
    }

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ragQuery),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let streamingComplete = false;
      let lastChunkTime = Date.now();

      if (DEBUG) {
        console.log(`[${new Date().toISOString()}] 🐛 Client-side debug streaming enabled from Firestore config`);
        console.log(`[${new Date().toISOString()}] 📖 Starting to read stream...`);
      }

      while (true) {
        const { done, value } = await reader.read();
        const currentTime = Date.now();

        if (DEBUG && value) {
          console.log(`[${new Date().toISOString()}] 📦 Received bytes:`, value.length);
        }

        if (done || streamingComplete) {
          if (DEBUG) {
            console.log(`[${new Date().toISOString()}] 🛑 Stream complete (done: ${done}, streamingComplete: ${streamingComplete})`);
          }
          break;
        }

        // Safety timeout: if we haven't received any data for 30 seconds, break
        if (currentTime - lastChunkTime > 30000) {
          console.warn(`[${new Date().toISOString()}] ⏰ Stream timeout: no data for 30s`);
          break;
        }

        if (value) {
          lastChunkTime = currentTime;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        if (DEBUG) {
          console.log(`[${new Date().toISOString()}] 📝 Buffer content (${buffer.length} chars):`, buffer.substring(0, 200));
          console.log(`[${new Date().toISOString()}] 📋 Split into ${lines.length} lines`);
        }

        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (DEBUG) {
            console.log(`[${new Date().toISOString()}] 🔍 Processing line:`, line.substring(0, 100));
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix

              if (DEBUG) {
                console.log(`[${new Date().toISOString()}] 📨 Parsed SSE data:`, { type: data.type, contentLength: data.content?.length || 0 });
              }

              if (data.type === 'chunk') {
                if (typeof data.content === 'string' && data.content.length > 0) {
                  if (DEBUG) {
                    console.log(`[${new Date().toISOString()}] 🎯 Calling onChunk with:`, data.content.substring(0, 50));
                  }
                  onChunk(data.content);
                } else if (DEBUG) {
                  console.warn(`⚠️ Invalid chunk:`, typeof data.content);
                }
              } else if (data.type === 'done') {
                if (DEBUG) {
                  console.log(`[${new Date().toISOString()}] ✅ Received 'done' message`);
                }
                if (onDone && data.response) {
                  onDone(data.response);
                }
                streamingComplete = true;
                break;
              } else if (data.type === 'error') {
                console.error(`❌ Streaming error:`, data.message);
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse SSE:', line, e);
            }
          }
        }

        // If streaming is complete, break out of the while loop immediately
        if (streamingComplete) {
          break;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Send a query to the RAG chatbot with full conversation context
   */
  async sendMessage(
    query: string, 
    maxResults: number = 5,
    conversationHistory: ChatMessage[] = [],
    topicContext?: TopicContext,
    selectedAgent: string = 'askRex'
  ): Promise<RAGResponse> {
    try {
      console.log('🚀 Sending RAG query with agent:', selectedAgent);

      // Always use Firestore RAG implementation with selected agent
      return await this.sendFirestoreMessage(query, maxResults, conversationHistory, topicContext, selectedAgent);
    } catch (error) {
      console.error('Error sending RAG query:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  /**
   * Send message using Firestore RAG implementation
   */
  private async sendFirestoreMessage(
    query: string,
    maxResults: number,
    conversationHistory: ChatMessage[],
    topicContext?: TopicContext,
    selectedAgent: string = 'askRex'
  ): Promise<RAGResponse> {
    // Call the Firestore RAG function
    const firestoreRagQuery = httpsCallable<RAGQuery, RAGResponse>(this.functions, 'firestoreRagChatQuery');

    const ragQuery = {
      query,
      maxResults,
      includeContext: true,
      conversationHistory: conversationHistory.slice(-10).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : undefined,
      })),
      topicContext,
      agentName: selectedAgent,
    };

    console.log('🚀 Sending Firestore RAG query:', {
      query: query.substring(0, 50) + '...',
      historyLength: ragQuery.conversationHistory?.length || 0,
      topicContext: ragQuery.topicContext,
    });

    const result = await firestoreRagQuery(ragQuery);
    return result.data;
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userId: string, title: string = 'New Chat'): Promise<string> {
    try {
      const chatSession: Omit<ChatSession, 'docId'> = {
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      };

      const docRef = await addDoc(collection(this.db, 'chatSessions'), chatSession);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Subscribe to chat session updates
   */
  subscribeToChatSession(sessionId: string, callback: (session: ChatSession) => void): Unsubscribe {
    const sessionRef = doc(this.db, 'chatSessions', sessionId);
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const session: ChatSession = {
          docId: doc.id,
          title: data.title,
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          userId: data.userId,
        };
        callback(session);
      }
    });
  }

  /**
   * Get user's chat sessions
   */
  subscribeToUserChatSessions(userId: string, callback: (sessions: ChatSession[]) => void): Unsubscribe {
    const sessionsRef = collection(this.db, 'chatSessions');
    const q = query(
      sessionsRef,
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const sessions: ChatSession[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            docId: doc.id,
            title: data.title,
            messages: data.messages || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            userId: data.userId,
          };
        })
        .filter(session => session.userId === userId);
      
      callback(sessions);
    });
  }

  /**
   * Update chat session title
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        title,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating session title:', error);
      throw new Error('Failed to update session title');
    }
  }

  /**
   * Generate a smart title for a chat session based on the first message
   */
  generateSessionTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6);
    const title = words.join(' ');
    return title.length > 30 ? title.substring(0, 30) + '...' : title;
  }

  /**
   * Get chatbot preferences from Firestore config/app
   */
  async getChatbotPreferences(): Promise<{
    selectedAgent?: string;
    streamingThreshold?: number;
  }> {
    try {
      const appConfigRef = doc(this.db, 'config/app');
      const appConfigSnap = await getDoc(appConfigRef);
      
      if (appConfigSnap.exists()) {
        const data = appConfigSnap.data();
        return {
          selectedAgent: data.selectedAgent as string | undefined,
          streamingThreshold: typeof data.streamingThreshold === 'number' ? data.streamingThreshold : undefined,
        };
      }
      return {};
    } catch (error) {
      console.warn('Failed to read chatbot preferences:', error);
      return {};
    }
  }

  /**
   * Save chatbot preferences to Firestore config/app
   */
  async saveChatbotPreferences(preferences: {
    selectedAgent?: string;
    streamingThreshold?: number;
  }): Promise<void> {
    const DEBUG = await this.getDebugStreamingFlag();
    
    console.log('� [ChatService] Attempting to save preferences to config/app:', preferences);
    
    if (DEBUG) {
      console.log('🔧 [ChatService] DEBUG mode enabled');
    }
    
    try {
      const appConfigRef = doc(this.db, 'config/app');
      
      // Use setDoc with merge to create document if it doesn't exist
      await setDoc(appConfigRef, preferences, { merge: true });
      
      console.log('✅ [ChatService] Successfully saved preferences to Firestore');
      
      if (DEBUG) {
        console.log('🔧 [ChatService] Preferences saved with merge:true');
      }
    } catch (error) {
      console.error('❌ [ChatService] Failed to save chatbot preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }
}
