import apiClient from './client';

export const reportApi = {
  createReport: async (reportData) => {
    const response = await apiClient.post('/reports', reportData);
    return response.data;
  }
};

export default reportApi;

