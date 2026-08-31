import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('app')).render(<App />);

// Lets the app boot with no connection at all (new tab, hard refresh) on any
// device that's loaded it online at least once — see scripts/build-sw.js for
// what it precaches. `reg.update()` nudges an immediate check for a newer
// build on top of the browser's own background polling.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => reg.update()).catch(() => {});
  });
}
