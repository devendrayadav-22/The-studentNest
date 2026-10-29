import apiClient from './client';

export const inquiryApi = {
  sendInquiry: async (inquiryData) => {
    const response = await apiClient.post('/inquiries', inquiryData);
    return response.data;
  },

  getMyInquiries: async () => {
    const response = await apiClient.get('/inquiries/mine');
    return response.data;
  },

  getReceivedInquiries: async () => {
    const response = await apiClient.get('/inquiries/received');
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/inquiries/${id}/status`, { status });
    return response.data;
  }
};

export default inquiryApi;

