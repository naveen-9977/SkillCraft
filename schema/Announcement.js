import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Announcement title is required"],
    trim: true,
    maxLength: [200, "Title cannot be more than 200 characters"]
  },
  mentor: {
    type: String,
    required: [true, "Mentor name is required"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "Announcement message is required"],
    trim: true,
  },
  batchCode: {
    type: String,
    required: [true, "Batch code is required for announcements"],
    trim: true,
  },
  // NEW: Add a field to track the creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to the Users model
    required: true,
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

announcementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

export default Announcement;