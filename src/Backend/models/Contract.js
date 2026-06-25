import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated'],
    default: 'active'
  },
  terms: {
    type: String
  },
  specialConditions: {
    type: String
  },
  contractFile: {
    type: String,
    default: null
  },
  signedDate: {
    type: Date,
    default: Date.now
  },
  // Online signature fields
  isSignedByTenant: {
    type: Boolean,
    default: false
  },
  isSignedByAdmin: {
    type: Boolean,
    default: false
  },
  tenantSignature: {
    type: String, // Base64 encoded signature image or text
    default: null
  },
  adminSignature: {
    type: String, // Base64 encoded signature image or text
    default: null
  },
  tenantSignedAt: {
    type: Date,
    default: null
  },
  adminSignedAt: {
    type: Date,
    default: null
  },
  signatureType: {
    type: String,
    enum: ['digital', 'handwritten', 'text'],
    default: 'digital'
  },
  confirmedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
