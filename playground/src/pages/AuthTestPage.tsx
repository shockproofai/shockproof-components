import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Auth, useAuth } from '@shockproofai/shockproof-components';
import { app } from '../firebase';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import './AuthTestPage.css';

function AuthenticatedContent() {
  const { user, signOut } = useAuth();

  return (
    <div className="authenticated-content">
      <h2>✅ Successfully Authenticated!</h2>
      <p>You are now signed in. The Auth component is working correctly.</p>
      <p><strong>User ID:</strong> {user?.uid}</p>
      <p><strong>Email:</strong> {user?.email || 'Anonymous'}</p>
      <button 
        onClick={signOut}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export function AuthTestPage() {
  const [enableGoogle, setEnableGoogle] = useState(true);
  const [enableEmailLink, setEnableEmailLink] = useState(false);
  const [autoSignInAnonymously, setAutoSignInAnonymously] = useState(false);
  const { toasts, removeToast, error } = useToast();

  const handleEmailLinkSent = (email: string) => {
    // The AuthUI component shows an inline success screen
    // so we don't need to show a toast for success
  };

  const handleEmailLinkError = (err: Error) => {
    // Show toast for errors since they need prominent display
    error(`Failed to send email link: ${err.message}`);
  };

  return (
    <div className="auth-test-page">
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="header">
        <Link to="/" className="back-link">← Back</Link>
        <h1>Auth Component Test</h1>
      </div>

      <div className="config-panel">
        <h3>Configuration</h3>
        <label>
          <input
            type="checkbox"
            checked={enableGoogle}
            onChange={(e) => setEnableGoogle(e.target.checked)}
          />
          Enable Google Sign-In
        </label>
        <label>
          <input
            type="checkbox"
            checked={enableEmailLink}
            onChange={(e) => setEnableEmailLink(e.target.checked)}
          />
          Enable Email Link
        </label>
        <label>
          <input
            type="checkbox"
            checked={autoSignInAnonymously}
            onChange={(e) => setAutoSignInAnonymously(e.target.checked)}
          />
          Auto Sign-In Anonymously
        </label>
      </div>

      <Auth
        firebaseApp={app}
        enableGoogle={enableGoogle}
        enableEmailLink={enableEmailLink}
        autoSignInAnonymously={autoSignInAnonymously}
        onEmailLinkSent={handleEmailLinkSent}
        onEmailLinkError={handleEmailLinkError}
        emailLinkSuccessMessage="We've sent a magic link to {email}"
        emailLinkSuccessInstructions="Click the link in the email to sign in. The link will expire in 60 minutes. If you don't see the email, please check your spam or junk folder."
      >
        <AuthenticatedContent />
      </Auth>
    </div>
  );
}
