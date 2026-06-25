import api from '../config/api';

class ChatbotService {
  async sendMessage(message) {
    try {
      const response = await api.post('/chatbot/message', { message });
      return response.data || response;
    } catch (error) {
      console.error('Error sending chatbot message:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
