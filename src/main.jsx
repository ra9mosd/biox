import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PublicProfile from './PublicProfile.jsx';
import './App.css';

const path = window.location.pathname;

if (path.startsWith('/u/')) {
  const username = path.split('/u/')[1];
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <PublicProfile username={username} />
    </React.StrictMode>,
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}