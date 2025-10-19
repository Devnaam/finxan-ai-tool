import api from './api';

export const getInventory = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/inventory?${queryString}`);
};

export const getInventoryStats = async () => {
  return api.get('/inventory/stats');
};

export const getLowStockItems = async () => {
  return api.get('/inventory/low-stock');
};

export const updateInventoryItem = async (itemId, data) => {
  return api.put(`/inventory/${itemId}`, data);
};

export const deleteInventoryItem = async (itemId) => {
  return api.delete(`/inventory/${itemId}`);
};
