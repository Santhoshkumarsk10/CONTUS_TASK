import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Inject Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture Session Expirations and Global Format Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), automatically clear token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Dispatch an event so the AuthContext can listen to it and update the reactive state
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
