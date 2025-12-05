import { ChatbotConfig } from './config';
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
export declare function Chatbot(props: ChatbotConfig): import("react/jsx-runtime").JSX.Element;
export type { ChatbotConfig };
export { ChatService } from './services/ChatService';
export type { ChatServiceInterface } from './services/ChatServiceInterface';
