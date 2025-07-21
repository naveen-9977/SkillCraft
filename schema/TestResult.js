// schema/TestResult.js
import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Assuming you have a 'Users' schema for students
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test', // Reference to your existing 'Test' schema
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionIndex: { type: Number, required: true },
      selectedOptionIndex: { type: Number, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);