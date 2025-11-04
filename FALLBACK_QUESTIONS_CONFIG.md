# Configurable Fallback Questions

The AIChatbot component now supports configurable fallback questions, making it easy to customize the default questions shown when no dynamic questions are available.

## Default Configuration

The component ships with 25 default fallback questions covering commercial lending topics:
- **8 initial questions** (priority 1) - shown in 4x2 grid
- **17 additional questions** (priorities 2-5) - shown when "Show more" is clicked

## Basic Usage (Default Fallback Questions)

```tsx
import { AIChatbot } from '@shockproofai/shockproof-components';

<AIChatbot
  provider={yourProvider}
  config={{
    enableQuestions: true,
    maxInitialQuestions: 8, // Show 8 questions initially
    // Uses built-in 25 fallback questions automatically
  }}
/>
```

## Custom Fallback Questions

```tsx
import { AIChatbot, FALLBACK_QUESTIONS } from '@shockproofai/shockproof-components';

// Option 1: Use built-in questions as a starting point
const customFallbackQuestions = [
  ...FALLBACK_QUESTIONS.slice(0, 10), // Keep first 10 default questions
  {
    id: "custom-1",
    question: "How do cryptocurrency loans work?",
    topicDescription: "Digital asset lending",
    contextHints: ["crypto collateral", "volatility", "regulatory"],
    priority: 1,
  },
  {
    id: "custom-2", 
    question: "What is peer-to-peer lending?",
    topicDescription: "Alternative financing",
    contextHints: ["P2P platforms", "marketplace lending", "risk assessment"],
    priority: 1,
  }
];

// Option 2: Completely custom questions
const myIndustryQuestions = [
  {
    id: "1",
    question: "How to evaluate SaaS companies?",
    topicDescription: "SaaS lending",
    contextHints: ["recurring revenue", "churn rate", "LTV/CAC"],
    priority: 1,
  },
  {
    id: "2",
    question: "What are ARR-based credit facilities?",
    topicDescription: "Revenue-based lending", 
    contextHints: ["annual recurring revenue", "growth capital", "covenants"],
    priority: 1,
  },
  // ... more questions
];

<AIChatbot
  provider={yourProvider}
  config={{
    enableQuestions: true,
    maxInitialQuestions: 6,
    fallbackQuestions: customFallbackQuestions, // or myIndustryQuestions
  }}
/>
```

## Question Format

Each fallback question must follow this interface:

```typescript
interface ChatQuestion {
  id: string;                    // Unique identifier
  question: string;              // The question text (keep under 120 chars for best UX)
  topicDescription?: string;     // Brief description shown as badge
  contextHints?: string[];       // Keywords for AI context
  priority: number;              // 1-5, lower numbers shown first
}
```

## Best Practices

### Question Design
- **Keep questions concise** (3-8 words ideal for buttons)
- **Use action-oriented language** ("How to...", "What is...", "Explain...")
- **Provide context hints** to help AI generate better responses

### Priority Levels
- **Priority 1**: Most important/common questions (shown initially)
- **Priority 2-3**: Secondary questions (shown in "more" section)
- **Priority 4-5**: Specialized/advanced questions

### Grid Layout
- Questions display in responsive grid (1 column mobile, 2 columns desktop)
- **Optimal initial count**: 4, 6, or 8 questions for clean grid layout
- **"Show more" threshold**: Total questions > maxInitialQuestions

## Migration from v1.2.x

No breaking changes! If you're using v1.2.x, upgrading to v1.3.0+ adds the configuration options without affecting existing behavior.

```typescript
// v1.2.x - continues to work exactly the same
<AIChatbot provider={provider} config={{ enableQuestions: true }} />

// v1.3.x - now with optional customization
<AIChatbot 
  provider={provider} 
  config={{ 
    enableQuestions: true,
    fallbackQuestions: myCustomQuestions // optional
  }} 
/>
```