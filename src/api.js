import axios from 'axios';

// URL base dinámica para producción/desarrollo
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.isCancel = axios.isCancel;

// Solo añade token si existe (para mantener funcionalidad opcional de login)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en petición:', error.response?.status, error.config?.url);
    console.error('Detalles del error:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;