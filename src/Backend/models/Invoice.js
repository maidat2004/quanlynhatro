import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
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
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  roomRent: {
    type: Number,
    required: true
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    name: String,
    oldReading: Number,
    newReading: Number,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'payment_submitted', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentSubmittedAt: {
    type: Date
  },
  paymentRejectedAt: {
    type: Date
  },
  paymentRejectionReason: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'momo', 'vnpay', 'sepay'],
    default: 'transfer'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  },
  notes: {
    type: String
  },
  isDraft: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
