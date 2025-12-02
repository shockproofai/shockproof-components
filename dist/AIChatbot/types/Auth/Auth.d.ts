import React from "react";
import { AuthConfig } from "./types";
interface AuthProps extends AuthConfig {
    children: React.ReactNode;
}
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
export declare const Auth: React.FC<AuthProps>;
export {};
