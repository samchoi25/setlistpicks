// Reactive online/offline state, combining two signals:
//  - the browser's own `online`/`offline` events (fast, but `online` doesn't
//    guarantee real internet — e.g. a captive portal or dead wifi still
//    reports `navigator.onLine === true`)
//  - actual fetch outcomes, reported by api.js's req() — a network-level
//    failure downgrades us to offline immediately, and any success upgrades
//    us back, catching cases the browser's own signal misses.
import { useState, useEffect } from 'react';

let online = navigator.onLine;
const listeners = new Set();

function setOnline(v) {
  if (v === online) return;
  online = v;
  listeners.forEach((fn) => fn(online));
}

window.addEventListener('online', () => setOnline(true));
window.addEventListener('offline', () => setOnline(false));

// Synchronous read for imperative code (api.js, App.jsx) that can't use a hook.
export function isOnline() {
  return online;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Called from api.js's req() on a network-level fetch failure.
export function reportNetworkFailure() {
  setOnline(false);
}

// Called from api.js's req() on any successful fetch.
export function reportNetworkSuccess() {
  setOnline(true);
}

// Reactive read for components.
export function useOnline() {
  const [state, setState] = useState(isOnline);
  useEffect(() => subscribe(setState), []);
  return state;
}
