# Shockproof Components Playground

Local development environment for testing components from `../src` with hot module replacement.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   Edit `src/firebase.ts` and add your Firebase project configuration from the [Firebase Console](https://console.firebase.google.com/).

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

   The playground will open at `http://localhost:3000`

## Testing Components

### Auth Component

The Auth section includes:
- **Checkboxes** to toggle authentication methods (Google OAuth, Email Link, Anonymous)
- **Real-time configuration** - changes take effect immediately when you toggle options
- **Sign Out button** - tests the auth state cleanup

**Testing scenarios:**
1. **Google Auth**: Enable only Google, click the Google sign-in button
2. **Email Link Auth**: Enable only Email Link, enter an email to receive a magic link
3. **Anonymous Auth**: Enable Auto Sign In Anonymously to test silent authentication
4. **Combined methods**: Enable both Google and Email Link to test the "Or" separator UI

**Note**: Email link authentication requires:
- Proper Firebase configuration with authorized domains
- Email link will redirect back to `http://localhost:3000` (or your current URL)
- Check your email for the sign-in link

### Chatbot Component

Click "Show Chatbot" after authenticating to test the chat interface.

**Requirements:**
The Chatbot component needs a complete Firebase backend setup:
- Firestore collection: `config/app` with chatbot configuration
- Firestore collection: `sources` with question documents
- Firebase callable function for message handling
- RAG (Retrieval-Augmented Generation) datastore with embeddings

**For full Chatbot testing**, set up the backend following the main README:
- Run `scripts/gemini_rag_1536.py` to populate embeddings
- Run `scripts/shockproof-cli.ts generate-sample-questions` to create suggested questions
- Deploy Firebase functions for the chat callable

**Without backend**: The component will render but won't function properly. This is still useful for testing:
- UI rendering and layout
- Component mounting/unmounting
- Props validation
- TypeScript types

## Development Workflow

### Direct Source Imports

The playground imports components directly from `../src` via the alias:
```typescript
import { Auth, Chatbot } from '@shockproofai/shockproof-components';
```

This is configured in `vite.config.ts` to resolve to the source directory, enabling:
- **Instant updates** - changes in `../src` appear immediately with HMR
- **No rebuild needed** - skip the `npm run build` step during development
- **TypeScript validation** - full type checking across the codebase

### Making Changes

1. Edit components in `../src/Auth/` or `../src/Chatbot/`
2. Save the file
3. Vite HMR updates the playground automatically
4. Test the changes in the browser

### Before Releasing

After validating changes in the playground:

1. **Build the library:**
   ```bash
   cd ..
   npm run build
   ```

2. **Verify TypeScript types:**
   ```bash
   npm run typecheck
   ```

3. **Create a release:**
   ```bash
   ./release.sh
   ```

## Architecture Notes

- **Private package**: `"private": true` prevents accidental npm publishing
- **Not in builds**: Playground is excluded from library builds via Rollup config
- **Git ignored**: `node_modules/`, `dist/`, and `.vite/` are in `.gitignore`
- **Playground files tracked**: Source files (`.tsx`, `.ts`, `.json`, `.html`) are committed for team use

## Troubleshooting

### Firebase Auth Errors

If you see "Firebase: Error (auth/unauthorized-domain)":
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add `localhost` to the list

### Chatbot Not Working

Expected behavior without backend setup - the component renders but won't send/receive messages. Set up the full Firebase backend to test end-to-end functionality.

### Import Errors

If you see "Cannot find module '@shockproofai/shockproof-components'":
- Check `vite.config.ts` has the correct alias path
- Restart the dev server (`npm run dev`)
- Clear Vite cache: `rm -rf node_modules/.vite`
