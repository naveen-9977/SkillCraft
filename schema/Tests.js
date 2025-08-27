import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, "Question text is required"],
    trim: true
  },
  options: {
    type: [{
      optionText: {
        type: String,
        required: [true, "Option text is required"],
        trim: true
      }
    }],
    validate: {
      validator: function(options) {
        return options.length === 4; 
      },
      message: "Each question must have exactly 4 options"
    }
  },
  correctOption: {
    type: Number,
    required: [true, "Correct option index is required"],
    min: [0, "Correct option index must be between 0 and 3"],
    max: [3, "Correct option index must be between 0 and 3"]
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Test title is required"],
    trim: true,
    maxLength: [200, "Title cannot be more than 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Test description is required"],
    trim: true,
    maxLength: [500, "Description cannot be more than 500 characters"]
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(questions) {
        return questions.length > 0; 
      },
      message: "Test must have at least one question"
    }
  },
  deadline: {
    type: Date,
    required: false
  },
  batchCode: {
    type: String,
    required: [true, "Batch code is required for tests"],
    trim: true,
  },
  // NEW: Add a field to track the creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to the Users model
    required: true,
  },
  isActive: {
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

testSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

export default Test;