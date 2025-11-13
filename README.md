# @shockproofai/shockproof-components

A comprehensive React components library for ShockProof AI applications. This repository contains reusable UI components with tight Firebase integration, an AI Chatbot, and an Auth component that can be used across ShockProof AI apps.

## Contents

- `Auth` — App-level authentication wrapper and hooks
- `Chatbot` — Simple opinionated chatbot wrapper backed by Firebase
- `AIChatbot` — Advanced, lower level chatbot for custom providers
- `dist/` — Build artifacts (committed so apps can depend on Git tags)
- `.githooks/` — Native git hooks (pre-commit builds `dist/`)
- `release.sh` — Simple release helper (version bump, build, tag, push)

---

## Installation

Install from GitHub (recommended for internal apps):

```bash
npm install github:shockproofai/shockproof-components#v2.1.2
```

Install peer deps:

```bash
npm install firebase react react-dom
```

### Required Tailwind Configuration

The Chatbot component uses markdown rendering with rich typography. You **must** install and configure the Tailwind Typography plugin in your consuming application:

```bash
npm install -D @tailwindcss/typography
```

Then add it to your `tailwind.config.js`:

```javascript
module.exports = {
  // ... your config
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

Without this plugin, markdown content (bold, lists, code blocks, tables, etc.) will not render correctly.

---

## Auth component

Use the `Auth` wrapper to centralize authentication for your app. It supports silent anonymous sign-in (useful when Firestore rules require `request.auth != null`), Google OAuth, and an email-link (passwordless) flow with an optional custom email sender.

Basic usage:

```tsx
import { Auth } from '@shockproofai/shockproof-components';
import { app } from './lib/firebase';

function App() {
  return (
    <Auth firebaseApp={app} autoSignInAnonymously={true}>
      <YourAppContent />
    </Auth>
  );
}
```

AuthConfig (options):

- `firebaseApp: FirebaseApp` (required) — your initialized Firebase app
- `autoSignInAnonymously?: boolean` — if true, calls `signInAnonymously()` on mount when no user exists (default: false)
- `enableGoogle?: boolean` — show Google sign-in button (default: true)
- `enableEmailLink?: boolean` — enable email-link sign-in UI (default: false)
- `onSendEmailLink?: (email: string) => Promise<void>` — optional override to send the magic link (if omitted the component will call Firebase's built-in `sendSignInLinkToEmail`)

Hook and API:

- `useAuth()` — returns `{ user, loading, isAuthenticated, signInWithGoogle(), signOut(), signInAnonymously() }`

When you wrap your app with `Auth`, the children will be hidden until the auth state stabilizes (loading state shown). This centralizes auth and makes it trivial to change auth requirements later (for example require Google-only or show an explicit sign-in page).

---

## Chatbot component

`Chatbot` is the opinionated, easy-to-drop-in chatbot for apps that use the shared Firebase backend. It uses a provider internally that reads configuration and suggested questions from Firestore.

Example:

```tsx
import { Chatbot } from '@shockproofai/shockproof-components';
import { app } from './lib/firebase';

<Chatbot
  firebaseApp={app}
  agentName="askRex"
  availableAgents={["askRex", "askRexTest"]}
  streamingThreshold={300}
  enableDynamicQuestions={true}
  showTimingInfo={true}
  placeholder="Ask me anything..."
  maxInitialQuestions={8}
  showNewChatButton={true}
  showHeader={true}
/>
```

### ChatbotConfig Properties

#### Required Properties

- **`firebaseApp: FirebaseApp`** (required)  
  Your initialized Firebase app instance.

#### Firebase Configuration

- **`useEmulators?: boolean`**  
  Whether to use Firebase emulators for local development (default: `false`).

- **`projectId?: string`**  
  Firebase project ID. If not provided, inferred from `firebaseApp.options.projectId`.

#### Agent Configuration

- **`agentName?: string`**  
  Default agent to use for chat responses (default: `'askRex'`).  
  This should match a document ID in your Firestore `agents` collection.

- **`availableAgents?: string[]`**  
  List of available agent names that users can switch between (default: `['askRex']`).  
  Each agent should exist in the Firestore `agents` collection.

#### Search & Retrieval

- **`maxResults?: number`**  
  Maximum number of context documents to retrieve from the vector store (default: `5`).  
  Higher values provide more context but may increase response time.

#### Streaming Configuration

- **`streamingThreshold?: number`**  
  Minimum number of characters before streaming begins (default: `300`).  
  - Set to `0` to always stream responses immediately
  - Set to a high value (e.g., `10000`) to effectively disable streaming
  - Responses shorter than this threshold appear all at once

#### UI Features

- **`enableDynamicQuestions?: boolean`**  
  Enable the dynamic questions feature that fetches suggested questions from Firestore (default: `true`).

- **`maxInitialQuestions?: number`**  
  Maximum number of questions to show initially (default: `8`).  
  Additional questions can be revealed with a "Show More" button.

- **`showTimingInfo?: boolean`**  
  Show timing information and token usage metrics for debugging (default: `false`).  
  Useful during development to understand performance characteristics.

- **`showNewChatButton?: boolean`**  
  Whether to show the "New Chat" button in the header (default: `true`).  
  Set to `false` when managing chat sessions externally (e.g., with a sidebar).

- **`showHeader?: boolean`**  
  Whether to show the title header bar with branding and controls (default: `true`).  
  Set to `false` to hide the header and maximize the chat area (useful when embedding in custom layouts).

#### Text Customization

- **`title?: string`**  
  Custom title for the chatbot header (default: `"Ask Rex"`).

- **`subtitle?: string`**  
  Optional subtitle text displayed below the title in the header.

- **`placeholder?: string`**  
  Custom placeholder text for the input field (default: `"Ask me anything about the course..."`).

#### Context & Topics

- **`topicContext?: object`**  
  Initial topic context for the conversation (optional).  
  ```tsx
  topicContext={{
    originalTopic: "React Hooks",
    topicDescription: "Understanding useState and useEffect",
    contextHints: ["functional components", "side effects"]
  }}
  ```

#### Chat History (v2.3+)

- **`userId?: string`**  
  User identifier for saving chat history (optional).  
  Required if `saveSessionHistory` is `true`.

- **`saveSessionHistory?: boolean`**  
  Whether to save chat sessions to Firestore (default: `false`).  
  When enabled, sessions are saved to `users/{userId}/chatSessions/{sessionId}`.

- **`loadSessionId?: string`**  
  Session ID to load an existing chat session (optional).  
  Use this to restore a previous conversation.

- **`initialMessages?: ChatMessage[]`**  
  Initial messages to display when loading a session (optional).  
  ```tsx
  initialMessages={[
    { id: '1', content: 'Hello!', role: 'user', timestamp: new Date() },
    { id: '2', content: 'Hi there!', role: 'assistant', timestamp: new Date() }
  ]}
  ```

#### Callbacks

- **`onMessageSent?: (message: string) => void`**  
  Callback fired when a user sends a message.

- **`onResponseReceived?: (response: string) => void`**  
  Callback fired when an assistant response is received.

#### Styling

- **`className?: string`**  
  Custom CSS class name for the root chatbot container.

- **`style?: React.CSSProperties`**  
  Custom inline styles for the chatbot container.

### Remote Configuration

The chatbot also respects configuration flags stored in Firestore under the `config/app` document:

- **`showAgentSelector: boolean`** — Controls whether the agent selector dropdown is visible
- **`showStreamingSelector: boolean`** — Controls whether the streaming threshold selector is visible

These are read on component mount, allowing you to centrally manage UI features without code changes.

---

## Where suggested questions come from (sources & RAG)

Suggested questions and contextual data are pulled from a Firestore collection named `sources` (or a project-specific equivalent). Each document typically contains an array of question objects with the following shape:

```json
{
  "id": "doc-id",
  "questions": [
    { "id": "q1", "question": "What is X?", "priority": 10, "topicDescription": "..." }
  ]
}
```

The chatbot UI reads these questions, shuffles and limits them (default max: 25) and exposes the top `maxInitialQuestions` in the UI with a "Show more" control.

### RAG (Retrieval-Augmented Generation) datastore

The chatbot relies on a RAG datastore that provides semantic search over your documents. The typical workflow is:

1. Upload source documents (PDFs, JSON, text files) to Cloud Storage
2. Run the ingestion script to chunk, embed, and store vectors in Firestore (other file types like docx are currently NOT supported)
3. The chatbot queries the vector store to retrieve relevant context

#### Available Scripts

**`scripts/gemini_rag_1536.py`** — Main RAG population script

Processes documents from Cloud Storage, chunks them using LangChain's RecursiveCharacterTextSplitter, generates embeddings with Vertex AI's `gemini-embedding-001` model, and stores them in Firestore with vector search support.

```bash
# For cloud Firestore
python3 scripts/gemini_rag_1536.py gs://your-bucket-name/path

# For local emulator
python3 scripts/gemini_rag_1536.py gs://your-bucket-name/path --firestore-mode emulator
```

The script will:
- Read PDFs from the specified Cloud Storage path
- Split text into semantic chunks with configurable size
- Generate 1536-dimensional embeddings
- Store chunks and vectors in Firestore `embeddings` collection - vector dimensions are 1536
- Store the entire source text of each file in the Firestore sources collection. These files also store related initial questions
which are generated by the shockproof-cli script (see below)

**`scripts/shockproof-cli.ts`** — Question generation utility

Generates sample questions from existing Firestore documents to populate suggested questions.

```bash
# Generate 5 questions for all documents
npx tsx scripts/shockproof-cli.ts generate-sample-questions 5

# Generate 10 questions for a specific document
npx tsx scripts/shockproof-cli.ts generate-sample-questions 10 "document-name.pdf"
```

The CLI uses Genkit with `gemini-2.5-flash-lite` to generate conceptual questions based on document content and updates the `sources` collection with a `questions` array.

---

## Development

```bash
git clone https://github.com/shockproofai/shockproof-components.git
cd shockproof-components
npm install
```

Build once:

```bash
npm run build
```

Watch mode:

```bash
npm run build:watch
npm run dev
```

### Pre-commit hook

This repository uses native git hooks configured in `.githooks/pre-commit`. The hook runs `npm run build` and stages the `dist/` folder so `dist/` is always committed alongside source changes.

The hook is configured via `git config core.hooksPath .githooks` during `postinstall`.

**Note:** The pre-commit hook skips building if only `playground/` files are changed, allowing fast iteration during development testing.

---

## Development Testing

The `playground/` directory contains a test application for developing and testing components in isolation.

### Starting the Playground

```bash
cd playground
npm install  # First time only
npm run dev  # Starts Vite dev server on port 3000
```

The playground provides:
- **Home page** (`/`) - Navigation to test pages
- **Auth Test page** (`/auth-test`) - Test authentication flows with configuration toggles
- **Chat Test page** (`/chat-test`) - Full-screen chatbot interface for testing chat functionality

### Extending the Playground

When adding a new component to the library, follow these steps to add it to the playground:

1. **Create a test page** in `playground/src/pages/`:
   ```tsx
   // playground/src/pages/NewComponentTestPage.tsx
   import { NewComponent } from '@shockproofai/shockproof-components';
   import { app } from '../firebase';
   import './NewComponentTestPage.css';

   export function NewComponentTestPage() {
     return (
       <div className="new-component-test-page">
         <h1>New Component Test</h1>
         <NewComponent firebaseApp={app} />
       </div>
     );
   }
   ```

2. **Create styles** in `playground/src/pages/NewComponentTestPage.css`

3. **Add route** in `playground/src/App.tsx`:
   ```tsx
   import { NewComponentTestPage } from './pages/NewComponentTestPage';
   
   // Add to Routes
   <Route path="/new-component" element={<NewComponentTestPage />} />
   ```

4. **Add navigation card** to `playground/src/pages/Home.tsx`:
   ```tsx
   <Link to="/new-component" className="card">
     <h2>New Component</h2>
     <p>Test your new component here</p>
   </Link>
   ```

### Playground Configuration

- **Firebase**: Uses the same Firebase config as ai-launchpad (ai-launchpad web app credentials)
- **Tailwind CSS**: Configured to scan both `playground/src/**` and `../src/**` (component library)
- **Hot Reload**: Changes to component library source files trigger automatic rebuild
- **Isolated Dependencies**: Playground has its own `node_modules`, but imports components from `../src` via Vite alias

### Important Notes

- The playground is **not included** in the npm package (see `files` field in root `package.json`)
- Playground changes **do not trigger** the pre-commit build hook
- The playground has its own `.gitignore` to exclude `node_modules` and build artifacts
- Use the playground to test components with real Firebase backend before releasing

---

## Release process

Use the release script to automate version bumps, build, commit, tag and push:

```bash
npm run release:patch  # patch release
npm run release:minor  # minor release
npm run release:major  # major release
```

The script will:

1. Update `package.json` version
2. Build the dist
3. Commit `package.json` and `dist/`
4. Create a git tag `vX.Y.Z`
5. Push commit and tag to origin

---

## Project structure (high level)

```
shockproof-components/
├── src/
│   ├── Auth/
│   ├── Chatbot.tsx
│   ├── AIChatbot/
│   └── index.ts
├── dist/
├── .githooks/
├── release.sh
├── rollup.config.js
└── package.json
```

## Roadmap

- (v2.2) Email-link auth UI, Auth modal mode, standardized standalone builds
- (future) DataTable, FormBuilder, Charts

## Support

Report issues at: https://github.com/shockproofai/shockproof-components/issues

---

_Proprietary — ShockProof AI internal use only_
# @shockproofai/shockproof-components

A comprehensive React components library for ShockProof AI applications.

## Components

### Auth Component (v2.1+)
- Anonymous Authentication
- Google OAuth
- Email Link (Passwordless)

### Chatbot Component (v2.0+)
- Firestore integration
- Streaming responses
- Multi-agent support
- Dynamic questions

## Installation

```bash
npm install github:shockproofai/shockproof-components#v2.1.2
```

## Usage

### Auth
```tsx
import { Auth } from '@shockproofai/shockproof-components';
import { app } from './lib/firebase';

<Auth firebaseApp={app} autoSignInAnonymously={true}>
  <YourApp />
</Auth>
```

### Chatbot
```tsx
import { Chatbot } from '@shockproofai/shockproof-components';

<Chatbot
  firebaseApp={app}
  agentName="askRex"
  enableDynamicQuestions={true}
/>
```

## Development

```bash
npm run build
npm run release:patch
```

## Release Process

```bash
npm run release:patch  # Bug fixes
npm run release:minor  # New features
npm run release:major  # Breaking changes
```

Pre-commit hook automatically builds dist/
