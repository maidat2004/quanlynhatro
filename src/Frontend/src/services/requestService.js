import api from '../config/api';

class RequestService {
  /**
   * Lấy danh sách yêu cầu
   */
  async getRequests(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/requests?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  }

  /**
   * Lấy yêu cầu theo tenant
   */
  async getRequestsByTenant(tenantId) {
    try {
      const response = await api.get(`/requests/tenant/${tenantId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tenant requests:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin yêu cầu
   */
  async getRequest(id) {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  }

  /**
   * Tạo yêu cầu mới
   */
  async createRequest(data) {
    try {
      const response = await api.post('/requests', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật yêu cầu
   */
  async updateRequest(id, data) {
    try {
      const response = await api.put(`/requests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu
   */
  async updateRequestStatus(id, status, note = '') {
    try {
      const response = await api.put(`/requests/${id}`, { 
        status,
        ...(note && { response: note })
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xử lý yêu cầu
   */
  async resolveRequest(id, data) {
    try {
      const response = await api.put(`/requests/${id}/resolve`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa yêu cầu
   */
  async deleteRequest(id) {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const requestService = new RequestService();
