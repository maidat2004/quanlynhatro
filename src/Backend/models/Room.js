import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  length: {
    type: Number,
    default: 0
  },
  width: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  ward: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  currentTenants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }]
}, {
  timestamps: true
});

roomSchema.index({ location: '2dsphere' }, { sparse: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;
