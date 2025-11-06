import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerServiceWorker } from './serviceWorkerRegistration';

import './styles/theme.css';

// Register service worker for PWA support
registerServiceWorker();

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_G_AUTH_CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);