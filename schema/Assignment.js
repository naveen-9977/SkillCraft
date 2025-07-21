import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Assignment title is required"],
    trim: true,
    maxLength: [300, "Title cannot be more than 300 characters"]
  },
  description: {
    type: String,
    required: [true, "Assignment description is required"],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, "Deadline date is required"]
  },
  resourceUrl: { // To store the path/URL of the admin-uploaded assignment PDF
    type: String,
    default: ''
  },
  batchCode: { // NEW: Added batchCode to associate assignments with a batch
    type: String,
    required: [true, "Batch code is required for assignments"],
    trim: true,
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

assignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment;
