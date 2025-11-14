import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthUIProps {
  enableGoogle?: boolean;
  enableEmailLink?: boolean;
  heading?: string;
  tagline?: string;
  badgeText?: string;
  /** Custom className for the outer container (removes default min-h-screen and gradient if provided) */
  containerClassName?: string;
  /** Custom className for the auth card */
  cardClassName?: string;
  /** Whether to show the Shockproof AI footer branding */
  showFooter?: boolean;
  /** Theme variant - affects default styling if no custom classes provided */
  variant?: 'light' | 'dark';
}

export const AuthUI: React.FC<AuthUIProps> = ({
  enableGoogle = true,
  enableEmailLink = false,
  heading = "Welcome to Shockproof AI",
  tagline = "Your intelligent AI assistant platform",
  badgeText = "Secure, passwordless authentication",
  containerClassName,
  cardClassName,
  showFooter = true,
  variant = 'light',
}) => {
  const {
    loading,
    error,
    signInWithGoogle,
    sendEmailLink,
    completeEmailLinkSignIn,
    isEmailLinkSignIn,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isCompletingSignIn, setIsCompletingSignIn] = useState(false);

  // Check if this is an email link sign-in completion
  const needsEmailForCompletion = isEmailLinkSignIn() && error?.includes("email");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await sendEmailLink(email);
      setEmailSent(true);
    } catch (err) {
      // Error is handled by AuthProvider
      console.error("Failed to send email link:", err);
    }
  };

  const handleCompleteSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsCompletingSignIn(true);
    try {
      await completeEmailLinkSignIn(email);
    } catch (err) {
      console.error("Failed to complete sign-in:", err);
    } finally {
      setIsCompletingSignIn(false);
    }
  };

  const hasMultipleMethods = enableGoogle && enableEmailLink;

  // Default container styles based on variant and whether custom className provided
  const defaultContainerClass = variant === 'dark' 
    ? "min-h-screen flex items-center justify-center bg-background text-foreground px-4"
    : "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4";
  
  const finalContainerClass = containerClassName || defaultContainerClass;
  
  const defaultCardClass = variant === 'dark'
    ? "bg-card border border-border rounded-2xl shadow-xl p-8"
    : "bg-white rounded-2xl shadow-xl p-8";
    
  const finalCardClass = cardClassName || defaultCardClass;

  // Email sent success screen
  if (emailSent) {
    return (
      <div className={finalContainerClass}>
        <div className="max-w-md w-full">
          <div className={finalCardClass + " text-center"}>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a magic link to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to sign in. The link will expire in 60 minutes.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={finalContainerClass}>
      {loading || isCompletingSignIn ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : needsEmailForCompletion ? (
        // User clicked email link but email not found in localStorage
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Sign-In</h2>
              <p className="text-sm text-gray-600">
                Please enter your email to complete sign-in
              </p>
            </div>
            {error && (
              <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleCompleteSignIn} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
              >
                Complete Sign-In
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Normal sign-in UI
        <div className="max-w-md w-full">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {heading}
            </h1>
            <p className="text-muted-foreground text-lg">
              {tagline}
            </p>
          </div>

          {/* Auth Card */}
          <div className={finalCardClass}>
            {error && !needsEmailForCompletion && (
              <div className="flex items-start space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-6">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {enableGoogle && (
              <button
                onClick={signInWithGoogle}
                className="w-full inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-border bg-card hover:bg-accent hover:text-accent-foreground h-12 px-6 shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            )}

            {hasMultipleMethods && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-3 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
            )}

            {enableEmailLink && (
              <>
                {!hasMultipleMethods && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in with email</h3>
                    <p className="text-sm text-gray-600">
                      Enter your email and we'll send you a magic link to sign in instantly—no password needed.
                    </p>
                  </div>
                )}
                <form onSubmit={handleSendLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoFocus={!enableGoogle}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    Send sign-in link
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{badgeText}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Powered by{' '}
                <a
                  href="https://shockproof.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Shockproof AI
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
