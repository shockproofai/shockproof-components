import React, { createContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
} from "firebase/auth";
import { AuthContextType, AuthProviderProps } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  firebaseApp,
  autoSignInAnonymously = false,
  enableEmailLink = false,
  onSendEmailLink,
  onEmailLinkSent,
  onEmailLinkError,
  emailLinkActionURL,
  emailLinkHandleCodeInApp = true,
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth(firebaseApp);

  // Validate at least one auth method is enabled
  useEffect(() => {
    const hasAuthMethod =
      autoSignInAnonymously ||
      enableEmailLink ||
      true; // Google is always available (enableGoogle not yet in props but defaults to true)

    if (!hasAuthMethod && process.env.NODE_ENV === "development") {
      console.warn(
        "[Auth] No authentication methods enabled. " +
          "Set autoSignInAnonymously, enableEmailLink, or enable Google authentication."
      );
    }
  }, [autoSignInAnonymously, enableEmailLink]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Auto-detect and complete email link sign-in if URL contains sign-in link
  useEffect(() => {
    if (enableEmailLink && isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem("emailForSignIn");
      if (email) {
        handleCompleteEmailLinkSignIn(email);
      } else {
        // Email not found in localStorage
        // User might have opened link on different device
        // Set error to prompt for email re-entry
        setError("Please enter your email to complete sign-in");
        setLoading(false);
      }
    }
  }, [auth, enableEmailLink]);

  // Auto sign-in anonymously if enabled
  useEffect(() => {
    if (autoSignInAnonymously && !user && !loading) {
      handleSignInAnonymously();
    }
  }, [autoSignInAnonymously, user, loading]);

  const handleSignInAnonymously = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignInAnonymously(auth);
      // Don't call setLoading(false) - let onAuthStateChanged handle it
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in anonymously";
      setError(errorMessage);
      console.error("Anonymous sign-in error:", err);
      setLoading(false); // Only set loading false on error
    }
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Don't call setLoading(false) - let onAuthStateChanged handle it
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      console.error("Google sign-in error:", err);
      setLoading(false); // Only set loading false on error
    }
  };

  const handleSendEmailLink = async (email: string) => {
    // Don't set global loading state for email sending
    // This prevents AuthGate from unmounting AuthUI
    // setLoading(true);
    setError(null);
    try {
      const actionCodeSettings = {
        url: emailLinkActionURL || window.location.href,
        handleCodeInApp: emailLinkHandleCodeInApp,
      };

      if (onSendEmailLink) {
        // Custom email sender provided - use it
        await onSendEmailLink(email);
      } else {
        // Use Firebase's built-in email service
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      }

      // Store email in localStorage for verification step
      window.localStorage.setItem("emailForSignIn", email);

      // Notify parent component of success
      if (onEmailLinkSent) {
        onEmailLinkSent(email);
      }

      // setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to send sign-in link");
      setError(error.message);
      console.error("Email link send error:", err);
      
      // Notify parent component of error
      if (onEmailLinkError) {
        onEmailLinkError(error);
      }
      
      // setLoading(false);
      // Re-throw the error so AuthUI knows it failed
      throw error;
    }
  };

  const handleCompleteEmailLinkSignIn = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailLink(auth, email, window.location.href);

      // Clean up
      window.localStorage.removeItem("emailForSignIn");

      // Don't call setLoading(false) - let onAuthStateChanged handle it
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to complete email link sign-in";
      setError(errorMessage);
      console.error("Email link sign-in error:", err);
      setLoading(false);
    }
  };

  const handleIsEmailLinkSignIn = () => {
    return isSignInWithEmailLink(auth, window.location.href);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      // Don't call setLoading(false) - let onAuthStateChanged handle it
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      console.error("Sign-out error:", err);
      setLoading(false); // Only set loading false on error
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInAnonymously: handleSignInAnonymously,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    sendEmailLink: handleSendEmailLink,
    completeEmailLinkSignIn: handleCompleteEmailLinkSignIn,
    isEmailLinkSignIn: handleIsEmailLinkSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
