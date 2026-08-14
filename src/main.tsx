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
