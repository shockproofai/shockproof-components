import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthUIProps {
  enableGoogle?: boolean;
  enableEmailLink?: boolean;
}

export const AuthUI: React.FC<AuthUIProps> = ({
  enableGoogle = true,
  enableEmailLink = false,
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

  return (
    <div className="flex items-center justify-center h-screen">
      {loading || isCompletingSignIn ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : needsEmailForCompletion ? (
        // User clicked email link but email not found in localStorage
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Complete Sign-In</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your email to complete sign-in
            </p>
          </div>
          {error && (
            <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleCompleteSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              Complete Sign-In
            </button>
          </form>
        </div>
      ) : emailSent ? (
        // Email link sent successfully
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-sm text-gray-600">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Click the link in the email to sign in. The link will expire in 1 hour.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        // Normal sign-in UI
        <div className="w-full max-w-sm space-y-4">
          {error && !needsEmailForCompletion && (
            <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {enableGoogle && (
            <button
              onClick={signInWithGoogle}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Sign in with Google
            </button>
          )}

          {hasMultipleMethods && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
          )}

          {enableEmailLink && (
            <form onSubmit={handleSendLink} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                Send sign-in link
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
