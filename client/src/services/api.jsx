import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  updateTheme: (data) => api.put('/auth/theme', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
};

export const filesAPI = {
  upload: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  getAll: () => api.get('/files'),
  getFavorites: () => api.get('/files/favorites'),
  getTrash: () => api.get('/files/trash'),
  search: (query) => api.get(`/files/search?query=${query}`),
  filter: (type, sort) => api.get(`/files/filter`, { params: { type, sort } }),
  rename: (id, name) => api.put(`/files/${id}/rename`, { name }),
  toggleFavorite: (id) => api.put(`/files/${id}/favorite`),
  delete: (id) => api.delete(`/files/${id}`),
  permanentDelete: (id) => api.delete(`/files/${id}/permanent`),
  restore: (id) => api.put(`/files/${id}/restore`),
  download: (id) =>
    api.get(`/files/${id}/download`, { responseType: 'blob' }),
  getVersions: (id) => api.get(`/files/${id}/versions`),
  share: (id, data) => api.post(`/files/${id}/share`, data),
  getShares: (id) => api.get(`/files/${id}/shares`),
  revokeShare: (shareId) => api.delete(`/files/shares/${shareId}`),
};

export default api;