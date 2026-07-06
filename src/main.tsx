import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <Toaster theme="dark" position="top-right" closeButton richColors />
      <App />
    </LanguageProvider>
  </StrictMode>,
);
