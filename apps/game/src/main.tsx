import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import { App } from './App';
import { RotateHint } from './ui/ui';
import { installSound } from './sound';

installSound();

// Installable web version (lot L8.2): the service worker keeps the game on the device for offline play. Not in the
// Tauri app (its files are already on the device) nor while developing.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !('__TAURI_INTERNALS__' in window) && window.isSecureContext) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('./sw.js'); });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <RotateHint />
  </StrictMode>,
);
