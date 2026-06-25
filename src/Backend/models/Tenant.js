import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  idCard: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  hometown: {
    type: String
  },
  currentAddress: {
    type: String
  },
  occupation: {
    type: String,
    default: 'Người thuê'
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  moveInDate: {
    type: Date
  },
  moveOutDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
