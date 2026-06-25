import api from '../config/api';

const sortRoomsByNumber = (rooms) => {
  return [...rooms].sort((a, b) => {
    const roomA = String(a?.roomNumber || '');
    const roomB = String(b?.roomNumber || '');
    return roomA.localeCompare(roomB, 'vi', { numeric: true, sensitivity: 'base' });
  });
};

class RoomService {
  /**
   * Lấy danh sách phòng
   */
  async getRooms(filters = {}) {
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
      const response = await api.get(`/rooms${query ? `?${query}` : ''}`);
      const rooms = response.data || [];
      return filters.sortBy ? rooms : sortRoomsByNumber(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách phòng (alias)
   */
  async getAllRooms(filters = {}) {
    return this.getRooms(filters);
  }

  /**
   * Lấy danh sách phòng trống
   */
  async getAvailableRooms() {
    try {
      const response = await api.get('/rooms/available');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin phòng
   */
  async getRoom(id) {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  }

  /**
   * Tạo phòng mới
   */
  async createRoom(data) {
    try {
      const response = await api.post('/rooms', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật phòng
   */
  async updateRoom(id, data) {
    try {
      const response = await api.put(`/rooms/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa phòng
   */
  async deleteRoom(id) {
    try {
      const response = await api.delete(`/rooms/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload ảnh cho phòng
   */
  async uploadRoomImages(roomId, files) {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      
      const response = await api.post(`/rooms/${roomId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa ảnh của phòng
   */
  async deleteRoomImage(roomId, imageUrl) {
    try {
      const response = await api.delete(`/rooms/${roomId}/images`, {
        data: { imageUrl }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const roomService = new RoomService();
