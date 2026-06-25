import mongoose from 'mongoose';

const roomInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  eventType: {
    type: String,
    enum: ['view', 'favorite', 'contact', 'direction', 'search', 'chatbot'],
    required: true
  },
  meta: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

roomInteractionSchema.index({ user: 1, room: 1, eventType: 1, createdAt: -1 });
roomInteractionSchema.index({ room: 1, eventType: 1, createdAt: -1 });

const RoomInteraction = mongoose.model('RoomInteraction', roomInteractionSchema);

export default RoomInteraction;
