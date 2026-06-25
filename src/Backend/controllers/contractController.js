import Contract from '../models/Contract.js';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private/Admin
export const getContracts = async (req, res) => {
  try {
    const { status, room, tenant } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (room) query.room = room;
    if (tenant) query.tenant = tenant;

    const contracts = await Contract.find(query)
      .populate('room', 'roomNumber floor')
      .populate('tenant', 'fullName phone email');

    res.json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private
export const getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room')
      .populate('tenant');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create contract
// @route   POST /api/contracts
// @access  Private/Admin
export const createContract = async (req, res) => {
  try {
    console.log('📝 Creating contract with data:', req.body);
    
    const contract = await Contract.create(req.body);
    
    console.log('✅ Contract created successfully:', contract._id);

    // Update tenant status
    await Tenant.findByIdAndUpdate(contract.tenant, {
      status: 'active',
      moveInDate: contract.startDate
    });
    
    console.log('✅ Tenant status updated');

    res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('❌ Error creating contract:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private/Admin
export const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private/Admin
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    await contract.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa hợp đồng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get contracts by tenant
// @route   GET /api/contracts/tenant/:tenantId
// @access  Private
export const getContractsByTenant = async (req, res) => {
  try {
    const contracts = await Contract.find({ tenant: req.params.tenantId })
      .populate('room', 'roomNumber floor price');

    res.json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload contract file
// @route   POST /api/contracts/:id/upload
// @access  Private/Admin
export const uploadContractFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Update contract with file path
    contract.contractFile = `/uploads/contracts/${req.file.filename}`;
    await contract.save();

    res.json({
      success: true,
      message: 'Upload file hợp đồng thành công',
      data: {
        contractFile: contract.contractFile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sign contract by tenant
// @route   POST /api/contracts/:id/sign-tenant
// @access  Private
export const signContractByTenant = async (req, res) => {
  try {
    const { signature, signatureType = 'digital' } = req.body;

    const contract = await Contract.findById(req.params.id)
      .populate('tenant');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Check if user is the tenant
    if (contract.tenant.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền ký hợp đồng này'
      });
    }

    // Update contract signature
    contract.isSignedByTenant = true;
    contract.tenantSignature = signature;
    contract.tenantSignedAt = new Date();
    contract.signatureType = signatureType;

    await contract.save();

    res.json({
      success: true,
      message: 'Đã ký hợp đồng thành công',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sign contract by admin
// @route   POST /api/contracts/:id/sign-admin
// @access  Private/Admin
export const signContractByAdmin = async (req, res) => {
  try {
    const { signature, signatureType = 'digital' } = req.body;

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Update contract signature
    contract.isSignedByAdmin = true;
    contract.adminSignature = signature;
    contract.adminSignedAt = new Date();
    contract.signatureType = signatureType;

    await contract.save();

    res.json({
      success: true,
      message: 'Admin đã ký hợp đồng thành công',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get contract signature status
// @route   GET /api/contracts/:id/signature-status
// @access  Private
export const getContractSignatureStatus = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .select('isSignedByTenant isSignedByAdmin tenantSignedAt adminSignedAt status');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    res.json({
      success: true,
      data: {
        isSignedByTenant: contract.isSignedByTenant || false,
        isSignedByAdmin: contract.isSignedByAdmin || false,
        tenantSignedAt: contract.tenantSignedAt,
        adminSignedAt: contract.adminSignedAt,
        status: contract.status,
        isFullySigned: (contract.isSignedByTenant && contract.isSignedByAdmin) || false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm contract
// @route   POST /api/contracts/:id/confirm
// @access  Private/Admin
export const confirmContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room')
      .populate('tenant');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    // Check if contract is fully signed
    if (!contract.isSignedByTenant || !contract.isSignedByAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Hợp đồng chưa được ký đầy đủ bởi cả người thuê và admin'
      });
    }

    // Update contract status to confirmed
    contract.status = 'active';
    contract.confirmedAt = new Date();
    await contract.save();

    res.json({
      success: true,
      message: 'Hợp đồng đã được xác nhận thành công',
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
