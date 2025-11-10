import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Auth, useAuth } from '@shockproofai/shockproof-components';
import { app } from '../firebase';
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

  return (
    <div className="auth-test-page">
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
      >
        <AuthenticatedContent />
      </Auth>
    </div>
  );
}
