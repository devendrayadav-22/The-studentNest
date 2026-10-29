import apiClient from './client';

export const messApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/messes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/messes/${id}`);
    return response.data;
  }
};

export default messApi;

