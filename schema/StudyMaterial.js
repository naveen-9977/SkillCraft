import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  thumbnailUrl: {
      type: String,
      trim: true,
  },
  type: {
    type: String,
    enum: ['folder', 'file', 'youtube_video', 'youtube_playlist'],
    required: true,
  },
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
  resourceUrl: {
    type: String,
    trim: true,
  },
  youtubeUrl: {
    type: String,
    trim: true,
  },
  // This field is crucial for the sync button
  youtubePlaylistId: {
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
  isPremium: {
      type: Boolean,
      default: false,
  },
  dripDate: {
      type: Date,
  },
}, { timestamps: true });

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;