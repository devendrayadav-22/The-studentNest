import apiClient from './client';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (targetType, targetId) => {
    const response = await apiClient.post('/wishlist', { targetType, targetId });
    return response.data;
  },

  removeFromWishlist: async (id) => {
    const response = await apiClient.delete(`/wishlist/${id}`);
    return response.data;
  }
};

export default wishlistApi;

