import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
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
    ref: 'StudyMaterial',
    default: null,
  },
  batchCode: {
    type: String,
    required: [true, "Batch code is required"],
    trim: true,
  },
  // resourceUrl is only required for files
  resourceUrl: {
    type: String,
    trim: true,
  },
  mentor: {
    type: String,
    required: [true, "Mentor name is required"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
}, { timestamps: true });

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;