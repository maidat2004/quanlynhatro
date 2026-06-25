import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import { sendAccountEmail } from '../utils/mailer.js';

// Hàm tạo mật khẩu ngẫu nhiên
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/Admin
export const getTenants = async (req, res) => {
  try {
    const { status, room } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (room) query.room = room;

    const tenants = await Tenant.find(query)
      .populate('user', 'name email phone')
      .populate('room', 'roomNumber floor price');

    res.json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('room', 'roomNumber floor price');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người thuê'
      });
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create tenant
// @route   POST /api/tenants
// @access  Private/Admin
export const createTenant = async (req, res) => {
  try {
    const { userId, roomId, email, fullName, phone, ...tenantData } = req.body;

    let user;
    let generatedPassword = null;
    let emailSent = false;

    // Nếu có userId thì sử dụng user đã tồn tại
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
    } else if (email) {
      // Kiểm tra xem email đã tồn tại chưa
      user = await User.findOne({ email });
      
      if (!user) {
        // Tạo user mới với mật khẩu mặc định
        generatedPassword = generateRandomPassword();
        
        user = await User.create({
          name: fullName,
          email: email,
          password: generatedPassword,
          phone: phone,
          role: 'user',
          mustChangePassword: true // Bắt buộc đổi mật khẩu khi đăng nhập lần đầu
        });

        // Gửi email thông báo tài khoản
        const emailResult = await sendAccountEmail(email, fullName, generatedPassword);
        emailSent = emailResult.success;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp userId hoặc email để tạo người thuê'
      });
    }

    // Kiểm tra xem user đã có tenant chưa
    const existingTenant = await Tenant.findOne({ user: user._id });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng này đã có hồ sơ người thuê'
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      user: user._id,
      room: roomId,
      fullName: fullName,
      email: email,
      phone: phone,
      ...tenantData
    });

    // Update user's tenantId and sync profile fields
    user.tenantId = tenant._id;
    user.name = tenant.fullName;
    user.phone = tenant.phone;
    user.idCard = tenant.idCard;
    user.dateOfBirth = tenant.dateOfBirth;
    user.hometown = tenant.hometown;
    user.currentAddress = tenant.currentAddress;
    user.occupation = tenant.occupation;
    if (tenant.emergencyContact) {
      user.emergencyContact = {
        name: tenant.emergencyContact.name || '',
        phone: tenant.emergencyContact.phone || '',
        relationship: tenant.emergencyContact.relationship || ''
      };
    }
    await user.save();

    // Update room if provided
    if (roomId) {
      const room = await Room.findById(roomId);
      if (room) {
        room.currentTenants.push(tenant._id);
        // Set status to occupied when there's at least one tenant
        if (room.currentTenants.length > 0) {
          room.status = 'occupied';
        }
        await room.save();
      }
    }

    res.status(201).json({
      success: true,
      data: tenant,
      userCreated: generatedPassword !== null,
      emailSent: emailSent,
      message: generatedPassword 
        ? `Tạo người thuê thành công. Tài khoản đã được tạo với mật khẩu: ${generatedPassword}${emailSent ? ' và đã gửi email thông báo.' : ' (Gửi email thất bại, vui lòng thông báo mật khẩu cho người thuê).'}`
        : 'Tạo người thuê thành công.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private/Admin
export const updateTenant = async (req, res) => {
  try {
    const oldTenant = await Tenant.findById(req.params.id);
    
    if (!oldTenant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người thuê'
      });
    }

    const oldRoomId = oldTenant.room ? oldTenant.room.toString() : null;
    const newRoomId = req.body.room ? req.body.room.toString() : null;

    // Update tenant
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Sync profile changes to corresponding User document if linked
    if (tenant.user) {
      const user = await User.findById(tenant.user);
      if (user) {
        user.name = tenant.fullName;
        user.phone = tenant.phone;
        user.idCard = tenant.idCard;
        user.dateOfBirth = tenant.dateOfBirth;
        user.hometown = tenant.hometown;
        user.currentAddress = tenant.currentAddress;
        user.occupation = tenant.occupation;
        if (tenant.emergencyContact) {
          user.emergencyContact = {
            name: tenant.emergencyContact.name || '',
            phone: tenant.emergencyContact.phone || '',
            relationship: tenant.emergencyContact.relationship || ''
          };
        }
        await user.save();
      }
    }

    // Handle room changes
    if (oldRoomId !== newRoomId) {
      // Remove tenant from old room
      if (oldRoomId) {
        const oldRoom = await Room.findById(oldRoomId);
        if (oldRoom) {
          oldRoom.currentTenants = oldRoom.currentTenants.filter(
            t => t.toString() !== tenant._id.toString()
          );
          if (oldRoom.currentTenants.length === 0) {
            oldRoom.status = 'available';
          }
          await oldRoom.save();
        }
      }

      // Add tenant to new room
      if (newRoomId) {
        const newRoom = await Room.findById(newRoomId);
        if (newRoom) {
          if (!newRoom.currentTenants.includes(tenant._id)) {
            newRoom.currentTenants.push(tenant._id);
          }
          // Set status to occupied when there's at least one tenant
          if (newRoom.currentTenants.length > 0) {
            newRoom.status = 'occupied';
          }
          await newRoom.save();
        }
      }
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private/Admin
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người thuê'
      });
    }

    // Remove tenant from room
    if (tenant.room) {
      const room = await Room.findById(tenant.room);
      if (room) {
        room.currentTenants = room.currentTenants.filter(
          t => t.toString() !== tenant._id.toString()
        );
        if (room.currentTenants.length === 0) {
          room.status = 'available';
        }
        await room.save();
      }
    }

    // Update user
    const user = await User.findById(tenant.user);
    if (user) {
      user.tenantId = null;
      await user.save();
    }

    await tenant.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa người thuê thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tenant by user ID
// @route   GET /api/tenants/user/:userId
// @access  Private
export const getTenantByUser = async (req, res) => {
  try {
    // Tìm tenant theo user ID
    let tenant = await Tenant.findOne({ user: req.params.userId })
      .populate('user', 'name email phone')
      .populate('room', 'roomNumber floor price');

    // Nếu không tìm thấy theo user ID, thử tìm theo email
    if (!tenant) {
      const user = await User.findById(req.params.userId);
      if (user && user.email) {
        tenant = await Tenant.findOne({ email: user.email })
          .populate('user', 'name email phone')
          .populate('room', 'roomNumber floor price');
      }
    }

    // Nếu vẫn không tìm thấy, thử tìm theo tenantId của user
    if (!tenant) {
      const user = await User.findById(req.params.userId);
      if (user && user.tenantId) {
        tenant = await Tenant.findById(user.tenantId)
          .populate('user', 'name email phone')
          .populate('room', 'roomNumber floor price');
      }
    }

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create tenant with new user account
// @route   POST /api/tenants/with-account
// @access  Private/Admin
export const createTenantWithAccount = async (req, res) => {
  try {
    const { fullName, email, phone, idCard, dateOfBirth, school, hometown, 
            emergencyContact, emergencyPhone, room, moveInDate } = req.body;

    // Check if email already exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Generate random password for new user
      const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const password = generatePassword();

      // Create user account
      user = await User.create({
        name: fullName,
        email,
        password,
        phone,
        role: 'user'
      });

      isNewUser = true;
    } else {
      // Check if user already has a tenant
      if (user.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được liên kết với một người thuê khác'
        });
      }
    }

    // Create tenant
    const tenant = await Tenant.create({
      user: user._id,
      fullName,
      email,
      phone,
      idCard,
      dateOfBirth,
      school,
      hometown,
      emergencyContact,
      emergencyPhone,
      room,
      moveInDate
    });

    // Update user's tenantId
    user.tenantId = tenant._id;
    await user.save();

    // Update room if provided
    if (room) {
      const roomDoc = await Room.findById(room);
      if (roomDoc) {
        if (!roomDoc.currentTenants.includes(tenant._id)) {
          roomDoc.currentTenants.push(tenant._id);
        }
        if (roomDoc.currentTenants.length >= roomDoc.capacity) {
          roomDoc.status = 'occupied';
        }
        await roomDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      data: tenant,
      account: isNewUser ? {
        email: user.email,
        password: user.password // Send password to admin to give to tenant
      } : null,
      message: isNewUser ? 'Đã tạo người thuê và tài khoản mới' : 'Đã tạo người thuê và liên kết với tài khoản hiện có'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update own tenant profile (for users)
// @route   PUT /api/tenants/profile/me
// @access  Private (User can update their own info)
export const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find tenant by user ID
    const tenant = await Tenant.findOne({ user: userId });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    // Only allow updating certain fields (not room, user, status, email)
    // Email is removed from allowed updates to prevent confusion with login email
    const allowedUpdates = [
      'fullName',
      'phone',
      'idCard',
      'dateOfBirth',
      'hometown',
      'currentAddress',
      'occupation',
      'school',
      'emergencyContact'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(tenant, updates);
    await tenant.save();

    // Sync profile changes to corresponding User document
    const user = await User.findById(userId);
    if (user) {
      user.name = tenant.fullName;
      user.phone = tenant.phone;
      user.idCard = tenant.idCard;
      user.dateOfBirth = tenant.dateOfBirth;
      user.hometown = tenant.hometown;
      user.currentAddress = tenant.currentAddress;
      user.occupation = tenant.occupation;
      if (tenant.emergencyContact) {
        user.emergencyContact = {
          name: tenant.emergencyContact.name || '',
          phone: tenant.emergencyContact.phone || '',
          relationship: tenant.emergencyContact.relationship || ''
        };
      }
      await user.save();
    }

    res.json({
      success: true,
      data: tenant,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register new tenant profile (for users)
// @route   POST /api/tenants/register
// @access  Private
export const registerTenant = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a tenant profile
    const existingTenant = await Tenant.findOne({ user: userId });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này đã đăng ký thông tin người thuê'
      });
    }

    const { fullName, phone, idCard, dateOfBirth, hometown, currentAddress, occupation, school, emergencyContact } = req.body;

    // Create tenant profile linked to the authenticated user
    const tenant = await Tenant.create({
      user: userId,
      fullName,
      email: req.user.email,
      phone: phone || req.user.phone,
      idCard,
      dateOfBirth,
      hometown,
      currentAddress,
      occupation,
      school,
      emergencyContact,
      status: 'pending'
    });

    // Update user's tenantId and sync details
    const user = await User.findById(userId);
    if (user) {
      user.tenantId = tenant._id;
      user.name = fullName;
      if (phone) user.phone = phone;
      user.idCard = idCard;
      user.dateOfBirth = dateOfBirth;
      user.hometown = hometown;
      user.currentAddress = currentAddress;
      user.occupation = occupation;
      if (emergencyContact) {
        user.emergencyContact = {
          name: emergencyContact.name || '',
          phone: emergencyContact.phone || '',
          relationship: emergencyContact.relationship || ''
        };
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: tenant,
      message: 'Đăng ký hồ sơ người thuê thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
