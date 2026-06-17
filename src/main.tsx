// `gray-matter` references Node's Buffer; this polyfill lands BEFORE any module that imports it.
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') globalThis.Buffer = Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { applyTheme } from './domain/appearance';
import './index.css';

// Apply saved theme BEFORE first render to avoid a flash.
applyTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

// Strip trailing slash so basepath like '/sovereign/' becomes '/sovereign'.
const BASEPATH = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
const router = createRouter({ routeTree, context: { queryClient }, basepath: BASEPATH });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);

// Register service worker in production only (skip during `vite dev` to avoid stale caches).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(console.error);
  });
}
