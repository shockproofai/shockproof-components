import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Import components directly from source (no need to rebuild)
      '@shockproofai/shockproof-components': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, './src'),
      // Force all firebase imports to use playground's node_modules
      // This prevents dual Firebase instances when importing components from ../src
      'firebase/app': path.resolve(__dirname, './node_modules/firebase/app'),
      'firebase/auth': path.resolve(__dirname, './node_modules/firebase/auth'),
      'firebase/firestore': path.resolve(__dirname, './node_modules/firebase/firestore'),
      'firebase/functions': path.resolve(__dirname, './node_modules/firebase/functions'),
      'firebase/storage': path.resolve(__dirname, './node_modules/firebase/storage'),
    },
  },
  server: {
    port: 3000,
  },
});
