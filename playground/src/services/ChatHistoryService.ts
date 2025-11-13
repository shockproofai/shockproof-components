import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { app } from '../firebase';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatHistoryService {
  private db = getFirestore(app);

  private timestampToDate(timestamp: unknown): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp as string | number);
  }

  private docToSession(doc: QueryDocumentSnapshot<DocumentData>): ChatSession {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || 'Untitled Chat',
      messages: (data.messages || []).map((msg: { id: string; content: string; role: 'user' | 'assistant'; timestamp: unknown }) => ({
        ...msg,
        timestamp: this.timestampToDate(msg.timestamp)
      })),
      createdAt: this.timestampToDate(data.createdAt),
      updatedAt: this.timestampToDate(data.updatedAt)
    };
  }

  async getRecentSessions(userId: string, maxSessions: number = 20): Promise<ChatSession[]> {
    try {
      const sessionsRef = collection(this.db, 'users', userId, 'chatSessions');
      const q = query(sessionsRef, orderBy('updatedAt', 'desc'), limit(maxSessions));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => this.docToSession(doc));
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      return [];
    }
  }

  watchUserSessions(
    userId: string, 
    callback: (sessions: ChatSession[]) => void,
    maxSessions: number = 20
  ): () => void {
    const sessionsRef = collection(this.db, 'users', userId, 'chatSessions');
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'), limit(maxSessions));
    
    return onSnapshot(q, 
      (snapshot) => {
        const sessions = snapshot.docs.map(doc => this.docToSession(doc));
        callback(sessions);
      },
      (error) => {
        console.error('Error watching sessions:', error);
        callback([]);
      }
    );
  }

  async getSessionById(userId: string, sessionId: string): Promise<ChatSession | null> {
    try {
      const sessionRef = doc(this.db, 'users', userId, 'chatSessions', sessionId);
      const snapshot = await getDoc(sessionRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return this.docToSession(snapshot as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  async getSessionMessages(userId: string, sessionId: string): Promise<ChatMessage[]> {
    const session = await this.getSessionById(userId, sessionId);
    return session?.messages || [];
  }
}

export const chatHistoryService = new ChatHistoryService();
