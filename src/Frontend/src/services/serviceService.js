import api from '../config/api';

class ServiceService {
  /**
   * Lấy danh sách dịch vụ
   */
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/services?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin dịch vụ
   */
  async getService(id) {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  /**
   * Tạo dịch vụ mới
   */
  async createService(data) {
    try {
      const response = await api.post('/services', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật dịch vụ
   */
  async updateService(id, data) {
    try {
      const response = await api.put(`/services/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa dịch vụ
   */
  async deleteService(id) {
    try {
      const response = await api.delete(`/services/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const serviceService = new ServiceService();
