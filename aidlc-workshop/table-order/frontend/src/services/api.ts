import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  // Use table token for customer paths, admin token for admin paths
  const path = window.location.pathname;
  let token: string | null = null;

  if (path.startsWith('/customer')) {
    token = localStorage.getItem('table_token');
  } else if (path.startsWith('/admin')) {
    token = localStorage.getItem('admin_token');
  } else {
    // Fallback: try both
    token = localStorage.getItem('table_token') || localStorage.getItem('admin_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('table_token');
      // Redirect based on current path
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/customer/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
