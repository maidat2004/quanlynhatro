import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Tenant from './models/Tenant.js';
import connectDB from './config/database.js';

dotenv.config();

const fixUserTenantIds = async () => {
  try {
    await connectDB();
    console.log('🔄 Đang sửa user.tenantId...');

    // Tìm tất cả tenants
    const tenants = await Tenant.find({}).populate('user');

    let fixedCount = 0;
    for (const tenant of tenants) {
      if (tenant.user && !tenant.user.tenantId) {
        // Update user.tenantId
        await User.findByIdAndUpdate(tenant.user._id, {
          tenantId: tenant._id
        });
        fixedCount++;
        console.log(`✅ Đã sửa user ${tenant.user.email} với tenantId ${tenant._id}`);
      }
    }

    console.log(`🎉 Hoàn thành! Đã sửa ${fixedCount} user(s).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixUserTenantIds();