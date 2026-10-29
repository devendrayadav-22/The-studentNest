import apiClient from './client';

export const adminApi = {
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getPending: async () => {
    const response = await apiClient.get('/admin/pending');
    return response.data;
  },

  approvePg: async (id) => {
    const response = await apiClient.post(`/admin/pgs/${id}/approve`);
    return response.data;
  },

  rejectPg: async (id, reason) => {
    const response = await apiClient.post(`/admin/pgs/${id}/reject`, { reason });
    return response.data;
  },

  approveMess: async (id) => {
    const response = await apiClient.post(`/admin/messes/${id}/approve`);
    return response.data;
  },

  rejectMess: async (id, reason) => {
    const response = await apiClient.post(`/admin/messes/${id}/reject`, { reason });
    return response.data;
  },

  getAllListings: async () => {
    const response = await apiClient.get('/admin/listings');
    return response.data;
  },

  deletePg: async (id) => {
    const response = await apiClient.delete(`/admin/pgs/${id}`);
    return response.data;
  },

  deleteMess: async (id) => {
    const response = await apiClient.delete(`/admin/messes/${id}`);
    return response.data;
  },

  getUsers: async (role = null) => {
    const params = role ? { role } : {};
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  blockUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/block`);
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/unblock`);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await apiClient.get('/admin/reviews');
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  getReports: async () => {
    const response = await apiClient.get('/admin/reports');
    return response.data;
  },

  updateReportStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/reports/${id}`, { status });
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await apiClient.post('/admin/announcements', announcementData);
    return response.data;
  },

  updateAnnouncement: async (id, announcementData) => {
    const response = await apiClient.put(`/admin/announcements/${id}`, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await apiClient.delete(`/admin/announcements/${id}`);
    return response.data;
  }
};

export default adminApi;

