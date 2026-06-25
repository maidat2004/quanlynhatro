import UpdateRequest from '../models/UpdateRequest.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all update requests
// @route   GET /api/update-requests
// @access  Admin
export const getUpdateRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    
    const requests = await UpdateRequest.find(query)
      .populate('tenant', 'fullName email phone')
      .populate('reviewedBy', 'name email')
      .sort({ requestDate: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get update request by ID
// @route   GET /api/update-requests/:id
// @access  Admin, User (own request)
export const getUpdateRequestById = async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id)
      .populate('tenant', 'fullName email phone')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get update requests by tenant
// @route   GET /api/update-requests/tenant/:tenantId
// @access  User (own), Admin
export const getUpdateRequestsByTenant = async (req, res) => {
  try {
    const requests = await UpdateRequest.find({ tenant: req.params.tenantId })
      .populate('reviewedBy', 'name email')
      .sort({ requestDate: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create update request
// @route   POST /api/update-requests
// @access  User
export const createUpdateRequest = async (req, res) => {
  try {
    const { tenant, changes, note } = req.body;

    // Verify tenant exists
    const tenantExists = await Tenant.findById(tenant);
    if (!tenantExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê'
      });
    }

    // Create request
    const request = await UpdateRequest.create({
      tenant,
      changes,
      note,
      status: 'pending'
    });

    const populatedRequest = await UpdateRequest.findById(request._id)
      .populate('tenant', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu thành công',
      data: populatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve update request
// @route   PUT /api/update-requests/:id/approve
// @access  Admin
export const approveUpdateRequest = async (req, res) => {
  try {
    const { reviewNote } = req.body;
    
    const request = await UpdateRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu đã được xử lý trước đó'
      });
    }

    // Update tenant information based on changes
    const tenant = await Tenant.findById(request.tenant);
    if (tenant) {
      request.changes.forEach(change => {
        // Map field names to tenant model properties
        const fieldMap = {
          'Số điện thoại': 'phone',
          'Email': 'email',
          'Địa chỉ': 'address',
          'Liên hệ khẩn cấp': 'emergencyContact',
          'SĐT khẩn cấp': 'emergencyPhone'
        };

        const fieldName = fieldMap[change.field];
        if (fieldName && tenant[fieldName] !== undefined) {
          tenant[fieldName] = change.newValue;
        }
      });
      await tenant.save();
    }

    // Update request status
    request.status = 'approved';
    request.reviewDate = new Date();
    request.reviewNote = reviewNote;
    request.reviewedBy = req.user.id;
    
    await request.save();

    const updatedRequest = await UpdateRequest.findById(request._id)
      .populate('tenant', 'fullName email phone')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Đã phê duyệt yêu cầu',
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject update request
// @route   PUT /api/update-requests/:id/reject
// @access  Admin
export const rejectUpdateRequest = async (req, res) => {
  try {
    const { reviewNote } = req.body;
    
    const request = await UpdateRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu đã được xử lý trước đó'
      });
    }

    request.status = 'rejected';
    request.reviewDate = new Date();
    request.reviewNote = reviewNote;
    request.reviewedBy = req.user.id;
    
    await request.save();

    const updatedRequest = await UpdateRequest.findById(request._id)
      .populate('tenant', 'fullName email phone')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Đã từ chối yêu cầu',
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete update request
// @route   DELETE /api/update-requests/:id
// @access  Admin
export const deleteUpdateRequest = async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa yêu cầu'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
