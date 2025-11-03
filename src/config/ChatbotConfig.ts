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
   * Agent to use for chat responses (optional, default: 'askRex')
   */
  agentName?: 'askRex' | 'askRexTest';

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
   * Maximum number of dynamic questions to show (optional, default: 3)
   */
  maxDynamicQuestions?: number;

  /**
   * Show timing information for debugging (optional, default: false)
   */
  showTimingInfo?: boolean;

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
}
