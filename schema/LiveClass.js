import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // CORRECTED: Reference the Users collection
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'batch1', 
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  classType: {
    type: String,
    enum: ['webrtc', 'external'],
    default: 'external',
    required: true,
  },
  link: {
    type: String,
    required: function() {
      return this.classType === 'external';
    },
  },
  // NEW: Add a field to track the creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to the Users model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', liveClassSchema);

export default LiveClass;