import api from './api';

export const cartService = {
  createCart: () => api.post('/carts'),
  getMyCart: () => api.get('/carts/my-cart'),
  getMyCartHistory: () => api.get('/carts/history'),
  getCartById: (cartId) => api.get(`/carts/${cartId}`),
  getActiveCarts: () => api.get('/carts/active'),
  getAllCarts: (params) => api.get('/carts/all', { params }),
  checkout: (cartId) => api.post(`/carts/${cartId}/checkout`),
};