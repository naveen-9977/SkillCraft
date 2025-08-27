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
    ref: 'Users', 
    required: true,
  },
  // UPDATED: batch is now an array of ObjectIds
  batch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'batch1', 
  }],
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', liveClassSchema);

export default LiveClass;