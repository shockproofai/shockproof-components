import { CSSProperties } from 'react';
export interface BaseComponentProps {
    className?: string;
    style?: CSSProperties;
    'data-testid'?: string;
}
export interface ThemeConfig {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
}
export interface BreakpointConfig {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
}
export interface ApiResponse<T = any> {
    data: T;
    status: 'success' | 'error';
    message?: string;
    timestamp: Date;
}
export interface CumulativeTokenUsage {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    responseCount: number;
}
