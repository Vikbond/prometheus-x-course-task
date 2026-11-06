import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import BookstoreApp from './BookstoreApp';

// Relative assets on static hosting resolve from the page before the hash.
const Router = process.env.PUBLIC_URL === '.' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BookstoreApp />
    </Router>
  </StrictMode>
);
