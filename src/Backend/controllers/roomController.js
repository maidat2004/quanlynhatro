import Room from '../models/Room.js';

const PRICE_TO_AREA_MAP = {
  1200000: { area: 15, length: 5, width: 3 },
  1500000: { area: 18, length: 4.5, width: 4 },
  1800000: { area: 20, length: 5, width: 4 },
  2000000: { area: 24, length: 6, width: 4 },
  2500000: { area: 30, length: 7.5, width: 4 }
};

const enforceConsistentArea = (payload) => {
  if (payload.price && PRICE_TO_AREA_MAP[payload.price]) {
    const config = PRICE_TO_AREA_MAP[payload.price];
    payload.area = config.area;
    payload.length = config.length;
    payload.width = config.width;
  }
  return payload;
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res) => {
  try {
    const { status, floor, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (floor) query.floor = parseInt(floor);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const rooms = await Room.find(query).populate('currentTenants');

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('currentTenants');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = async (req, res) => {
  try {
    const payload = enforceConsistentArea({ ...req.body });
    const room = await Room.create(payload);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = async (req, res) => {
  try {
    const payload = enforceConsistentArea({ ...req.body });
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa phòng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload room images
// @route   POST /api/rooms/:id/images
// @access  Private/Admin
export const uploadRoomImages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 ảnh'
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được upload tối đa 5 ảnh'
      });
    }

    // Get file paths
    const imagePaths = req.files.map(file => `/uploads/rooms/${file.filename}`);
    
    // Add new images to existing images
    room.images = [...(room.images || []), ...imagePaths];
    
    // Keep only last 5 images if more than 5
    if (room.images.length > 5) {
      room.images = room.images.slice(-5);
    }

    await room.save();

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete room image
// @route   DELETE /api/rooms/:id/images
// @access  Private/Admin
export const deleteRoomImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    // Remove image from array
    room.images = room.images.filter(img => img !== imageUrl);
    await room.save();

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
