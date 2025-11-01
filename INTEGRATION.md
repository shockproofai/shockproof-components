# Integration Guide: @shockproofai/shockproof-components

## For ShockProof AI Apps

This guide shows how to integrate the reusable components library into your existing applications.

## Installation in Your Apps

Add to your `package.json`:

```json
{
  "dependencies": {
    "@shockproofai/shockproof-components": "git+https://github.com/shockproofai/shockproof-components.git#v1.0.0",
    "firebase": "^10.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

Then run:
```bash
npm install
```

## Integration Steps

### 1. Import Components

```tsx
// Full library import
import { AIChatbot, createFirebaseProvider } from '@shockproofai/shockproof-components';
import '@shockproofai/shockproof-components/styles';

// Or component-specific import
import { AIChatbot } from '@shockproofai/shockproof-components/AIChatbot';
```

### 2. Use Your Existing ChatService

Since all apps use the same Firebase project, use your existing ChatService:

```tsx
// Use your existing ChatService - no changes needed
import { chatService } from './services/ChatService';

const provider = createFirebaseProvider({
  chatService: chatService,           // Your existing ChatService
  agentOptions: ['askRex', 'askRexTest'],
  authRequired: true
});
```

### 3. Add to Your App

```tsx
function YourApp() {
  const { user } = useFirebaseAuth(); // Your existing auth

  const provider = React.useMemo(() => {
    return createFirebaseProvider({
      chatService: chatService,
      agentOptions: ['askRex', 'askRexTest'],
      authRequired: true
    });
  }, []);

  const config = {
    title: "Your App Assistant",
    subtitle: "Customized for your app context",
    enableStreaming: true,
    streamingThreshold: 300,
    enableSources: true,
    enableQuestions: true,
    showTimingInfo: true,
    showAgentSwitcher: true,
    theme: 'auto' as const,
    placeholder: 'Ask about your specific domain...',
    welcomeMessage: 'Welcome! How can I help with [your domain]?'
  };

  if (!user) {
    return <div>Please sign in...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <AIChatbot provider={provider} config={config} />
    </div>
  );
}
```

### 4. No Firebase Changes Required

✅ **Your existing Firebase setup works as-is:**
- Same Firebase project
- Same authentication
- Same ChatService
- Same Firestore collections
- Same Cloud Functions

### 5. Customization per App

Each app can customize components:

```tsx
// App 1: Credit Analysis
const config = {
  title: "Credit Analyzer",
  subtitle: "Ask questions about credit analysis and risk assessment",
  welcomeMessage: "I can help analyze credit applications and risk factors.",
  placeholder: "Ask about credit scores, debt ratios, or risk assessment..."
};

// App 2: Lending Operations  
const config = {
  title: "Lending Assistant",
  subtitle: "Ask questions about lending operations and compliance",
  welcomeMessage: "I can help with lending processes and regulations.",
  placeholder: "Ask about loan processes, compliance, or regulations..."
};

// App 3: Portfolio Management
const config = {
  title: "Portfolio Manager",
  subtitle: "Ask questions about portfolio optimization and monitoring",
  welcomeMessage: "I can help optimize and monitor your loan portfolio.",
  placeholder: "Ask about portfolio performance, diversification, or monitoring..."
};
```

## Update Workflow

### To update the component library across apps:

1. **Update component version**:
   ```bash
   # In component repo, create new tag
   git tag v1.1.0
   git push origin v1.1.0
   ```

2. **Update in each app**:
   ```json
   {
     "dependencies": {
       "@shockproofai/shockproof-components": "git+https://github.com/shockproofai/shockproof-components.git#v1.1.0"
     }
   }
   ```

3. **Install updates**:
   ```bash
   npm install
   ```

## Component Library Expansion

As new components are added to the library:

```tsx
// Future imports will be available
import { 
  AIChatbot,
  DataTable,
  FormBuilder,
  ChartComponent 
} from '@shockproofai/shockproof-components';
```

## Monorepo Migration Ready

When you consolidate to monorepo, the transition is seamless:

```json
// Future monorepo structure
{
  "dependencies": {
    "@shockproofai/shockproof-components": "workspace:*"
  }
}
```

## Benefits

✅ **Consistent UI** across all apps  
✅ **Shared component library** for all future components  
✅ **Single dependency** to manage  
✅ **Shared bug fixes** and improvements  
✅ **Easy customization** per app context  
✅ **Firebase integration** remains unchanged  
✅ **Scalable architecture** for future components  

## Support

For issues or feature requests, create issues in the component repository:
https://github.com/shockproofai/shockproof-components/issues