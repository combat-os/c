// frontend/src/utils/api.js
// API client for communicating with backend

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (nrp) => apiClient.post('/auth/login', { nrp }),
  verify: () => apiClient.get('/auth/verify'),
};

// Personnel API
export const personnelAPI = {
  list: () => apiClient.get('/personnel'),
  get: (id) => apiClient.get(`/personnel/${id}`),
  create: (data) => apiClient.post('/personnel', data),
  update: (id, data) => apiClient.put(`/personnel/${id}`, data),
  delete: (id) => apiClient.delete(`/personnel/${id}`),
};

// QR Scan API
export const qrScanAPI = {
  getPOS: () => apiClient.get('/qr-scan/pos'),
  scan: (data) => apiClient.post('/qr-scan/scan', data),
};

// Exit Form API
export const exitFormAPI = {
  getLogs: () => apiClient.get('/exit-form/logs'),
  submit: (data) => apiClient.post('/exit-form/submit', data),
};

// Photo Upload API
export const photoUploadAPI = {
  attach: (data) => apiClient.post('/photo-upload/attach', data),
  get: (logId) => apiClient.get(`/photo-upload/${logId}`),
};

// Logs API
export const logsAPI = {
  list: (admin = false) => apiClient.get('/logs', { params: { admin } }),
  get: (id) => apiClient.get(`/logs/${id}`),
};

export default apiClient;
