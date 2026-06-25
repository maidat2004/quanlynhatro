import api from '../config/api';

class UserService {
  /**
   * Lấy danh sách tất cả users
   */
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

      const queryString = params.toString();
      const response = await api.get(`/users${queryString ? `?${queryString}` : ''}`);
      
      if (response.success) {
        return response.data;
      }
      throw new Error('Không thể tải danh sách người dùng');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Không tìm thấy người dùng');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật user
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      if (response.success) {
        return response.data;
      }
      throw new Error('Không thể cập nhật người dùng');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo user mới
   */
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      if (response.success) {
        return response.data;
      }
      throw new Error('Không thể tạo người dùng');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa user
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Không thể xóa người dùng');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tự động cập nhật lại dữ liệu users
   * @param {Function} callback - Hàm callback để xử lý dữ liệu mới
   * @param {Object} filters - Bộ lọc cho dữ liệu
   * @param {number} interval - Khoảng thời gian tự động cập nhật (ms), mặc định 30000ms = 30s
   */
  startAutoRefresh(callback, filters = {}, interval = 30000) {
    // Dừng auto refresh cũ nếu có
    this.stopAutoRefresh();

    // Hàm refresh data
    const refreshData = async () => {
      try {
        const data = await this.getUsers(filters);
        if (callback && typeof callback === 'function') {
          callback(data);
        }
      } catch (error) {
        console.error('Lỗi khi tự động cập nhật dữ liệu users:', error);
      }
    };

    // Thực hiện refresh ngay lập tức
    refreshData();

    // Thiết lập interval để tự động refresh
    this._autoRefreshInterval = setInterval(refreshData, interval);

    console.log(`🚀 Bắt đầu tự động cập nhật dữ liệu users mỗi ${interval/1000}s`);
  }

  /**
   * Dừng tự động cập nhật dữ liệu
   */
  stopAutoRefresh() {
    if (this._autoRefreshInterval) {
      clearInterval(this._autoRefreshInterval);
      this._autoRefreshInterval = null;
      console.log('⏹️ Dừng tự động cập nhật dữ liệu users');
    }
  }

  /**
   * Refresh dữ liệu một lần
   * @param {Object} filters - Bộ lọc cho dữ liệu
   */
  async refreshData(filters = {}) {
    try {
      console.log('🔄 Đang cập nhật dữ liệu users...');
      const data = await this.getUsers(filters);
      console.log('✅ Dữ liệu users đã được cập nhật');
      return data;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật dữ liệu users:', error);
      throw error;
    }
  }

  /**
   * Tự động reload trang sau một khoảng thời gian
   * @param {number} delay - Thời gian chờ trước khi reload (ms), mặc định 5000ms = 5s
   * @param {string} message - Thông báo hiển thị trước khi reload
   */
  autoReloadPage(delay = 5000, message = 'Trang sẽ được tải lại...') {
    console.log(`🔄 Trang sẽ được tải lại sau ${delay/1000} giây`);
    
    // Hiển thị thông báo nếu có
    if (message && typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        alert(message);
      }, delay - 1000);
    }

    // Reload trang
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }, delay);
  }
}

export const userService = new UserService();
