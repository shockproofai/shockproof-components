import { FirebaseApp } from 'firebase/app';

/**
 * Configuration for the Chatbot component
 */
export interface ChatbotConfig {
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
}
