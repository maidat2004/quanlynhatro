import mongoose from 'mongoose';

const updateRequestSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: {
      type: String,
      required: true
    },
    newValue: {
      type: String,
      required: true
    }
  }],
  note: {
    type: String
  },
  reviewDate: {
    type: Date
  },
  reviewNote: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const UpdateRequest = mongoose.model('UpdateRequest', updateRequestSchema);

export default UpdateRequest;
