import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import App from './App';
// ensure base URL convenience constant


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA installability if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
    } catch (err) {
      console.warn('Service worker registration failed', err);
    }
  });
}

