import { initializeApp } from 'firebase/app';

// Using the same Firebase web app config as ai-launchpad
// This app has Google Sign-In properly configured
const firebaseConfig = {
  apiKey: "AIzaSyBazZcs4jc3zuHi1cxZ9vgLP0lz9qYx1q4",
  authDomain: "shockproof-dev.firebaseapp.com",
  projectId: "shockproof-dev",
  storageBucket: "shockproof-dev.firebasestorage.app",
  messagingSenderId: "974303339799",
  appId: "1:974303339799:web:5a170967a59e7142384352"
};

// Initialize and export ONLY the app
// Components will get their own service instances using getAuth(app), etc.
export const app = initializeApp(firebaseConfig);

// Debug logging
console.log('🔥 Firebase app initialized:', {
  name: app.name,
  options: app.options,
  apiKey: app.options.apiKey,
});
