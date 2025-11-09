import { FirebaseApp } from "firebase/app";
import { User } from "firebase/auth";

/**
 * Configuration for the Auth component
 */
export interface AuthConfig {
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
   * Optional callback to handle email sending for passwordless login
   * If not provided, Firebase's built-in sendSignInLinkToEmail will be used
   * 
   * @param email - The email address to send the sign-in link to
   * @param link - The sign-in link URL to include in the email
   * @returns Promise that resolves when email is sent
   */
  onSendEmailLink?: (email: string, link: string) => Promise<void>;
}

/**
 * Auth context value
 */
export interface AuthContextType {
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
}

/**
 * Props for AuthProvider
 */
export interface AuthProviderProps extends AuthConfig {
  children: React.ReactNode;
}
