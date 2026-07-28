import axios from 'axios';

// Create base Axios instance configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT Authorization token from localStorage if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for handling common error statuses (e.g. 401 Unauthorized)
API.interceptors.response.use(
  (response) => response.data, // return response data directly
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Auto logout if session expires / token is invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event so the UI can redirect or update state accordingly
      window.dispatchEvent(new Event('auth-expired'));
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors || null,
      originalError: error,
    });
  }
);

export default API;
