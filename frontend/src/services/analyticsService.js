import api from './api';

export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getRevenueChart: (period) => api.get('/analytics/revenue', { params: { period } }),
  getBestSellers: (limit) => api.get('/analytics/best-sellers', { params: { limit } }),
  getCategorySales: () => api.get('/analytics/category-sales'),
  getInventoryStatus: () => api.get('/analytics/inventory-status'),
  getRecentTransactions: (limit) => api.get('/analytics/recent-transactions', { params: { limit } }),
};