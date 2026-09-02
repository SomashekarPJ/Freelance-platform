import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

let rootEl = document.getElementById('root');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'root';
  document.body.appendChild(rootEl);
}

const root = createRoot(rootEl);
root.render(<App />);

