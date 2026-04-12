import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Habits ───────────────────────────────────────────
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  getStats: (id) => api.get(`/habits/${id}/stats`),
};

// ── Logs ─────────────────────────────────────────────
export const logsAPI = {
  createOrUpdate: (data) => api.post('/logs', data),
  getByDate: (date) => api.get('/logs', { params: { date } }),
  getRange: (start, end) => api.get('/logs/range', { params: { start, end } }),
  delete: (id) => api.delete(`/logs/${id}`),
};

// ── Analytics ────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  exportCSV: () => api.get('/analytics/export', { responseType: 'blob' }),
};

// ── Goals ────────────────────────────────────────────
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// ── Users ────────────────────────────────────────────
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  changePassword: (data) => api.put('/users/password', data),
};

// 🧠 ── AI INSIGHTS ───────────────────────────────────
export const aiAPI = {
  getInsights: (data) => api.post('/ai/insights', data),
};

export default api;