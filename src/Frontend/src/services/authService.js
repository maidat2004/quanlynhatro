import api from '../config/api';

class AuthService {
  /**
   * Đăng nhập
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { token, ...user } = response.data;
        
        // Lưu token và user info với đầy đủ thông tin role
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        
        return user;
      }
      
      throw new Error('Đăng nhập thất bại');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Đăng ký
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success && response.data) {
        // KHÔNG lưu token - yêu cầu người dùng đăng nhập sau khi đăng ký
        return response.data;
      }
      
      throw new Error('Đăng ký thất bại');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đăng xuất
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Lấy session từ localStorage
   */
  getSession() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        // Ensure user has _id property (for backward compatibility)
        if (user.id && !user._id) {
          user._id = user.id;
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      throw new Error('Cập nhật thất bại');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data) {
    try {
      const response = await api.put('/auth/change-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra đã đăng nhập
   */
  isAuthenticated() {
    return this.getSession() !== null;
  }

  /**
   * Kiểm tra role
   */
  hasRole(role) {
    const session = this.getSession();
    return session?.role === role;
  }
}

export const authService = new AuthService();
