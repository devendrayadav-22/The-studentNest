import apiClient from './client';

export const announcementApi = {
  getAll: async () => {
    const response = await apiClient.get('/announcements');
    return response.data;
  }
};

export default announcementApi;

