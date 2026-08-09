import api from './api';

export const transactionService = {
  getMyHistory: () => api.get('/transactions/my-history'),
  getAll: (params) => api.get('/transactions', { params }),
  getReceipt: (transactionId) => api.get(`/transactions/${transactionId}/receipt`),
};