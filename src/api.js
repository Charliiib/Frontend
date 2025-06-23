import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Solo añade token si existe (para mantener funcionalidad opcional de login)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;