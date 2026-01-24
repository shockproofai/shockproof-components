"use client";
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, isSignInWithEmailLink, signInAnonymously, signInWithEmailLink, GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AuthContext = createContext(undefined);
const AuthProvider = ({ firebaseApp, autoSignInAnonymously = false, enableEmailLink = false, onSendEmailLink, onEmailLinkSent, onEmailLinkError, emailLinkActionURL, emailLinkHandleCodeInApp = true, useCustomEmailSender = false, customEmailFunctionName = "sendSignInEmail", children, }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth(firebaseApp);
    const functions = getFunctions(firebaseApp);
    // Validate at least one auth method is enabled
    useEffect(() => {
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
            }
            else {
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
            await signInAnonymously(auth);
            // Don't call setLoading(false) - let onAuthStateChanged handle it
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to sign in anonymously";
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
            setError(errorMessage);
            console.error("Google sign-in error:", err);
            setLoading(false); // Only set loading false on error
        }
    };
    const handleSendEmailLink = async (email) => {
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
                // Custom email sender callback provided - use it
                await onSendEmailLink(email);
            }
            else if (useCustomEmailSender) {
                // Use custom cloud function to send branded email
                const sendSignInEmail = httpsCallable(functions, customEmailFunctionName);
                await sendSignInEmail({
                    email,
                    actionCodeSettings,
                });
            }
            else {
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
        }
        catch (err) {
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
    const handleCompleteEmailLinkSignIn = async (email) => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailLink(auth, email, window.location.href);
            // Clean up
            window.localStorage.removeItem("emailForSignIn");
            // Don't call setLoading(false) - let onAuthStateChanged handle it
        }
        catch (err) {
            const errorMessage = err instanceof Error
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
            await signOut(auth);
            // Don't call setLoading(false) - let onAuthStateChanged handle it
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
            setError(errorMessage);
            console.error("Sign-out error:", err);
            setLoading(false); // Only set loading false on error
        }
    };
    const value = {
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
    return jsx(AuthContext.Provider, { value: value, children: children });
};

/**
 * Hook to access Auth context
 * Must be used within AuthProvider
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

const AuthUI = ({ enableGoogle = true, enableEmailLink = false, heading = "Welcome to Shockproof AI", tagline = "Your intelligent AI assistant platform", badgeText = "Secure, passwordless authentication", emailLinkSuccessMessage, emailLinkSuccessInstructions, containerClassName, cardClassName, showFooter = true, variant = 'light', }) => {
    const { loading, error, signInWithGoogle, sendEmailLink, completeEmailLinkSignIn, isEmailLinkSignIn, } = useAuth();
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [isCompletingSignIn, setIsCompletingSignIn] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    // Check if this is an email link sign-in completion
    const needsEmailForCompletion = isEmailLinkSignIn() && error?.includes("email");
    const handleSendLink = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Also stop event propagation
        if (!email)
            return;
        setIsSendingEmail(true);
        try {
            await sendEmailLink(email);
            // Use callback form to ensure state update happens
            setEmailSent(true);
        }
        catch (err) {
            // Error is handled by AuthProvider
            console.error("Failed to send email link:", err);
            // Don't set emailSent to true if there was an error
        }
        finally {
            setIsSendingEmail(false);
        }
    };
    const handleCompleteSignIn = async (e) => {
        e.preventDefault();
        if (!email)
            return;
        setIsCompletingSignIn(true);
        try {
            await completeEmailLinkSignIn(email);
        }
        catch (err) {
            console.error("Failed to complete sign-in:", err);
        }
        finally {
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
    // Email sent success screen - render without outer container wrapper when custom className provided
    if (emailSent) {
        const successContent = (jsxs("div", { className: finalCardClass + " text-center", children: [jsx("div", { className: "w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6", children: jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), jsx("h2", { className: "text-2xl font-bold mb-3", children: "Check your email" }), jsx("p", { className: "text-muted-foreground mb-6", children: emailLinkSuccessMessage
                        ? emailLinkSuccessMessage.replace('{email}', email)
                        : jsxs(Fragment, { children: ["We've sent a magic link to ", jsx("span", { className: "font-semibold text-foreground", children: email })] }) }), jsx("p", { className: "text-sm text-muted-foreground mb-6", children: emailLinkSuccessInstructions || "Click the link in the email to sign in. The link will expire in 60 minutes." }), jsx("button", { onClick: () => {
                        setEmailSent(false);
                        setEmail("");
                    }, className: "text-primary hover:text-primary/80 font-medium text-sm transition-colors", children: "Use a different email" })] }));
        // If custom containerClassName provided, render directly without wrapper
        if (containerClassName) {
            return jsx("div", { className: finalContainerClass, children: successContent });
        }
        // Otherwise, use the default full-page wrapper
        return (jsx("div", { className: finalContainerClass, children: jsx("div", { className: "max-w-md w-full", children: successContent }) }));
    }
    return (jsx("div", { className: finalContainerClass, children: loading || isCompletingSignIn ? (jsx("div", { className: "flex items-center justify-center", children: jsx("div", { className: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" }) })) : needsEmailForCompletion ? (
        // User clicked email link but email not found in localStorage
        jsx("div", { className: "max-w-md w-full", children: jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8", children: [jsxs("div", { className: "text-center mb-6", children: [jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Complete Sign-In" }), jsx("p", { className: "text-sm text-gray-600", children: "Please enter your email to complete sign-in" })] }), error && (jsxs("div", { className: "flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4", children: [jsx("svg", { className: "w-5 h-5 flex-shrink-0 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), jsx("span", { children: error })] })), jsxs("form", { onSubmit: handleCompleteSignIn, className: "space-y-4", children: [jsx("input", { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true, className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" }), jsx("button", { type: "submit", className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl", children: "Complete Sign-In" })] })] }) })) : (
        // Normal sign-in UI
        jsxs("div", { className: "max-w-md w-full", children: [jsxs("div", { className: "text-center mb-8", children: [jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg", children: jsx("svg", { className: "w-9 h-9 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) }) }), jsx("h1", { className: "text-3xl font-bold mb-2", children: heading }), jsx("p", { className: "text-muted-foreground text-lg", children: tagline })] }), jsxs("div", { className: finalCardClass, children: [error && !needsEmailForCompletion && (jsxs("div", { className: "flex items-start space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-6", children: [jsx("svg", { className: "w-5 h-5 flex-shrink-0 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), jsx("span", { children: error })] })), enableGoogle && (jsxs("button", { onClick: signInWithGoogle, className: "w-full inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-border bg-card hover:bg-accent hover:text-accent-foreground h-12 px-6 shadow-sm hover:shadow", children: [jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign in with Google"] })), hasMultipleMethods && (jsxs("div", { className: "relative my-6", children: [jsx("div", { className: "absolute inset-0 flex items-center", children: jsx("span", { className: "w-full border-t border-border" }) }), jsx("div", { className: "relative flex justify-center text-sm", children: jsx("span", { className: "bg-card px-3 text-muted-foreground", children: "Or continue with email" }) })] })), enableEmailLink && (jsxs(Fragment, { children: [!hasMultipleMethods && (jsxs("div", { className: "mb-6", children: [jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Sign in with email" }), jsx("p", { className: "text-sm text-gray-600", children: "Enter your email and we'll send you a magic link to sign in instantly\u2014no password needed." })] })), jsxs("form", { onSubmit: handleSendLink, className: "space-y-4", children: [jsxs("div", { children: [jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email address" }), jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", required: true, autoFocus: !enableGoogle, className: "w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground" })] }), jsx("button", { type: "submit", disabled: isSendingEmail, className: "w-full bg-gradient-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed", children: isSendingEmail ? 'Sending...' : 'Send sign-in link' })] })] })), jsx("div", { className: "mt-6 pt-6 border-t border-border", children: jsxs("div", { className: "flex items-center justify-center space-x-2 text-sm text-muted-foreground", children: [jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), jsx("span", { children: badgeText })] }) })] }), showFooter && (jsx("div", { className: "text-center mt-6", children: jsxs("p", { className: "text-sm text-muted-foreground", children: ["Powered by", ' ', jsx("a", { href: "https://shockproof.ai", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:text-primary/80 font-medium transition-colors", children: "Shockproof AI" })] }) }))] })) }));
};

/**
 * Internal component that shows auth UI or children based on auth state
 */
const AuthGate = ({ enableGoogle, enableEmailLink, heading, tagline, badgeText, emailLinkSuccessMessage, emailLinkSuccessInstructions, children }) => {
    const { isAuthenticated, loading } = useAuth();
    // Show loading spinner while checking auth state
    if (loading) {
        return (jsx("div", { className: "flex items-center justify-center min-h-screen", children: jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    // Show auth UI if not authenticated
    if (!isAuthenticated) {
        return (jsx(AuthUI, { enableGoogle: enableGoogle, enableEmailLink: enableEmailLink, heading: heading, tagline: tagline, badgeText: badgeText, emailLinkSuccessMessage: emailLinkSuccessMessage, emailLinkSuccessInstructions: emailLinkSuccessInstructions }));
    }
    // Show children when authenticated
    return jsx(Fragment, { children: children });
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
const Auth = ({ firebaseApp, autoSignInAnonymously = false, enableGoogle = true, enableEmailLink = false, heading, tagline, badgeText, emailLinkSuccessMessage, emailLinkSuccessInstructions, onSendEmailLink, onEmailLinkSent, onEmailLinkError, emailLinkActionURL, emailLinkHandleCodeInApp, useCustomEmailSender, customEmailFunctionName, children, }) => {
    return (jsx(AuthProvider, { firebaseApp: firebaseApp, autoSignInAnonymously: autoSignInAnonymously, enableGoogle: enableGoogle, enableEmailLink: enableEmailLink, onSendEmailLink: onSendEmailLink, onEmailLinkSent: onEmailLinkSent, onEmailLinkError: onEmailLinkError, emailLinkActionURL: emailLinkActionURL, emailLinkHandleCodeInApp: emailLinkHandleCodeInApp, useCustomEmailSender: useCustomEmailSender, customEmailFunctionName: customEmailFunctionName, children: jsx(AuthGate, { enableGoogle: enableGoogle, enableEmailLink: enableEmailLink, heading: heading, tagline: tagline, badgeText: badgeText, emailLinkSuccessMessage: emailLinkSuccessMessage, emailLinkSuccessInstructions: emailLinkSuccessInstructions, children: children }) }));
};

export { Auth, AuthProvider, AuthUI, useAuth };
//# sourceMappingURL=index.esm.js.map
