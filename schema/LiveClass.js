import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Live class title is required"],
    trim: true,
    maxLength: [200, "Title cannot be more than 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Live class description is required"],
    trim: true,
    maxLength: [1000, "Description cannot be more than 1000 characters"]
  },
  classLink: { // URL for the live class (e.g., Zoom, Google Meet link, or 'internal' for WebRTC)
    type: String,
    required: [true, "Class link is required"],
    trim: true,
  },
  mentor: {
    type: String,
    required: [true, "Mentor name is required"],
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"],
  },
  batchCodes: { // Array of batch codes this class is for
    type: [String],
    required: [true, "At least one batch code is required"],
    validate: {
      validator: function(v) {
        return v && v.length > 0; // Ensure the array is not empty
      },
      message: 'At least one batch code is required for the live class.'
    }
  },
  isActive: { // To easily enable/disable a class
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

liveClassSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', liveClassSchema);

export default LiveClass;
