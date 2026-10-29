import apiClient from './client';

export const pgApi = {
  getAll: async (params = {}) => {
    // Process facilities array if passed as array
    const queryParams = { ...params };
    if (Array.isArray(queryParams.facilities)) {
      queryParams.facilities = queryParams.facilities.join(',');
    }
    const response = await apiClient.get('/pgs', { params: queryParams });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/pgs/${id}`);
    return response.data;
  }
};

export default pgApi;

