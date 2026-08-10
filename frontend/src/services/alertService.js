import api from './api';

export const alertService = {
  getAll: (resolved) => api.get('/alerts', { params: { resolved } }),
  markRead: (id) => api.patch(`/alerts/${id}/read`),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
};