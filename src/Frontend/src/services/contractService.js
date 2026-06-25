import api from '../config/api';

class ContractService {
  /**
   * Lấy danh sách hợp đồng
   */
  async getContracts(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/contracts?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Lấy hợp đồng theo tenant
   */
  async getContractsByTenant(tenantId) {
    try {
      const response = await api.get(`/contracts/tenant/${tenantId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tenant contracts:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin hợp đồng
   */
  async getContract(id) {
    try {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }

  /**
   * Tạo hợp đồng mới
   */
  async createContract(data) {
    try {
      console.log('🚀 ContractService - Sending data:', data);
      const response = await api.post('/contracts', data);
      console.log('✅ ContractService - Response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ ContractService - Error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật hợp đồng
   */
  async updateContract(id, data) {
    try {
      const response = await api.put(`/contracts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa hợp đồng
   */
  async deleteContract(id) {
    try {
      const response = await api.delete(`/contracts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file hợp đồng
   */
  async uploadContractFile(id, formData) {
    try {
      const response = await api.post(`/contracts/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading contract file:', error);
      throw error;
    }
  }

  /**
   * Ký hợp đồng bởi tenant
   */
  async signContractByTenant(id, signatureData) {
    try {
      const response = await api.post(`/contracts/${id}/sign-tenant`, signatureData);
      return response.data;
    } catch (error) {
      console.error('Error signing contract by tenant:', error);
      throw error;
    }
  }

  /**
   * Ký hợp đồng bởi admin
   */
  async signContractByAdmin(id, signatureData) {
    try {
      const response = await api.post(`/contracts/${id}/sign-admin`, signatureData);
      return response.data;
    } catch (error) {
      console.error('Error signing contract by admin:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái ký hợp đồng
   */
  async getContractSignatureStatus(id) {
    try {
      const response = await api.get(`/contracts/${id}/signature-status`);
      return response.data;
    } catch (error) {
      console.error('Error getting contract signature status:', error);
      throw error;
    }
  }

  /**
   * Xác nhận hợp đồng
   */
  async confirmContract(id) {
    try {
      const response = await api.post(`/contracts/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming contract:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
