import api from '../config/api';

class InvoiceService {
  /**
   * Lấy danh sách hóa đơn
   */
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/invoices?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Lấy hóa đơn theo tenant
   */
  async getInvoicesByTenant(tenantId) {
    try {
      const response = await api.get(`/invoices/tenant/${tenantId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tenant invoices:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin hóa đơn
   */
  async getInvoice(id) {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Tạo hóa đơn mới
   */
  async createInvoice(data) {
    try {
      const response = await api.post('/invoices', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo draft hóa đơn hàng loạt cho tất cả người thuê
   */
  async createBulkDraftInvoices() {
    try {
      const response = await api.post('/invoices/bulk-draft');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật hóa đơn
   */
  async updateInvoice(id, data) {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thanh toán hóa đơn
   */
  async payInvoice(id, paymentMethod = 'transfer') {
    try {
      const response = await api.put(`/invoices/${id}/pay`, { paymentMethod });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async submitPayment(id) {
    try {
      const response = await api.put(`/invoices/${id}/submit-payment`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async rejectPayment(id, reason) {
    try {
      const response = await api.put(`/invoices/${id}/reject-payment`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gửi hóa đơn qua email
   */
  async sendInvoice(id) {
    try {
      const response = await api.post(`/invoices/${id}/send`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa hóa đơn
   */
  async deleteInvoice(id) {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
