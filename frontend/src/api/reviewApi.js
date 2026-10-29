import apiClient from './client';

export const reviewApi = {
  getReviews: async (targetType, targetId) => {
    const response = await apiClient.get('/reviews', {
      params: { targetType, targetId }
    });
    return response.data;
  },

  postReview: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  updateReview: async (id, reviewData) => {
    const response = await apiClient.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  replyToReview: async (id, ownerReply) => {
    const response = await apiClient.post(`/reviews/${id}/reply`, { ownerReply });
    return response.data;
  },

  getMyReviews: async () => {
    const response = await apiClient.get('/reviews/mine');
    return response.data;
  }
};

export default reviewApi;

