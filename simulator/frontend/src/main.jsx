import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// In production VITE_API_URL = Render backend URL (e.g. https://mindtrace-api.onrender.com)
// In dev it is empty so the Vite proxy handles /api/* → localhost:3001
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
