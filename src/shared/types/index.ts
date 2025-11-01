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

// Future component types will be added here
// export interface DataTableConfig { ... }
// export interface FormBuilderConfig { ... }
// export interface ChartConfig { ... }