import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
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
export default api

