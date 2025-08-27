import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  // Type can be either 'folder' or 'file'
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true,
  },
  // ID of the parent folder, null for root items within a batch
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    default: null,
  },
  batchCode: {
    type: String,
    required: [true, "Batch code is required"],
    trim: true,
  },
  // These fields only apply to files (assignments)
  description: {
    type: String,
    trim: true,
  },
  deadline: {
    type: Date,
  },
  resourceUrl: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
}, { timestamps: true });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment;