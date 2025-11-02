// Shared TypeScript types for all ShockProof Components
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

// Common response types
export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: Date;
}

// Cumulative token usage for entire chat session
export interface CumulativeTokenUsage {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  responseCount: number; // Number of AI responses in this session
}

// Future component types will be added here
// export interface DataTableConfig { ... }
// export interface FormBuilderConfig { ... }
// export interface ChartConfig { ... }