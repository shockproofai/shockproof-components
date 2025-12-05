import React from "react";
interface AuthUIProps {
    enableGoogle?: boolean;
    enableEmailLink?: boolean;
    heading?: string;
    tagline?: string;
    badgeText?: string;
    /** Custom success message shown after email link is sent. Use {email} as placeholder for the email address */
    emailLinkSuccessMessage?: string;
    /** Custom instruction text shown in the email sent success screen */
    emailLinkSuccessInstructions?: string;
    /** Custom className for the outer container (removes default min-h-screen and gradient if provided) */
    containerClassName?: string;
    /** Custom className for the auth card */
    cardClassName?: string;
    /** Whether to show the Shockproof AI footer branding */
    showFooter?: boolean;
    /** Theme variant - affects default styling if no custom classes provided */
    variant?: 'light' | 'dark';
}
export declare const AuthUI: React.FC<AuthUIProps>;
export {};
