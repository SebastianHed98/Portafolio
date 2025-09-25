import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './i18n.js';

// Silence noisy console logs across the app (keep warnings and errors)
// Toggle this to false if you want to see logs again during debugging
const SILENCE_LOGS = true;
if (SILENCE_LOGS) {
  // Preserve original methods if you want to restore later
  // eslint-disable-next-line no-console
  console.log = () => {};
  // eslint-disable-next-line no-console
  console.info = () => {};
  // eslint-disable-next-line no-console
  console.debug = () => {};
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
