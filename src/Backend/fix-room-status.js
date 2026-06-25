import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import Tenant from './models/Tenant.js';
import connectDB from './config/database.js';

dotenv.config();

const fixRoomStatus = async () => {
  try {
    await connectDB();
    console.log('🔄 Đang sửa trạng thái phòng...');

    // Lấy tất cả các phòng
    const rooms = await Room.find({});

    for (const room of rooms) {
      // Đếm số tenant trong phòng
      const tenantCount = await Tenant.countDocuments({ room: room._id });
      
      // Cập nhật status dựa trên số tenant
      if (tenantCount > 0) {
        if (room.status !== 'occupied') {
          room.status = 'occupied';
          await room.save();
          console.log(`✅ Đã sửa phòng ${room.roomNumber}: ${tenantCount} người thuê -> status = occupied`);
        }
      } else {
        if (room.status !== 'available') {
          room.status = 'available';
          await room.save();
          console.log(`✅ Đã sửa phòng ${room.roomNumber}: 0 người thuê -> status = available`);
        }
      }
      
      // Cập nhật currentTenants
      const tenants = await Tenant.find({ room: room._id });
      room.currentTenants = tenants.map(t => t._id);
      await room.save();
    }

    console.log('🎉 Hoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixRoomStatus();
