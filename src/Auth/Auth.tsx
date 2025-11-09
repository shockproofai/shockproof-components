import React from "react";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { AuthUI } from "./components/AuthUI";
import { AuthConfig } from "./types";

interface AuthProps extends AuthConfig {
  children: React.ReactNode;
}

/**
 * Internal component that shows auth UI or children based on auth state
 */
const AuthGate: React.FC<{ enableGoogle?: boolean; children: React.ReactNode }> = ({
  enableGoogle,
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show auth UI if not authenticated
  if (!isAuthenticated) {
    return <AuthUI enableGoogle={enableGoogle} />;
  }

  // Show children when authenticated
  return <>{children}</>;
};

/**
 * Auth component - wrapper that handles authentication
 * 
 * Provides inline authentication gate:
 * - Shows auth UI when not authenticated
 * - Reveals children when authenticated
 * - Supports auto anonymous sign-in
 * - Supports Google OAuth
 * 
 * @example
 * ```tsx
 * // Auto sign-in anonymously (silent)
 * <Auth firebaseApp={firebaseApp} autoSignInAnonymously={true}>
 *   <YourApp />
 * </Auth>
 * 
 * // Show Google sign-in
 * <Auth firebaseApp={firebaseApp} enableGoogle={true}>
 *   <YourApp />
 * </Auth>
 * ```
 */
export const Auth: React.FC<AuthProps> = ({
  firebaseApp,
  autoSignInAnonymously = false,
  enableGoogle = true,
  enableEmailLink = false,
  onSendEmailLink,
  children,
}) => {
  return (
    <AuthProvider
      firebaseApp={firebaseApp}
      autoSignInAnonymously={autoSignInAnonymously}
      enableGoogle={enableGoogle}
      enableEmailLink={enableEmailLink}
      onSendEmailLink={onSendEmailLink}
    >
      <AuthGate enableGoogle={enableGoogle}>
        {children}
      </AuthGate>
    </AuthProvider>
  );
};
