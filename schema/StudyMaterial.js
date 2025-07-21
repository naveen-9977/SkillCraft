import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Study material title is required"],
    trim: true,
    maxLength: [300, "Title cannot be more than 300 characters"]
  },
  mentor: {
    type: String,
    required: [true, "Mentor name is required"],
    trim: true,
  },
  resourceUrl: {
    type: String,
    required: [true, "Resource URL is required"],
    trim: true,
  },
  resourceType: {
    type: String,
    required: [true, "Resource type is required"],
    enum: ['pdf', 'video', 'link', 'document', 'other'], // Example types
    default: 'other',
  },
  batchCode: { // NEW: Link to a batch
    type: String,
    required: [true, "Batch code is required for study material"],
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

studyMaterialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;
