import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateMe: (data) => API.put('/auth/me', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ─── Tasks ─────────────────────────────────────
export const taskAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getOne: (id) => API.get(`/tasks/${id}`),
  getStats: () => API.get('/tasks/stats'),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  export: () => API.get('/tasks/export', { responseType: 'blob' }),
  uploadAttachment: (id, formData) => API.post(`/tasks/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (taskId, attachmentId) => API.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
  getComments: (taskId) => API.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, text) => API.post(`/tasks/${taskId}/comments`, { text }),
};

export const commentAPI = {
  edit: (id, text) => API.put(`/comments/${id}`, { text }),
  delete: (id) => API.delete(`/comments/${id}`),
};

// ─── Users ─────────────────────────────────────
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getOne: (id) => API.get(`/users/${id}`),
  getUserTasks: (id) => API.get(`/users/${id}/tasks`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

// ─── Notifications ─────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};
 
// ─── Activity ─────────────────────────────────────
export const activityAPI = {
  getAll: (params) => API.get('/activity', { params }),
};

export default API;