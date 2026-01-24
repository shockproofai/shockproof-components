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
    /**
     * Use a custom cloud function to send sign-in emails instead of Firebase's built-in service.
     * When enabled, emails are generated server-side using Firebase Admin SDK and sent via
     * a custom email provider (e.g., MailerSend), allowing full control over email branding.
     *
     * Requires the `sendSignInEmail` cloud function to be deployed.
     * @default false
     */
    useCustomEmailSender?: boolean;
    /**
     * Name of the cloud function to call for sending sign-in emails.
     * Only used when `useCustomEmailSender` is true.
     * @default "sendSignInEmail"
     */
    customEmailFunctionName?: string;
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
export interface AuthProviderProps extends AuthConfig {
    children: React.ReactNode;
}
