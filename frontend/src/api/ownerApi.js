import apiClient from './client';

export const ownerApi = {
  createListing: async (listingData) => {
    const response = await apiClient.post('/owner/pgs', listingData);
    return response.data;
  },

  getMyListings: async () => {
    const response = await apiClient.get('/owner/pgs');
    return response.data;
  },

  updateListing: async (id, listingData) => {
    const response = await apiClient.put(`/owner/pgs/${id}`, listingData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await apiClient.delete(`/owner/pgs/${id}`);
    return response.data;
  },

  confirmAvailability: async (id) => {
    const response = await apiClient.post(`/owner/pgs/${id}/confirm-availability`);
    return response.data;
  },

  updateBeds: async (id, availableBeds) => {
    const response = await apiClient.patch(`/owner/pgs/${id}/beds`, { availableBeds });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/owner/stats');
    return response.data;
  }
};

export default ownerApi;

