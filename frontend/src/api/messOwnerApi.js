import apiClient from './client';

export const messOwnerApi = {
  createProfile: async (profileData) => {
    const response = await apiClient.post('/mess-owner/profile', profileData);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/mess-owner/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/mess-owner/profile', profileData);
    return response.data;
  },

  toggleOpen: async () => {
    const response = await apiClient.patch('/mess-owner/profile/open');
    return response.data;
  },

  confirmAvailability: async () => {
    const response = await apiClient.post('/mess-owner/confirm-availability');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/mess-owner/stats');
    return response.data;
  },

  getMenuItems: async () => {
    const response = await apiClient.get('/mess-owner/menu');
    return response.data;
  },

  addMenuItem: async (itemData) => {
    const response = await apiClient.post('/mess-owner/menu', itemData);
    return response.data;
  },

  updateMenuItem: async (id, itemData) => {
    const response = await apiClient.put(`/mess-owner/menu/${id}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await apiClient.delete(`/mess-owner/menu/${id}`);
    return response.data;
  }
};

export default messOwnerApi;

