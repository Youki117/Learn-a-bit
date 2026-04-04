import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { PlayerMetaProvider } from './context/PlayerMetaContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PlayerMetaProvider>
        <App />
      </PlayerMetaProvider>
    </AuthProvider>
  </StrictMode>,
);
