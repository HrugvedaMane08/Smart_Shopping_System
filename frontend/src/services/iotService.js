import api from './api';

export const iotService = {
  scanRfid: (data) => api.post('/iot/rfid', data),
  productReturn: (data) => api.post('/iot/product-return', data),
};