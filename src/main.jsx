import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);

// Offline support for the phone/PWA version (not needed inside the desktop app).
if ('serviceWorker' in navigator && !window.__TAURI__ && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js');
}
