import api from '../config/api';

class RecommendationService {
  async getRecommendations(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
          if (value.length === 0) return;
          params.append(key, value.join(','));
          return;
        }
        params.append(key, value);
      });

      const query = params.toString();
      const response = await api.get(`/recommendations${query ? `?${query}` : ''}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  async trackInteraction(roomId, eventType, meta = {}) {
    try {
      const response = await api.post('/recommendations/track', {
        roomId,
        eventType,
        meta
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }
}

export const recommendationService = new RecommendationService();
