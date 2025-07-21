import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [200, "Title cannot be more than 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxLength: [500, "Description cannot be more than 500 characters"]
  },
  paragraphOne: {
    type: String,
    required: [true, "First paragraph is required"],
    trim: true
  },
  paragraphTwo: {
    type: String,
    required: [true, "Second paragraph is required"],
    trim: true
  },
  paragraphThree: {
    type: String,
    required: [true, "Third paragraph is required"],
    trim: true
  },
  coverImage: {
    type: String,
    required: [true, "Cover image URL is required"]
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

// Update the updatedAt timestamp before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
